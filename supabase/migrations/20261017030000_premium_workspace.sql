-- Account-synced premium tools. Core cheque/party policies are deliberately unchanged.
CREATE TABLE public.premium_workspace_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('cheque-template', 'saved-view', 'message-template')),
  name text NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 100),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, business_id, kind, name)
);
CREATE INDEX premium_workspace_tools_owner_idx
  ON public.premium_workspace_tools(user_id, business_id, kind);
ALTER TABLE public.premium_workspace_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY premium_tools_owner_read ON public.premium_workspace_tools
  FOR SELECT TO authenticated USING (user_id = auth.uid());
-- All writes go through the validating RPC. Expired owners retain read access.
REVOKE ALL ON public.premium_workspace_tools FROM anon, authenticated;
GRANT SELECT ON public.premium_workspace_tools TO authenticated;

CREATE FUNCTION public.premium_workspace_assert_owner(requested_business uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_lifetime_premium() THEN
    RAISE EXCEPTION 'Lifetime Premium required' USING ERRCODE = '42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.businesses
    WHERE id = requested_business AND user_id = auth.uid() AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Business not owned or unavailable' USING ERRCODE = '42501';
  END IF;
END;
$$;

-- Reused on saving AND applying: references may have been deleted since a tool was saved.
CREATE FUNCTION public.premium_workspace_validate_payload(
  requested_business uuid, requested_kind text, requested_payload jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  k text;
  body text;
BEGIN
  PERFORM public.premium_workspace_assert_owner(requested_business);
  IF jsonb_typeof(requested_payload) IS DISTINCT FROM 'object'
    OR octet_length(requested_payload::text) > 20000 THEN
    RAISE EXCEPTION 'Invalid tool payload';
  END IF;
  FOR k IN SELECT jsonb_object_keys(requested_payload) LOOP
    IF NOT (
      (requested_kind = 'cheque-template' AND k = ANY(ARRAY['party_id','account_id','amount','type','notes']))
      OR (requested_kind = 'saved-view' AND k = ANY(ARRAY['search','status','type','party_id','from','to']))
      OR (requested_kind = 'message-template' AND k = 'body')
    ) THEN RAISE EXCEPTION 'Unsupported tool field: %', k; END IF;
    IF jsonb_typeof(requested_payload->k) NOT IN ('string','number') THEN
      RAISE EXCEPTION 'Invalid tool field: %', k;
    END IF;
  END LOOP;
  IF requested_kind NOT IN ('cheque-template','saved-view','message-template') THEN
    RAISE EXCEPTION 'Invalid tool kind';
  END IF;
  IF requested_payload ? 'party_id' AND NOT EXISTS (
    SELECT 1 FROM public.parties WHERE id = (requested_payload->>'party_id')::uuid
      AND business_id = requested_business AND NOT is_draft AND deleted_at IS NULL
  ) THEN RAISE EXCEPTION 'Invalid party'; END IF;
  IF requested_payload ? 'account_id' AND NOT EXISTS (
    SELECT 1 FROM public.accounts WHERE id = (requested_payload->>'account_id')::uuid
      AND business_id = requested_business AND NOT is_draft AND deleted_at IS NULL
  ) THEN RAISE EXCEPTION 'Invalid account'; END IF;
  IF requested_payload ? 'amount' AND (
    (requested_payload->>'amount') !~ '^[0-9]+([.][0-9]{1,2})?$'
    OR (requested_payload->>'amount')::numeric <= 0
    OR (requested_payload->>'amount')::numeric > 999999999999.99
  ) THEN RAISE EXCEPTION 'Invalid amount'; END IF;
  IF requested_payload ? 'type' AND requested_payload->>'type' NOT IN ('Inward','Outward') THEN
    RAISE EXCEPTION 'Invalid cheque type';
  END IF;
  IF requested_payload ? 'status' AND requested_payload->>'status' NOT IN ('Issued','Received','Cleared','Bounced') THEN
    RAISE EXCEPTION 'Invalid cheque status';
  END IF;
  IF requested_payload ? 'notes' AND length(requested_payload->>'notes') > 2000 THEN
    RAISE EXCEPTION 'Notes too long';
  END IF;
  FOREACH k IN ARRAY ARRAY['from','to'] LOOP
    IF requested_payload ? k AND (
      requested_payload->>k !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      OR (requested_payload->>k)::date NOT BETWEEN date '1900-01-01' AND date '2200-12-31'
    ) THEN RAISE EXCEPTION 'Invalid date'; END IF;
  END LOOP;
  IF requested_payload ? 'from' AND requested_payload ? 'to'
    AND (requested_payload->>'from')::date > (requested_payload->>'to')::date THEN
    RAISE EXCEPTION 'Invalid date range';
  END IF;
  IF requested_kind = 'message-template' THEN
    body := requested_payload->>'body';
    IF body IS NULL OR length(btrim(body)) NOT BETWEEN 1 AND 2000
      OR regexp_replace(body, '\{(party|cheque_number|amount|date|status|business)\}', '', 'g') ~ '[{}]' THEN
      RAISE EXCEPTION 'Invalid message or unsupported placeholder';
    END IF;
  END IF;
  RETURN requested_payload;
END;
$$;

CREATE FUNCTION public.premium_workspace_save_tool(
  requested_business uuid, requested_kind text, requested_name text,
  requested_payload jsonb, requested_id uuid DEFAULT NULL
) RETURNS public.premium_workspace_tools
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE result public.premium_workspace_tools;
BEGIN
  PERFORM public.premium_workspace_validate_payload(requested_business, requested_kind, requested_payload);
  IF requested_name IS NULL OR length(btrim(requested_name)) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'Invalid tool name';
  END IF;
  IF requested_id IS NULL THEN
    INSERT INTO public.premium_workspace_tools(user_id,business_id,kind,name,payload)
      VALUES(auth.uid(),requested_business,requested_kind,btrim(requested_name),requested_payload)
      RETURNING * INTO result;
  ELSE
    UPDATE public.premium_workspace_tools SET name = btrim(requested_name),
      payload = requested_payload, updated_at = now()
      WHERE id = requested_id AND user_id = auth.uid()
        AND business_id = requested_business AND kind = requested_kind
      RETURNING * INTO result;
    IF NOT FOUND THEN RAISE EXCEPTION 'Tool not owned' USING ERRCODE = '42501'; END IF;
  END IF;
  RETURN result;
END;
$$;

CREATE FUNCTION public.premium_workspace_apply_tool(requested_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE tool public.premium_workspace_tools;
BEGIN
  SELECT * INTO tool FROM public.premium_workspace_tools
    WHERE id = requested_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Tool not owned' USING ERRCODE = '42501'; END IF;
  RETURN public.premium_workspace_validate_payload(tool.business_id,tool.kind,tool.payload);
END;
$$;

CREATE FUNCTION public.premium_workspace_delete_tool(requested_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE tool public.premium_workspace_tools;
BEGIN
  SELECT * INTO tool FROM public.premium_workspace_tools
    WHERE id = requested_id AND user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Tool not owned' USING ERRCODE = '42501'; END IF;
  PERFORM public.premium_workspace_assert_owner(tool.business_id);
  DELETE FROM public.premium_workspace_tools WHERE id = tool.id;
END;
$$;

CREATE FUNCTION public.premium_workspace_message(requested_business uuid DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE tool public.premium_workspace_tools;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_lifetime_premium() THEN
    RAISE EXCEPTION 'Lifetime Premium required' USING ERRCODE = '42501';
  END IF;
  IF requested_business IS NOT NULL THEN
    PERFORM public.premium_workspace_assert_owner(requested_business);
  END IF;
  SELECT * INTO tool FROM public.premium_workspace_tools
    WHERE user_id = auth.uid() AND (requested_business IS NULL OR business_id = requested_business)
      AND kind = 'message-template'
      AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_id AND b.user_id = auth.uid() AND b.deleted_at IS NULL)
    ORDER BY updated_at DESC, id LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  PERFORM public.premium_workspace_validate_payload(tool.business_id,tool.kind,tool.payload);
  RETURN tool.payload->>'body';
END;
$$;

CREATE FUNCTION public.premium_workspace_import(
  requested_business uuid, requested_kind text, requested_rows jsonb
) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  item jsonb;
  k text;
  n integer := 0;
  party uuid;
  account uuid;
  cheque_kind public.cheque_type;
  cheque_day date;
  deposit_day date;
  number_text text;
  amount_value numeric;
BEGIN
  PERFORM public.premium_workspace_assert_owner(requested_business);
  IF requested_kind NOT IN ('parties','cheques') OR requested_kind IS NULL
    OR jsonb_typeof(requested_rows) IS DISTINCT FROM 'array'
    OR jsonb_array_length(requested_rows) NOT BETWEEN 1 AND 500
    OR octet_length(requested_rows::text) > 2000000 THEN
    RAISE EXCEPTION 'Import must contain 1 to 500 rows';
  END IF;
  -- Serialize imports for this business, including duplicate detection within the file.
  PERFORM 1 FROM public.businesses WHERE id = requested_business FOR UPDATE;
  FOR item IN SELECT value FROM jsonb_array_elements(requested_rows) LOOP
    n := n + 1;
    IF jsonb_typeof(item) IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'Invalid row %',n; END IF;
    FOR k IN SELECT jsonb_object_keys(item) LOOP
      IF NOT ((requested_kind = 'parties' AND k = ANY(ARRAY['name','contact','email','address','notes']))
        OR (requested_kind = 'cheques' AND k = ANY(ARRAY['party_id','account_id','cheque_number','amount','cheque_date','deposit_date','type','notes'])))
        OR jsonb_typeof(item->k) NOT IN ('string','number') THEN
        RAISE EXCEPTION 'Invalid field in row %',n;
      END IF;
    END LOOP;
    IF length(coalesce(item->>'notes','')) > 2000 THEN RAISE EXCEPTION 'Notes too long in row %',n; END IF;
    IF requested_kind = 'parties' THEN
      IF length(btrim(coalesce(item->>'name',''))) NOT BETWEEN 1 AND 200
        OR coalesce(item->>'contact','') !~ '^\+[1-9][0-9]{6,14}$'
        OR (coalesce(item->>'email','') <> '' AND (length(item->>'email') > 254 OR item->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'))
        OR length(coalesce(item->>'address','')) > 1000 THEN
        RAISE EXCEPTION 'Invalid party in row %',n;
      END IF;
      IF EXISTS (SELECT 1 FROM public.parties p WHERE p.business_id = requested_business
        AND p.deleted_at IS NULL AND NOT p.is_draft AND (
          lower(btrim(p.name)) = lower(btrim(item->>'name'))
          OR regexp_replace(p.contact,'[^0-9]','','g') = regexp_replace(item->>'contact','[^0-9]','','g')
          OR (coalesce(item->>'email','') <> '' AND lower(p.email) = lower(item->>'email'))
        )) THEN RAISE EXCEPTION 'Duplicate party in row %',n; END IF;
      INSERT INTO public.parties(business_id,name,contact,email,address,notes,is_draft)
        VALUES(requested_business,btrim(item->>'name'),item->>'contact',
          nullif(item->>'email',''),nullif(item->>'address',''),nullif(item->>'notes',''),false);
    ELSE
      party := (item->>'party_id')::uuid;
      account := (item->>'account_id')::uuid;
      IF NOT EXISTS (SELECT 1 FROM public.parties WHERE id = party AND business_id = requested_business AND NOT is_draft AND deleted_at IS NULL)
        OR NOT EXISTS (SELECT 1 FROM public.accounts WHERE id = account AND business_id = requested_business AND NOT is_draft AND deleted_at IS NULL) THEN
        RAISE EXCEPTION 'Invalid party or account in row %',n;
      END IF;
      number_text := btrim(item->>'cheque_number');
      IF number_text IS NULL OR number_text !~ '^[0-9]{6}$'
        OR coalesce(item->>'amount','') !~ '^[0-9]+([.][0-9]{1,2})?$'
        OR coalesce(item->>'type','') NOT IN ('Inward','Outward')
        OR coalesce(item->>'cheque_date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
        RAISE EXCEPTION 'Invalid cheque in row %',n;
      END IF;
      amount_value := (item->>'amount')::numeric;
      cheque_kind := (item->>'type')::public.cheque_type;
      cheque_day := (item->>'cheque_date')::date;
      deposit_day := nullif(item->>'deposit_date','')::date;
      IF amount_value <= 0 OR amount_value > 999999999999.99
        OR cheque_day NOT BETWEEN date '1900-01-01' AND date '2200-12-31'
        OR (deposit_day IS NOT NULL AND (item->>'deposit_date' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
          OR deposit_day NOT BETWEEN cheque_day AND date '2200-12-31')) THEN
        RAISE EXCEPTION 'Invalid amount or dates in row %',n;
      END IF;
      IF EXISTS (SELECT 1 FROM public.cheques c WHERE c.business_id = requested_business
        AND c.account_id = account AND c.cheque_number = number_text AND NOT c.is_draft) THEN
        RAISE EXCEPTION 'Duplicate cheque in row %',n;
      END IF;
      INSERT INTO public.cheques(business_id,party_id,account_id,cheque_number,amount,cheque_date,deposit_date,type,status,notes,is_draft)
        VALUES(requested_business,party,account,number_text,amount_value,cheque_day,deposit_day,cheque_kind,
          CASE WHEN cheque_kind = 'Inward' THEN 'Received'::public.cheque_status ELSE 'Issued'::public.cheque_status END,
          nullif(item->>'notes',''),false);
    END IF;
  END LOOP;
  RETURN n;
END;
$$;

CREATE FUNCTION public.premium_workspace_bulk_status(
  requested_business uuid, requested_ids uuid[], requested_status public.cheque_status
) RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE item public.cheques; n integer := 0;
BEGIN
  PERFORM public.premium_workspace_assert_owner(requested_business);
  IF requested_status IS NULL OR coalesce(cardinality(requested_ids),0) NOT BETWEEN 1 AND 500
    OR cardinality(requested_ids) <> (SELECT count(DISTINCT id) FROM unnest(requested_ids) id) THEN
    RAISE EXCEPTION 'Select 1 to 500 distinct cheques';
  END IF;
  FOR item IN SELECT * FROM public.cheques
    WHERE id = ANY(requested_ids) AND business_id = requested_business ORDER BY id FOR UPDATE LOOP
    IF item.is_draft OR item.status IS NULL OR item.type IS NULL OR item.status = requested_status
      OR (requested_status = 'Issued' AND item.type <> 'Outward')
      OR (requested_status = 'Received' AND item.type <> 'Inward') THEN
      RAISE EXCEPTION 'Invalid status transition for cheque %',item.id;
    END IF;
    n := n + 1;
  END LOOP;
  IF n <> cardinality(requested_ids) THEN RAISE EXCEPTION 'Cheque not owned or unavailable' USING ERRCODE = '42501'; END IF;
  UPDATE public.cheques SET status = requested_status, updated_at = now()
    WHERE id = ANY(requested_ids) AND business_id = requested_business;
  RETURN n;
END;
$$;

-- A single fresh, owner-checked snapshot supports statements and consolidation.
CREATE FUNCTION public.premium_workspace_snapshot(
  requested_businesses uuid[], requested_party uuid DEFAULT NULL,
  requested_from date DEFAULT NULL, requested_to date DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE business uuid; result jsonb;
BEGIN
  IF coalesce(cardinality(requested_businesses),0) NOT BETWEEN 1 AND 100
    OR (requested_from IS NOT NULL AND requested_to IS NOT NULL AND requested_from > requested_to) THEN
    RAISE EXCEPTION 'Invalid scope or date range';
  END IF;
  FOREACH business IN ARRAY requested_businesses LOOP
    PERFORM public.premium_workspace_assert_owner(business);
  END LOOP;
  IF requested_party IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.parties
    WHERE id = requested_party AND business_id = ANY(requested_businesses) AND NOT is_draft AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Party not in owned scope' USING ERRCODE = '42501';
  END IF;
  SELECT jsonb_build_object(
    'businesses', (SELECT coalesce(jsonb_agg(jsonb_build_object('id',b.id,'name',b.name)), '[]'::jsonb)
      FROM public.businesses b WHERE b.id = ANY(requested_businesses) AND b.user_id = auth.uid() AND b.deleted_at IS NULL),
    'cheques', (SELECT coalesce(jsonb_agg(to_jsonb(c) ORDER BY c.cheque_date,c.id),'[]'::jsonb)
      FROM public.cheques c WHERE c.business_id = ANY(requested_businesses) AND NOT c.is_draft
        AND (requested_party IS NULL OR c.party_id = requested_party)
        AND (requested_from IS NULL OR c.cheque_date >= requested_from)
        AND (requested_to IS NULL OR c.cheque_date <= requested_to))
  ) INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.premium_workspace_assert_owner(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.premium_workspace_validate_payload(uuid,text,jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.premium_workspace_save_tool(uuid,text,text,jsonb,uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.premium_workspace_apply_tool(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.premium_workspace_delete_tool(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.premium_workspace_message(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.premium_workspace_import(uuid,text,jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.premium_workspace_bulk_status(uuid,uuid[],public.cheque_status) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.premium_workspace_snapshot(uuid[],uuid,date,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.premium_workspace_save_tool(uuid,text,text,jsonb,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.premium_workspace_apply_tool(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.premium_workspace_delete_tool(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.premium_workspace_message(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.premium_workspace_import(uuid,text,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.premium_workspace_bulk_status(uuid,uuid[],public.cheque_status) TO authenticated;
GRANT EXECUTE ON FUNCTION public.premium_workspace_snapshot(uuid[],uuid,date,date) TO authenticated;

-- Print positions are account-scoped, not browser-local. No core account policies change.
CREATE TABLE public.premium_workspace_print_layouts (
  account_id uuid PRIMARY KEY REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  layout jsonb NOT NULL CHECK (jsonb_typeof(layout) = 'object'),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.premium_workspace_print_layouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY premium_print_owner_read ON public.premium_workspace_print_layouts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
REVOKE ALL ON public.premium_workspace_print_layouts FROM anon, authenticated;
GRANT SELECT ON public.premium_workspace_print_layouts TO authenticated;

CREATE FUNCTION public.premium_workspace_print_layout(requested_account uuid, requested_layout jsonb DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE business uuid; result jsonb; k text; v numeric;
BEGIN
  SELECT a.business_id INTO business FROM public.accounts a
    JOIN public.businesses b ON b.id = a.business_id
    WHERE a.id = requested_account AND NOT a.is_draft AND a.deleted_at IS NULL
      AND b.user_id = auth.uid() AND b.deleted_at IS NULL;
  PERFORM public.premium_workspace_assert_owner(business);
  IF requested_layout IS NULL THEN
    SELECT layout INTO result FROM public.premium_workspace_print_layouts
      WHERE account_id = requested_account AND user_id = auth.uid();
    RETURN result;
  END IF;
  IF jsonb_typeof(requested_layout) IS DISTINCT FROM 'object'
    OR (SELECT count(*) FROM jsonb_object_keys(requested_layout)) <> 8 THEN
    RAISE EXCEPTION 'Invalid print layout';
  END IF;
  FOR k IN SELECT jsonb_object_keys(requested_layout) LOOP
    IF k <> ALL(ARRAY['payeeX','payeeY','amountX','amountY','dateX','dateY','chequeNumberX','chequeNumberY'])
      OR jsonb_typeof(requested_layout->k) <> 'number' THEN RAISE EXCEPTION 'Invalid print coordinate'; END IF;
    v := (requested_layout->>k)::numeric;
    IF v < 0 OR (right(k,1) = 'X' AND v > 210) OR (right(k,1) = 'Y' AND v > 297) THEN
      RAISE EXCEPTION 'Print coordinate outside A4 page';
    END IF;
  END LOOP;
  INSERT INTO public.premium_workspace_print_layouts(account_id,user_id,layout)
    VALUES(requested_account,auth.uid(),requested_layout)
    ON CONFLICT(account_id) DO UPDATE SET layout = excluded.layout, user_id = excluded.user_id, updated_at = now();
  RETURN requested_layout;
END;
$$;
REVOKE ALL ON FUNCTION public.premium_workspace_print_layout(uuid,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.premium_workspace_print_layout(uuid,jsonb) TO authenticated;

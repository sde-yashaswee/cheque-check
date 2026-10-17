CREATE OR REPLACE FUNCTION public.has_lifetime_premium()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_entitlements
    WHERE user_id = auth.uid()
      AND feature_id = 'lifetime_premium'
      AND (
        (status = 'active' AND (valid_until IS NULL OR (isfinite(valid_until) AND valid_until > now())))
        OR (status = 'trialing' AND valid_until IS NOT NULL AND isfinite(valid_until) AND valid_until > now())
      )
  );
$$;

REVOKE ALL ON FUNCTION public.has_lifetime_premium() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_lifetime_premium() TO authenticated;

ALTER TABLE public.user_entitlements ADD CONSTRAINT finite_premium_trial
  CHECK (status <> 'trialing' OR (valid_until IS NOT NULL AND isfinite(valid_until)));

CREATE OR REPLACE FUNCTION public.enforce_inward_premium()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NEW.type = 'Inward'
     AND NOT coalesce(NEW.is_draft, false) THEN
    IF TG_OP = 'INSERT' THEN
      IF NOT public.has_lifetime_premium() THEN
        RAISE EXCEPTION 'Lifetime Premium is required to create inward cheques'
          USING ERRCODE = '42501';
      END IF;
    ELSIF OLD.type <> 'Inward' OR coalesce(OLD.is_draft, false) THEN
      IF NOT public.has_lifetime_premium() THEN
        RAISE EXCEPTION 'Lifetime Premium is required to create inward cheques'
          USING ERRCODE = '42501';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_inward_premium() FROM PUBLIC;
CREATE TRIGGER enforce_inward_premium
BEFORE INSERT OR UPDATE ON public.cheques
FOR EACH ROW EXECUTE FUNCTION public.enforce_inward_premium();

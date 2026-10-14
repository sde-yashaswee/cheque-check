CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_quotas (user_id, feature_id, "limit")
  VALUES (NEW.user_id, 'ai_scan', 10);

  RETURN NEW;
END;
$$;

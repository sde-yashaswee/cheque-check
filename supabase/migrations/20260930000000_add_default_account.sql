ALTER TABLE accounts
  ADD COLUMN is_default BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX accounts_one_default_per_business_idx
  ON accounts (business_id)
  WHERE is_default = TRUE AND deleted_at IS NULL;

CREATE OR REPLACE FUNCTION clear_previous_default_account()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE accounts
    SET is_default = FALSE
    WHERE business_id = NEW.business_id
      AND id <> NEW.id
      AND is_default = TRUE
      AND deleted_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER accounts_clear_previous_default
  BEFORE INSERT OR UPDATE OF is_default, business_id ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION clear_previous_default_account();
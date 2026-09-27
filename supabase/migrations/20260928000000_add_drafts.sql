-- Drafts live in the real tables; required columns are enforced only once a row is published.

-- Cheques
ALTER TABLE cheques ADD COLUMN is_draft BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE cheques
  ALTER COLUMN party_id DROP NOT NULL,
  ALTER COLUMN account_id DROP NOT NULL,
  ALTER COLUMN cheque_number DROP NOT NULL,
  ALTER COLUMN amount DROP NOT NULL,
  ALTER COLUMN cheque_date DROP NOT NULL,
  ALTER COLUMN status DROP NOT NULL,
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN type DROP NOT NULL;

ALTER TABLE cheques
  ADD CONSTRAINT cheques_required_unless_draft_check
  CHECK (
    is_draft
    OR (
      party_id IS NOT NULL
      AND account_id IS NOT NULL
      AND cheque_number IS NOT NULL
      AND amount IS NOT NULL
      AND cheque_date IS NOT NULL
      AND status IS NOT NULL
      AND type IS NOT NULL
    )
  );

ALTER TABLE cheques DROP CONSTRAINT IF EXISTS cheques_type_status_check;
ALTER TABLE cheques
  ADD CONSTRAINT cheques_type_status_check
  CHECK (
    (is_draft AND status IS NULL)
    OR (type = 'Outward' AND status IN ('Issued', 'Cleared', 'Bounced'))
    OR (type = 'Inward' AND status IN ('Received', 'Cleared', 'Bounced'))
  );

-- The original UNIQUE(business_id, bank_id, cheque_number) was renamed with the column, so drop it by lookup.
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_constraint con
    WHERE con.conrelid = 'public.cheques'::regclass
      AND con.contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE cheques DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

CREATE UNIQUE INDEX cheques_business_account_number_key
  ON cheques (business_id, account_id, cheque_number)
  WHERE NOT is_draft;

CREATE INDEX cheques_business_is_draft_idx ON cheques (business_id, is_draft);

-- Parties
ALTER TABLE parties ADD COLUMN is_draft BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE parties
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN contact DROP NOT NULL;

ALTER TABLE parties
  ADD CONSTRAINT parties_required_unless_draft_check
  CHECK (is_draft OR (name IS NOT NULL AND contact IS NOT NULL));

CREATE INDEX parties_business_is_draft_idx ON parties (business_id, is_draft);

-- Accounts
ALTER TABLE accounts ADD COLUMN is_draft BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE accounts
  ALTER COLUMN account_name DROP NOT NULL,
  ALTER COLUMN account_number DROP NOT NULL;

ALTER TABLE accounts
  ADD CONSTRAINT accounts_required_unless_draft_check
  CHECK (is_draft OR (account_name IS NOT NULL AND account_number IS NOT NULL));

CREATE INDEX accounts_business_is_draft_idx ON accounts (business_id, is_draft);

-- Published records can never become drafts again.
CREATE OR REPLACE FUNCTION prevent_unpublishing_drafts()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.is_draft = FALSE AND NEW.is_draft = TRUE THEN
    RAISE EXCEPTION 'Published records cannot be converted back to drafts'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER cheques_prevent_unpublishing
  BEFORE UPDATE OF is_draft ON cheques
  FOR EACH ROW EXECUTE FUNCTION prevent_unpublishing_drafts();

CREATE TRIGGER parties_prevent_unpublishing
  BEFORE UPDATE OF is_draft ON parties
  FOR EACH ROW EXECUTE FUNCTION prevent_unpublishing_drafts();

CREATE TRIGGER accounts_prevent_unpublishing
  BEFORE UPDATE OF is_draft ON accounts
  FOR EACH ROW EXECUTE FUNCTION prevent_unpublishing_drafts();

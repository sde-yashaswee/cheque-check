-- Repair rows created before inward cheques explicitly persisted their initial status.
UPDATE cheques
SET status = CASE WHEN type = 'Inward' THEN 'Received' ELSE 'Issued' END
WHERE status IS NULL;

UPDATE cheques SET status = 'Received' WHERE type = 'Inward' AND status = 'Issued';
UPDATE cheques SET status = 'Issued' WHERE type = 'Outward' AND status = 'Received';

ALTER TABLE cheques
  ALTER COLUMN status SET NOT NULL;

ALTER TABLE cheques
  ADD CONSTRAINT cheques_type_status_check
  CHECK (
    (type = 'Outward' AND status IN ('Issued', 'Cleared', 'Bounced'))
    OR
    (type = 'Inward' AND status IN ('Received', 'Cleared', 'Bounced'))
  );

CREATE OR REPLACE FUNCTION enforce_cheque_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF (
    (OLD.status = 'Issued' AND NEW.status IN ('Cleared', 'Bounced'))
    OR
    (OLD.status = 'Received' AND NEW.status IN ('Cleared', 'Bounced'))
  ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid cheque status transition from % to %', OLD.status, NEW.status
    USING ERRCODE = '23514';
END;
$$;

CREATE TRIGGER enforce_cheque_status_transition_before_update
  BEFORE UPDATE OF status ON cheques
  FOR EACH ROW
  EXECUTE FUNCTION enforce_cheque_status_transition();

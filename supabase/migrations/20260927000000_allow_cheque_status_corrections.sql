-- Cheque statuses are user-correctable: Cleared and Bounced are no longer terminal.
-- The cheques_type_status_check constraint still guards type/status compatibility.
DROP TRIGGER IF EXISTS enforce_cheque_status_transition_before_update ON cheques;
DROP FUNCTION IF EXISTS enforce_cheque_status_transition();

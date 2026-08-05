-- 1. Add 'deleted_at' for soft deletes
ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE businesses ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE parties ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE accounts ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Update 'cheques' foreign keys to 'ON DELETE RESTRICT'
-- Drop existing constraints (names based on standard Postgres naming conventions)
ALTER TABLE cheques DROP CONSTRAINT IF EXISTS cheques_party_id_fkey;
ALTER TABLE cheques DROP CONSTRAINT IF EXISTS cheques_bank_id_fkey;

-- Re-add with RESTRICT
ALTER TABLE cheques
  ADD CONSTRAINT cheques_party_id_fkey 
  FOREIGN KEY (party_id) 
  REFERENCES parties(id) 
  ON DELETE RESTRICT;

ALTER TABLE cheques
  ADD CONSTRAINT cheques_account_id_fkey 
  FOREIGN KEY (account_id) 
  REFERENCES accounts(id) 
  ON DELETE RESTRICT;

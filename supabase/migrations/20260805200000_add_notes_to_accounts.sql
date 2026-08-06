-- Add notes column to accounts (previously called banks in initial schema)
ALTER TABLE accounts ADD COLUMN notes TEXT;

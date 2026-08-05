-- Remove bank_name column from accounts as we use bank_id for the master data
ALTER TABLE accounts DROP COLUMN bank_name;

-- Ensure bank_id is required if we want to enforce master bank usage, 
-- but maybe keep it optional for 'Other' (which we should handle via master banks too if needed)
-- For now, let's keep it and rely on the relationship.

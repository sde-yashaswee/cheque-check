-- 1. Rename 'banks' table to 'accounts'
ALTER TABLE banks RENAME TO accounts;

-- 2. Rename 'bank_id' in 'cheques' to 'account_id'
ALTER TABLE cheques RENAME COLUMN bank_id TO account_id;

-- 3. Create master 'banks' table
CREATE TABLE banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on master banks
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Banks are viewable by everyone" ON banks FOR SELECT USING (true);

-- 5. Add 'bank_id' to 'accounts'
ALTER TABLE accounts ADD COLUMN bank_id UUID REFERENCES banks(id);

-- 6. Add preference columns to 'profiles'
ALTER TABLE profiles 
ADD COLUMN time_format TEXT DEFAULT '12h',
ADD COLUMN time_zone TEXT DEFAULT 'UTC',
ADD COLUMN language TEXT DEFAULT 'en';

-- 7. Seed some common banks
INSERT INTO banks (name) VALUES 
('State Bank of India'),
('HDFC Bank'),
('ICICI Bank'),
('Axis Bank'),
('Punjab National Bank'),
('Bank of Baroda'),
('Canara Bank'),
('Union Bank of India'),
('IDBI Bank'),
('Kotak Mahindra Bank'),
('IndusInd Bank'),
('Yes Bank'),
('Federal Bank');

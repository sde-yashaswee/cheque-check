-- Enums
CREATE TYPE cheque_status AS ENUM ('Issued', 'Received', 'Cleared', 'Bounced');
CREATE TYPE cheque_type AS ENUM ('Outward', 'Inward');
CREATE TYPE reminder_type AS ENUM ('Push', 'Voice', 'SMS');
CREATE TYPE reminder_status AS ENUM ('Pending', 'Success', 'Failed');

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  currency TEXT DEFAULT '₹',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  reminders_per_day INT DEFAULT 1,
  default_reminder_days INT DEFAULT 3,
  received_cheques_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parties
CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banks
CREATE TABLE banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cheques
CREATE TABLE cheques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  bank_id UUID NOT NULL REFERENCES banks(id) ON DELETE CASCADE,
  cheque_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  cheque_date DATE NOT NULL,
  deposit_date DATE,
  remind_before_days INT,
  status cheque_status DEFAULT 'Issued',
  type cheque_type NOT NULL,
  notes TEXT,
  voice_call_sent BOOLEAN DEFAULT FALSE,
  last_call_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, bank_id, cheque_number)
);

-- Reminder Logs
CREATE TABLE reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cheque_id UUID NOT NULL REFERENCES cheques(id) ON DELETE CASCADE,
  type reminder_type NOT NULL,
  status reminder_status DEFAULT 'Pending',
  provider_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Enable)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheques ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own businesses" ON businesses
  FOR ALL TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can manage parties in their businesses" ON parties
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Users can manage banks in their businesses" ON banks
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Users can manage cheques in their businesses" ON cheques
  FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM businesses b WHERE b.id = business_id AND b.user_id = auth.uid())
  );

CREATE POLICY "Users can manage reminder logs for their cheques" ON reminder_logs
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM cheques c 
      JOIN businesses b ON c.business_id = b.id 
      WHERE c.id = cheque_id AND b.user_id = auth.uid()
    )
  );

-- Profile Creation Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', ''), new.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

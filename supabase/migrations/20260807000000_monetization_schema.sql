-- Monetization Schema

-- Enums/Types
CREATE TYPE feature_type AS ENUM (
  'ai_scan', 
  'voice_reminder', 
  'lifetime_premium', 
  'ai_scanner_sub', 
  'voice_reminder_sub'
);

CREATE TYPE entitlement_status AS ENUM (
  'active', 
  'expired', 
  'canceled'
);

CREATE TYPE transaction_status AS ENUM (
  'created', 
  'authorized', 
  'captured', 
  'refunded', 
  'failed'
);

CREATE TYPE transaction_type AS ENUM (
  'lifetime', 
  'subscription', 
  'top_up'
);

-- User Entitlements: Tracks what the user owns (Lifetime or active subscriptions)
CREATE TABLE user_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id feature_type NOT NULL,
  status entitlement_status NOT NULL DEFAULT 'active', -- active, expired, canceled
  valid_until TIMESTAMPTZ, -- NULL for lifetime
  razorpay_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_id)
);

-- User Quotas: Tracks usage and limits for specific features
CREATE TABLE user_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_id feature_type NOT NULL,
  used INT NOT NULL DEFAULT 0,
  "limit" INT NOT NULL DEFAULT 0,
  reset_at TIMESTAMPTZ, -- When the monthly quota resets
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature_id)
);

-- Transactions: Immutable record of payments
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  amount INT NOT NULL, -- in paise
  currency TEXT NOT NULL DEFAULT 'INR',
  status transaction_status NOT NULL, -- created, authorized, captured, refunded, failed
  type transaction_type NOT NULL, -- lifetime, subscription, top_up
  feature_id feature_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own entitlements"
  ON user_entitlements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own quotas"
  ON user_quotas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Trigger for initial trial quota
CREATE OR REPLACE FUNCTION handle_new_user_trial()
RETURNS TRIGGER AS $$
BEGIN
  -- Give 10 free AI scans
  INSERT INTO user_quotas (user_id, feature_id, "limit")
  VALUES (NEW.user_id, 'ai_scan', 10);
  
  -- We could also give a trial for voice reminders if desired
  -- INSERT INTO user_quotas (user_id, feature_id, "limit")
  -- VALUES (NEW.user_id, 'voice_reminder', 5);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_trial();

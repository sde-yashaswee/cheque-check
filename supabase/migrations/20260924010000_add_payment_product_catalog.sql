CREATE TABLE payment_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  transaction_type transaction_type NOT NULL,
  feature_id feature_type NOT NULL,
  amount INT NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  entitlement_days INT CHECK (entitlement_days > 0),
  quota_feature_id feature_type,
  quota_increment INT CHECK (quota_increment > 0),
  required_entitlement_id feature_type,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (transaction_type = 'lifetime' AND entitlement_days IS NULL)
    OR
    (transaction_type = 'subscription' AND entitlement_days IS NOT NULL)
    OR
    (transaction_type = 'top_up' AND entitlement_days IS NULL)
  )
);

INSERT INTO payment_products (
  id,
  name,
  transaction_type,
  feature_id,
  amount,
  entitlement_days,
  quota_feature_id,
  quota_increment,
  required_entitlement_id
)
VALUES
  ('lifetime_premium', 'Lifetime Premium', 'lifetime', 'lifetime_premium', 30000, NULL, NULL, NULL, NULL),
  ('ai_scanner_30d', 'AI Scanner - 30 days', 'subscription', 'ai_scanner_sub', 5000, 30, 'ai_scan', 250, NULL),
  ('voice_reminder_30d', 'Voice Reminders - 30 days', 'subscription', 'voice_reminder_sub', 5000, 30, 'voice_reminder', 100, NULL),
  ('ai_scan_250', 'AI Scanner - 250 scan top-up', 'top_up', 'ai_scan', 5000, NULL, 'ai_scan', 250, 'ai_scanner_sub'),
  ('voice_reminder_100', 'Voice Reminders - 100 call top-up', 'top_up', 'voice_reminder', 5000, NULL, 'voice_reminder', 100, 'voice_reminder_sub');

ALTER TABLE payment_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active payment products"
  ON payment_products FOR SELECT TO authenticated
  USING (active = TRUE);

ALTER TABLE transactions ADD COLUMN product_id TEXT;

UPDATE transactions
SET product_id = CASE
  WHEN type = 'lifetime' AND feature_id = 'lifetime_premium' THEN 'lifetime_premium'
  WHEN type = 'subscription' AND feature_id = 'ai_scanner_sub' THEN 'ai_scanner_30d'
  WHEN type = 'subscription' AND feature_id = 'voice_reminder_sub' THEN 'voice_reminder_30d'
  WHEN type = 'top_up' AND feature_id = 'ai_scan' THEN 'ai_scan_250'
  WHEN type = 'top_up' AND feature_id = 'voice_reminder' THEN 'voice_reminder_100'
END;

ALTER TABLE transactions
  ALTER COLUMN product_id SET NOT NULL,
  ADD CONSTRAINT transactions_product_id_fkey
    FOREIGN KEY (product_id) REFERENCES payment_products(id);

CREATE OR REPLACE FUNCTION record_payment_order(
  order_user_id UUID,
  requested_product_id TEXT,
  razorpay_order TEXT
)
RETURNS transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  product payment_products%ROWTYPE;
  created_transaction transactions%ROWTYPE;
BEGIN
  IF order_user_id IS NULL THEN
    RAISE EXCEPTION 'Order user is required' USING ERRCODE = '22023';
  END IF;

  SELECT * INTO product
  FROM payment_products
  WHERE id = requested_product_id AND active = TRUE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment product is unavailable' USING ERRCODE = '22023';
  END IF;

  IF product.transaction_type IN ('lifetime', 'subscription') AND EXISTS (
    SELECT 1
    FROM user_entitlements
    WHERE user_id = order_user_id
      AND feature_id = product.feature_id
      AND status = 'active'
      AND (valid_until IS NULL OR valid_until > NOW())
  ) THEN
    RAISE EXCEPTION 'Entitlement is already active' USING ERRCODE = '23505';
  END IF;

  IF product.required_entitlement_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM user_entitlements
    WHERE user_id = order_user_id
      AND feature_id = product.required_entitlement_id
      AND status = 'active'
      AND (valid_until IS NULL OR valid_until > NOW())
  ) THEN
    RAISE EXCEPTION 'Required entitlement is not active' USING ERRCODE = '42501';
  END IF;

  INSERT INTO transactions (
    user_id,
    razorpay_order_id,
    amount,
    currency,
    status,
    type,
    feature_id,
    product_id
  )
  VALUES (
    order_user_id,
    razorpay_order,
    product.amount,
    product.currency,
    'created',
    product.transaction_type,
    product.feature_id,
    product.id
  )
  RETURNING * INTO created_transaction;

  RETURN created_transaction;
END;
$$;

REVOKE ALL ON FUNCTION record_payment_order(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION record_payment_order(UUID, TEXT, TEXT) TO service_role;

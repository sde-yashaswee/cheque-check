ALTER TABLE payment_products
  ADD CONSTRAINT payment_products_quota_metadata_check
  CHECK (
    (transaction_type = 'lifetime' AND quota_feature_id IS NULL AND quota_increment IS NULL)
    OR
    (transaction_type IN ('subscription', 'top_up') AND quota_feature_id IS NOT NULL AND quota_increment IS NOT NULL)
  );

CREATE OR REPLACE FUNCTION fulfill_payment_order(
  razorpay_order TEXT,
  razorpay_payment TEXT,
  order_user_id UUID,
  requested_product_id TEXT,
  paid_amount INT,
  paid_currency TEXT
)
RETURNS transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payment_transaction transactions%ROWTYPE;
  product payment_products%ROWTYPE;
  current_quota user_quotas%ROWTYPE;
  entitlement_expiry TIMESTAMPTZ;
  remaining_quota INT;
BEGIN
  SELECT * INTO payment_transaction
  FROM transactions
  WHERE razorpay_order_id = razorpay_order
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment order is not registered' USING ERRCODE = 'P0002';
  END IF;

  IF payment_transaction.user_id <> order_user_id
    OR payment_transaction.product_id <> requested_product_id THEN
    RAISE EXCEPTION 'Payment metadata does not match the registered order'
      USING ERRCODE = '22023';
  END IF;

  SELECT * INTO product
  FROM payment_products
  WHERE id = payment_transaction.product_id;

  IF NOT FOUND
    OR payment_transaction.amount <> paid_amount
    OR payment_transaction.currency <> paid_currency
    OR product.amount <> paid_amount
    OR product.currency <> paid_currency THEN
    RAISE EXCEPTION 'Payment amount or currency does not match the product'
      USING ERRCODE = '22023';
  END IF;

  IF payment_transaction.status = 'captured' THEN
    IF payment_transaction.razorpay_payment_id = razorpay_payment THEN
      RETURN payment_transaction;
    END IF;

    RAISE EXCEPTION 'Payment order was already captured by another payment'
      USING ERRCODE = '23505';
  END IF;

  IF payment_transaction.status <> 'created' THEN
    RAISE EXCEPTION 'Payment order cannot be fulfilled from status %', payment_transaction.status
      USING ERRCODE = '23514';
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

  IF product.transaction_type = 'lifetime' THEN
    INSERT INTO user_entitlements (user_id, feature_id, status, valid_until)
    VALUES (order_user_id, product.feature_id, 'active', NULL)
    ON CONFLICT (user_id, feature_id) DO UPDATE
      SET status = 'active', valid_until = NULL, updated_at = NOW();
  ELSIF product.transaction_type = 'subscription' THEN
    entitlement_expiry := NOW() + make_interval(days => product.entitlement_days);

    INSERT INTO user_entitlements (user_id, feature_id, status, valid_until)
    VALUES (order_user_id, product.feature_id, 'active', entitlement_expiry)
    ON CONFLICT (user_id, feature_id) DO UPDATE
      SET status = 'active', valid_until = EXCLUDED.valid_until, updated_at = NOW();

    SELECT * INTO current_quota
    FROM user_quotas
    WHERE user_id = order_user_id AND feature_id = product.quota_feature_id
    FOR UPDATE;

    IF FOUND THEN
      remaining_quota := GREATEST(current_quota."limit" - current_quota.used, 0);
      UPDATE user_quotas
      SET used = 0,
          "limit" = remaining_quota + product.quota_increment,
          reset_at = entitlement_expiry,
          updated_at = NOW()
      WHERE id = current_quota.id;
    ELSE
      INSERT INTO user_quotas (user_id, feature_id, used, "limit", reset_at)
      VALUES (
        order_user_id,
        product.quota_feature_id,
        0,
        product.quota_increment,
        entitlement_expiry
      );
    END IF;
  ELSIF product.transaction_type = 'top_up' THEN
    INSERT INTO user_quotas (user_id, feature_id, used, "limit")
    VALUES (order_user_id, product.quota_feature_id, 0, product.quota_increment)
    ON CONFLICT (user_id, feature_id) DO UPDATE
      SET "limit" = user_quotas."limit" + EXCLUDED."limit", updated_at = NOW();
  ELSE
    RAISE EXCEPTION 'Unsupported payment transaction type' USING ERRCODE = '22023';
  END IF;

  UPDATE transactions
  SET razorpay_payment_id = razorpay_payment,
      status = 'captured',
      updated_at = NOW()
  WHERE id = payment_transaction.id
  RETURNING * INTO payment_transaction;

  RETURN payment_transaction;
END;
$$;

REVOKE ALL ON FUNCTION fulfill_payment_order(TEXT, TEXT, UUID, TEXT, INT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION fulfill_payment_order(TEXT, TEXT, UUID, TEXT, INT, TEXT) TO service_role;

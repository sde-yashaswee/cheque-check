CREATE TABLE api_rate_limits (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INT NOT NULL DEFAULT 1 CHECK (request_count > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, endpoint, window_started_at)
);

ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX api_rate_limits_created_at_idx
  ON api_rate_limits (created_at);

CREATE OR REPLACE FUNCTION consume_api_rate_limit(
  requested_endpoint TEXT,
  request_limit INT,
  window_seconds INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  current_window TIMESTAMPTZ;
  allowed BOOLEAN;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF requested_endpoint !~ '^[a-z0-9-]{1,64}$'
    OR request_limit NOT BETWEEN 1 AND 1000
    OR window_seconds NOT BETWEEN 1 AND 86400 THEN
    RAISE EXCEPTION 'Invalid rate limit configuration' USING ERRCODE = '22023';
  END IF;

  current_window := to_timestamp(
    FLOOR(EXTRACT(EPOCH FROM NOW()) / window_seconds) * window_seconds
  );

  DELETE FROM api_rate_limits
  WHERE user_id = current_user_id
    AND endpoint = requested_endpoint
    AND window_started_at < NOW() - INTERVAL '2 days';

  INSERT INTO api_rate_limits (
    user_id,
    endpoint,
    window_started_at,
    request_count
  )
  VALUES (current_user_id, requested_endpoint, current_window, 1)
  ON CONFLICT (user_id, endpoint, window_started_at) DO UPDATE
    SET request_count = api_rate_limits.request_count + 1,
        updated_at = NOW()
    WHERE api_rate_limits.request_count < request_limit
  RETURNING TRUE INTO allowed;

  RETURN COALESCE(allowed, FALSE);
END;
$$;

CREATE OR REPLACE FUNCTION consume_user_quota(requested_feature feature_type)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  consumed BOOLEAN;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  UPDATE user_quotas
  SET used = used + 1,
      updated_at = NOW()
  WHERE user_id = current_user_id
    AND feature_id = requested_feature
    AND used < "limit"
    AND (reset_at IS NULL OR reset_at > NOW())
  RETURNING TRUE INTO consumed;

  RETURN COALESCE(consumed, FALSE);
END;
$$;

REVOKE ALL ON FUNCTION consume_api_rate_limit(TEXT, INT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION consume_user_quota(feature_type) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION consume_api_rate_limit(TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION consume_user_quota(feature_type) TO authenticated;

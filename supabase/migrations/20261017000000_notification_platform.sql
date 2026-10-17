-- Notification platform: replaces per-cheque voice tracking columns and the
-- unused reminder_logs table with a generic, multi-channel job queue + audit
-- log, plus the Postgres plumbing (RPCs, cron) needed to run it at scale.
--
-- MANUAL ONE-TIME STEP REQUIRED (do NOT put secrets in a migration file):
-- Run the following once in the Supabase SQL editor (or via `supabase secrets`
-- for the edge functions, plus these two vault entries for pg_cron -> Vault
-- is the Supabase-documented way to keep secrets out of cron job source):
--   select vault.create_secret('https://<your-project-ref>.supabase.co', 'project_url');
--   select vault.create_secret('<your-service-role-key>', 'service_role_key');
-- Until both secrets exist, the cron jobs below will fail at the net.http_post
-- call (same failure mode as the previous cron job, which relied on
-- `project.ref`/`project.service_key` custom settings that were never set).

-- 1. Drop the old per-cheque voice-call tracking columns (moved to
--    notification_jobs/notification_logs below).
ALTER TABLE cheques DROP COLUMN IF EXISTS voice_call_sent;
ALTER TABLE cheques DROP COLUMN IF EXISTS last_call_at;

-- 2. Drop the unused reminder_logs table (never populated; too narrow to
--    extend - single cheque_id, no job/purpose concept).
DROP POLICY IF EXISTS "Users can manage reminder logs for their cheques" ON reminder_logs;
DROP TABLE IF EXISTS reminder_logs;
DROP TYPE IF EXISTS reminder_type;
DROP TYPE IF EXISTS reminder_status;

-- 3. notification_jobs: the scheduled/queued work items.
-- channel/status use CHECK constraints (small, stable sets). purpose is
-- intentionally unconstrained TEXT (NOT an enum/CHECK list) so new business
-- events can be added without a migration - validated at the app layer
-- instead (see supabase/functions/_shared/notifications.ts, NOTIFICATION_PURPOSE).
CREATE TABLE notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('voice', 'whatsapp', 'email', 'push', 'sms')),
  purpose TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'skipped', 'cancelled')),
  attempts INT NOT NULL DEFAULT 0,
  last_error TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notification_jobs_claim_idx ON notification_jobs (scheduled_at) WHERE status = 'pending';
CREATE INDEX notification_jobs_user_id_idx ON notification_jobs (user_id);

-- 4. notification_logs: immutable delivery audit trail (replaces reminder_logs).
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES notification_jobs(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('voice', 'whatsapp', 'email', 'push', 'sms')),
  purpose TEXT NOT NULL,
  recipient TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  provider TEXT NOT NULL,
  provider_message_id TEXT,
  provider_response JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notification_logs_user_id_idx ON notification_logs (user_id, created_at DESC);
CREATE INDEX notification_logs_job_id_idx ON notification_logs (job_id);

-- 5. push_subscriptions: Web Push (VAPID) endpoints, wired up in a later phase
--    but created now to avoid a second breaking migration.
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX push_subscriptions_user_id_idx ON push_subscriptions (user_id);

-- RLS
ALTER TABLE notification_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification jobs" ON notification_jobs
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can view their own notification logs" ON notification_logs
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- 6. RPC: atomically claim a batch of due jobs (SKIP LOCKED makes this safe
--    across overlapping dispatcher invocations - required for 10k-user scale).
CREATE OR REPLACE FUNCTION claim_notification_jobs(p_batch_size INT DEFAULT 50)
RETURNS SETOF notification_jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE notification_jobs
  SET status = 'processing', attempts = attempts + 1, updated_at = NOW()
  WHERE id IN (
    SELECT id FROM notification_jobs
    WHERE status = 'pending' AND scheduled_at <= NOW()
    ORDER BY scheduled_at ASC
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  )
  RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION claim_notification_jobs(INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION claim_notification_jobs(INT) TO service_role;

-- 7. RPC: atomic quota increment for service-role contexts (edge functions
--    run with no auth.uid(), unlike the existing consume_user_quota()).
--    Fixes the read-then-write race condition in the old incrementVoiceQuota.
CREATE OR REPLACE FUNCTION admin_increment_quota(p_user_id UUID, p_feature_id feature_type)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  consumed BOOLEAN;
BEGIN
  UPDATE user_quotas
  SET used = used + 1, updated_at = NOW()
  WHERE user_id = p_user_id
    AND feature_id = p_feature_id
    AND used < "limit"
    AND (reset_at IS NULL OR reset_at > NOW())
  RETURNING TRUE INTO consumed;

  RETURN COALESCE(consumed, FALSE);
END;
$$;

REVOKE ALL ON FUNCTION admin_increment_quota(UUID, feature_type) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_increment_quota(UUID, feature_type) TO service_role;

-- 8. Replace the old single daily cron job with a scheduler/dispatcher pair,
--    reading project URL + service role key from Vault instead of the
--    never-configured `project.ref`/`project.service_key` custom settings.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-cheque-reminders') THEN
    PERFORM cron.unschedule('daily-cheque-reminders');
  END IF;
END $$;

SELECT cron.schedule(
  'notifications-scheduler-tick',
  '*/15 * * * *',
  $$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/notifications-scheduler',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);

SELECT cron.schedule(
  'notifications-dispatcher-tick',
  '*/2 * * * *',
  $$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/notifications-dispatcher',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
      ),
      body := '{}'::jsonb
    );
  $$
);

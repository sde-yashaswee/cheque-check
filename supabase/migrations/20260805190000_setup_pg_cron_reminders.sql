-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule job at 03:30 UTC (9:00 AM IST) daily
-- Note: Replace <PROJECT_REF> and <SERVICE_ROLE_KEY> with actual values or use vault
SELECT cron.schedule(
  'daily-cheque-reminders',
  '30 3 * * *',
  $$
    SELECT net.http_post(
      url:='https://' || current_setting('project.ref', true) || '.supabase.co/functions/v1/send-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('project.service_key', true) || '"}'::jsonb,
      body:='{}'::jsonb
    );
  $$
);

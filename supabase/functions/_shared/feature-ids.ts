// Mirrors src/features/monetization/constants.ts FEATURE_IDS - keep in sync
// with the `feature_type` Postgres enum
// (supabase/migrations/20260807000000_monetization_schema.sql). Deno edge
// functions can't import from src/, so this only duplicates the one value
// the notification functions actually need.
export const FEATURE_IDS = {
  VOICE_REMINDER: 'voice_reminder',
} as const

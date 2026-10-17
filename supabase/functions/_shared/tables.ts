// Deno cannot import from src/, so table names are mirrored here.
// Keep in sync with src/lib/supabase/tables.ts.
export const TABLES = {
  PROFILES: 'profiles',
  BUSINESSES: 'businesses',
  PARTIES: 'parties',
  BANKS: 'banks',
  ACCOUNTS: 'accounts',
  CHEQUES: 'cheques',
  USER_ENTITLEMENTS: 'user_entitlements',
  USER_QUOTAS: 'user_quotas',
  TRANSACTIONS: 'transactions',
  PAYMENT_PRODUCTS: 'payment_products',
  API_RATE_LIMITS: 'api_rate_limits',
  NOTIFICATION_JOBS: 'notification_jobs',
  NOTIFICATION_LOGS: 'notification_logs',
  PUSH_SUBSCRIPTIONS: 'push_subscriptions',
} as const

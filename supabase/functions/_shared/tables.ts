// Deno cannot import from src/, so table names are mirrored here.
// Keep in sync with src/lib/supabase/tables.ts.
export const TABLES = {
  PROFILES: 'profiles',
  BUSINESSES: 'businesses',
  PARTIES: 'parties',
  BANKS: 'banks',
  ACCOUNTS: 'accounts',
  CHEQUES: 'cheques',
  REMINDER_LOGS: 'reminder_logs',
  USER_ENTITLEMENTS: 'user_entitlements',
  USER_QUOTAS: 'user_quotas',
  TRANSACTIONS: 'transactions',
  PAYMENT_PRODUCTS: 'payment_products',
  API_RATE_LIMITS: 'api_rate_limits',
} as const

import type { Database } from '@/types/database.types'

type PublicTableName = keyof Database['public']['Tables']

// Central table-name registry so `.from(...)` calls get editor autocomplete and
// break at compile time if a migration renames or drops a table.
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
} as const satisfies Record<string, PublicTableName>

export type TableName = (typeof TABLES)[keyof typeof TABLES]

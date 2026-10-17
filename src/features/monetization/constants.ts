import { z } from 'zod'

// Single source of truth for monetization identifiers. Mirrors the Postgres
// `feature_type` enum (supabase/migrations/20260807000000_monetization_schema.sql)
// and the `payment_products` catalog
// (supabase/migrations/20260924010000_add_payment_product_catalog.sql).
// Renaming a value here requires a matching DB migration either way - this
// file exists so the string only needs to be typed once in the app layer,
// instead of being re-typed independently in every consumer.
export const FEATURE_IDS = {
  AI_SCAN: 'ai_scan',
  VOICE_REMINDER: 'voice_reminder',
  LIFETIME_PREMIUM: 'lifetime_premium',
  AI_SCANNER_SUB: 'ai_scanner_sub',
  VOICE_REMINDER_SUB: 'voice_reminder_sub',
} as const

export type FeatureId = (typeof FEATURE_IDS)[keyof typeof FEATURE_IDS]

export const ALL_FEATURE_IDS = Object.values(FEATURE_IDS) as FeatureId[]

/** Feature IDs tracked via user_quotas (usage/limit), as opposed to a plain on/off entitlement. */
export const METERED_FEATURE_IDS: FeatureId[] = [
  FEATURE_IDS.AI_SCAN,
  FEATURE_IDS.VOICE_REMINDER,
]

export const ENTITLEMENT_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELED: 'canceled',
} as const

export type EntitlementStatus =
  (typeof ENTITLEMENT_STATUS)[keyof typeof ENTITLEMENT_STATUS]

export const ALL_ENTITLEMENT_STATUSES = Object.values(
  ENTITLEMENT_STATUS,
) as EntitlementStatus[]

export const PRODUCT_IDS = {
  LIFETIME_PREMIUM: 'lifetime_premium',
  AI_SCANNER_30D: 'ai_scanner_30d',
  VOICE_REMINDER_30D: 'voice_reminder_30d',
  AI_SCAN_250: 'ai_scan_250',
  VOICE_REMINDER_100: 'voice_reminder_100',
} as const

export type ProductId = (typeof PRODUCT_IDS)[keyof typeof PRODUCT_IDS]

export const ALL_PRODUCT_IDS = Object.values(PRODUCT_IDS) as [
  ProductId,
  ...ProductId[],
]

export const ProductIdSchema = z.enum(ALL_PRODUCT_IDS)

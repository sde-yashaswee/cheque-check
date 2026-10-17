import type { Entitlement } from '../repositories/monetization.repository'

export const PREMIUM_FEATURES = [
  'notify-party',
  'contact-import',
  'duplicate-cheque',
  'cheque-printing',
  'reports',
  'bulk-import',
  'cheque-templates',
  'bulk-actions',
  'saved-views',
  'party-statements',
  'consolidated-dashboard',
  'message-templates',
  'inward-tracking',
] as const

export type PremiumFeature = (typeof PREMIUM_FEATURES)[number]
export type PremiumState =
  | 'loading'
  | 'error'
  | 'free'
  | 'trialing'
  | 'active'
  | 'paused'
  | 'canceled'
  | 'expired'

export function entitlementHasAccess(
  entitlement: Entitlement | undefined,
  now: number,
): boolean {
  if (!entitlement) return false
  if (entitlement.status !== 'active' && entitlement.status !== 'trialing')
    return false
  if (entitlement.status === 'trialing' && entitlement.valid_until === null)
    return false
  return (
    entitlement.valid_until === null ||
    (Number.isFinite(Date.parse(entitlement.valid_until)) &&
      Date.parse(entitlement.valid_until) > now)
  )
}

export function resolvePremiumState(
  entitlement: Entitlement | undefined,
  now: number,
): PremiumState {
  if (!entitlement) return 'free'
  if (entitlement.status === 'paused' || entitlement.status === 'canceled')
    return entitlement.status
  if (!entitlementHasAccess(entitlement, now)) return 'expired'
  return entitlement.status === 'trialing' ? 'trialing' : 'active'
}

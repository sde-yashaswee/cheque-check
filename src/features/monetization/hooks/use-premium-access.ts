'use client'

import { useEntitlements } from './use-entitlements'
import { FEATURE_IDS } from '../constants'
import {
  PREMIUM_FEATURES,
  resolvePremiumState,
  type PremiumFeature,
  type PremiumState,
} from '../lib/premium-access'

export function usePremiumAccess() {
  const query = useEntitlements()
  const entitlement = query.data?.find(
    (entry) => entry.feature_id === FEATURE_IDS.LIFETIME_PREMIUM,
  )
  const state: PremiumState = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : resolvePremiumState(entitlement, query.dataUpdatedAt)
  const hasAccess = state === 'active' || state === 'trialing'

  return {
    state,
    hasAccess,
    hasLifetimePurchase:
      hasAccess && state === 'active' && entitlement?.valid_until === null,
    isLoading: query.isPending,
    error: query.error,
    validUntil: entitlement?.valid_until ?? null,
    canUse: (feature: PremiumFeature) =>
      hasAccess && PREMIUM_FEATURES.includes(feature),
    refresh: query.refetch,
  }
}

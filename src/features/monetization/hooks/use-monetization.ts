import { useQuery } from '@tanstack/react-query'
import { monetizationService } from '@/features/monetization/services/monetization.service'
import type {
  Entitlement,
  Quota,
} from '@/features/monetization/repositories/monetization.repository'
import { FEATURE_IDS } from '@/features/monetization/constants'
import { queryKeys } from '@/lib/query-keys'
import { useEntitlements } from './use-entitlements'
import {
  entitlementHasAccess,
  resolvePremiumState,
} from '../lib/premium-access'

export function useMonetization() {
  const {
    data: entitlements,
    isLoading: isLoadingEntitlements,
    error: entitlementsError,
    dataUpdatedAt,
  } = useEntitlements()

  const {
    data: quotas,
    isLoading: isLoadingQuotas,
    error: quotasError,
  } = useQuery<Quota[]>({
    queryKey: queryKeys.monetization.quotas(),
    queryFn: () => monetizationService.getQuotas(),
  })

  const isActive = (e: Entitlement) =>
    !entitlementsError &&
    entitlementHasAccess(e, dataUpdatedAt) &&
    (e.feature_id === FEATURE_IDS.LIFETIME_PREMIUM || e.status === 'active')

  const isLifetimePremium = entitlements?.some(
    (e: Entitlement) =>
      e.feature_id === FEATURE_IDS.LIFETIME_PREMIUM && isActive(e),
  )
  const hasAiScannerSub = entitlements?.some(
    (e: Entitlement) =>
      e.feature_id === FEATURE_IDS.AI_SCANNER_SUB && isActive(e),
  )
  const hasVoiceReminderSub = entitlements?.some(
    (e: Entitlement) =>
      e.feature_id === FEATURE_IDS.VOICE_REMINDER_SUB && isActive(e),
  )

  const getQuota = (featureId: string) => {
    return quotas?.find((q: Quota) => q.feature_id === featureId)
  }

  const checkEntitlement = (featureId: string) => {
    return entitlements?.some(
      (e: Entitlement) => e.feature_id === featureId && isActive(e),
    )
  }

  return {
    entitlements,
    quotas,
    isLoading: isLoadingEntitlements || isLoadingQuotas,
    error: entitlementsError || quotasError,
    isLifetimePremium,
    hasAiScannerSub,
    hasVoiceReminderSub,
    getQuota,
    checkEntitlement,
    getEntitlementState: (featureId: string) =>
      isLoadingEntitlements
        ? 'loading'
        : entitlementsError
          ? 'error'
          : resolvePremiumState(
              entitlements?.find((entry) => entry.feature_id === featureId),
              dataUpdatedAt,
            ),
  }
}

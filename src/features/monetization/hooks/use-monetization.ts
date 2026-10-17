import { useQuery } from '@tanstack/react-query'
import { monetizationService } from '@/features/monetization/services/monetization.service'
import type {
  Entitlement,
  Quota,
} from '@/features/monetization/repositories/monetization.repository'
import {
  ENTITLEMENT_STATUS,
  FEATURE_IDS,
} from '@/features/monetization/constants'
import { queryKeys } from '@/lib/query-keys'

export function useMonetization() {
  const { data: entitlements, isLoading: isLoadingEntitlements } = useQuery<
    Entitlement[]
  >({
    queryKey: queryKeys.monetization.entitlements(),
    queryFn: () => monetizationService.getEntitlements(),
  })

  const { data: quotas, isLoading: isLoadingQuotas } = useQuery<Quota[]>({
    queryKey: queryKeys.monetization.quotas(),
    queryFn: () => monetizationService.getQuotas(),
  })

  const isLifetimePremium = entitlements?.some(
    (e: Entitlement) =>
      e.feature_id === FEATURE_IDS.LIFETIME_PREMIUM &&
      e.status === ENTITLEMENT_STATUS.ACTIVE,
  )
  const hasAiScannerSub = entitlements?.some(
    (e: Entitlement) =>
      e.feature_id === FEATURE_IDS.AI_SCANNER_SUB &&
      e.status === ENTITLEMENT_STATUS.ACTIVE,
  )
  const hasVoiceReminderSub = entitlements?.some(
    (e: Entitlement) =>
      e.feature_id === FEATURE_IDS.VOICE_REMINDER_SUB &&
      e.status === ENTITLEMENT_STATUS.ACTIVE,
  )

  const getQuota = (featureId: string) => {
    return quotas?.find((q: Quota) => q.feature_id === featureId)
  }

  const checkEntitlement = (featureId: string) => {
    return entitlements?.some(
      (e: Entitlement) =>
        e.feature_id === featureId && e.status === ENTITLEMENT_STATUS.ACTIVE,
    )
  }

  return {
    entitlements,
    quotas,
    isLoading: isLoadingEntitlements || isLoadingQuotas,
    isLifetimePremium,
    hasAiScannerSub,
    hasVoiceReminderSub,
    getQuota,
    checkEntitlement,
  }
}

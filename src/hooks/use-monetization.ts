import { useQuery } from '@tanstack/react-query'
import { monetizationService } from '@/services/monetization.service'
import type { Entitlement, Quota } from '@/repositories/monetization.repository'

export function useMonetization() {
  const { data: entitlements, isLoading: isLoadingEntitlements } = useQuery<
    Entitlement[]
  >({
    queryKey: ['entitlements'],
    queryFn: () => monetizationService.getEntitlements(),
  })

  const { data: quotas, isLoading: isLoadingQuotas } = useQuery<Quota[]>({
    queryKey: ['quotas'],
    queryFn: () => monetizationService.getQuotas(),
  })

  const isLifetimePremium = entitlements?.some(
    (e: Entitlement) =>
      e.feature_id === 'lifetime_premium' && e.status === 'active',
  )
  const hasAiScannerSub = entitlements?.some(
    (e: Entitlement) =>
      e.feature_id === 'ai_scanner_sub' && e.status === 'active',
  )
  const hasVoiceReminderSub = entitlements?.some(
    (e: Entitlement) =>
      e.feature_id === 'voice_reminder_sub' && e.status === 'active',
  )

  const getQuota = (featureId: string) => {
    return quotas?.find((q: Quota) => q.feature_id === featureId)
  }

  const checkEntitlement = (featureId: string) => {
    return entitlements?.some(
      (e: Entitlement) => e.feature_id === featureId && e.status === 'active',
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

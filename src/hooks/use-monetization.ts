import { useQuery } from '@tanstack/react-query';
import { MonetizationService } from '@/services/monetization.service';

export function useMonetization() {
  const { data: entitlements, isLoading: isLoadingEntitlements } = useQuery({
    queryKey: ['entitlements'],
    queryFn: () => MonetizationService.getEntitlements(),
  });

  const { data: quotas, isLoading: isLoadingQuotas } = useQuery({
    queryKey: ['quotas'],
    queryFn: () => MonetizationService.getQuotas(),
  });

  const isLifetimePremium = entitlements?.some(e => e.feature_id === 'lifetime_premium' && e.status === 'active');
  const hasAiScannerSub = entitlements?.some(e => e.feature_id === 'ai_scanner_sub' && e.status === 'active');
  const hasVoiceReminderSub = entitlements?.some(e => e.feature_id === 'voice_reminder_sub' && e.status === 'active');

  const getQuota = (featureId: string) => {
    return quotas?.find(q => q.feature_id === featureId);
  };

  const checkEntitlement = (featureId: string) => {
    return entitlements?.some(e => e.feature_id === featureId && e.status === 'active');
  };

  return {
    entitlements,
    quotas,
    isLoading: isLoadingEntitlements || isLoadingQuotas,
    isLifetimePremium,
    hasAiScannerSub,
    hasVoiceReminderSub,
    getQuota,
    checkEntitlement,
  };
}

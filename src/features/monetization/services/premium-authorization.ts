import { monetizationService } from './monetization.service'
import { entitlementHasAccess } from '../lib/premium-access'
import { FEATURE_IDS } from '../constants'
import type { Entitlement } from '../repositories/monetization.repository'

export async function verifyLifetimePremium(): Promise<boolean> {
  const entitlements: Entitlement[] =
    await monetizationService.getEntitlements()
  return entitlementHasAccess(
    entitlements.find(
      (entry) => entry.feature_id === FEATURE_IDS.LIFETIME_PREMIUM,
    ),
    Date.now(),
  )
}

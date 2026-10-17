import { describe, expect, it } from 'vitest'
import {
  PREMIUM_FEATURES,
  entitlementHasAccess,
  resolvePremiumState,
} from './premium-access'
import type { Entitlement } from '../repositories/monetization.repository'

const now = Date.parse('2026-10-17T12:00:00Z')
function grant(
  status: Entitlement['status'],
  valid_until: string | null = null,
): Entitlement {
  return {
    id: 'grant',
    user_id: 'user',
    feature_id: 'lifetime_premium',
    status,
    valid_until,
  }
}

describe('Lifetime Premium policy', () => {
  it.each([
    [undefined, 'free', false],
    [grant('active'), 'active', true],
    [grant('active', '2026-10-18T12:00:00Z'), 'active', true],
    [grant('active', '2026-10-17T12:00:00Z'), 'expired', false],
    [grant('active', '2026-10-16T12:00:00Z'), 'expired', false],
    [grant('trialing', '2026-10-18T12:00:00Z'), 'trialing', true],
    [grant('trialing', '2026-10-17T12:00:00Z'), 'expired', false],
    [grant('trialing'), 'expired', false],
    [grant('trialing', 'invalid'), 'expired', false],
    [grant('active', 'invalid'), 'expired', false],
    [grant('paused'), 'paused', false],
    [grant('paused', '2026-10-18T12:00:00Z'), 'paused', false],
    [grant('canceled'), 'canceled', false],
    [grant('expired'), 'expired', false],
  ] as const)(
    'resolves %j to %s with access %s',
    (entitlement, state, allowed) => {
      expect(resolvePremiumState(entitlement, now)).toBe(state)
      expect(entitlementHasAccess(entitlement, now)).toBe(allowed)
    },
  )

  it('catalogs every proposed benefit without metered AI or Voice products', () => {
    expect(PREMIUM_FEATURES).toHaveLength(13)
    expect(PREMIUM_FEATURES).not.toContain('ai_scan')
    expect(PREMIUM_FEATURES).not.toContain('voice_reminder')
  })
})

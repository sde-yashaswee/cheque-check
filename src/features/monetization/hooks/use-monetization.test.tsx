import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { FEATURE_IDS } from '@/features/monetization/constants'
import { useMonetization } from './use-monetization'

const mocks = vi.hoisted(() => ({ entitlements: vi.fn(), quotas: vi.fn() }))
vi.mock('@/features/monetization/services/monetization.service', () => ({
  monetizationService: {
    getEntitlements: mocks.entitlements,
    getQuotas: mocks.quotas,
  },
}))

function renderAccess() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return renderHook(() => useMonetization(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  })
}

describe('useMonetization', () => {
  it('does not treat expired or canceled access as an active subscription', async () => {
    mocks.entitlements.mockResolvedValue([
      {
        feature_id: FEATURE_IDS.AI_SCANNER_SUB,
        status: 'active',
        valid_until: '2020-01-01T00:00:00Z',
      },
      {
        feature_id: FEATURE_IDS.VOICE_REMINDER_SUB,
        status: 'canceled',
        valid_until: null,
      },
      {
        feature_id: FEATURE_IDS.LIFETIME_PREMIUM,
        status: 'active',
        valid_until: null,
      },
    ])
    mocks.quotas.mockResolvedValue([])
    const { result } = renderAccess()
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.isLifetimePremium).toBe(true)
    expect(result.current.hasAiScannerSub).toBe(false)
    expect(result.current.hasVoiceReminderSub).toBe(false)
    expect(result.current.checkEntitlement(FEATURE_IDS.AI_SCANNER_SUB)).toBe(
      false,
    )
  })

  it('exposes access errors so purchases are not offered on failed entitlement loads', async () => {
    mocks.entitlements.mockRejectedValue(new Error('Access unavailable'))
    mocks.quotas.mockResolvedValue([])
    const { result } = renderAccess()
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error?.message).toBe('Access unavailable')
  })
})

import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { queryKeys } from '@/lib/query-keys'
import { usePremiumAccess } from './use-premium-access'

const mocks = vi.hoisted(() => ({ entitlements: vi.fn() }))
vi.mock('../services/monetization.service', () => ({
  monetizationService: { getEntitlements: mocks.entitlements },
}))
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function setup() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const hook = renderHook(() => usePremiumAccess(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  })
  return { client, ...hook }
}

describe('usePremiumAccess', () => {
  it('fails closed while loading and on request failure', async () => {
    mocks.entitlements.mockRejectedValue(new Error('Unavailable'))
    const { result } = setup()
    expect(result.current.state).toBe('loading')
    expect(result.current.canUse('notify-party')).toBe(false)
    await waitFor(() => expect(result.current.state).toBe('error'))
    expect(result.current.hasAccess).toBe(false)
  })

  it('does not confuse add-on entitlements with Lifetime Premium', async () => {
    mocks.entitlements.mockResolvedValue([
      { feature_id: 'ai_scanner_sub', status: 'active', valid_until: null },
    ])
    const { result } = setup()
    await waitFor(() => expect(result.current.state).toBe('free'))
    expect(result.current.canUse('bulk-import')).toBe(false)
  })

  it('lets a granted trial use Premium tools without claiming a lifetime purchase', async () => {
    mocks.entitlements.mockResolvedValue([
      {
        feature_id: 'lifetime_premium',
        status: 'trialing',
        valid_until: '2099-01-01T00:00:00Z',
      },
    ])
    const { result } = setup()
    await waitFor(() => expect(result.current.state).toBe('trialing'))
    expect(result.current.canUse('notify-party')).toBe(true)
    expect(result.current.hasLifetimePurchase).toBe(false)
  })

  it('revokes all Premium gates when the authoritative grant is paused or canceled', async () => {
    mocks.entitlements.mockResolvedValue([
      { feature_id: 'lifetime_premium', status: 'active', valid_until: null },
    ])
    const { result, client } = setup()
    await waitFor(() => expect(result.current.hasLifetimePurchase).toBe(true))
    act(() =>
      client.setQueryData(queryKeys.monetization.entitlements(), [
        { feature_id: 'lifetime_premium', status: 'paused', valid_until: null },
      ]),
    )
    await waitFor(() => expect(result.current.state).toBe('paused'))
    expect(result.current.canUse('duplicate-cheque')).toBe(false)
    act(() =>
      client.setQueryData(queryKeys.monetization.entitlements(), [
        {
          feature_id: 'lifetime_premium',
          status: 'canceled',
          valid_until: null,
        },
      ]),
    )
    await waitFor(() => expect(result.current.state).toBe('canceled'))
    expect(result.current.canUse('reports')).toBe(false)
  })

  it('expires a finite trial automatically without a navigation or user action', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-17T12:00:00Z'))
    mocks.entitlements.mockResolvedValue([
      {
        feature_id: 'lifetime_premium',
        status: 'trialing',
        valid_until: '2026-10-17T12:00:01Z',
      },
    ])
    const { result } = setup()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(result.current.state).toBe('trialing')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_020)
    })
    expect(result.current.state).toBe('expired')
    expect(result.current.canUse('saved-views')).toBe(false)
    expect(mocks.entitlements.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('blocks stale granted access when its refetch fails', async () => {
    mocks.entitlements.mockResolvedValue([
      { feature_id: 'lifetime_premium', status: 'active', valid_until: null },
    ])
    const { result } = setup()
    await waitFor(() => expect(result.current.hasAccess).toBe(true))
    mocks.entitlements.mockRejectedValue(new Error('Verification unavailable'))
    await act(async () => {
      await result.current.refresh()
    })
    await waitFor(() => expect(result.current.state).toBe('error'))
    expect(result.current.hasAccess).toBe(false)
    expect(result.current.canUse('reports')).toBe(false)
  })
})

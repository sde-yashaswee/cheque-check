import {
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import { PremiumGate, usePremiumAction } from './premium-gate'
import { PREMIUM_FEATURES, type PremiumState } from '../lib/premium-access'
import messages from '../../../../messages/en.json'

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  toast: vi.fn(),
  push: vi.fn(),
  verify: vi.fn(),
  state: 'free' as PremiumState,
}))
vi.mock('../hooks/use-premium-access', () => ({
  usePremiumAccess: () => ({
    state: mocks.state,
    hasAccess: mocks.state === 'active' || mocks.state === 'trialing',
    isLoading: mocks.state === 'loading',
    refresh: mocks.refresh,
    canUse: () => mocks.state === 'active' || mocks.state === 'trialing',
  }),
}))
vi.mock('../services/premium-authorization', () => ({
  verifyLifetimePremium: mocks.verify,
}))
vi.mock('@/components/ui/toast', () => ({ toast: { add: mocks.toast } }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }))
afterEach(cleanup)
beforeEach(() => {
  vi.clearAllMocks()
  mocks.state = 'free'
})

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}

describe('PremiumGate', () => {
  it.each(PREMIUM_FEATURES)(
    'blocks %s for free users without blocking core controls',
    (feature) => {
      render(
        <>
          <button>Update cheque status</button>
          <PremiumGate feature={feature}>
            <button>Paid operation</button>
          </PremiumGate>
        </>,
        { wrapper: Wrapper },
      )
      expect(
        screen.queryByRole('button', { name: 'Paid operation' }),
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Update cheque status' }),
      ).toBeEnabled()
      expect(
        screen.getByRole('link', { name: messages.Premium.viewPlan }),
      ).toHaveAttribute('href', '/features')
    },
  )

  it.each(['active', 'trialing'] as const)(
    'allows Premium features for %s access',
    (state) => {
      mocks.state = state
      render(
        <PremiumGate feature="bulk-import">
          <button>Import</button>
        </PremiumGate>,
        { wrapper: Wrapper },
      )
      expect(screen.getByRole('button', { name: 'Import' })).toBeEnabled()
      expect(screen.queryByTestId('premium-gate')).not.toBeInTheDocument()
    },
  )

  it.each(['paused', 'canceled', 'expired'] as const)(
    'explains %s without mounting the paid workflow',
    (state) => {
      mocks.state = state
      render(
        <PremiumGate feature="reports">
          <button>Export</button>
        </PremiumGate>,
        { wrapper: Wrapper },
      )
      expect(
        screen.getByText(messages.Premium.states[state]),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Export' }),
      ).not.toBeInTheDocument()
    },
  )

  it('does not show an upsell or protected content while access is loading', () => {
    mocks.state = 'loading'
    render(<PremiumGate feature="reports">Protected</PremiumGate>, {
      wrapper: Wrapper,
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      messages.Premium.loading,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('offers retry rather than pretending an access error is a free plan', () => {
    mocks.state = 'error'
    render(<PremiumGate feature="reports">Protected</PremiumGate>, {
      wrapper: Wrapper,
    })
    fireEvent.click(
      screen.getByRole('button', { name: messages.Premium.retry }),
    )
    expect(mocks.refresh).toHaveBeenCalledOnce()
    expect(screen.getByRole('alert')).toHaveTextContent(
      messages.Premium.states.error,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

describe('Premium execution guard', () => {
  it('does not even call protected authorization for a blocked user', async () => {
    const { result } = renderHook(() => usePremiumAction(), {
      wrapper: Wrapper,
    })
    expect(await result.current.verifyAccess('cheque-printing')).toBe(false)
    expect(mocks.verify).not.toHaveBeenCalled()
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'info' }),
    )
  })

  it('rechecks authorization before executing and handles revocation', async () => {
    mocks.state = 'active'
    mocks.verify.mockResolvedValue(false)
    const { result } = renderHook(() => usePremiumAction(), {
      wrapper: Wrapper,
    })
    expect(await result.current.verifyAccess('duplicate-cheque')).toBe(false)
    expect(mocks.refresh).toHaveBeenCalledOnce()
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({ description: messages.Premium.states.expired }),
    )
  })

  it('surfaces authorization errors instead of running the operation', async () => {
    mocks.state = 'active'
    mocks.verify.mockRejectedValue(new Error('Verification unavailable'))
    const { result } = renderHook(() => usePremiumAction(), {
      wrapper: Wrapper,
    })
    expect(await result.current.verifyAccess('reports')).toBe(false)
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'error',
        description: 'Verification unavailable',
      }),
    )
  })
})

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PRODUCT_IDS } from '@/features/monetization/constants'
import { useRazorpay } from './use-razorpay'

const mocks = vi.hoisted(() => ({ order: vi.fn(), open: vi.fn() }))
vi.mock('@/lib/env/client', () => ({ getRazorpayPublicKey: () => 'test-key' }))
vi.mock('@/features/monetization/services/payment.service', () => ({
  paymentService: { createOrder: mocks.order },
}))

let options: ConstructorParameters<typeof window.Razorpay>[0]

beforeEach(() => {
  vi.clearAllMocks()
  mocks.order.mockResolvedValue({
    id: 'order',
    amount: 5000,
    currency: 'INR',
    name: 'Scanner',
  })
  window.Razorpay = class {
    constructor(value: typeof options) {
      options = value
    }
    open = mocks.open
  }
})

describe('useRazorpay', () => {
  it('keeps checkout busy until dismissal and rejects duplicate checkout requests', async () => {
    const { result } = renderHook(() => useRazorpay())
    await act(async () => {
      await result.current.processPayment({
        productId: PRODUCT_IDS.AI_SCANNER_30D,
      })
    })
    expect(result.current.isProcessing).toBe(true)
    await act(async () => {
      await result.current.processPayment({
        productId: PRODUCT_IDS.AI_SCANNER_30D,
      })
    })
    expect(mocks.order).toHaveBeenCalledTimes(1)
    act(() => options.modal.ondismiss())
    expect(result.current.isProcessing).toBe(false)
  })

  it('releases checkout and refreshes access on payment success', async () => {
    const success = vi.fn()
    const { result } = renderHook(() => useRazorpay())
    await act(async () => {
      await result.current.processPayment({
        productId: PRODUCT_IDS.LIFETIME_PREMIUM,
        onSuccess: success,
      })
    })
    act(() =>
      options.handler({
        razorpay_order_id: 'order',
        razorpay_payment_id: 'payment',
        razorpay_signature: 'signature',
      }),
    )
    expect(result.current.isProcessing).toBe(false)
    expect(success).toHaveBeenCalledTimes(1)
  })

  it('releases checkout and surfaces order creation errors', async () => {
    mocks.order.mockRejectedValue(new Error('Product unavailable'))
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => useRazorpay())
    await act(async () => {
      await result.current.processPayment({
        productId: PRODUCT_IDS.AI_SCANNER_30D,
      })
    })
    expect(result.current.isProcessing).toBe(false)
    expect(alert).toHaveBeenCalledWith('Product unavailable')
    expect(mocks.open).not.toHaveBeenCalled()
    alert.mockRestore()
    log.mockRestore()
  })
})

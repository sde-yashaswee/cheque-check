import { afterEach, describe, expect, it, vi } from 'vitest'
import { paymentService } from './payment.service'

describe('PaymentService', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates a payment order via the API contract', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'order_123',
        amount: 19900,
        currency: 'INR',
        productId: 'lifetime_premium',
        name: 'Lifetime Premium',
      }),
    } as Response)

    const result = await paymentService.createOrder('lifetime_premium')

    expect(fetchSpy).toHaveBeenCalledWith('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'lifetime_premium' }),
    })
    expect(result).toEqual({
      id: 'order_123',
      amount: 19900,
      currency: 'INR',
      productId: 'lifetime_premium',
      name: 'Lifetime Premium',
    })
  })

  it('throws the server error when order creation fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Payment product is unavailable' }),
    } as Response)

    await expect(
      paymentService.createOrder('lifetime_premium'),
    ).rejects.toThrow('Payment product is unavailable')
  })
})

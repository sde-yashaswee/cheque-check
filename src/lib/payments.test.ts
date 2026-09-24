import { describe, expect, it } from 'vitest'
import {
  CreatePaymentOrderSchema,
  PaymentOrderSchema,
  PaymentProductIdSchema,
} from './payments'

describe('payment contracts', () => {
  it('accepts catalogue product IDs', () => {
    expect(PaymentProductIdSchema.parse('ai_scanner_30d')).toBe(
      'ai_scanner_30d',
    )
  })

  it('strips client-controlled price fields', () => {
    const result = CreatePaymentOrderSchema.parse({
      productId: 'lifetime_premium',
      amount: 1,
      currency: 'USD',
    })

    expect(result).toEqual({ productId: 'lifetime_premium' })
  })

  it('validates server order responses', () => {
    expect(
      PaymentOrderSchema.safeParse({
        id: 'order_123',
        amount: 30000,
        currency: 'INR',
        productId: 'lifetime_premium',
        name: 'Lifetime Premium',
      }).success,
    ).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import { paymentProductIcons } from './payment-product-icons'

describe('paymentProductIcons', () => {
  it('defines an icon for every payment product', () => {
    expect(Object.keys(paymentProductIcons)).toHaveLength(5)
    expect(Object.values(paymentProductIcons)).toHaveLength(5)
  })

  it('uses a distinct icon for each product', () => {
    expect(new Set(Object.values(paymentProductIcons)).size).toBe(5)
  })
})

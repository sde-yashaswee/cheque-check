import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/env/client', () => ({
  publicEnv: { NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER: undefined },
}))

import { getWhatsAppSupportLink, getWhatsAppSupportNumber } from './whatsapp'

describe('getWhatsAppSupportNumber', () => {
  it('falls back to the default support number when unset', () => {
    expect(getWhatsAppSupportNumber()).toBe('919794457099')
  })
})

describe('getWhatsAppSupportLink', () => {
  it('builds a wa.me link without a message', () => {
    expect(getWhatsAppSupportLink()).toBe('https://wa.me/919794457099')
  })

  it('builds a wa.me link with an encoded message', () => {
    expect(getWhatsAppSupportLink('Hi there')).toBe(
      'https://wa.me/919794457099?text=Hi%20there',
    )
  })
})

import { describe, expect, it } from 'vitest'
import { buildChequeUpdateMessage, buildSmsLink } from './notify-party'

describe('notify-party', () => {
  const cheque = {
    cheque_number: '123456',
    amount: 12500,
    cheque_date: '2026-09-30',
    status: 'Issued' as const,
  }

  it('builds a readable cheque update message', () => {
    expect(
      buildChequeUpdateMessage(cheque, { name: 'Acme Ltd' }, '₹'),
    ).toContain('Hi Acme Ltd')
    expect(
      buildChequeUpdateMessage(cheque, { name: 'Acme Ltd' }, '₹'),
    ).toContain('Cheque #123456')
  })

  it('encodes a phone number and message as an SMS link', () => {
    expect(buildSmsLink('+919876543210', 'Cheque ready')).toBe(
      'sms:+919876543210?body=Cheque%20ready',
    )
  })
})

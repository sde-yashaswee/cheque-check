import { describe, expect, it } from 'vitest'
import {
  buildChequeUpdateMessage,
  buildNotifyPartyAction,
  buildSmsLink,
  isPartySmsEnabled,
} from './notify-party'

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

  it('treats the party SMS preference as on unless explicitly disabled', () => {
    expect(isPartySmsEnabled(undefined)).toBe(true)
    expect(isPartySmsEnabled({ party_sms_enabled: true })).toBe(true)
    expect(isPartySmsEnabled({ party_sms_enabled: false })).toBe(false)
  })

  it('skips the notify action when party SMS is disabled', async () => {
    await expect(
      buildNotifyPartyAction(
        { ...cheque, party_id: 'p1' },
        { currency: '₹', party_sms_enabled: false },
        'Notify',
      ),
    ).resolves.toBeUndefined()
  })
})

import { describe, expect, it, vi } from 'vitest'
import { Cheque } from './cheque.entity'

describe('Cheque entity', () => {
  it('derives initial statuses by cheque type', () => {
    expect(Cheque.initialStatusFor('Outward')).toBe('Issued')
    expect(Cheque.initialStatusFor('Inward')).toBe('Received')
  })

  it('allows status corrections and blocks no-op or wrong-type transitions', () => {
    const cheque = Cheque.fromRow({
      id: '1',
      business_id: 'b1',
      party_id: 'p1',
      account_id: 'a1',
      cheque_number: '100',
      amount: 100,
      cheque_date: '2025-01-01',
      deposit_date: null,
      remind_before_days: null,
      status: 'Issued',
      type: 'Outward',
      notes: null,
      image_url: null,
      voice_call_sent: false,
      last_call_at: null,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    })

    expect(cheque.canTransition('Cleared')).toBe(true)
    expect(cheque.canTransition('Bounced')).toBe(true)
    expect(cheque.canTransition('Issued')).toBe(false)
    expect(cheque.canTransition('Received')).toBe(false)

    const cleared = Cheque.fromRow({
      ...cheque.toJSON(),
      status: 'Cleared',
    })

    expect(cleared.canTransition('Bounced')).toBe(true)
    expect(cleared.canTransition('Issued')).toBe(true)
    expect(cleared.canTransition('Cleared')).toBe(false)
  })

  it('flags overdue cheques when expired and still active', () => {
    const overdue = Cheque.fromRow({
      id: '1',
      business_id: 'b1',
      party_id: 'p1',
      account_id: 'a1',
      cheque_number: '100',
      amount: 100,
      cheque_date: '2024-01-01',
      deposit_date: null,
      remind_before_days: null,
      status: 'Issued',
      type: 'Outward',
      notes: null,
      image_url: null,
      voice_call_sent: false,
      last_call_at: null,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    })

    expect(overdue.isOverdue(new Date('2024-01-05T00:00:00.000Z'))).toBe(true)
    expect(overdue.isOverdue(new Date('2023-12-31T00:00:00.000Z'))).toBe(false)
  })
})

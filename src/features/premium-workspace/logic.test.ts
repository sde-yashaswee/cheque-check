import { describe, expect, it } from 'vitest'
import {
  canBulkTransition,
  filterCheques,
  isValidMessageTemplate,
  renderMessageTemplate,
  safeChequePrefill,
  summarizeCheques,
  validAmount,
  validDate,
  validateImport,
} from './logic'
import type { ChequeRow, WorkspaceContext } from './types'

const cheque = (overrides: Partial<ChequeRow> = {}): ChequeRow => ({
  id: 'c1',
  business_id: 'b1',
  party_id: 'p1',
  account_id: 'a1',
  cheque_number: '000001',
  amount: 10,
  cheque_date: '2026-10-17',
  deposit_date: '2026-10-17',
  remind_before_days: null,
  status: 'Issued',
  type: 'Outward',
  notes: null,
  image_url: null,
  is_draft: false,
  created_at: null,
  updated_at: null,
  ...overrides,
})
const context: WorkspaceContext = {
  parties: [
    {
      id: 'p1',
      business_id: 'b1',
      name: 'Asha',
      contact: '+919876543210',
      email: 'asha@example.com',
      is_draft: false,
    } as WorkspaceContext['parties'][number],
  ],
  accounts: [
    {
      id: 'a1',
      business_id: 'b1',
      account_name: 'Main',
      is_draft: false,
    } as WorkspaceContext['accounts'][number],
  ],
  cheques: [cheque()],
}
const validCheque = {
  party_id: 'p1',
  account_id: 'a1',
  cheque_number: '000002',
  amount: '100.25',
  cheque_date: '2026-10-17',
  type: 'Inward',
}

describe('premium import validation', () => {
  it('accepts valid cheque rows and preserves leading zeros', () => {
    const preview = validateImport('cheques', [validCheque], context)
    expect(preview[0].issues).toEqual([])
    expect(preview[0].data.cheque_number).toBe('000002')
  })
  it('catches duplicates in the existing business and within an upload', () => {
    const result = validateImport(
      'cheques',
      [{ ...validCheque, cheque_number: '000001' }, validCheque, validCheque],
      context,
    )
    expect(
      result.map((r) => r.issues.some((i) => i.code === 'duplicate')),
    ).toEqual([true, false, true])
  })
  it('does not allow status, business, draft or unknown fields to bypass server workflows', () => {
    const [row] = validateImport(
      'cheques',
      [
        {
          ...validCheque,
          status: 'Cleared',
          business_id: 'other',
          is_draft: 'true',
        },
      ],
      context,
    )
    expect(
      row.issues.filter((i) => i.code === 'unknownColumn').map((i) => i.field),
    ).toEqual(['status', 'business_id', 'is_draft'])
  })
  it('rejects cross-business references and wrong numbers, dates, amounts and directions', () => {
    const [row] = validateImport(
      'cheques',
      [
        {
          ...validCheque,
          party_id: 'foreign',
          account_id: 'foreign',
          cheque_number: '123',
          cheque_date: '2026-02-30',
          amount: '1.001',
          type: 'received',
        },
      ],
      context,
    )
    expect(row.issues.map((i) => i.field)).toEqual([
      'party_id',
      'account_id',
      'cheque_number',
      'amount',
      'cheque_date',
      'type',
    ])
  })
  it('rejects impossible and backwards deposit dates', () => {
    for (const deposit_date of ['2026-02-30', '2026-10-16']) {
      expect(
        validateImport(
          'cheques',
          [{ ...validCheque, deposit_date }],
          context,
        )[0].issues,
      ).toContainEqual({ field: 'deposit_date', code: 'invalid' })
    }
  })
  it('detects normalized name, phone and email duplicates among parties', () => {
    const result = validateImport(
      'parties',
      [
        { name: ' asha ', contact: '+919111111111' },
        { name: 'New', contact: '+919876543210' },
        { name: 'Other', contact: '+919222222222', email: 'ASHA@example.com' },
        { name: 'Unique', contact: '+919333333333' },
        { name: ' UNIQUE ', contact: '+919444444444' },
      ],
      context,
    )
    expect(
      result.map((r) => r.issues.some((i) => i.code === 'duplicate')),
    ).toEqual([true, true, true, false, true])
  })
  it('validates mandatory party fields and batch limits', () => {
    expect(
      validateImport(
        'parties',
        [{ name: '', contact: 'bad', email: 'bad' }],
        context,
      )[0].issues.map((i) => i.field),
    ).toEqual(['name', 'contact', 'email'])
    expect(
      validateImport(
        'cheques',
        Array.from({ length: 501 }, () => validCheque),
        context,
      )[0].issues,
    ).toContainEqual({ field: 'rows', code: 'limit' })
  })
  it('rejects nonfinite, signed, imprecise and zero amounts', () => {
    for (const value of [
      0,
      -1,
      NaN,
      Infinity,
      '1e3',
      '1.001',
      '+1',
      '9999999999999',
    ])
      expect(validAmount(value)).toBe(false)
    expect(validAmount('0.01')).toBe(true)
    expect(validAmount('999999999999.99')).toBe(true)
  })
  it('validates leap dates and exact ISO formatting', () => {
    expect(validDate('2024-02-29')).toBe(true)
    for (const value of ['2025-02-29', '2026-2-01', '01/01/2026', '1899-12-31'])
      expect(validDate(value)).toBe(false)
  })
})

describe('safe reusable workflows', () => {
  it('never carries numbers, dates, status, images, IDs or draft flags into templates', () => {
    expect(
      safeChequePrefill({ ...cheque(), amount: '10.25', is_draft: true }),
    ).toEqual({
      party_id: 'p1',
      account_id: 'a1',
      amount: 10.25,
      type: 'Outward',
    })
  })
  it('drops malformed template fields', () => {
    expect(
      safeChequePrefill({
        amount: -1,
        type: 'random',
        notes: 'x'.repeat(2001),
      }),
    ).toEqual({})
  })
  it('applies every saved filter and excludes drafts', () => {
    const rows = [
      cheque(),
      cheque({
        id: 'c2',
        type: 'Inward',
        status: 'Received',
        cheque_number: '000002',
        notes: 'Invoice',
        cheque_date: '2026-10-18',
      }),
      cheque({ id: 'c3', is_draft: true }),
    ]
    expect(
      filterCheques(rows, {
        search: 'invoice',
        status: 'Received',
        type: 'Inward',
        party_id: 'p1',
        from: '2026-10-18',
        to: '2026-10-18',
      }).map((c) => c.id),
    ).toEqual(['c2'])
    expect(filterCheques(rows, {})).toHaveLength(2)
  })
  it('preserves correctable individual status semantics without opposite-direction or no-op transitions', () => {
    expect(canBulkTransition(cheque(), 'Received')).toBe(false)
    expect(canBulkTransition(cheque(), 'Issued')).toBe(false)
    expect(canBulkTransition(cheque(), 'Cleared')).toBe(true)
    expect(canBulkTransition(cheque({ status: 'Cleared' }), 'Issued')).toBe(
      true,
    )
    expect(
      canBulkTransition(
        cheque({ type: 'Inward', status: 'Bounced' }),
        'Received',
      ),
    ).toBe(true)
    expect(canBulkTransition(cheque({ is_draft: true }), 'Cleared')).toBe(false)
  })
  it('sums monetary values as cents and distinguishes gross pending from net cleared', () => {
    const totals = summarizeCheques([
      cheque({ amount: 0.1, type: 'Inward', status: 'Cleared' }),
      cheque({ amount: 0.2, type: 'Inward', status: 'Cleared' }),
      cheque({ amount: 0.1, status: 'Cleared' }),
      cheque({ amount: 1, status: 'Issued' }),
      cheque({ amount: 2, status: 'Bounced' }),
      cheque({ amount: 100, is_draft: true }),
    ])
    expect(totals).toEqual({
      count: 5,
      inward: 0.3,
      outward: 3.1,
      pending: 1,
      cleared: 0.4,
      bounced: 2,
      netCleared: 0.2,
    })
  })
})

describe('approved message templates', () => {
  it('supports exactly the agreed placeholders and treats replacement values literally', () => {
    expect(
      renderMessageTemplate(
        '{party}: {cheque_number}, {amount}, {date}, {status}, {business}',
        {
          party: 'Asha {status}',
          cheque_number: '000001',
          amount: '₹100',
          date: '2026-10-17',
          status: 'Cleared',
          business: 'Acme',
        },
      ),
    ).toBe('Asha {status}: 000001, ₹100, 2026-10-17, Cleared, Acme')
  })
  it('supports messages without the optional business placeholder', () => {
    expect(
      isValidMessageTemplate(
        'Hello {party}, cheque {cheque_number} is {status}.',
      ),
    ).toBe(true)
  })
  it('rejects unapproved placeholders, unmatched braces, empty or oversized messages', () => {
    for (const body of [
      '{phone}',
      '{party',
      'party}',
      '{{party}}',
      '',
      ' ',
      'a'.repeat(2001),
    ])
      expect(isValidMessageTemplate(body)).toBe(false)
    expect(() => renderMessageTemplate('{secret}', {} as never)).toThrow()
  })
})

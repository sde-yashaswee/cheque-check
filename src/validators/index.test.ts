import { describe, expect, it } from 'vitest'
import {
  accountSchema,
  businessSchema,
  chequeSchema,
  partySchema,
} from './index'

describe('businessSchema', () => {
  it('accepts a business with optional blank contact fields', () => {
    expect(
      businessSchema.safeParse({
        name: 'Acme Traders',
        email: '',
        phone: '',
        address: '',
      }).success,
    ).toBe(true)
  })

  it('rejects a missing business name', () => {
    expect(businessSchema.safeParse({ name: '' }).success).toBe(false)
  })
})

describe('partySchema', () => {
  it('requires a contact number with at least ten characters', () => {
    expect(
      partySchema.safeParse({
        name: 'Supplier',
        contact: '123456789',
      }).success,
    ).toBe(false)
  })
})

describe('accountSchema', () => {
  it('requires a bank, account holder, and account number', () => {
    expect(
      accountSchema.safeParse({
        bank_id: '',
        account_name: '',
        account_number: '',
      }).success,
    ).toBe(false)
  })
})

describe('chequeSchema', () => {
  const validCheque = {
    cheque_number: '123456',
    amount: 1000,
    cheque_date: '2026-09-24',
    deposit_date: '2026-09-24',
    party_id: 'party-id',
    account_id: 'account-id',
    type: 'Outward' as const,
  }

  it('accepts a valid cheque', () => {
    expect(chequeSchema.safeParse(validCheque).success).toBe(true)
  })

  it('rejects zero and negative amounts', () => {
    expect(chequeSchema.safeParse({ ...validCheque, amount: 0 }).success).toBe(
      false,
    )
    expect(chequeSchema.safeParse({ ...validCheque, amount: -1 }).success).toBe(
      false,
    )
  })

  it('rejects unsupported cheque types', () => {
    expect(
      chequeSchema.safeParse({ ...validCheque, type: 'Unknown' }).success,
    ).toBe(false)
  })
})

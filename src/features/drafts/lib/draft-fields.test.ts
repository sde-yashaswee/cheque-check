import { describe, expect, it } from 'vitest'
import {
  chequeDraftToFormValues,
  firstIncompleteAccountStep,
  firstIncompleteChequeStep,
  firstIncompletePartyStep,
  toAccountDraftFields,
  toChequeDraftFields,
  toPartyDraftFields,
} from './draft-fields'

describe('toChequeDraftFields', () => {
  it('stores blank and invalid form values as null', () => {
    expect(
      toChequeDraftFields({
        amount: Number.NaN,
        cheque_number: '   ',
        party_id: '',
        account_id: 'a1',
        type: 'Sideways',
        image_url: null,
      }),
    ).toEqual({
      party_id: null,
      account_id: 'a1',
      cheque_number: null,
      amount: null,
      cheque_date: null,
      deposit_date: null,
      type: null,
      notes: null,
      image_url: null,
    })
  })

  it('keeps meaningful values untouched', () => {
    const fields = toChequeDraftFields({
      amount: 1500,
      cheque_number: '123456',
      type: 'Inward',
      notes: 'rent ',
    })
    expect(fields).toMatchObject({
      amount: 1500,
      cheque_number: '123456',
      type: 'Inward',
      notes: 'rent ',
    })
  })

  it('rejects zero and negative amounts', () => {
    expect(toChequeDraftFields({ amount: 0 }).amount).toBeNull()
    expect(toChequeDraftFields({ amount: -5 }).amount).toBeNull()
  })
})

describe('party and account draft fields', () => {
  it('normalizes party values', () => {
    expect(toPartyDraftFields({ name: 'Acme', contact: '' })).toMatchObject({
      name: 'Acme',
      contact: null,
      email: null,
    })
  })

  it('normalizes account values', () => {
    expect(
      toAccountDraftFields({ bank_id: 'b1', account_number: ' ' }),
    ).toMatchObject({ bank_id: 'b1', account_number: null })
  })
})

describe('chequeDraftToFormValues', () => {
  it('fills form defaults for missing draft values', () => {
    const values = chequeDraftToFormValues(toChequeDraftFields({}))
    expect(values).toMatchObject({
      amount: 0,
      cheque_number: '',
      party_id: '',
      type: 'Outward',
      image_url: null,
    })
    expect(values.cheque_date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('first incomplete step', () => {
  it('points cheques at the first step with missing required data', () => {
    const empty = toChequeDraftFields({})
    expect(firstIncompleteChequeStep(empty)).toBe(1)
    expect(
      firstIncompleteChequeStep({
        ...empty,
        amount: 10,
        cheque_number: '12345',
      }),
    ).toBe(1)
    expect(
      firstIncompleteChequeStep({
        ...empty,
        amount: 10,
        cheque_number: '123456',
        party_id: 'p1',
      }),
    ).toBe(2)
    expect(
      firstIncompleteChequeStep({
        ...empty,
        amount: 10,
        cheque_number: '123456',
        party_id: 'p1',
        account_id: 'a1',
      }),
    ).toBe(3)
  })

  it('points parties at the first step with missing required data', () => {
    const empty = toPartyDraftFields({})
    expect(firstIncompletePartyStep(empty)).toBe(1)
    expect(firstIncompletePartyStep({ ...empty, name: 'Acme' })).toBe(2)
    expect(
      firstIncompletePartyStep({
        ...empty,
        name: 'Acme',
        contact: '9876543210',
      }),
    ).toBe(3)
  })

  it('points accounts at the first step with missing required data', () => {
    const empty = toAccountDraftFields({})
    expect(firstIncompleteAccountStep(empty)).toBe(1)
    expect(firstIncompleteAccountStep({ ...empty, bank_id: 'b1' })).toBe(2)
    expect(
      firstIncompleteAccountStep({
        ...empty,
        bank_id: 'b1',
        account_name: 'Main',
        account_number: '0001',
      }),
    ).toBe(3)
  })
})

import { describe, expect, it } from 'vitest'
import {
  buildChequeReturnTo,
  getChequeDraftIdFromReturnTo,
  getSafeChequeReturnTo,
} from './cheque-draft'

describe('cheque draft return paths', () => {
  it('round-trips the draft id through the return path', () => {
    const returnTo = buildChequeReturnTo('d-1')
    expect(getSafeChequeReturnTo(returnTo)).toBe('/cheques/create?draftId=d-1')
    expect(getChequeDraftIdFromReturnTo(returnTo)).toBe('d-1')
  })

  it('falls back to a fresh cheque form without a draft', () => {
    expect(buildChequeReturnTo(null)).toBe('/cheques/create')
    expect(getChequeDraftIdFromReturnTo('/cheques/create')).toBeNull()
  })

  it.each([
    'https://evil.example/cheques/create',
    '//evil.example/cheques/create',
    '/parties/create',
    null,
  ])('rejects unsafe return path %s', (returnTo) => {
    expect(getSafeChequeReturnTo(returnTo)).toBeNull()
  })
})

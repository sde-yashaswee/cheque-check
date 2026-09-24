import { describe, expect, it } from 'vitest'
import { getInitialChequeStatus } from './cheque-state'

describe('getInitialChequeStatus', () => {
  it('starts outward cheques as issued', () => {
    expect(getInitialChequeStatus('Outward')).toBe('Issued')
  })

  it('starts inward cheques as received', () => {
    expect(getInitialChequeStatus('Inward')).toBe('Received')
  })
})

import { describe, expect, it } from 'vitest'
import {
  createChequePrintPdf,
  defaultPrintLayout,
  getPrintLayout,
  savePrintLayout,
} from './print-cheque'

describe('print-cheque', () => {
  const cheque = {
    account_id: 'account-1',
    cheque_number: '123456',
    amount: 12500,
    cheque_date: '2026-09-30',
    party: { name: 'Acme Ltd' },
  }

  it('uses defaults and creates an A4 PDF', () => {
    const document = createChequePrintPdf(cheque, '₹')
    expect(document.internal.pageSize.getWidth()).toBeCloseTo(210)
    expect(document.internal.pageSize.getHeight()).toBeCloseTo(297)
  })

  it('persists account-specific layout coordinates', () => {
    const layout = { ...defaultPrintLayout, payeeX: 42 }
    savePrintLayout('account-1', layout)
    expect(getPrintLayout('account-1')).toEqual(layout)
  })
})

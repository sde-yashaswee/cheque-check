import { jsPDF } from 'jspdf'
import type { Cheque, ChequeWithRelations } from '@/types'

export interface PrintLayout {
  payeeX: number
  payeeY: number
  amountX: number
  amountY: number
  dateX: number
  dateY: number
  chequeNumberX: number
  chequeNumberY: number
}

export const defaultPrintLayout: PrintLayout = {
  payeeX: 35,
  payeeY: 55,
  amountX: 150,
  amountY: 55,
  dateX: 165,
  dateY: 25,
  chequeNumberX: 165,
  chequeNumberY: 35,
}

function layoutKey(accountId: string): string {
  return `cheque-check:print-layout:${accountId}`
}

export function getPrintLayout(accountId: string): PrintLayout {
  if (typeof window === 'undefined') return defaultPrintLayout
  const stored = window.localStorage.getItem(layoutKey(accountId))
  if (!stored) return defaultPrintLayout

  try {
    return { ...defaultPrintLayout, ...JSON.parse(stored) }
  } catch {
    return defaultPrintLayout
  }
}

export function savePrintLayout(accountId: string, layout: PrintLayout): void {
  window.localStorage.setItem(layoutKey(accountId), JSON.stringify(layout))
}

export function createChequePrintPdf(
  cheque: Pick<
    Cheque,
    'account_id' | 'cheque_number' | 'amount' | 'cheque_date'
  > &
    Pick<ChequeWithRelations, 'party'>,
  currency: string,
  layout = getPrintLayout(cheque.account_id),
): jsPDF {
  const document = new jsPDF({ unit: 'mm', format: 'a4' })
  document.setFontSize(11)
  document.text(cheque.party?.name || '', layout.payeeX, layout.payeeY)
  document.text(
    `${currency}${cheque.amount.toLocaleString()}`,
    layout.amountX,
    layout.amountY,
  )
  document.text(cheque.cheque_date, layout.dateX, layout.dateY)
  document.text(
    cheque.cheque_number,
    layout.chequeNumberX,
    layout.chequeNumberY,
  )
  return document
}

export function downloadChequePrintPdf(
  cheque: Pick<
    Cheque,
    'account_id' | 'cheque_number' | 'amount' | 'cheque_date'
  > &
    Pick<ChequeWithRelations, 'party'>,
  currency: string,
  layout?: PrintLayout,
): void {
  createChequePrintPdf(cheque, currency, layout).save(
    `cheque-${cheque.cheque_number}.pdf`,
  )
}

import type { Cheque, ChequeStatus, Party } from '@/types'

export function buildChequeUpdateMessage(
  cheque: Pick<Cheque, 'cheque_number' | 'amount' | 'cheque_date' | 'status'>,
  party: Pick<Party, 'name'>,
  currency: string,
  status: ChequeStatus = cheque.status,
): string {
  return [
    `Hi ${party.name},`,
    `Cheque #${cheque.cheque_number} for ${currency}${cheque.amount.toLocaleString()} dated ${new Date(cheque.cheque_date).toLocaleDateString()} is now ${status}.`,
    'Regards, ChequeCheck',
  ].join('\n')
}

export function buildSmsLink(phone: string, message: string): string {
  return `sms:${phone}?body=${encodeURIComponent(message)}`
}

export function openPartySms(phone: string, message: string): void {
  window.location.href = buildSmsLink(phone, message)
}

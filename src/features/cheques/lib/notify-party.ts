import type { Cheque, ChequeStatus, Party } from '@/types'
import { partyService } from '@/features/parties/services/party.service'

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

export interface NotifyPartyActionProps {
  children: string
  onClick: () => void
}

/** Resolves an SMS toast action for a cheque's party, or undefined if the party has no phone. */
export async function buildNotifyPartyAction(
  cheque: Pick<
    Cheque,
    'party_id' | 'cheque_number' | 'amount' | 'cheque_date' | 'status'
  >,
  currency: string,
  label: string,
): Promise<NotifyPartyActionProps | undefined> {
  try {
    const party = await partyService.getById(cheque.party_id)
    if (!party.contact) return undefined
    return {
      children: label,
      onClick: () =>
        openPartySms(
          party.contact,
          buildChequeUpdateMessage(cheque, party, currency),
        ),
    }
  } catch {
    return undefined
  }
}

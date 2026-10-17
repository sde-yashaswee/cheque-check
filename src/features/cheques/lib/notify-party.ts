import type { Cheque, ChequeStatus, Party, Profile } from '@/types'
import { partyService } from '@/features/parties/services/party.service'
import { verifyLifetimePremium } from '@/features/monetization/services/premium-authorization'
import { toast } from '@/components/ui/toast'
import {
  getMessageTemplate,
  renderMessageTemplate,
  type MessageValues,
} from '@/features/premium-workspace/services/workspace.service'
import { businessService } from '@/features/businesses/services/business.service'

type MessageCheque = Pick<
  Cheque,
  'cheque_number' | 'amount' | 'cheque_date' | 'status'
> &
  Partial<Pick<Cheque, 'business_id'>>

export function buildChequeUpdateMessage(
  cheque: MessageCheque,
  party: Pick<Party, 'name'>,
  currency: string,
  status: ChequeStatus = cheque.status,
  template?: string | null,
  businessName = 'ChequeCheck',
): string {
  if (template) {
    const values: MessageValues = {
      party: party.name,
      cheque_number: cheque.cheque_number,
      amount: `${currency}${cheque.amount.toLocaleString()}`,
      date: new Date(cheque.cheque_date).toLocaleDateString(),
      status,
      business: businessName,
    }
    return renderMessageTemplate(template, values)
  }
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

export function isPartySmsEnabled(
  profile: Pick<Profile, 'party_sms_enabled'> | null | undefined,
): boolean {
  return profile?.party_sms_enabled !== false
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
  > &
    Partial<Pick<Cheque, 'business_id'>>,
  profile: Pick<Profile, 'currency' | 'party_sms_enabled'> | null | undefined,
  label: string,
  canNotify = false,
  accessRequiredMessage = label,
): Promise<NotifyPartyActionProps | undefined> {
  if (!canNotify || !isPartySmsEnabled(profile)) return undefined
  const currency = profile?.currency || '₹'
  try {
    const party = await partyService.getById(cheque.party_id)
    if (!party.contact) return undefined
    return {
      children: label,
      onClick: () => {
        void preparePartySms(
          label,
          party.contact,
          cheque,
          party,
          currency,
          accessRequiredMessage,
        )
      },
    }
  } catch (error) {
    toast.add({
      title: label,
      description: error instanceof Error ? error.message : label,
      type: 'error',
    })
    return undefined
  }
}

export async function preparePartySms(
  title: string,
  phone: string,
  cheque: Parameters<typeof buildChequeUpdateMessage>[0],
  party: Parameters<typeof buildChequeUpdateMessage>[1],
  currency: string,
  accessRequiredMessage = title,
): Promise<void> {
  try {
    if (!(await verifyLifetimePremium())) {
      toast.add({
        title,
        description: accessRequiredMessage,
        type: 'info',
      })
      return
    }
    const template = await getMessageTemplate(cheque.business_id)
    const business =
      template?.includes('{business}') && cheque.business_id
        ? await businessService.getById(cheque.business_id)
        : null
    openPartySms(
      phone,
      buildChequeUpdateMessage(
        cheque,
        party,
        currency,
        cheque.status,
        template,
        business?.name,
      ),
    )
  } catch (error) {
    toast.add({
      title,
      description: error instanceof Error ? error.message : title,
      type: 'error',
    })
  }
}

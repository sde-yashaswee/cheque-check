import type {
  AccountDraftFields,
  ChequeDraftFields,
  ChequeType,
  PartyDraftFields,
} from '@/types'

export type DraftEntity = 'cheque' | 'party' | 'account'

export const DRAFT_CREATE_PATHS: Record<DraftEntity, string> = {
  cheque: '/cheques/create',
  party: '/parties/create',
  account: '/accounts/create',
}

export const DRAFT_LIST_PATHS: Record<DraftEntity, string> = {
  cheque: '/cheques/drafts',
  party: '/parties/drafts',
  account: '/accounts/drafts',
}

const text = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value : null

const positiveNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : null

const chequeType = (value: unknown): ChequeType | null =>
  value === 'Inward' || value === 'Outward' ? value : null

export function toChequeDraftFields(
  values: Record<string, unknown>,
): ChequeDraftFields {
  return {
    party_id: text(values.party_id),
    account_id: text(values.account_id),
    cheque_number: text(values.cheque_number),
    amount: positiveNumber(values.amount),
    cheque_date: text(values.cheque_date),
    deposit_date: text(values.deposit_date),
    type: chequeType(values.type),
    notes: text(values.notes),
    image_url: text(values.image_url),
  }
}

export function toPartyDraftFields(
  values: Record<string, unknown>,
): PartyDraftFields {
  return {
    name: text(values.name),
    contact: text(values.contact),
    email: text(values.email),
    address: text(values.address),
    notes: text(values.notes),
    color: text(values.color),
    avatar_url: text(values.avatar_url),
  }
}

export function toAccountDraftFields(
  values: Record<string, unknown>,
): AccountDraftFields {
  return {
    bank_id: text(values.bank_id),
    account_name: text(values.account_name),
    account_number: text(values.account_number),
    ifsc_code: text(values.ifsc_code),
    color: text(values.color),
    notes: text(values.notes),
    opening_balance:
      typeof values.opening_balance === 'number' &&
      Number.isFinite(values.opening_balance)
        ? values.opening_balance
        : 0,
  }
}

export function chequeDraftToFormValues(draft: ChequeDraftFields) {
  return {
    party_id: draft.party_id ?? '',
    account_id: draft.account_id ?? '',
    cheque_number: draft.cheque_number ?? '',
    amount: draft.amount ?? 0,
    cheque_date: draft.cheque_date ?? new Date().toISOString().split('T')[0],
    deposit_date: draft.deposit_date ?? '',
    type: draft.type ?? 'Outward',
    notes: draft.notes ?? '',
    image_url: draft.image_url,
  }
}

export function partyDraftToFormValues(draft: PartyDraftFields) {
  return {
    name: draft.name ?? '',
    contact: draft.contact ?? '',
    email: draft.email ?? '',
    address: draft.address ?? '',
    notes: draft.notes ?? '',
    color: draft.color ?? '#34C759',
    avatar_url: draft.avatar_url,
  }
}

export function accountDraftToFormValues(draft: AccountDraftFields) {
  return {
    bank_id: draft.bank_id ?? '',
    account_name: draft.account_name ?? '',
    account_number: draft.account_number ?? '',
    ifsc_code: draft.ifsc_code ?? '',
    color: draft.color ?? '#007AFF',
    notes: draft.notes ?? '',
    opening_balance: draft.opening_balance ?? 0,
  }
}

export function firstIncompleteChequeStep(draft: ChequeDraftFields) {
  if (!draft.amount || !/^\d{6}$/.test(draft.cheque_number ?? '')) return 1
  if (!draft.party_id || !draft.account_id) return 2
  return 3
}

export function firstIncompletePartyStep(draft: PartyDraftFields) {
  if (!draft.name) return 1
  if ((draft.contact ?? '').length < 10) return 2
  return 3
}

export function firstIncompleteAccountStep(draft: AccountDraftFields) {
  if (!draft.bank_id) return 1
  if (!draft.account_name || !draft.account_number) return 2
  return 3
}

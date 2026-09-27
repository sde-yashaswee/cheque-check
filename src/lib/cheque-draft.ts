const CHEQUE_CREATE_PATH = '/cheques/create'

export const CHEQUE_DRAFT_FIELDS = [
  'type',
  'amount',
  'cheque_number',
  'cheque_date',
  'deposit_date',
  'notes',
  'image_url',
  'party_id',
  'account_id',
] as const

export type ChequeDraftField = (typeof CHEQUE_DRAFT_FIELDS)[number]

export type ChequeDraftValues = Partial<
  Record<ChequeDraftField, string | number | null | undefined>
>

export function buildChequeDraftUrl(values: ChequeDraftValues, step: number) {
  const params = new URLSearchParams({ draft: '1', step: String(step) })
  for (const field of CHEQUE_DRAFT_FIELDS) {
    const value = values[field]
    if (value !== null && value !== undefined && value !== '') {
      params.set(field, String(value))
    }
  }
  return `${CHEQUE_CREATE_PATH}?${params.toString()}`
}

// Only allow returning to the cheque creation flow to prevent open redirects.
export function getSafeChequeReturnTo(returnTo: string | null) {
  if (!returnTo) return null
  try {
    const url = new URL(returnTo, 'http://local')
    if (url.origin !== 'http://local' || url.pathname !== CHEQUE_CREATE_PATH) {
      return null
    }
    return `${url.pathname}${url.search}`
  } catch {
    return null
  }
}

export function withSelectedEntity(
  returnTo: string,
  field: 'party_id' | 'account_id',
  id: string,
) {
  const url = new URL(returnTo, 'http://local')
  url.searchParams.set(field, id)
  return `${url.pathname}${url.search}`
}

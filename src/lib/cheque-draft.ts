const CHEQUE_CREATE_PATH = '/cheques/create'
const ORIGIN = 'http://local'

export function buildChequeReturnTo(draftId: string | null) {
  return draftId
    ? `${CHEQUE_CREATE_PATH}?draftId=${encodeURIComponent(draftId)}`
    : CHEQUE_CREATE_PATH
}

// Only allow returning to the cheque creation flow to prevent open redirects.
export function getSafeChequeReturnTo(returnTo: string | null) {
  if (!returnTo) return null
  try {
    const url = new URL(returnTo, ORIGIN)
    if (url.origin !== ORIGIN || url.pathname !== CHEQUE_CREATE_PATH) {
      return null
    }
    return `${url.pathname}${url.search}`
  } catch {
    return null
  }
}

export function getChequeDraftIdFromReturnTo(returnTo: string) {
  return new URL(returnTo, ORIGIN).searchParams.get('draftId')
}

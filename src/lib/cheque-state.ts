import { ChequeStatus, ChequeType } from '@/types'

export function getInitialChequeStatus(type: ChequeType): ChequeStatus {
  return type === 'Inward' ? 'Received' : 'Issued'
}

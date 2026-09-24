import { ChequeStatus, ChequeType } from '@/types'
import { Cheque } from '@/domain/cheque.entity'

export function getInitialChequeStatus(type: ChequeType): ChequeStatus {
  return Cheque.initialStatusFor(type)
}

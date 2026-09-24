import {
  Cheque as ChequeRow,
  ChequeStatus,
  ChequeType,
  ChequeWithRelations,
} from '@/types'

export class Cheque {
  private readonly row: ChequeWithRelations

  private constructor(row: ChequeWithRelations) {
    this.row = row
  }

  static initialStatusFor(type: ChequeType): ChequeStatus {
    return type === 'Inward' ? 'Received' : 'Issued'
  }

  static fromRow(row: ChequeWithRelations): Cheque {
    return new Cheque(row)
  }

  get id(): string {
    return this.row.id
  }

  get business_id(): string {
    return this.row.business_id
  }

  get party_id(): string {
    return this.row.party_id
  }

  get account_id(): string {
    return this.row.account_id
  }

  get cheque_number(): string {
    return this.row.cheque_number
  }

  get amount(): number {
    return this.row.amount
  }

  get cheque_date(): string {
    return this.row.cheque_date
  }

  get deposit_date(): string | null {
    return this.row.deposit_date
  }

  get remind_before_days(): number | null {
    return this.row.remind_before_days
  }

  get status(): ChequeStatus {
    return this.row.status
  }

  get type(): ChequeType {
    return this.row.type
  }

  get notes(): string | null {
    return this.row.notes
  }

  get image_url(): string | null {
    return this.row.image_url
  }

  get voice_call_sent(): boolean {
    return this.row.voice_call_sent
  }

  get last_call_at(): string | null {
    return this.row.last_call_at
  }

  get created_at(): string {
    return this.row.created_at
  }

  get updated_at(): string {
    return this.row.updated_at
  }

  get party(): ChequeWithRelations['party'] {
    return this.row.party
  }

  get account(): ChequeWithRelations['account'] {
    return this.row.account
  }

  canTransition(nextStatus: ChequeStatus): boolean {
    if (this.status === 'Cleared' || this.status === 'Bounced') {
      return false
    }

    if (nextStatus === 'Cleared' || nextStatus === 'Bounced') {
      return true
    }

    return false
  }

  isOverdue(asOf: Date | string = new Date()): boolean {
    if (this.status !== 'Issued' && this.status !== 'Received') {
      return false
    }

    const comparisonDate = new Date(asOf)
    const paymentDate = new Date(this.cheque_date)

    return paymentDate < comparisonDate
  }

  toJSON(): ChequeRow {
    return { ...this.row }
  }
}

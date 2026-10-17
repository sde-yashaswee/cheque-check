export type NotificationChannel =
  'voice' | 'whatsapp' | 'email' | 'push' | 'sms'

export interface ClaimedJob {
  id: string
  user_id: string
  business_id: string | null
  channel: NotificationChannel
  purpose: string
  payload: { cheque_ids?: string[]; slot?: string }
  attempts: number
}

export interface DispatchProfile {
  user_id: string
  name: string | null
  phone: string | null
  language: string | null
}

export interface DispatchCheque {
  id: string
  amount: number
  account: { bank: { name: string } | null } | null
}

export interface DispatchResult {
  jobId: string
  status: 'sent' | 'skipped' | 'failed'
  error?: string
}

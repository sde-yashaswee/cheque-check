export interface ReminderProfile {
  user_id: string
  name: string | null
  time_zone: string | null
  reminders_per_day: number | null
  voice_call_enabled: boolean
  phone: string | null
}

export interface ReminderCheque {
  id: string
  deposit_date: string | null
  cheque_date: string
  remind_before_days: number | null
  business: { id: string; user_id: string }
}

export interface NewNotificationJob {
  user_id: string
  business_id: string
  channel: 'voice'
  purpose: string
  payload: { cheque_ids: string[]; slot: string }
  scheduled_at: string
  idempotency_key: string
}

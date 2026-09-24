export interface TwilioConfig {
  accountSid: string
  authToken: string
  fromNumber: string
}

export interface ReminderResult {
  userId: string
  userName: string
  status: 'success' | 'failed'
  sid?: string
  error?: string
}

export interface ReminderCheque {
  id: string
  amount: number
  account: { bank: { name: string } | null } | null
  business: { user_id: string }
}

export interface ReminderProfile {
  user_id: string
  name: string | null
  phone: string
  voice_call_enabled: boolean
  language: string | null
}

export interface ReminderQuota {
  user_id: string
  used: number
  limit: number
}

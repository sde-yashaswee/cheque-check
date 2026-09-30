export type ChequeStatus = 'Issued' | 'Received' | 'Cleared' | 'Bounced'
export type ChequeType = 'Outward' | 'Inward'
export type IconType = any // For now, to be safe with HugeIcons and Lucide

export interface Profile {
  id: string
  user_id: string
  name: string | null
  email: string | null
  currency: string
  date_format: string
  time_format: string
  time_zone: string
  language: string
  reminders_per_day: number
  default_reminder_days: number
  received_cheques_enabled: boolean
  phone: string | null
  voice_call_enabled: boolean
  sms_enabled: boolean
  push_enabled: boolean
  whatsapp_enabled: boolean
  reduce_motion: boolean
  avatar_url?: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Business {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  logo_url: string | null
  color?: string
  icon?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Party {
  id: string
  business_id: string
  name: string
  contact: string
  email: string | null
  address: string | null
  notes: string | null
  color?: string
  icon?: string
  avatar_url?: string | null
  is_draft?: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Bank {
  id: string
  name: string
  logo_url: string | null
  created_at: string
  updated_at: string
}

export type TagEntityType = 'cheque' | 'account' | 'party' | 'business'

export interface Tag {
  id: string
  business_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface Account {
  id: string
  business_id: string
  bank_id: string | null
  account_name: string
  account_number: string
  ifsc_code: string | null
  color?: string
  icon?: string
  created_at: string
  updated_at: string
  deleted_at?: string | null
  bank?: Bank
  notes?: string | null
  opening_balance: number
  is_default: boolean
  is_draft?: boolean
}

export interface AccountWithRelations extends Account {
  bank?: Bank
}

export interface Cheque {
  id: string
  business_id: string
  party_id: string
  account_id: string
  cheque_number: string
  amount: number
  cheque_date: string
  deposit_date: string | null
  remind_before_days: number | null
  status: ChequeStatus
  type: ChequeType
  notes: string | null
  image_url: string | null
  voice_call_sent: boolean
  last_call_at: string | null
  is_draft?: boolean
  created_at: string
  updated_at: string
}

export interface ChequeWithRelations extends Cheque {
  party?: {
    name: string
    contact?: string
    color?: string
    icon?: string
    avatar_url?: string | null
  }
  account?: {
    account_name: string
    color?: string
    icon?: string
    bank?: { name: string; logo_url?: string | null }
  }
}

type DraftBase = {
  id: string
  business_id: string
  is_draft: true
  created_at: string
  updated_at: string
}

export type ChequeDraftFields = {
  party_id: string | null
  account_id: string | null
  cheque_number: string | null
  amount: number | null
  cheque_date: string | null
  deposit_date: string | null
  type: ChequeType | null
  notes: string | null
  image_url: string | null
}

export type ChequeDraft = DraftBase &
  ChequeDraftFields &
  Pick<ChequeWithRelations, 'party' | 'account'>

export type PartyDraftFields = {
  name: string | null
  contact: string | null
  email: string | null
  address: string | null
  notes: string | null
  color: string | null
  avatar_url: string | null
}

export type PartyDraft = DraftBase & PartyDraftFields

export type AccountDraftFields = {
  bank_id: string | null
  account_name: string | null
  account_number: string | null
  ifsc_code: string | null
  color: string | null
  notes: string | null
  opening_balance: number | null
  is_default: boolean
}

export type AccountDraft = DraftBase & AccountDraftFields & { bank?: Bank }

export type ChequeStatus = 'Issued' | 'Received' | 'Cleared' | 'Bounced';
export type ChequeType = 'Outward' | 'Inward';

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  currency: string;
  date_format: string;
  time_format: string;
  time_zone: string;
  language: string;
  reminders_per_day: number;
  default_reminder_days: number;
  received_cheques_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Party {
  id: string;
  business_id: string;
  name: string;
  contact: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
}

export interface Bank {
  id: string;
  name: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  business_id: string;
  bank_id: string | null;
  bank_name: string;
  account_name: string;
  account_number: string;
  ifsc_code: string | null;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  bank?: Bank;
}

export interface Cheque {
  id: string;
  business_id: string;
  party_id: string;
  account_id: string;
  cheque_number: string;
  amount: number;
  cheque_date: string;
  deposit_date: string | null;
  remind_before_days: number | null;
  status: ChequeStatus;
  type: ChequeType;
  notes: string | null;
  voice_call_sent: boolean;
  last_call_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChequeWithRelations extends Cheque {
  party?: { name: string; color?: string; icon?: string };
  account?: { bank_name: string; account_name: string; color?: string; icon?: string };
}

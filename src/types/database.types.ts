// Hand-authored snapshot of the Supabase schema (supabase/migrations/*.sql).
// Regenerate with `npm run supabase:gen-types` after every new migration.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          email: string | null
          currency: string | null
          date_format: string | null
          reminders_per_day: number | null
          default_reminder_days: number | null
          received_cheques_enabled: boolean | null
          time_format: string | null
          time_zone: string | null
          language: string | null
          avatar_url: string | null
          phone: string | null
          voice_call_enabled: boolean | null
          deleted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & {
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
        Relationships: []
      }
      businesses: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          logo_url: string | null
          color: string | null
          icon: string | null
          deleted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['businesses']['Row']> & {
          user_id: string
          name: string
        }
        Update: Partial<Database['public']['Tables']['businesses']['Row']>
        Relationships: []
      }
      parties: {
        Row: {
          id: string
          business_id: string
          name: string
          contact: string
          email: string | null
          address: string | null
          notes: string | null
          color: string | null
          icon: string | null
          avatar_url: string | null
          deleted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['parties']['Row']> & {
          business_id: string
          name: string
          contact: string
        }
        Update: Partial<Database['public']['Tables']['parties']['Row']>
        Relationships: []
      }
      banks: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['banks']['Row']> & {
          name: string
        }
        Update: Partial<Database['public']['Tables']['banks']['Row']>
        Relationships: []
      }
      accounts: {
        Row: {
          id: string
          business_id: string
          account_name: string
          account_number: string
          ifsc_code: string | null
          bank_id: string | null
          color: string | null
          icon: string | null
          notes: string | null
          deleted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['accounts']['Row']> & {
          business_id: string
          account_name: string
          account_number: string
        }
        Update: Partial<Database['public']['Tables']['accounts']['Row']>
        Relationships: [
          {
            foreignKeyName: 'accounts_bank_id_fkey'
            columns: ['bank_id']
            isOneToOne: false
            referencedRelation: 'banks'
            referencedColumns: ['id']
          },
        ]
      }
      cheques: {
        Row: {
          id: string
          business_id: string
          party_id: string
          account_id: string
          cheque_number: string
          amount: number
          cheque_date: string
          deposit_date: string | null
          remind_before_days: number | null
          status: Database['public']['Enums']['cheque_status']
          type: Database['public']['Enums']['cheque_type']
          notes: string | null
          voice_call_sent: boolean | null
          last_call_at: string | null
          image_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['cheques']['Row']> & {
          business_id: string
          party_id: string
          account_id: string
          cheque_number: string
          amount: number
          cheque_date: string
          type: Database['public']['Enums']['cheque_type']
        }
        Update: Partial<Database['public']['Tables']['cheques']['Row']>
        Relationships: [
          {
            foreignKeyName: 'cheques_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cheques_party_id_fkey'
            columns: ['party_id']
            isOneToOne: false
            referencedRelation: 'parties'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'cheques_business_id_fkey'
            columns: ['business_id']
            isOneToOne: false
            referencedRelation: 'businesses'
            referencedColumns: ['id']
          },
        ]
      }
      reminder_logs: {
        Row: {
          id: string
          cheque_id: string
          type: Database['public']['Enums']['reminder_type']
          status: Database['public']['Enums']['reminder_status'] | null
          provider_response: Json | null
          created_at: string | null
        }
        Insert: Partial<
          Database['public']['Tables']['reminder_logs']['Row']
        > & {
          cheque_id: string
          type: Database['public']['Enums']['reminder_type']
        }
        Update: Partial<Database['public']['Tables']['reminder_logs']['Row']>
        Relationships: []
      }
      user_entitlements: {
        Row: {
          id: string
          user_id: string
          feature_id: Database['public']['Enums']['feature_type']
          status: Database['public']['Enums']['entitlement_status']
          valid_until: string | null
          razorpay_subscription_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<
          Database['public']['Tables']['user_entitlements']['Row']
        > & {
          user_id: string
          feature_id: Database['public']['Enums']['feature_type']
        }
        Update: Partial<
          Database['public']['Tables']['user_entitlements']['Row']
        >
        Relationships: []
      }
      user_quotas: {
        Row: {
          id: string
          user_id: string
          feature_id: Database['public']['Enums']['feature_type']
          used: number
          limit: number
          reset_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['user_quotas']['Row']> & {
          user_id: string
          feature_id: Database['public']['Enums']['feature_type']
        }
        Update: Partial<Database['public']['Tables']['user_quotas']['Row']>
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          amount: number
          currency: string
          status: Database['public']['Enums']['transaction_status']
          type: Database['public']['Enums']['transaction_type']
          feature_id: Database['public']['Enums']['feature_type']
          product_id: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: Partial<Database['public']['Tables']['transactions']['Row']> & {
          user_id: string
          amount: number
          status: Database['public']['Enums']['transaction_status']
          type: Database['public']['Enums']['transaction_type']
          feature_id: Database['public']['Enums']['feature_type']
          product_id: string
        }
        Update: Partial<Database['public']['Tables']['transactions']['Row']>
        Relationships: []
      }
      payment_products: {
        Row: {
          id: string
          name: string
          transaction_type: Database['public']['Enums']['transaction_type']
          feature_id: Database['public']['Enums']['feature_type']
          amount: number
          currency: string
          entitlement_days: number | null
          quota_feature_id: Database['public']['Enums']['feature_type'] | null
          quota_increment: number | null
          required_entitlement_id:
            Database['public']['Enums']['feature_type'] | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<
          Database['public']['Tables']['payment_products']['Row']
        > & {
          id: string
          name: string
          transaction_type: Database['public']['Enums']['transaction_type']
          feature_id: Database['public']['Enums']['feature_type']
          amount: number
        }
        Update: Partial<Database['public']['Tables']['payment_products']['Row']>
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          user_id: string
          endpoint: string
          window_started_at: string
          request_count: number
          created_at: string
          updated_at: string
        }
        Insert: Partial<
          Database['public']['Tables']['api_rate_limits']['Row']
        > & {
          user_id: string
          endpoint: string
          window_started_at: string
        }
        Update: Partial<Database['public']['Tables']['api_rate_limits']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      record_payment_order: {
        Args: {
          order_user_id: string
          requested_product_id: string
          razorpay_order: string
        }
        Returns: Database['public']['Tables']['transactions']['Row']
      }
      fulfill_payment_order: {
        Args: {
          razorpay_order: string
          razorpay_payment: string
        }
        Returns: Database['public']['Tables']['transactions']['Row']
      }
      consume_api_rate_limit: {
        Args: {
          requested_endpoint: string
          request_limit: number
          window_seconds: number
        }
        Returns: boolean
      }
      consume_user_quota: {
        Args: {
          requested_feature_id: Database['public']['Enums']['feature_type']
          increment: number
        }
        Returns: boolean
      }
    }
    Enums: {
      cheque_status: 'Issued' | 'Received' | 'Cleared' | 'Bounced'
      cheque_type: 'Outward' | 'Inward'
      reminder_type: 'Push' | 'Voice' | 'SMS'
      reminder_status: 'Pending' | 'Success' | 'Failed'
      feature_type:
        | 'ai_scan'
        | 'voice_reminder'
        | 'lifetime_premium'
        | 'ai_scanner_sub'
        | 'voice_reminder_sub'
      entitlement_status: 'active' | 'expired' | 'canceled'
      transaction_status:
        'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
      transaction_type: 'lifetime' | 'subscription' | 'top_up'
    }
  }
}

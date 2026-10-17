import { SupabaseRepository } from '@/repositories/base.repository'
import { TABLES } from '@/lib/supabase/tables'
import type {
  EntitlementStatus,
  FeatureId,
} from '@/features/monetization/constants'

export interface Entitlement {
  id: string
  user_id: string
  feature_id: FeatureId
  status: EntitlementStatus
  valid_until: string | null
}

export interface Quota {
  id: string
  user_id: string
  feature_id: FeatureId
  used: number
  limit: number
  reset_at: string | null
}

export interface Transaction {
  id: string
  user_id: string
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  amount: number
  currency: string
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
  type: 'lifetime' | 'subscription' | 'top_up'
  feature_id: FeatureId
  created_at: string
  updated_at: string
}

export interface IMonetizationRepository {
  getEntitlements(): Promise<Entitlement[]>
  getQuotas(): Promise<Quota[]>
  getTransactions(): Promise<Transaction[]>
}

export class SupabaseMonetizationRepository
  extends SupabaseRepository
  implements IMonetizationRepository
{
  async getEntitlements(): Promise<Entitlement[]> {
    const { data: userData } = await this.supabase.auth.getUser()
    const user = userData?.user
    if (!user) return []

    const data = await this.query(
      this.supabase
        .from(TABLES.USER_ENTITLEMENTS)
        .select('*')
        .eq('user_id', user.id),
    )
    return (data ?? []) as Entitlement[]
  }

  async getQuotas(): Promise<Quota[]> {
    const { data: userData } = await this.supabase.auth.getUser()
    const user = userData?.user
    if (!user) return []

    const data = await this.query(
      this.supabase.from(TABLES.USER_QUOTAS).select('*').eq('user_id', user.id),
    )
    return (data ?? []) as Quota[]
  }

  async getTransactions(): Promise<Transaction[]> {
    const { data: userData } = await this.supabase.auth.getUser()
    const user = userData?.user
    if (!user) return []

    const data = await this.query(
      this.supabase
        .from(TABLES.TRANSACTIONS)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
    )
    return (data ?? []) as Transaction[]
  }
}

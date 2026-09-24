import { SupabaseRepository } from './base.repository'
import { mapSupabaseError } from '@/lib/errors'

export interface Entitlement {
  id: string
  user_id: string
  feature_id: string
  status: 'active' | 'expired' | 'canceled'
  valid_until: string | null
}

export interface Quota {
  id: string
  user_id: string
  feature_id: string
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
  feature_id: string
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

    const { data, error } = await this.supabase
      .from('user_entitlements')
      .select('*')
      .eq('user_id', user.id)

    if (error) throw mapSupabaseError(error)
    return (data ?? []) as Entitlement[]
  }

  async getQuotas(): Promise<Quota[]> {
    const { data: userData } = await this.supabase.auth.getUser()
    const user = userData?.user
    if (!user) return []

    const { data, error } = await this.supabase
      .from('user_quotas')
      .select('*')
      .eq('user_id', user.id)

    if (error) throw mapSupabaseError(error)
    return (data ?? []) as Quota[]
  }

  async getTransactions(): Promise<Transaction[]> {
    const { data: userData } = await this.supabase.auth.getUser()
    const user = userData?.user
    if (!user) return []

    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw mapSupabaseError(error)
    return (data ?? []) as Transaction[]
  }
}

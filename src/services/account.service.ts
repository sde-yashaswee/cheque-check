import { createClient } from '@/lib/supabase/client'
import { Account } from '@/types'

const supabase = createClient()

export class AccountService {
  static async getAll(businessId: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, bank:banks(name, logo_url)')
      .eq('business_id', businessId)
      .is('deleted_at', null)
      .order('account_name', { ascending: true })
    
    if (error) throw error
    return data as Account[]
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, bank:banks(name, logo_url)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Account
  }

  static async create(account: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'bank' | 'deleted_at'>) {
    const { data, error } = await supabase
      .from('accounts')
      .insert([account])
      .select()
      .single()
    
    if (error) throw error
    return data as Account
  }

  static async update(id: string, account: Partial<Omit<Account, 'id' | 'business_id' | 'created_at' | 'updated_at' | 'bank' | 'deleted_at'>>) {
    const { data, error } = await supabase
      .from('accounts')
      .update(account)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Account
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('accounts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }
}

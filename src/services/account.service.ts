import { createClient } from '@/lib/supabase/client'
import { Account } from '@/types'

const supabase = createClient()

export class AccountService {
  static async getAll(businessId: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, bank:banks(name)')
      .eq('business_id', businessId)
      .order('account_name', { ascending: true })
    
    if (error) throw error
    return data as Account[]
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, bank:banks(name)')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Account
  }

  static async create(account: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'bank'>) {
    const { data, error } = await supabase
      .from('accounts')
      .insert([account])
      .select()
      .single()
    
    if (error) throw error
    return data as Account
  }

  static async update(id: string, account: Partial<Omit<Account, 'id' | 'business_id' | 'created_at' | 'updated_at' | 'bank'>>) {
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
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

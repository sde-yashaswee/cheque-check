import { createClient } from '@/lib/supabase/client'
import { Bank } from '@/types'

const supabase = createClient()

export class BankService {
  static async getAll(businessId: string) {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .eq('business_id', businessId)
      .order('bank_name', { ascending: true })
    
    if (error) throw error
    return data as Bank[]
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Bank
  }

  static async create(bank: Omit<Bank, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('banks')
      .insert([bank])
      .select()
      .single()
    
    if (error) throw error
    return data as Bank
  }

  static async update(id: string, bank: Partial<Omit<Bank, 'id' | 'business_id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('banks')
      .update(bank)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Bank
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('banks')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

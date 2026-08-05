import { createClient } from '@/lib/supabase/client'
import { Cheque, ChequeStatus } from '@/types'

const supabase = createClient()

export class ChequeService {
  static async getAll(businessId: string) {
    const { data, error } = await supabase
      .from('cheques')
      .select('*, party:parties(name, color, icon, avatar_url), account:accounts(account_name, color, icon, bank:banks(name, logo_url))')
      .eq('business_id', businessId)
      .order('cheque_date', { ascending: true })
    
    if (error) throw error
    return data
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('cheques')
      .select('*, party:parties(name, color, icon, avatar_url), account:accounts(account_name, color, icon, bank:banks(name, logo_url))')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }

  static async create(cheque: Omit<Cheque, 'id' | 'created_at' | 'updated_at' | 'voice_call_sent' | 'last_call_at'>) {
    const { data, error } = await supabase
      .from('cheques')
      .insert([cheque])
      .select()
      .single()
    
    if (error) throw error
    return data as Cheque
  }

  static async update(id: string, cheque: Partial<Omit<Cheque, 'id' | 'business_id' | 'created_at' | 'updated_at' | 'voice_call_sent' | 'last_call_at'>>) {
    const { data, error } = await supabase
      .from('cheques')
      .update(cheque)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Cheque
  }

  static async updateStatus(id: string, status: ChequeStatus) {
    const { data, error } = await supabase
      .from('cheques')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Cheque
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('cheques')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

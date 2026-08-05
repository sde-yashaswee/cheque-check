import { createClient } from '@/lib/supabase/client'
import { Cheque, ChequeStatus } from '@/types'

const supabase = createClient()

export class ChequeService {
  static async getAll(businessId: string) {
    const { data, error } = await supabase
      .from('cheques')
      .select('*, party:parties(name), bank:banks(bank_name)')
      .eq('business_id', businessId)
      .order('cheque_date', { ascending: true })
    
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

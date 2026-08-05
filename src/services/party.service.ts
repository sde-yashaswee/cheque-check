import { createClient } from '@/lib/supabase/client'
import { Party } from '@/types'

const supabase = createClient()

export class PartyService {
  static async getAll(businessId: string) {
    const { data, error } = await supabase
      .from('parties')
      .select('*')
      .eq('business_id', businessId)
      .is('deleted_at', null)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data as Party[]
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('parties')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Party
  }

  static async create(party: Omit<Party, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) {
    const { data, error } = await supabase
      .from('parties')
      .insert([party])
      .select()
      .single()
    
    if (error) throw error
    return data as Party
  }

  static async update(id: string, party: Partial<Omit<Party, 'id' | 'business_id' | 'created_at' | 'updated_at' | 'deleted_at'>>) {
    const { data, error } = await supabase
      .from('parties')
      .update(party)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Party
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('parties')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }
}

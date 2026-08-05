import { createClient } from '@/lib/supabase/client'
import { Business } from '@/types'

const supabase = createClient()

export class BusinessService {
  static async getAll() {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Business[]
  }

  static async getById(id: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data as Business
  }

  static async create(business: Omit<Business, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('businesses')
      .insert([{ ...business, user_id: user.id }])
      .select()
      .single()
    
    if (error) throw error
    return data as Business
  }

  static async update(id: string, business: Partial<Omit<Business, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'>>) {
    const { data, error } = await supabase
      .from('businesses')
      .update(business)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Business
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('businesses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) throw error
  }
}

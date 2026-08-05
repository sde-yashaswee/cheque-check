import { createClient } from '@/lib/supabase/client'
import { Bank } from '@/types'

const supabase = createClient()

export class BankService {
  static async getAll() {
    const { data, error } = await supabase
      .from('banks')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data as Bank[]
  }
}

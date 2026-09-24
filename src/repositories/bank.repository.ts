import { Bank } from '@/types'
import { SupabaseRepository } from './base.repository'

export interface IBankRepository {
  getAll(): Promise<Bank[]>
}

export class SupabaseBankRepository
  extends SupabaseRepository
  implements IBankRepository
{
  async getAll(): Promise<Bank[]> {
    const { data, error } = await this.supabase
      .from('banks')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return (data ?? []) as Bank[]
  }
}

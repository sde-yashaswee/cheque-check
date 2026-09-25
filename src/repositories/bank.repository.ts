import { Bank } from '@/types'
import { TABLES } from '@/lib/supabase/tables'
import { SupabaseRepository } from './base.repository'

export interface IBankRepository {
  getAll(): Promise<Bank[]>
}

export class SupabaseBankRepository
  extends SupabaseRepository
  implements IBankRepository
{
  async getAll(): Promise<Bank[]> {
    return this.handle(
      this.supabase
        .from(TABLES.BANKS)
        .select('*')
        .order('name', { ascending: true }),
    ) as Promise<Bank[]>
  }
}

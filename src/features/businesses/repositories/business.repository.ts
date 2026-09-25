import { Business } from '@/types'
import { ValidationError } from '@/lib/errors'
import { TABLES } from '@/lib/supabase/tables'
import { SupabaseRepository } from './base.repository'

export interface IBusinessRepository {
  getAll(): Promise<Business[]>
  getById(id: string): Promise<Business>
  create(
    input: Omit<
      Business,
      'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
    >,
  ): Promise<Business>
  update(
    id: string,
    input: Partial<
      Omit<
        Business,
        'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
      >
    >,
  ): Promise<Business>
  delete(id: string): Promise<void>
}

export class SupabaseBusinessRepository
  extends SupabaseRepository
  implements IBusinessRepository
{
  async getAll(): Promise<Business[]> {
    return this.handle(
      this.supabase
        .from(TABLES.BUSINESSES)
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
    ) as Promise<Business[]>
  }

  async getById(id: string): Promise<Business> {
    return this.handle(
      this.supabase.from(TABLES.BUSINESSES).select('*').eq('id', id).single(),
    ) as Promise<Business>
  }

  async create(
    input: Omit<
      Business,
      'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
    >,
  ): Promise<Business> {
    const { data: userData } = await this.supabase.auth.getUser()
    const user = userData?.user
    if (!user) {
      throw new ValidationError('User not authenticated')
    }

    return this.handle(
      this.supabase
        .from(TABLES.BUSINESSES)
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single(),
    ) as Promise<Business>
  }

  async update(
    id: string,
    input: Partial<
      Omit<
        Business,
        'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
      >
    >,
  ): Promise<Business> {
    return this.handle(
      this.supabase
        .from(TABLES.BUSINESSES)
        .update(input)
        .eq('id', id)
        .select()
        .single(),
    ) as Promise<Business>
  }

  async delete(id: string): Promise<void> {
    await this.handleVoid(
      this.supabase
        .from(TABLES.BUSINESSES)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id),
    )
  }
}

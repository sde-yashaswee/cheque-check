import { Business } from '@/types'
import { ValidationError } from '@/lib/errors'
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
    const { data, error } = await this.supabase
      .from('businesses')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as Business[]
  }

  async getById(id: string): Promise<Business> {
    const { data, error } = await this.supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Business
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

    const { data, error } = await this.supabase
      .from('businesses')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data as Business
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
    const { data, error } = await this.supabase
      .from('businesses')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Business
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('businesses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
  }
}

import { Party } from '@/types'
import { SupabaseRepository } from './base.repository'

export interface IPartyRepository {
  getAll(businessId: string): Promise<Party[]>
  getById(id: string): Promise<Party>
  create(
    input: Omit<Party, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  ): Promise<Party>
  update(
    id: string,
    input: Partial<
      Omit<
        Party,
        'id' | 'business_id' | 'created_at' | 'updated_at' | 'deleted_at'
      >
    >,
  ): Promise<Party>
  delete(id: string): Promise<void>
}

export class SupabasePartyRepository
  extends SupabaseRepository
  implements IPartyRepository
{
  async getAll(businessId: string): Promise<Party[]> {
    return this.handle(
      this.supabase
        .from('parties')
        .select('*')
        .eq('business_id', businessId)
        .is('deleted_at', null)
        .order('name', { ascending: true }),
    ) as Promise<Party[]>
  }

  async getById(id: string): Promise<Party> {
    return this.handle(
      this.supabase.from('parties').select('*').eq('id', id).single(),
    ) as Promise<Party>
  }

  async create(
    input: Omit<Party, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  ): Promise<Party> {
    return this.handle(
      this.supabase.from('parties').insert([input]).select().single(),
    ) as Promise<Party>
  }

  async update(
    id: string,
    input: Partial<
      Omit<
        Party,
        'id' | 'business_id' | 'created_at' | 'updated_at' | 'deleted_at'
      >
    >,
  ): Promise<Party> {
    return this.handle(
      this.supabase
        .from('parties')
        .update(input)
        .eq('id', id)
        .select()
        .single(),
    ) as Promise<Party>
  }

  async delete(id: string): Promise<void> {
    await this.handleVoid(
      this.supabase
        .from('parties')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id),
    )
  }
}

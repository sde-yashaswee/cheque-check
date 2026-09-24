import { Account } from '@/types'
import { SupabaseRepository } from './base.repository'

export interface IAccountRepository {
  getAll(businessId: string): Promise<Account[]>
  getById(id: string): Promise<Account>
  create(
    input: Omit<
      Account,
      'id' | 'created_at' | 'updated_at' | 'bank' | 'deleted_at'
    >,
  ): Promise<Account>
  update(
    id: string,
    input: Partial<
      Omit<
        Account,
        | 'id'
        | 'business_id'
        | 'created_at'
        | 'updated_at'
        | 'bank'
        | 'deleted_at'
      >
    >,
  ): Promise<Account>
  delete(id: string): Promise<void>
}

export class SupabaseAccountRepository
  extends SupabaseRepository
  implements IAccountRepository
{
  async getAll(businessId: string): Promise<Account[]> {
    return this.handle(
      this.supabase
        .from('accounts')
        .select('*, bank:banks(name, logo_url)')
        .eq('business_id', businessId)
        .is('deleted_at', null)
        .order('account_name', { ascending: true }),
    ) as Promise<Account[]>
  }

  async getById(id: string): Promise<Account> {
    return this.handle(
      this.supabase
        .from('accounts')
        .select('*, bank:banks(name, logo_url)')
        .eq('id', id)
        .single(),
    ) as Promise<Account>
  }

  async create(
    input: Omit<
      Account,
      'id' | 'created_at' | 'updated_at' | 'bank' | 'deleted_at'
    >,
  ): Promise<Account> {
    return this.handle(
      this.supabase.from('accounts').insert([input]).select().single(),
    ) as Promise<Account>
  }

  async update(
    id: string,
    input: Partial<
      Omit<
        Account,
        | 'id'
        | 'business_id'
        | 'created_at'
        | 'updated_at'
        | 'bank'
        | 'deleted_at'
      >
    >,
  ): Promise<Account> {
    return this.handle(
      this.supabase
        .from('accounts')
        .update(input)
        .eq('id', id)
        .select()
        .single(),
    ) as Promise<Account>
  }

  async delete(id: string): Promise<void> {
    await this.handleVoid(
      this.supabase
        .from('accounts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id),
    )
  }
}

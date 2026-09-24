import { Cheque, ChequeStatus, ChequeWithRelations } from '@/types'
import { SupabaseRepository } from './base.repository'

export interface IChequeRepository {
  getAll(businessId: string): Promise<ChequeWithRelations[]>
  getById(id: string): Promise<ChequeWithRelations>
  create(
    input: Omit<
      Cheque,
      'id' | 'created_at' | 'updated_at' | 'voice_call_sent' | 'last_call_at'
    >,
  ): Promise<Cheque>
  update(
    id: string,
    input: Partial<
      Omit<
        Cheque,
        | 'id'
        | 'business_id'
        | 'status'
        | 'created_at'
        | 'updated_at'
        | 'voice_call_sent'
        | 'last_call_at'
      >
    >,
  ): Promise<Cheque>
  updateStatus(id: string, status: ChequeStatus): Promise<Cheque>
  delete(id: string): Promise<void>
}

export class SupabaseChequeRepository
  extends SupabaseRepository
  implements IChequeRepository
{
  async getAll(businessId: string): Promise<ChequeWithRelations[]> {
    return this.handle(
      this.supabase
        .from('cheques')
        .select(
          '*, party:parties(name, color, icon, avatar_url), account:accounts(account_name, color, icon, bank:banks(name, logo_url))',
        )
        .eq('business_id', businessId)
        .order('cheque_date', { ascending: true }),
    ) as Promise<ChequeWithRelations[]>
  }

  async getById(id: string): Promise<ChequeWithRelations> {
    return this.handle(
      this.supabase
        .from('cheques')
        .select(
          '*, party:parties(name, color, icon, avatar_url), account:accounts(account_name, color, icon, bank:banks(name, logo_url))',
        )
        .eq('id', id)
        .single(),
    ) as Promise<ChequeWithRelations>
  }

  async create(
    input: Omit<
      Cheque,
      'id' | 'created_at' | 'updated_at' | 'voice_call_sent' | 'last_call_at'
    >,
  ): Promise<Cheque> {
    return this.handle(
      this.supabase.from('cheques').insert([input]).select().single(),
    ) as Promise<Cheque>
  }

  async update(
    id: string,
    input: Partial<
      Omit<
        Cheque,
        | 'id'
        | 'business_id'
        | 'status'
        | 'created_at'
        | 'updated_at'
        | 'voice_call_sent'
        | 'last_call_at'
      >
    >,
  ): Promise<Cheque> {
    return this.handle(
      this.supabase
        .from('cheques')
        .update(input)
        .eq('id', id)
        .select()
        .single(),
    ) as Promise<Cheque>
  }

  async updateStatus(id: string, status: ChequeStatus): Promise<Cheque> {
    return this.handle(
      this.supabase
        .from('cheques')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single(),
    ) as Promise<Cheque>
  }

  async delete(id: string): Promise<void> {
    await this.handleVoid(this.supabase.from('cheques').delete().eq('id', id))
  }
}

import type { SupabaseClient } from '@supabase/supabase-js'
import { SupabaseRepository } from '@/repositories/base.repository'
import { TABLES } from '@/lib/supabase/tables'
import type {
  AccountDraft,
  AccountDraftFields,
  ChequeDraft,
  ChequeDraftFields,
  PartyDraft,
  PartyDraftFields,
} from '@/types'

type DraftTable =
  typeof TABLES.CHEQUES | typeof TABLES.PARTIES | typeof TABLES.ACCOUNTS

export interface IDraftRepository<TDraft, TFields> {
  list(businessId: string): Promise<TDraft[]>
  getById(id: string): Promise<TDraft>
  create(businessId: string, fields: Partial<TFields>): Promise<TDraft>
  update(id: string, fields: Partial<TFields>): Promise<TDraft>
  delete(id: string): Promise<void>
  publish<TPublished>(
    id: string,
    values: Record<string, unknown>,
  ): Promise<TPublished>
}

export class SupabaseDraftRepository<TDraft, TFields>
  extends SupabaseRepository
  implements IDraftRepository<TDraft, TFields>
{
  constructor(
    private readonly table: DraftTable,
    private readonly selection: string,
  ) {
    super()
  }

  // Draft rows have nullable columns the typed insert/update signatures don't model.
  protected get db() {
    return (this.supabase as unknown as SupabaseClient).from(this.table)
  }

  async list(businessId: string): Promise<TDraft[]> {
    return this.handle(
      this.db
        .select(this.selection)
        .eq('business_id', businessId)
        .eq('is_draft', true)
        .order('updated_at', { ascending: false }),
    ) as Promise<TDraft[]>
  }

  async getById(id: string): Promise<TDraft> {
    return this.handle(
      this.db.select(this.selection).eq('id', id).eq('is_draft', true).single(),
    ) as Promise<TDraft>
  }

  async create(businessId: string, fields: Partial<TFields>): Promise<TDraft> {
    return this.handle(
      this.db
        .insert([{ ...fields, business_id: businessId, is_draft: true }])
        .select(this.selection)
        .single(),
    ) as Promise<TDraft>
  }

  async update(id: string, fields: Partial<TFields>): Promise<TDraft> {
    return this.handle(
      this.db
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('is_draft', true)
        .select(this.selection)
        .single(),
    ) as Promise<TDraft>
  }

  async delete(id: string): Promise<void> {
    await this.handleVoid(this.db.delete().eq('id', id).eq('is_draft', true))
  }

  async publish<TPublished>(
    id: string,
    values: Record<string, unknown>,
  ): Promise<TPublished> {
    return this.handle(
      this.db
        .update({
          ...values,
          is_draft: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('is_draft', true)
        .select()
        .single(),
    ) as Promise<TPublished>
  }
}

export interface IChequeDraftRepository extends IDraftRepository<
  ChequeDraft,
  ChequeDraftFields
> {
  hasNumberConflict(
    businessId: string,
    accountId: string,
    chequeNumber: string,
  ): Promise<boolean>
}

export class SupabaseChequeDraftRepository
  extends SupabaseDraftRepository<ChequeDraft, ChequeDraftFields>
  implements IChequeDraftRepository
{
  constructor() {
    super(
      TABLES.CHEQUES,
      '*, party:parties(name, color, icon, avatar_url), account:accounts(account_name, color, icon, bank:banks(name, logo_url))',
    )
  }

  async hasNumberConflict(
    businessId: string,
    accountId: string,
    chequeNumber: string,
  ): Promise<boolean> {
    const rows = await this.handle(
      this.db
        .select('id')
        .eq('business_id', businessId)
        .eq('account_id', accountId)
        .eq('cheque_number', chequeNumber)
        .eq('is_draft', false)
        .limit(1),
    )
    return (rows as unknown[]).length > 0
  }
}

export class SupabasePartyDraftRepository extends SupabaseDraftRepository<
  PartyDraft,
  PartyDraftFields
> {
  constructor() {
    super(TABLES.PARTIES, '*')
  }
}

export class SupabaseAccountDraftRepository extends SupabaseDraftRepository<
  AccountDraft,
  AccountDraftFields
> {
  constructor() {
    super(TABLES.ACCOUNTS, '*, bank:banks(id, name, logo_url)')
  }
}

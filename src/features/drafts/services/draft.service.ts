import type { z } from 'zod'
import { accountSchema, chequeSchema, partySchema } from '@/validators'
import { ValidationError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { Cheque as ChequeEntity } from '@/domain/cheque.entity'
import { storageService } from '@/services/storage.service'
import type {
  Account,
  AccountDraft,
  AccountDraftFields,
  ChequeDraft,
  ChequeDraftFields,
  ChequeWithRelations,
  Party,
  PartyDraft,
  PartyDraftFields,
} from '@/types'
import {
  type IChequeDraftRepository,
  type IDraftRepository,
  SupabaseAccountDraftRepository,
  SupabaseChequeDraftRepository,
  SupabasePartyDraftRepository,
} from '../repositories/draft.repository'

function parseOrThrow<T extends z.ZodTypeAny>(
  schema: T,
  values: unknown,
): z.infer<T> {
  const result = schema.safeParse(values)
  if (!result.success) {
    throw new ValidationError(
      result.error.issues[0]?.message ?? 'Draft is incomplete',
      result.error,
    )
  }
  return result.data
}

class DraftService<TDraft, TFields> {
  constructor(
    protected readonly repository: IDraftRepository<TDraft, TFields>,
  ) {}

  list(businessId: string) {
    return this.repository.list(businessId)
  }

  getById(id: string) {
    return this.repository.getById(id)
  }

  create(businessId: string, fields: Partial<TFields>) {
    return this.repository.create(businessId, fields)
  }

  update(id: string, fields: Partial<TFields>) {
    return this.repository.update(id, fields)
  }

  delete(id: string) {
    return this.repository.delete(id)
  }
}

type ImageStorage = { deleteChequeImage(url: string): Promise<void> }

export class ChequeDraftService extends DraftService<
  ChequeDraft,
  ChequeDraftFields
> {
  constructor(
    protected readonly repository: IChequeDraftRepository = new SupabaseChequeDraftRepository(),
    private readonly storage: ImageStorage = storageService,
  ) {
    super(repository)
  }

  async delete(id: string) {
    const draft = await this.repository.getById(id)
    await this.repository.delete(id)
    if (draft.image_url) {
      await this.storage.deleteChequeImage(draft.image_url).catch((error) => {
        logger.error('Failed to delete draft cheque image', error)
      })
    }
  }

  async publish(
    id: string,
    values: unknown,
    remindBeforeDays: number | null,
  ): Promise<ChequeEntity> {
    const data = parseOrThrow(chequeSchema, values)
    const row = await this.repository.publish<ChequeWithRelations>(id, {
      ...data,
      notes: data.notes || null,
      image_url: data.image_url ?? null,
      remind_before_days: remindBeforeDays,
      status: ChequeEntity.initialStatusFor(data.type),
    })
    return ChequeEntity.fromRow(row)
  }

  hasNumberConflict(
    businessId: string,
    accountId: string,
    chequeNumber: string,
  ) {
    return this.repository.hasNumberConflict(
      businessId,
      accountId,
      chequeNumber,
    )
  }
}

export class PartyDraftService extends DraftService<
  PartyDraft,
  PartyDraftFields
> {
  constructor(
    repository: IDraftRepository<
      PartyDraft,
      PartyDraftFields
    > = new SupabasePartyDraftRepository(),
  ) {
    super(repository)
  }

  async publish(id: string, values: unknown): Promise<Party> {
    const data = parseOrThrow(partySchema, values)
    return this.repository.publish<Party>(id, {
      ...data,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
      avatar_url: data.avatar_url || null,
    })
  }
}

export class AccountDraftService extends DraftService<
  AccountDraft,
  AccountDraftFields
> {
  constructor(
    repository: IDraftRepository<
      AccountDraft,
      AccountDraftFields
    > = new SupabaseAccountDraftRepository(),
  ) {
    super(repository)
  }

  async publish(id: string, values: unknown): Promise<Account> {
    const data = parseOrThrow(accountSchema, {
      opening_balance: 0,
      ...(values as Record<string, unknown>),
    })
    return this.repository.publish<Account>(id, {
      ...data,
      ifsc_code: data.ifsc_code || null,
      notes: data.notes || null,
      opening_balance: data.opening_balance,
    })
  }
}

function lazy<T extends object>(factory: () => T): T {
  let instance: T | undefined
  return new Proxy({} as T, {
    get(_target, property) {
      instance ??= factory()
      const value = Reflect.get(instance, property, instance)
      return typeof value === 'function' ? value.bind(instance) : value
    },
  })
}

export const chequeDraftService = lazy(() => new ChequeDraftService())
export const partyDraftService = lazy(() => new PartyDraftService())
export const accountDraftService = lazy(() => new AccountDraftService())

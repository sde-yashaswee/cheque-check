import { Cheque, ChequeStatus, ChequeWithRelations } from '@/types'
import { ValidationError } from '@/lib/errors'
import { Cheque as ChequeEntity } from '@/domain/cheque.entity'
import {
  IChequeRepository,
  SupabaseChequeRepository,
} from '@/repositories/cheque.repository'

let defaultChequeService: ChequeService | undefined

function getDefaultChequeService(): ChequeService {
  if (!defaultChequeService) {
    defaultChequeService = new ChequeService()
  }

  return defaultChequeService
}

export class ChequeService {
  constructor(
    private readonly repository: IChequeRepository = new SupabaseChequeRepository(),
  ) {}

  static async getAll(businessId: string): Promise<ChequeEntity[]> {
    return getDefaultChequeService().getAll(businessId)
  }

  static async getById(id: string): Promise<ChequeEntity> {
    return getDefaultChequeService().getById(id)
  }

  static async create(
    cheque: Omit<
      Cheque,
      'id' | 'created_at' | 'updated_at' | 'voice_call_sent' | 'last_call_at'
    >,
  ): Promise<ChequeEntity> {
    return getDefaultChequeService().create(cheque)
  }

  static async update(
    id: string,
    cheque: Partial<
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
  ): Promise<ChequeEntity> {
    return getDefaultChequeService().update(id, cheque)
  }

  static async updateStatus(
    id: string,
    status: ChequeStatus,
  ): Promise<ChequeEntity> {
    return getDefaultChequeService().updateStatus(id, status)
  }

  static async delete(id: string): Promise<void> {
    return getDefaultChequeService().delete(id)
  }

  async getAll(businessId: string): Promise<ChequeEntity[]> {
    const rows = await this.repository.getAll(businessId)
    return rows.map((row) => ChequeEntity.fromRow(row))
  }

  async getById(id: string): Promise<ChequeEntity> {
    const row = await this.repository.getById(id)
    return ChequeEntity.fromRow(row)
  }

  async create(
    cheque: Omit<
      Cheque,
      'id' | 'created_at' | 'updated_at' | 'voice_call_sent' | 'last_call_at'
    >,
  ): Promise<ChequeEntity> {
    const created = await this.repository.create(cheque)
    return ChequeEntity.fromRow(created as ChequeWithRelations)
  }

  async update(
    id: string,
    cheque: Partial<
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
  ): Promise<ChequeEntity> {
    const updated = await this.repository.update(id, cheque)
    return ChequeEntity.fromRow(updated as ChequeWithRelations)
  }

  async updateStatus(id: string, status: ChequeStatus): Promise<ChequeEntity> {
    const current = ChequeEntity.fromRow(await this.repository.getById(id))

    if (!current.canTransition(status)) {
      throw new ValidationError(
        `Cannot transition cheque from ${current.status} to ${status}`,
      )
    }

    const row = await this.repository.updateStatus(id, status)
    return ChequeEntity.fromRow(row as ChequeWithRelations)
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id)
  }
}

const chequeServiceTarget = Object.create(
  ChequeService.prototype,
) as ChequeService

export const chequeService = new Proxy(chequeServiceTarget, {
  get(_target, property, receiver) {
    const service = getDefaultChequeService()
    const value = Reflect.get(service, property, receiver)
    return typeof value === 'function' ? value.bind(service) : value
  },
})

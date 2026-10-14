import { Business } from '@/types'
import {
  IBusinessRepository,
  SupabaseBusinessRepository,
} from '@/features/businesses/repositories/business.repository'

let defaultBusinessService: BusinessService | undefined

function getDefaultBusinessService(): BusinessService {
  if (!defaultBusinessService) {
    defaultBusinessService = new BusinessService()
  }

  return defaultBusinessService
}

export class BusinessService {
  constructor(
    private readonly repository: IBusinessRepository = new SupabaseBusinessRepository(),
  ) {}

  async getAll(): Promise<Business[]> {
    return this.repository.getAll()
  }

  async getById(id: string): Promise<Business> {
    return this.repository.getById(id)
  }

  async create(
    business: Omit<
      Business,
      'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
    >,
  ): Promise<Business> {
    return this.repository.create(business)
  }

  async update(
    id: string,
    business: Partial<
      Omit<
        Business,
        'id' | 'user_id' | 'created_at' | 'updated_at' | 'deleted_at'
      >
    >,
  ): Promise<Business> {
    return this.repository.update(id, business)
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id)
  }
}

const businessServiceTarget = Object.create(
  BusinessService.prototype,
) as BusinessService

export const businessService = new Proxy(businessServiceTarget, {
  get(_target, property, receiver) {
    const service = getDefaultBusinessService()
    const value = Reflect.get(service, property, receiver)
    return typeof value === 'function' ? value.bind(service) : value
  },
})

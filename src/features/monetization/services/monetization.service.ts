import {
  Entitlement,
  IMonetizationRepository,
  Quota,
  SupabaseMonetizationRepository,
  Transaction,
} from '@/features/monetization/repositories/monetization.repository'

let defaultMonetizationService: MonetizationService | undefined

function getDefaultMonetizationService(): MonetizationService {
  if (!defaultMonetizationService) {
    defaultMonetizationService = new MonetizationService()
  }

  return defaultMonetizationService
}

export type { Entitlement, Quota, Transaction }

export class MonetizationService {
  constructor(
    private readonly repository: IMonetizationRepository = new SupabaseMonetizationRepository(),
  ) {}

  async getEntitlements(): Promise<Entitlement[]> {
    return this.repository.getEntitlements()
  }

  async getQuotas(): Promise<Quota[]> {
    return this.repository.getQuotas()
  }

  async getTransactions(): Promise<Transaction[]> {
    return this.repository.getTransactions()
  }
}

export const monetizationService = new Proxy(
  Object.create(MonetizationService.prototype),
  {
    get(_target, property, receiver) {
      const service = getDefaultMonetizationService()
      const value = Reflect.get(service, property, receiver)
      return typeof value === 'function' ? value.bind(service) : value
    },
  },
)

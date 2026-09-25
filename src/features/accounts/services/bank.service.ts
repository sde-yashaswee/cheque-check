import { Bank } from '@/types'
import {
  IBankRepository,
  SupabaseBankRepository,
} from '@/features/accounts/repositories/bank.repository'

let defaultBankService: BankService | undefined

function getDefaultBankService(): BankService {
  if (!defaultBankService) {
    defaultBankService = new BankService()
  }

  return defaultBankService
}

export class BankService {
  constructor(
    private readonly repository: IBankRepository = new SupabaseBankRepository(),
  ) {}

  static async getAll(): Promise<Bank[]> {
    return getDefaultBankService().getAll()
  }

  async getAll(): Promise<Bank[]> {
    return this.repository.getAll()
  }
}

export const bankService = new Proxy(Object.create(BankService.prototype), {
  get(_target, property, receiver) {
    const service = getDefaultBankService()
    const value = Reflect.get(service, property, receiver)
    return typeof value === 'function' ? value.bind(service) : value
  },
})

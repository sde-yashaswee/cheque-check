import { Account } from '@/types'
import {
  IAccountRepository,
  SupabaseAccountRepository,
} from '@/features/accounts/repositories/account.repository'

let defaultAccountService: AccountService | undefined

function getDefaultAccountService(): AccountService {
  if (!defaultAccountService) {
    defaultAccountService = new AccountService()
  }

  return defaultAccountService
}

export class AccountService {
  constructor(
    private readonly repository: IAccountRepository = new SupabaseAccountRepository(),
  ) {}

  static async getAll(businessId: string) {
    return getDefaultAccountService().getAll(businessId)
  }

  static async getById(id: string) {
    return getDefaultAccountService().getById(id)
  }

  static async create(
    account: Omit<
      Account,
      'id' | 'created_at' | 'updated_at' | 'bank' | 'deleted_at'
    >,
  ) {
    return getDefaultAccountService().create(account)
  }

  static async update(
    id: string,
    account: Partial<
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
  ) {
    return getDefaultAccountService().update(id, account)
  }

  static async delete(id: string) {
    return getDefaultAccountService().delete(id)
  }

  async getAll(businessId: string): Promise<Account[]> {
    return this.repository.getAll(businessId)
  }

  async getById(id: string): Promise<Account> {
    return this.repository.getById(id)
  }

  async create(
    account: Omit<
      Account,
      'id' | 'created_at' | 'updated_at' | 'bank' | 'deleted_at'
    >,
  ): Promise<Account> {
    return this.repository.create(account)
  }

  async update(
    id: string,
    account: Partial<
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
    return this.repository.update(id, account)
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id)
  }
}

export const accountService = new Proxy(
  Object.create(AccountService.prototype),
  {
    get(_target, property, receiver) {
      const service = getDefaultAccountService()
      const value = Reflect.get(service, property, receiver)
      return typeof value === 'function' ? value.bind(service) : value
    },
  },
)

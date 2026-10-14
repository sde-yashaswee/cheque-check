import { Party } from '@/types'
import {
  IPartyRepository,
  SupabasePartyRepository,
} from '@/features/parties/repositories/party.repository'

let defaultPartyService: PartyService | undefined

function getDefaultPartyService(): PartyService {
  if (!defaultPartyService) {
    defaultPartyService = new PartyService()
  }

  return defaultPartyService
}

export class PartyService {
  constructor(
    private readonly repository: IPartyRepository = new SupabasePartyRepository(),
  ) {}

  async getAll(businessId: string): Promise<Party[]> {
    return this.repository.getAll(businessId)
  }

  async getById(id: string): Promise<Party> {
    return this.repository.getById(id)
  }

  async create(
    party: Omit<Party, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
  ): Promise<Party> {
    return this.repository.create(party)
  }

  async update(
    id: string,
    party: Partial<
      Omit<
        Party,
        'id' | 'business_id' | 'created_at' | 'updated_at' | 'deleted_at'
      >
    >,
  ): Promise<Party> {
    return this.repository.update(id, party)
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id)
  }
}

export const partyService = new Proxy(Object.create(PartyService.prototype), {
  get(_target, property, receiver) {
    const service = getDefaultPartyService()
    const value = Reflect.get(service, property, receiver)
    return typeof value === 'function' ? value.bind(service) : value
  },
})

import { Profile } from '@/types'
import {
  IProfileRepository,
  SupabaseProfileRepository,
} from '@/features/profile/repositories/profile.repository'

let defaultProfileService: ProfileService | undefined

function getDefaultProfileService(): ProfileService {
  if (!defaultProfileService) {
    defaultProfileService = new ProfileService()
  }

  return defaultProfileService
}

export class ProfileService {
  constructor(
    private readonly repository: IProfileRepository = new SupabaseProfileRepository(),
  ) {}

  async get(): Promise<Profile | null> {
    return this.repository.get()
  }

  async update(profile: Partial<Profile>): Promise<Profile> {
    return this.repository.update(profile)
  }

  async delete(): Promise<void> {
    return this.repository.delete()
  }
}

export const profileService = new Proxy(
  Object.create(ProfileService.prototype),
  {
    get(_target, property, receiver) {
      const service = getDefaultProfileService()
      const value = Reflect.get(service, property, receiver)
      return typeof value === 'function' ? value.bind(service) : value
    },
  },
)

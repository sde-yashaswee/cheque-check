import {
  IStorageRepository,
  SupabaseStorageRepository,
} from '@/repositories/storage.repository'

export class StorageService {
  constructor(
    private readonly repository: IStorageRepository = new SupabaseStorageRepository(),
  ) {}

  async uploadChequeImage(file: File): Promise<string> {
    return this.repository.uploadChequeImage(file)
  }

  async uploadAvatar(file: File): Promise<string> {
    return this.repository.uploadAvatar(file)
  }
}

export const storageService = new StorageService()

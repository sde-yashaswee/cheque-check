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

  async deleteAvatar(url: string): Promise<void> {
    return this.repository.deleteAvatar(url)
  }

  async deleteChequeImage(url: string): Promise<void> {
    return this.repository.deleteChequeImage(url)
  }
}

export const storageService = new StorageService()

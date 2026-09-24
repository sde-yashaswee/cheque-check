import { describe, expect, it, vi } from 'vitest'
import { StorageService } from './storage.service'
import type { IStorageRepository } from '@/repositories/storage.repository'

describe('StorageService', () => {
  it('delegates cheque image uploads to the injected repository', async () => {
    const repository = {
      uploadChequeImage: vi.fn().mockResolvedValue('/api/storage/cheque.jpg'),
    } as unknown as IStorageRepository
    const service = new StorageService(repository)
    const file = new File(['image'], 'cheque.jpg', { type: 'image/jpeg' })

    await expect(service.uploadChequeImage(file)).resolves.toBe(
      '/api/storage/cheque.jpg',
    )
    expect(repository.uploadChequeImage).toHaveBeenCalledWith(file)
  })
})

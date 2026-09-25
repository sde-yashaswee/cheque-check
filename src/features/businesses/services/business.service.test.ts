import { describe, expect, it, vi } from 'vitest'
import { BusinessService, businessService } from './business.service'

describe('BusinessService', () => {
  it('delegates read calls to the injected repository', async () => {
    const repo = {
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }

    const service = new BusinessService(repo as any)
    await service.getAll()

    expect(repo.getAll).toHaveBeenCalledTimes(1)
  })

  it('exports a singleton instance', () => {
    expect(businessService).toBeInstanceOf(BusinessService)
  })
})

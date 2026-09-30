import { describe, expect, it, vi } from 'vitest'
import { TagService } from './tag.service'
import type { ITagRepository } from '@/features/tags/repositories/tag.repository'

describe('TagService', () => {
  it('delegates tag creation to the repository', async () => {
    const tag = {
      id: 'tag-1',
      business_id: 'business-1',
      name: 'Urgent',
      color: '#ff0000',
      created_at: '',
      updated_at: '',
    }
    const repository = {
      create: vi.fn().mockResolvedValue(tag),
    } as unknown as ITagRepository

    const result = await new TagService(repository).create({
      business_id: 'business-1',
      name: 'Urgent',
      color: '#ff0000',
    })

    expect(result).toEqual(tag)
    expect(repository.create).toHaveBeenCalledWith({
      business_id: 'business-1',
      name: 'Urgent',
      color: '#ff0000',
    })
  })
})

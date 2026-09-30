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

  it('syncs entity tags by attaching new and detaching removed ids', async () => {
    const repository = {
      attach: vi.fn().mockResolvedValue(undefined),
      detach: vi.fn().mockResolvedValue(undefined),
    } as unknown as ITagRepository

    await new TagService(repository).syncForEntity(
      'party',
      'p1',
      ['a', 'b'],
      ['b', 'c'],
    )

    expect(repository.attach).toHaveBeenCalledTimes(1)
    expect(repository.attach).toHaveBeenCalledWith({
      tag_id: 'c',
      entity_type: 'party',
      entity_id: 'p1',
    })
    expect(repository.detach).toHaveBeenCalledTimes(1)
    expect(repository.detach).toHaveBeenCalledWith({
      tag_id: 'a',
      entity_type: 'party',
      entity_id: 'p1',
    })
  })
})

import { describe, expect, it } from 'vitest'
import type { TagWithUsage } from '@/types'
import { filterAndSortTags, type TagListQuery } from './tag-list'

const tag = (
  name: string,
  color: string,
  usage_count: number,
  created_at: string,
): TagWithUsage => ({
  id: name,
  business_id: 'b',
  name,
  color,
  usage_count,
  created_at,
  updated_at: created_at,
})

const tags = [
  tag('Urgent', '#dc2626', 3, '2026-01-03'),
  tag('archive', '#475569', 0, '2026-01-01'),
  tag('Bank', '#2563eb', 1, '2026-01-02'),
]

const base: TagListQuery = {
  search: '',
  sortBy: 'name',
  sortOrder: 'asc',
  color: null,
  usage: 'all',
}

const names = (query: Partial<TagListQuery>) =>
  filterAndSortTags(tags, { ...base, ...query }).map((t) => t.name)

describe('filterAndSortTags', () => {
  it('sorts by name case-insensitively by default', () => {
    expect(names({})).toEqual(['archive', 'Bank', 'Urgent'])
  })

  it('sorts by usage and creation date in either order', () => {
    expect(names({ sortBy: 'usage', sortOrder: 'desc' })).toEqual([
      'Urgent',
      'Bank',
      'archive',
    ])
    expect(names({ sortBy: 'created' })).toEqual(['archive', 'Bank', 'Urgent'])
  })

  it('filters by search, color and usage', () => {
    expect(names({ search: 'AN' })).toEqual(['Bank'])
    expect(names({ color: '#dc2626' })).toEqual(['Urgent'])
    expect(names({ usage: 'unused' })).toEqual(['archive'])
    expect(names({ usage: 'used' })).toEqual(['Bank', 'Urgent'])
  })
})

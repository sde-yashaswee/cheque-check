import type { TagWithUsage } from '@/types'

export type TagSortBy = 'name' | 'created' | 'usage'
export type TagUsageFilter = 'all' | 'used' | 'unused'

export interface TagListQuery {
  search: string
  sortBy: TagSortBy
  sortOrder: 'asc' | 'desc'
  color: string | null
  usage: TagUsageFilter
}

export function filterAndSortTags(
  tags: readonly TagWithUsage[],
  { search, sortBy, sortOrder, color, usage }: TagListQuery,
): TagWithUsage[] {
  const query = search.trim().toLowerCase()
  const result = tags.filter(
    (tag) =>
      (!query || tag.name.toLowerCase().includes(query)) &&
      (!color || tag.color.toLowerCase() === color) &&
      (usage === 'all' ||
        (usage === 'used' ? tag.usage_count > 0 : tag.usage_count === 0)),
  )

  const direction = sortOrder === 'asc' ? 1 : -1
  result.sort((a, b) => {
    if (sortBy === 'usage') return (a.usage_count - b.usage_count) * direction
    if (sortBy === 'created')
      return a.created_at.localeCompare(b.created_at) * direction
    return a.name.localeCompare(b.name) * direction
  })
  return result
}

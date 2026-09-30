'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Tag, TagWithUsage } from '@/types'
import type { TagLink } from '@/features/tags/repositories/tag.repository'
import { tagService } from '@/features/tags/services/tag.service'
import {
  filterAndSortTags,
  type TagSortBy,
  type TagUsageFilter,
} from '@/features/tags/lib/tag-list'

export function useTagList(businessId: string | undefined) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<TagSortBy>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [color, setColor] = useState<string | null>(null)
  const [usage, setUsage] = useState<TagUsageFilter>('all')

  const query = useQuery<TagWithUsage[]>({
    queryKey: ['tags', businessId, 'usage'],
    queryFn: () => tagService.getAllWithUsage(businessId!),
    enabled: !!businessId,
  })

  const filteredTags = useMemo(
    () =>
      filterAndSortTags(query.data ?? [], {
        search,
        sortBy,
        sortOrder,
        color,
        usage,
      }),
    [query.data, search, sortBy, sortOrder, color, usage],
  )

  const clearFilters = () => {
    setSearch('')
    setColor(null)
    setUsage('all')
  }

  return {
    tags: query.data,
    filteredTags,
    isLoading: query.isLoading,
    error: query.error,
    search,
    setSearch,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    color,
    setColor,
    usage,
    setUsage,
    clearFilters,
  }
}

export function useTagDetail(id: string) {
  const tag = useQuery<Tag>({
    queryKey: ['tag', id],
    queryFn: () => tagService.getById(id),
  })
  const links = useQuery<TagLink[]>({
    queryKey: ['tag', id, 'links'],
    queryFn: () => tagService.getLinks(id),
  })
  return {
    tag: tag.data,
    links: links.data ?? [],
    isLoading: tag.isLoading || links.isLoading,
    error: tag.error ?? links.error,
  }
}

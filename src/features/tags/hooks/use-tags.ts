'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Tag } from '@/types'
import { tagService } from '@/features/tags/services/tag.service'

export function useTags(businessId: string | undefined) {
  const queryClient = useQueryClient()
  const queryKey = ['tags', businessId]
  const query = useQuery<Tag[]>({
    queryKey,
    queryFn: () => tagService.getAll(businessId!),
    enabled: !!businessId,
  })

  const createMutation = useMutation<
    Tag,
    Error,
    Pick<Tag, 'business_id' | 'name' | 'color'>
  >({
    mutationFn: (input: Pick<Tag, 'business_id' | 'name' | 'color'>) =>
      tagService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    tags: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createTag: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}

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

  const updateMutation = useMutation<
    Tag,
    Error,
    { id: string; input: Partial<Pick<Tag, 'name' | 'color'>> }
  >({
    mutationFn: ({ id, input }) => tagService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => tagService.delete(id),
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
    updateTag: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteTag: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  }
}

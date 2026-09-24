import type { QueryKey } from '@tanstack/react-query'
import { useOptimisticMutation } from './use-optimistic-mutation'
import type { MutationFunction } from '@tanstack/react-query'

interface UseEntityMutationsOptions<TEntity, TUpdate, TUpdateResult> {
  listQueryKey: QueryKey
  detailQueryKey?: QueryKey
  deleteQueryKeys?: QueryKey[]
  update: {
    mutationFn: (variables: TUpdate) => Promise<TUpdateResult>
    updateList: (
      current: TEntity[] | undefined,
      variables: TUpdate,
    ) => TEntity[] | undefined
  }
  remove: {
    mutationFn: () => Promise<void>
    updateList: (current: TEntity[] | undefined) => TEntity[] | undefined
  }
}

interface UseEntityCreateMutationOptions<TEntity, TCreate, TResult> {
  queryKey: QueryKey
  mutationFn: MutationFunction<TResult, TCreate>
  addToList: (
    current: TEntity[] | undefined,
    variables: TCreate,
  ) => TEntity[] | undefined
  onSuccess?: (data: TResult, variables: TCreate) => void
  onError?: (
    error: unknown,
    variables: TCreate,
    context: { previousValues: Record<string, unknown> } | undefined,
  ) => void
}

export function useEntityMutations<TEntity, TUpdate, TUpdateResult>({
  listQueryKey,
  detailQueryKey,
  deleteQueryKeys = [],
  update,
  remove,
}: UseEntityMutationsOptions<TEntity, TUpdate, TUpdateResult>) {
  const updateMutation = useOptimisticMutation<
    TEntity[],
    TUpdate,
    TUpdateResult
  >({
    queryKey: listQueryKey,
    additionalQueryKeys: detailQueryKey ? [detailQueryKey] : [],
    mutationFn: update.mutationFn,
    update: update.updateList,
  })

  const deleteMutation = useOptimisticMutation<TEntity[], void, void>({
    queryKey: listQueryKey,
    additionalQueryKeys: deleteQueryKeys,
    mutationFn: remove.mutationFn,
    update: (current) => remove.updateList(current),
  })

  return { updateMutation, deleteMutation }
}

export function useEntityCreateMutation<TEntity, TCreate, TResult>({
  queryKey,
  mutationFn,
  addToList,
  onSuccess,
  onError,
}: UseEntityCreateMutationOptions<TEntity, TCreate, TResult>) {
  return useOptimisticMutation<TEntity[], TCreate, TResult>({
    queryKey,
    mutationFn,
    update: addToList,
    onSuccess,
    onError,
  })
}

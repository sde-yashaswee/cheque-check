import type { QueryKey } from '@tanstack/react-query'
import { useOptimisticMutation } from './use-optimistic-mutation'

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

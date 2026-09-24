import {
  QueryKey,
  useMutation,
  useQueryClient,
  type MutationFunction,
} from '@tanstack/react-query'

interface UseOptimisticMutationOptions<TData, TVariables, TResult> {
  queryKey: QueryKey
  additionalQueryKeys?: QueryKey[]
  mutationFn: MutationFunction<TResult, TVariables>
  update: (
    current: TData | undefined,
    variables: TVariables,
  ) => TData | undefined
  onSuccess?: (data: TResult, variables: TVariables) => void
}

export function useOptimisticMutation<TData, TVariables, TResult>({
  queryKey,
  additionalQueryKeys = [],
  mutationFn,
  update,
  onSuccess,
}: UseOptimisticMutationOptions<TData, TVariables, TResult>) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<TData>(queryKey)
      queryClient.setQueryData<TData>(queryKey, (current) =>
        update(current, variables),
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(queryKey, context?.previous)
    },
    onSuccess,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      for (const additionalQueryKey of additionalQueryKeys) {
        queryClient.invalidateQueries({ queryKey: additionalQueryKey })
      }
    },
  })
}

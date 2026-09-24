import {
  QueryKey,
  useMutation,
  useQueryClient,
  type MutationFunction,
} from '@tanstack/react-query'

interface UseOptimisticMutationOptions<TData, TVariables, TResult> {
  queryKey: QueryKey
  mutationFn: MutationFunction<TResult, TVariables>
  update: (
    current: TData | undefined,
    variables: TVariables,
  ) => TData | undefined
}

export function useOptimisticMutation<TData, TVariables, TResult>({
  queryKey,
  mutationFn,
  update,
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

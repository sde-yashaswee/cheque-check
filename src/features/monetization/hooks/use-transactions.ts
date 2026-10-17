import { useQuery } from '@tanstack/react-query'
import {
  monetizationService,
  type Transaction,
} from '../services/monetization.service'
import { queryKeys } from '@/lib/query-keys'

export function useTransactions() {
  const query = useQuery<Transaction[]>({
    queryKey: queryKeys.monetization.transactions(),
    queryFn: () => monetizationService.getTransactions(),
    refetchInterval: (current) =>
      current.state.data?.some(
        (transaction) =>
          transaction.status === 'created' ||
          transaction.status === 'authorized',
      )
        ? 15_000
        : false,
  })
  return {
    transactions: query.data ?? [],
    isLoading: query.isPending,
    error: query.error,
    refresh: query.refetch,
  }
}

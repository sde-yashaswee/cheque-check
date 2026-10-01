import { useQuery } from '@tanstack/react-query'
import { bankService } from '@/features/accounts/services/bank.service'
import { Bank } from '@/types'
import { queryKeys } from '@/lib/query-keys'

export function useBanks() {
  return useQuery<Bank[]>({
    queryKey: queryKeys.banks.list(),
    queryFn: () => bankService.getAll(),
  })
}

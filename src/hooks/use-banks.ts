import { useQuery } from '@tanstack/react-query'
import { BankService } from '@/services/bank.service'
import { Bank } from '@/types'

export function useBanks() {
  return useQuery<Bank[]>({
    queryKey: ['master-banks'],
    queryFn: () => BankService.getAll(),
  })
}

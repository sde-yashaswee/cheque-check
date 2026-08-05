import { useQuery } from '@tanstack/react-query'
import { BusinessService } from '@/services/business.service'
import { ChequeService } from '@/services/cheque.service'
import { useMemo } from 'react'
import type { Cheque } from '@/types'

export function useBusinessDetail(id: string) {
  const { data: business, isLoading: businessLoading, error: businessError } = useQuery({
    queryKey: ['business', id],
    queryFn: () => BusinessService.getById(id),
  })

  const { data: cheques, isLoading: chequesLoading } = useQuery({
    queryKey: ['cheques', id],
    queryFn: () => ChequeService.getAll(id),
    enabled: !!id,
  })

  const stats = useMemo(() => {
    if (!cheques) return { total: 0, cleared: 0, pending: 0, bounced: 0, totalAmount: 0 }
    return {
      total: cheques.length,
      cleared: cheques.filter((c: Cheque) => c.status === 'Cleared').length,
      pending: cheques.filter((c: Cheque) => c.status === 'Issued' || c.status === 'Received').length,
      bounced: cheques.filter((c: Cheque) => c.status === 'Bounced').length,
      totalAmount: cheques.reduce((sum: number, c: Cheque) => sum + c.amount, 0)
    }
  }, [cheques])

  return {
    business,
    cheques,
    stats,
    isLoading: businessLoading || chequesLoading,
    error: businessError,
  }
}

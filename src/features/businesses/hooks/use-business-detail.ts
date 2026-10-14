import { useQuery } from '@tanstack/react-query'
import { businessService } from '@/features/businesses/services/business.service'
import { useCheques } from '@/features/cheques/hooks/use-cheques'
import { useMemo } from 'react'
import type { Cheque } from '@/types'
import { queryKeys } from '@/lib/query-keys'

export function useBusinessDetail(id: string) {
  const {
    data: business,
    isLoading: businessLoading,
    error: businessError,
  } = useQuery({
    queryKey: queryKeys.businesses.detail(id),
    queryFn: () => businessService.getById(id),
  })

  const {
    cheques,
    filteredCheques,
    isLoading: chequesLoading,
    error: chequesError,
    search,
    setSearch,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    updateStatus,
  } = useCheques(id)

  const stats = useMemo(() => {
    if (!cheques)
      return { total: 0, cleared: 0, pending: 0, bounced: 0, totalAmount: 0 }
    return {
      total: cheques.length,
      cleared: cheques.filter((c: Cheque) => c.status === 'Cleared').length,
      pending: cheques.filter(
        (c: Cheque) => c.status === 'Issued' || c.status === 'Received',
      ).length,
      bounced: cheques.filter((c: Cheque) => c.status === 'Bounced').length,
      totalAmount: cheques.reduce(
        (sum: number, c: Cheque) => sum + c.amount,
        0,
      ),
    }
  }, [cheques])

  return {
    business,
    cheques,
    filteredCheques,
    stats,
    search,
    setSearch,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    updateStatus,
    isLoading: businessLoading || chequesLoading,
    error: businessError || chequesError,
  }
}

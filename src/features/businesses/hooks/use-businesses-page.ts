import { useBusiness } from '@/hooks/use-business'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chequeService } from '@/features/cheques/services/cheque.service'
import { businessService } from '@/features/businesses/services/business.service'
import { useState, useMemo, useCallback } from 'react'

export function useBusinesses() {
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [sortBy, setSortBy] = useState<'name' | 'upcoming'>('name')
  const {
    businesses,
    isLoading: businessesLoading,
    activeBusiness,
    setActiveBusiness,
  } = useBusiness()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => businessService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
    },
  })

  const { data: allCheques, isLoading: chequesLoading } = useQuery({
    queryKey: ['all-businesses-cheques'],
    queryFn: async () => {
      const results = await Promise.all(
        businesses.map((b) => chequeService.getAll(b.id)),
      )
      return results.flat()
    },
    enabled: businesses.length > 0,
  })

  const getUpcomingTotal = useCallback(
    (businessId: string) => {
      if (!allCheques) return 0
      const today = new Date().toISOString().split('T')[0]
      return allCheques
        .filter(
          (c) =>
            c.business_id === businessId &&
            c.status !== 'Cleared' &&
            c.status !== 'Bounced' &&
            c.cheque_date >= today,
        )
        .reduce((sum, c) => sum + (c.amount || 0), 0)
    },
    [allCheques],
  )

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return []
    const result = businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.email?.toLowerCase().includes(search.toLowerCase()),
    )

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      } else if (sortBy === 'upcoming') {
        const totalA = getUpcomingTotal(a.id)
        const totalB = getUpcomingTotal(b.id)
        return sortOrder === 'asc' ? totalA - totalB : totalB - totalA
      }
      return 0
    })

    return result
  }, [businesses, search, sortOrder, sortBy, getUpcomingTotal])

  const deleteBusiness = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  return {
    businesses,
    filteredBusinesses,
    isLoading: businessesLoading || chequesLoading,
    activeBusiness,
    setActiveBusiness,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    sortBy,
    setSortBy,
    getUpcomingTotal,
    deleteBusiness,
    isDeleting: deleteMutation.isPending,
  }
}

import { useBusiness } from "@/hooks/use-business"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ChequeService } from "@/services/cheque.service"
import { BusinessService } from "@/services/business.service"
import { useState, useMemo } from 'react'

export function useBusinesses() {
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const { businesses, isLoading: businessesLoading, activeBusiness, setActiveBusiness } = useBusiness()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: (id: string) => BusinessService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] })
    }
  })

  const { data: allCheques, isLoading: chequesLoading } = useQuery({
    queryKey: ['all-businesses-cheques'],
    queryFn: async () => {
      const results = await Promise.all(
        businesses.map(b => ChequeService.getAll(b.id))
      )
      return results.flat()
    },
    enabled: businesses.length > 0
  })

  const filteredBusinesses = useMemo(() => {
    if (!businesses) return []
    return businesses.filter(b => 
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.email?.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      if (sortOrder === 'asc') return a.name.localeCompare(b.name)
      return b.name.localeCompare(a.name)
    })
  }, [businesses, search, sortOrder])

  const getUpcomingTotal = (businessId: string) => {
    if (!allCheques) return 0
    const today = new Date().toISOString().split('T')[0]
    return allCheques
      .filter(c => c.business_id === businessId && c.status !== 'Cleared' && c.status !== 'Bounced' && c.cheque_date >= today)
      .reduce((sum, c) => sum + c.amount, 0)
  }

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
    getUpcomingTotal,
    deleteBusiness,
    isDeleting: deleteMutation.isPending,
  }
}

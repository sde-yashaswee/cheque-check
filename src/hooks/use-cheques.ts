import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChequeService } from '@/services/cheque.service'
import { useState, useMemo } from 'react'
import { ChequeStatus, ChequeWithRelations } from '@/types'

export function useCheques(businessId: string | undefined) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ChequeStatus | 'All'>('All')
  const queryClient = useQueryClient()

  const { data: cheques, isLoading, error } = useQuery<ChequeWithRelations[]>({
    queryKey: ['cheques', businessId],
    queryFn: () => ChequeService.getAll(businessId!) as Promise<ChequeWithRelations[]>,
    enabled: !!businessId,
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: ChequeStatus }) => 
      ChequeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
    }
  })

  const filteredCheques = useMemo(() => {
    if (!cheques) return []
    return cheques.filter((c) => {
      const matchesSearch = c.cheque_number.includes(search) || 
                           c.party?.name.toLowerCase().includes(search.toLowerCase()) ||
                           c.amount.toString().includes(search)
      const matchesFilter = filter === 'All' || c.status === filter
      return matchesSearch && matchesFilter
    })
  }, [cheques, search, filter])

  const updateStatus = (id: string, status: ChequeStatus) => {
    mutation.mutate({ id, status })
  }

  return {
    cheques,
    filteredCheques,
    isLoading,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    updateStatus,
    isUpdating: mutation.isPending,
  }
}

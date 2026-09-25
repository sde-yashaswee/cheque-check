import { useQuery } from '@tanstack/react-query'
import { chequeService } from '@/services/cheque.service'
import { useState, useMemo } from 'react'
import { ChequeStatus, ChequeWithRelations } from '@/types'
import { useProfile } from './use-profile'
import { useOptimisticMutation } from './use-optimistic-mutation'

export type SortBy = 'date' | 'amount'
export type SortOrder = 'asc' | 'desc'

export function useCheques(businessId: string | undefined) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ChequeStatus | 'All'>('All')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const { profile } = useProfile()

  const {
    data: cheques,
    isLoading,
    error,
  } = useQuery<ChequeWithRelations[]>({
    queryKey: ['cheques', businessId],
    queryFn: () => chequeService.getAll(businessId!),
    enabled: !!businessId,
  })

  const mutation = useOptimisticMutation<
    ChequeWithRelations[],
    { id: string; status: ChequeStatus },
    ChequeWithRelations
  >({
    queryKey: ['cheques', businessId],
    mutationFn: ({ id, status }: { id: string; status: ChequeStatus }) =>
      chequeService.updateStatus(id, status),
    update: (current, { id, status }) => {
      if (!current) return current
      return current.map((cheque) =>
        cheque.id === id ? { ...cheque, status } : cheque,
      )
    },
  })

  const deleteMutation = useOptimisticMutation<
    ChequeWithRelations[],
    string,
    void
  >({
    queryKey: ['cheques', businessId],
    mutationFn: (id: string) => chequeService.delete(id),
    update: (current, id) => {
      if (!current) return current
      return current.filter((cheque) => cheque.id !== id)
    },
  })

  const processedCheques = useMemo(() => {
    if (!cheques) return []
    return cheques.filter((c) => {
      if (profile?.received_cheques_enabled === false && c.type === 'Inward') {
        return false
      }
      return true
    })
  }, [cheques, profile?.received_cheques_enabled])

  const filteredCheques = useMemo(() => {
    const result = [...processedCheques].filter((c) => {
      const matchesSearch =
        c.cheque_number.includes(search) ||
        c.party?.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.amount.toString().includes(search)
      const matchesFilter = filter === 'All' || c.status === filter
      return matchesSearch && matchesFilter
    })

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.cheque_date).getTime()
        const dateB = new Date(b.cheque_date).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      } else if (sortBy === 'amount') {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount
      }
      return 0
    })

    return result
  }, [processedCheques, search, filter, sortBy, sortOrder])

  const updateStatus = (id: string, status: ChequeStatus) => {
    mutation.mutate({ id, status })
  }

  const deleteCheque = (id: string) => {
    deleteMutation.mutate(id)
  }

  return {
    cheques: processedCheques,
    filteredCheques,
    isLoading,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    updateStatus,
    deleteCheque,
    isUpdating: mutation.isPending || deleteMutation.isPending,
  }
}

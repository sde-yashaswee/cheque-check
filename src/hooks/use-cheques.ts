import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChequeService } from '@/services/cheque.service'
import { useState, useMemo } from 'react'
import { ChequeStatus, ChequeWithRelations } from '@/types'

export type SortBy = 'date' | 'amount'
export type SortOrder = 'asc' | 'desc'

export function useCheques(businessId: string | undefined) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ChequeStatus | 'All'>('All')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const queryClient = useQueryClient()

  const { data: cheques, isLoading, error } = useQuery<ChequeWithRelations[]>({
    queryKey: ['cheques', businessId],
    queryFn: () => ChequeService.getAll(businessId!) as Promise<ChequeWithRelations[]>,
    enabled: !!businessId,
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: ChequeStatus }) => 
      ChequeService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['cheques', businessId] })
      const previousCheques = queryClient.getQueryData(['cheques', businessId])
      queryClient.setQueryData(['cheques', businessId], (old: any) => {
        if (!old) return old
        return old.map((c: any) => c.id === id ? { ...c, status } : c)
      })
      return { previousCheques }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['cheques', businessId], context?.previousCheques)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
    }
  })

  const filteredCheques = useMemo(() => {
    if (!cheques) return []
    let result = cheques.filter((c) => {
      const matchesSearch = c.cheque_number.includes(search) || 
                           c.party?.name?.toLowerCase().includes(search.toLowerCase()) ||
                           c.amount.toString().includes(search)
      const matchesFilter = filter === 'All' || c.status === filter
      return matchesSearch && matchesFilter
    })

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      } else if (sortBy === 'amount') {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount
      }
      return 0
    })

    return result
  }, [cheques, search, filter, sortBy, sortOrder])

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
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    updateStatus,
    isUpdating: mutation.isPending,
  }
}

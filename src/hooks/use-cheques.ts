import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ChequeService } from '@/services/cheque.service'
import { useState, useMemo } from 'react'
import { ChequeStatus, ChequeWithRelations } from '@/types'
import { useProfile } from './use-profile'

export type SortBy = 'date' | 'amount'
export type SortOrder = 'asc' | 'desc'

export function useCheques(businessId: string | undefined) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<ChequeStatus | 'All'>('All')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const queryClient = useQueryClient()
  const { profile } = useProfile()

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
      const prev = queryClient.getQueryData(['cheques', businessId])
      queryClient.setQueryData(['cheques', businessId], (old: any[]) => {
        if (!old) return old
        return old.map((c: any) => c.id === id ? { ...c, status } : c)
      })
      return { previousCheques: prev }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['cheques', businessId], context?.previousCheques)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ChequeService.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['cheques', businessId] })
      const prev = queryClient.getQueryData(['cheques', businessId])
      queryClient.setQueryData(['cheques', businessId], (old: any[]) => {
        if (!old) return old
        return old.filter((c: any) => c.id !== id)
      })
      return { previousCheques: prev }
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['cheques', businessId], context?.previousCheques)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
    }
  })

  const processedCheques = useMemo(() => {
    if (!cheques) return []
    return cheques.filter(c => {
      if (profile?.received_cheques_enabled === false && c.type === 'Inward') {
        return false
      }
      return true
    })
  }, [cheques, profile?.received_cheques_enabled])

  const filteredCheques = useMemo(() => {
    const result = [...processedCheques].filter((c) => {
      const matchesSearch = c.cheque_number.includes(search) || 
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

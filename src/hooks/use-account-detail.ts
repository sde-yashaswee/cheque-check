import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AccountService } from '@/services/account.service'
import { ChequeService } from '@/services/cheque.service'
import { ChequeStatus, Cheque } from '@/types'
import { useMemo, useState } from 'react'

export type SortBy = 'date' | 'amount'
export type SortOrder = 'asc' | 'desc'

export function useAccountDetail(id: string, businessId: string | undefined) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | ChequeStatus>('All')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const { data: account, isLoading: accountLoading, error: accountError } = useQuery({
    queryKey: ['account', id],
    queryFn: () => AccountService.getById(id),
  })

  const { data: cheques, isLoading: chequesLoading } = useQuery({
    queryKey: ['cheques', businessId],
    queryFn: () => ChequeService.getAll(businessId!),
    enabled: !!businessId,
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: ChequeStatus }) => 
      ChequeService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques', businessId] })
    }
  })

  const accountCheques = useMemo(() => {
    if (!cheques) return []
    return cheques.filter((c: Cheque) => c.account_id === id)
  }, [cheques, id])

  const filteredCheques = useMemo(() => {
    const result = accountCheques.filter((c: Cheque) => {
      const matchesSearch = c.cheque_number.includes(search) || c.amount.toString().includes(search)
      const matchesFilter = filter === 'All' || c.status === filter
      return matchesSearch && matchesFilter
    })

    result.sort((a: Cheque, b: Cheque) => {
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
  }, [accountCheques, search, filter, sortBy, sortOrder])

  const updateChequeStatus = (id: string, status: ChequeStatus) => {
    mutation.mutate({ id, status })
  }

  return {
    account,
    accountCheques,
    filteredCheques,
    isLoading: accountLoading || chequesLoading,
    error: accountError,
    updateChequeStatus,
    isUpdating: mutation.isPending,
    search,
    setSearch,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  }
}

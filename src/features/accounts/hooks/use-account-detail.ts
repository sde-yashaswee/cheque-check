import { useQuery } from '@tanstack/react-query'
import { accountService } from '@/features/accounts/services/account.service'
import { chequeService } from '@/features/cheques/services/cheque.service'
import { ChequeStatus, Cheque } from '@/types'
import { useMemo, useState } from 'react'
import { useOptimisticMutation } from './use-optimistic-mutation'

export type SortBy = 'date' | 'amount'
export type SortOrder = 'asc' | 'desc'

export function useAccountDetail(id: string, businessId: string | undefined) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | ChequeStatus>('All')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const {
    data: account,
    isLoading: accountLoading,
    error: accountError,
  } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountService.getById(id),
  })

  const { data: cheques, isLoading: chequesLoading } = useQuery({
    queryKey: ['cheques', businessId],
    queryFn: () => chequeService.getAll(businessId!),
    enabled: !!businessId,
  })

  const mutation = useOptimisticMutation<
    Cheque[],
    { id: string; status: ChequeStatus },
    Cheque
  >({
    queryKey: ['cheques', businessId],
    mutationFn: ({ id, status }) => chequeService.updateStatus(id, status),
    update: (current, { id, status }) => {
      if (!current) return current
      return current.map((cheque) =>
        cheque.id === id ? { ...cheque, status } : cheque,
      )
    },
  })

  const accountCheques = useMemo(() => {
    if (!cheques) return []
    return cheques.filter((c: Cheque) => c.account_id === id)
  }, [cheques, id])

  const filteredCheques = useMemo(() => {
    const result = accountCheques.filter((c: Cheque) => {
      const matchesSearch =
        c.cheque_number.includes(search) || c.amount.toString().includes(search)
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
    setSortOrder,
  }
}

import { useQuery } from '@tanstack/react-query'
import { PartyService } from '@/services/party.service'
import { chequeService } from '@/services/cheque.service'
import { ChequeStatus, Cheque } from '@/types'
import { useMemo, useState } from 'react'
import { useOptimisticMutation } from './use-optimistic-mutation'

export type SortBy = 'date' | 'amount'
export type SortOrder = 'asc' | 'desc'

export function usePartyDetail(id: string, businessId: string | undefined) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | ChequeStatus>('All')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const {
    data: party,
    isLoading: partyLoading,
    error: partyError,
  } = useQuery({
    queryKey: ['party', id],
    queryFn: () => PartyService.getById(id),
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

  const partyCheques = useMemo(() => {
    if (!cheques) return []
    return cheques.filter((c: Cheque) => c.party_id === id)
  }, [cheques, id])

  const filteredCheques = useMemo(() => {
    const result = partyCheques.filter((c: Cheque) => {
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
  }, [partyCheques, search, filter, sortBy, sortOrder])

  const outstanding = useMemo(() => {
    return partyCheques
      .filter((c: Cheque) => c.status !== 'Cleared' && c.status !== 'Bounced')
      .reduce((sum: number, c: Cheque) => sum + c.amount, 0)
  }, [partyCheques])

  const updateChequeStatus = (id: string, status: ChequeStatus) => {
    mutation.mutate({ id, status })
  }

  return {
    party,
    partyCheques,
    filteredCheques,
    outstanding,
    isLoading: partyLoading || chequesLoading,
    error: partyError,
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

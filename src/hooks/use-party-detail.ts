import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PartyService } from '@/services/party.service'
import { ChequeService } from '@/services/cheque.service'
import { ChequeStatus } from '@/types'
import { useMemo, useState } from 'react'

export function usePartyDetail(id: string, businessId: string | undefined) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'All' | ChequeStatus>('All')

  const { data: party, isLoading: partyLoading, error: partyError } = useQuery({
    queryKey: ['party', id],
    queryFn: () => PartyService.getById(id),
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

  const partyCheques = useMemo(() => {
    if (!cheques) return []
    return cheques.filter((c: any) => c.party_id === id)
  }, [cheques, id])

  const filteredCheques = useMemo(() => {
    return partyCheques.filter((c: any) => {
      const matchesSearch = c.cheque_number.includes(search) || c.amount.toString().includes(search)
      const matchesFilter = filter === 'All' || c.status === filter
      return matchesSearch && matchesFilter
    })
  }, [partyCheques, search, filter])

  const outstanding = useMemo(() => {
    return partyCheques
      .filter((c: any) => c.status !== 'Cleared' && c.status !== 'Bounced')
      .reduce((sum: number, c: any) => sum + c.amount, 0)
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
    setFilter
  }
}

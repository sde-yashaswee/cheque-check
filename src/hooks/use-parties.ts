import { useQuery } from '@tanstack/react-query'
import { PartyService } from '@/services/party.service'
import { ChequeService } from '@/services/cheque.service'
import { useState, useMemo, useCallback } from 'react'

export function useParties(businessId: string | undefined) {
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [sortBy, setSortBy] = useState<'name' | 'balance'>('name')

  const { data: parties, isLoading: partiesLoading, error: partiesError } = useQuery({
    queryKey: ['parties', businessId],
    queryFn: () => PartyService.getAll(businessId!),
    enabled: !!businessId,
  })

  const { data: cheques } = useQuery({
    queryKey: ['cheques', businessId],
    queryFn: () => ChequeService.getAll(businessId!),
    enabled: !!businessId,
  })

  const getBalance = useCallback((partyId: string) => {
    if (!cheques) return 0
    return (cheques as any[])
      .filter((c: any) => c.party_id === partyId && c.status !== 'Cleared' && c.status !== 'Bounced')
      .reduce((sum: number, c: any) => sum + c.amount, 0)
  }, [cheques])

  const filteredParties = useMemo(() => {
    if (!parties) return []
    const result = parties.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.contact.includes(search)
    )

    result.sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name)
      } else if (sortBy === 'balance') {
        const balA = getBalance(a.id)
        const balB = getBalance(b.id)
        return sortOrder === 'asc' ? balA - balB : balB - balA
      }
      return 0
    })

    return result
  }, [parties, search, sortOrder, sortBy, getBalance])

  return {
    parties,
    filteredParties,
    isLoading: partiesLoading,
    error: partiesError,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    sortBy,
    setSortBy,
    getBalance,
  }
}

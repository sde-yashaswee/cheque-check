import { useQuery } from '@tanstack/react-query'
import { partyService } from '@/features/parties/services/party.service'
import { chequeService } from '@/features/cheques/services/cheque.service'
import { useState, useMemo, useCallback } from 'react'
import type { Party } from '@/types'

export function useParties(businessId: string | undefined) {
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [sortBy, setSortBy] = useState<'name' | 'balance'>('name')

  const {
    data: parties,
    isLoading: partiesLoading,
    error: partiesError,
  } = useQuery<Party[]>({
    queryKey: ['parties', businessId],
    queryFn: () => partyService.getAll(businessId!),
    enabled: !!businessId,
  })

  const { data: cheques } = useQuery({
    queryKey: ['cheques', businessId],
    queryFn: () => chequeService.getAll(businessId!),
    enabled: !!businessId,
  })

  const getBalance = useCallback(
    (partyId: string) => {
      if (!cheques) return 0
      return (cheques as any[])
        .filter(
          (c: any) =>
            c.party_id === partyId &&
            c.status !== 'Cleared' &&
            c.status !== 'Bounced',
        )
        .reduce((sum: number, c: any) => sum + c.amount, 0)
    },
    [cheques],
  )

  const filteredParties = useMemo(() => {
    if (!parties) return []
    const result = parties.filter(
      (p: Party) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.contact.includes(search),
    )

    result.sort((a: Party, b: Party) => {
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

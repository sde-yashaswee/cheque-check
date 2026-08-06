import { useQuery } from '@tanstack/react-query'
import { AccountService } from '@/services/account.service'
import { useState, useMemo } from 'react'
import { AccountWithRelations } from '@/types'

export function useAccounts(businessId: string | undefined) {
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [bankFilter, setBankFilter] = useState<string | 'All'>('All')

  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['accounts', businessId],
    queryFn: () => AccountService.getAll(businessId!),
    enabled: !!businessId,
  })

  const filteredAccounts = useMemo(() => {
    if (!accounts) return []

    return accounts.filter(a => {
      const matchesSearch = a.account_name.toLowerCase().includes(search.toLowerCase()) ||
                           a.bank?.name?.toLowerCase().includes(search.toLowerCase()) ||
                           a.account_number.includes(search)
      const matchesBank = bankFilter === 'All' || a.bank_id === bankFilter
      return matchesSearch && matchesBank
    }).sort((a, b) => {
      const nameA = a.account_name.toLowerCase()
      const nameB = b.account_name.toLowerCase()
      if (sortOrder === 'asc') return nameA.localeCompare(nameB)
      return nameB.localeCompare(nameA)
    })
  }, [accounts, search, sortOrder, bankFilter])

  const uniqueBanks = useMemo(() => {
    if (!accounts) return []
    const banks = new Map()
    accounts.forEach(a => {
      if (a.bank) {
        banks.set(a.bank_id, a.bank.name)
      }
    })
    return Array.from(banks.entries()).map(([id, name]) => ({ id, name }))
  }, [accounts])

  return {
    accounts,
    filteredAccounts,
    uniqueBanks,
    isLoading,
    error,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    bankFilter,
    setBankFilter,
  }
}

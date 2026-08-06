import { useQuery } from '@tanstack/react-query'
import { AccountService } from '@/services/account.service'
import { useState, useMemo } from 'react'

export function useAccounts(businessId: string | undefined) {
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [sortBy, setSortBy] = useState<'account_name' | 'bank_name'>('account_name')
  const [bankFilter, setBankFilter] = useState<string | 'All'>('All')

  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['accounts', businessId],
    queryFn: () => AccountService.getAll(businessId!),
    enabled: !!businessId,
  })

  const filteredAccounts = useMemo(() => {
    if (!accounts) return []

    const result = accounts.filter(a => {
      const matchesSearch = a.account_name.toLowerCase().includes(search.toLowerCase()) ||
                           a.bank?.name?.toLowerCase().includes(search.toLowerCase()) ||
                           a.account_number.includes(search)
      const matchesBank = bankFilter === 'All' || a.bank_id === bankFilter
      return matchesSearch && matchesBank
    })

    result.sort((a, b) => {
      if (sortBy === 'account_name') {
        const nameA = a.account_name.toLowerCase()
        const nameB = b.account_name.toLowerCase()
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      } else if (sortBy === 'bank_name') {
        const nameA = (a.bank?.name || '').toLowerCase()
        const nameB = (b.bank?.name || '').toLowerCase()
        return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      }
      return 0
    })

    return result
  }, [accounts, search, sortOrder, sortBy, bankFilter])

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
    sortBy,
    setSortBy,
    bankFilter,
    setBankFilter,
  }
}

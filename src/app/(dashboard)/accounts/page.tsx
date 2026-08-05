'use client'

import { useQuery } from '@tanstack/react-query'
import { AccountService } from '@/services/account.service'
import { Plus, Building2, ChevronRight, Search, ArrowUpAz, ArrowDownAz, Landmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState } from 'react'
import { useBusiness } from '@/hooks/use-business'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'

export default function AccountsPage() {
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts', businessId],
    queryFn: () => AccountService.getAll(businessId!),
    enabled: !!businessId,
  })

  const filteredAccounts = accounts?.filter(a => 
    a.account_name.toLowerCase().includes(search.toLowerCase()) ||
    a.bank?.name.toLowerCase().includes(search.toLowerCase()) ||
    a.account_number.includes(search)
  ).sort((a, b) => {
    const nameA = a.account_name.toLowerCase()
    const nameB = b.account_name.toLowerCase()
    if (sortOrder === 'asc') return nameA.localeCompare(nameB)
    return nameB.localeCompare(nameA)
  })

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-24">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="rounded-pill pl-10 h-11 bg-canvas-parchment border-none shadow-sm" 
            placeholder="Search accounts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-11 w-11 shrink-0 bg-white shadow-sm border-none"
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? <ArrowUpAz className="h-5 w-5" /> : <ArrowDownAz className="h-5 w-5" />}
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))
        ) : filteredAccounts?.length === 0 ? (
          <div className="py-20 text-center bg-canvas-parchment/30 rounded-3xl border border-dashed">
            <Landmark className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <p className="mt-4 text-muted-foreground">No accounts found.</p>
            <Link href="/accounts/create" className="mt-4 inline-block">
              <Button variant="outline" className="rounded-pill">Add your first account</Button>
            </Link>
          </div>
        ) : (
          filteredAccounts?.map((account) => (
            <Link key={account.id} href={`/accounts/${account.id}`}>
              <div className="group relative rounded-3xl border bg-card p-6 transition-all active:scale-98 hover:shadow-md">
                <div className="flex items-start gap-4">
                  <EntityAvatar 
                    name={account.bank?.name || 'A'} 
                    color={account.color} 
                    icon={account.icon} 
                    size="lg" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold truncate">{account.bank?.name}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">{account.account_name}</p>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-dashed pt-4">
                      <p className="text-xs font-mono text-muted-foreground tracking-tighter">
                        {account.account_number.replace(/\d(?=\d{4})/g, "•")}
                      </p>
                      <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[9px] font-black text-primary uppercase tracking-widest">
                        {account.ifsc_code || 'No IFSC'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <Link href="/accounts/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full shadow-2xl z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <Plus className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  )
}

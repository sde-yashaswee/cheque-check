'use client'

import { Plus, ChevronRight, Search, ArrowUpAz, ArrowDownAz, Landmark, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useBusiness } from '@/hooks/use-business'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useAccounts } from '@/hooks/use-accounts'

export default function AccountsPage() {
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id

  const {
    filteredAccounts,
    uniqueBanks,
    isLoading,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    bankFilter,
    setBankFilter,
  } = useAccounts(businessId)

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-24">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="rounded-full pl-10 h-11 bg-canvas-parchment border-none" 
            placeholder="Search accounts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant={bankFilter !== 'All' ? 'default' : 'outline'} size="icon" className="rounded-full h-11 w-11 shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2 rounded-lg" align="end">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">Filter Bank</p>
              <button
                onClick={() => setBankFilter('All')}
                className={cn(
                  "flex items-center justify-between rounded-sm px-3 py-2.5 text-sm font-semibold transition-all",
                  bankFilter === 'All' ? "bg-primary text-white" : "hover:bg-muted"
                )}
              >
                All Banks
              </button>
              {uniqueBanks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => setBankFilter(bank.id)}
                  className={cn(
                    "flex items-center justify-between rounded-sm px-3 py-2.5 text-sm font-semibold transition-all",
                    bankFilter === bank.id ? "bg-primary text-white" : "hover:bg-muted"
                  )}
                >
                  <span className="truncate">{bank.name}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-11 w-11 shrink-0"
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? <ArrowUpAz className="h-5 w-5" /> : <ArrowDownAz className="h-5 w-5" />}
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))
        ) : filteredAccounts?.length === 0 ? (
          <div className="py-20 text-center bg-canvas-parchment/30 rounded-lg border border-dashed">
            <Landmark className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
            <p className="mt-4 text-muted-foreground text-body">No accounts found.</p>
            <Link href="/accounts/create" className="mt-4 inline-block">
              <Button variant="outline" className="rounded-full">Add your first account</Button>
            </Link>
          </div>
        ) : (
          filteredAccounts?.map((account) => (
            <Link key={account.id} href={`/accounts/${account.id}`}>
              <div className="group relative rounded-lg border bg-card p-6 transition-all active:scale-[0.98] border-primary/5">
                <div className="flex items-start gap-4">
                  <EntityAvatar 
                    name={account.bank?.name || 'A'} 
                    color={account.color} 
                    icon={account.icon} 
                    size="lg" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold truncate">{account.bank?.name}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{account.account_name}</p>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-dashed pt-4">
                      <p className="text-xs font-mono text-muted-foreground tracking-tighter">
                        {account.account_number.replace(/\d(?=\d{4})/g, "•")}
                      </p>
                      <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wider">
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
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <Plus className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  )
}


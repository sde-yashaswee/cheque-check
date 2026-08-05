'use client'

import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon as Plus, ArrowRight01Icon as ChevronRight, Search01Icon as Search, TextSquareIcon as ArrowUpAz, SortingZA01Icon as ArrowDownAz, BankIcon as Landmark, FilterIcon as Filter } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useBusiness } from '@/hooks/use-business'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useAccounts } from '@/hooks/use-accounts'
import { DataState } from '@/components/ui/data-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useTranslations } from 'next-intl'

export default function AccountsPage() {
  const t = useTranslations('Accounts')
  const tc = useTranslations('Common')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id

  const {
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
  } = useAccounts(businessId)

  const clearFilters = () => {
    setSearch('')
    setBankFilter('All')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-24">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <HugeiconsIcon icon={Search} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="rounded-full pl-10 h-11 bg-canvas-parchment border-none" 
            placeholder={t('searchPlaceholder')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Popover>
          <PopoverTrigger 
            nativeButton
            render={
              <Button variant={bankFilter !== 'All' ? 'default' : 'outline'} size="icon" className="rounded-full h-11 w-11 shrink-0">
                <HugeiconsIcon icon={Filter} className="h-4 w-4" />
              </Button>
            } 
          />
          <PopoverContent className="w-56 p-2 rounded-lg" align="end">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">{t('filterBank')}</p>
              <button
                onClick={() => setBankFilter('All')}
                className={cn(
                  "flex items-center justify-between rounded-sm px-3 py-2.5 text-sm font-semibold transition-all",
                  bankFilter === 'All' ? "bg-primary text-white" : "hover:bg-muted"
                )}
              >
                {tc('allBanks')}
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
          {sortOrder === 'asc' ? <HugeiconsIcon icon={ArrowUpAz} className="h-5 w-5" /> : <HugeiconsIcon icon={ArrowDownAz} className="h-5 w-5" />}
        </Button>
      </div>

      <div className="grid gap-4">
        <DataState
          isLoading={isLoading}
          isError={!!error}
          data={filteredAccounts}
          allData={accounts}
          onClearFilters={clearFilters}
          loadingComponent={
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-lg" />
              ))}
            </div>
          }
          emptyState={
            <EmptyState
              icon={Landmark}
              title={t('noAccountsTitle')}
              description={t('noAccountsDesc')}
              action={{
                label: t('addFirstAccount'),
                href: "/accounts/create"
              }}
            />
          }
        >
          {filteredAccounts?.map((account) => (
            <Link key={account.id} href={`/accounts/${account.id}`}>
              <div className="group relative rounded-lg border bg-card p-6 transition-all active:scale-[0.98] border-primary/5">
                <div className="flex items-start gap-4">
                  <EntityAvatar 
                    name={account.bank?.name || 'A'} 
                    color={account.color} 
                    icon={account.icon} 
                    imageUrl={account.bank?.logo_url}
                    size="lg" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-semibold truncate">{account.bank?.name}</p>
                      <HugeiconsIcon icon={ChevronRight} className="h-4 w-4 text-muted-foreground opacity-40 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{account.account_name}</p>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-dashed pt-4">
                      <p className="text-xs font-mono text-muted-foreground tracking-tighter">
                        {account.account_number.replace(/\d(?=\d{4})/g, "•")}
                      </p>
                      <span className="rounded-full bg-primary/5 px-2 py-0.5 text-[9px] font-semibold text-primary uppercase tracking-wider">
                        {account.ifsc_code || tc('noIfsc')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </DataState>
      </div>

      <Link href="/accounts/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <HugeiconsIcon icon={Plus} className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  )
}


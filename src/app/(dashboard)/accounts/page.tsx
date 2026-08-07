'use client'

import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon as Plus, ArrowRight01Icon as ChevronRight, Search01Icon as Search, BankIcon as Landmark, Sorting05Icon as Filter, Tick02Icon as Check, UserIcon as User, SortingAZ01Icon as AscIcon, SortingZA01Icon as DescIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useBusiness } from '@/hooks/use-business'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { cn } from '@/lib/utils'
import { useAccounts } from '@/hooks/use-accounts'
import { DataState } from '@/components/ui/data-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useTranslations } from 'next-intl'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
    sortBy,
    setSortBy,
    bankFilter,
    setBankFilter,
  } = useAccounts(businessId)

  const clearFilters = () => {
    setSearch('')
    setBankFilter('All')
  }

  const sortOptions = [
    { label: t('sortByAccountName'), value: 'account_name', icon: User },
    { label: t('sortByBankName'), value: 'bank_name', icon: Landmark },
  ]

  const orderOptions = [
    { label: tc('ascending'), value: 'asc', icon: AscIcon },
    { label: tc('descending'), value: 'desc', icon: DescIcon },
  ]

  return (
    <div className="max-w-2xl space-y-8 pb-24">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <HugeiconsIcon icon={Search} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          <Input leftIcon={Search}  
            className="rounded-full  h-11 bg-canvas-parchment border-none"
            placeholder={t('searchPlaceholder')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Sheet>
          <SheetTrigger render={
            <Button 
              variant={bankFilter !== 'All' ? 'default' : 'outline'} 
              size="icon"
              className="rounded-full h-11 w-11 shrink-0 bg-white"
            >
              <HugeiconsIcon icon={Filter} className="h-5 w-5"/>
            </Button>
          } />
          <SheetContent className="max-h-[80dvh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Filter} className="h-5 w-5 text-primary" />
                {tc('sortAndFilter')}
              </SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tc('sortBy')}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-[0.98]",
                        sortBy === option.value 
                          ? "bg-primary/5 border-primary text-primary" 
                          : "bg-muted/30 border-transparent text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <HugeiconsIcon icon={option.icon} className="h-4 w-4"/>
                        <span className="font-bold text-sm">{option.label}</span>
                      </div>
                      {sortBy === option.value && <HugeiconsIcon icon={Check} className="h-4 w-4 stroke-[3]"/>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tc('order')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {orderOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortOrder(option.value as any)}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all active:scale-[0.98]",
                        sortOrder === option.value 
                          ? "bg-primary/5 border-primary text-primary" 
                          : "bg-muted/30 border-transparent text-foreground"
                      )}
                    >
                      <HugeiconsIcon icon={option.icon} className="h-4 w-4"/>
                      <span className="font-bold text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('filterBank')}</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setBankFilter('All')}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-[0.98]",
                      bankFilter === 'All' 
                        ? "bg-primary/5 border-primary text-primary" 
                        : "bg-muted/30 border-transparent text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <HugeiconsIcon icon={Landmark} className="h-4 w-4"/>
                      <span className="font-bold text-sm">{tc('allBanks')}</span>
                    </div>
                    {bankFilter === 'All' && <HugeiconsIcon icon={Check} className="h-4 w-4 stroke-[3]"/>}
                  </button>
                  {uniqueBanks.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => setBankFilter(bank.id)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-[0.98]",
                        bankFilter === bank.id 
                          ? "bg-primary/5 border-primary text-primary" 
                          : "bg-muted/30 border-transparent text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <HugeiconsIcon icon={Landmark} className="h-4 w-4 opacity-50"/>
                        <span className="font-bold text-sm truncate">{bank.name}</span>
                      </div>
                      {bankFilter === bank.id && <HugeiconsIcon icon={Check} className="h-4 w-4 stroke-[3]"/>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
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
                <Skeleton key={i} className="h-28 w-full rounded-lg"/>
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
                href:"/accounts/create"
              }}
            />
          }
        >
          {filteredAccounts?.map((account) => (
            <Link key={account.id} href={`/accounts/${account.id}`}>
              <div className="group relative rounded-xl border bg-card p-5 transition-all active:scale-95 border-zinc-200 dark:border-zinc-800">
                <div className="flex items-start gap-4">
                  <EntityAvatar 
                    name={account.bank?.name || 'Bank'} 
                    color={account.color} 
                    icon={account.icon} 
                    imageUrl={account.bank?.logo_url}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold truncate">{account.account_name}</p>
                      <HugeiconsIcon icon={ChevronRight} className="h-4 w-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform"/>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{account.bank?.name}</p>
                    
                    <div className="mt-4 flex items-center justify-between border-t border-dashed border-zinc-100 dark:border-zinc-800 pt-4">
                      <p className="text-xs font-mono text-muted-foreground tracking-tighter">
                        {account.account_number.replace(/\d(?=\d{4})/g,"•")}
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
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900"size="icon">
          <HugeiconsIcon icon={Plus} className="h-8 w-8"/>
        </Button>
      </Link>
    </div>
  )
}


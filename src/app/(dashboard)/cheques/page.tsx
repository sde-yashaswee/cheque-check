'use client'

import { useCheques } from '@/hooks/use-cheques'
import { ChequeCard } from '@/components/cheque-card'
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon as Plus, Search01Icon as Search, Sorting05Icon as Filter, Invoice01Icon as ReceiptText, Tick02Icon as Check, Calendar03Icon as DateIcon, Money03Icon as AmountIcon, SortingAZ01Icon as AscIcon, SortingZA01Icon as DescIcon, CircleIcon as AllIcon, ArrowUpRight01Icon as IssuedIcon, ArrowDownLeft01Icon as ReceivedIcon, CheckmarkCircle01Icon as ClearedIcon, Cancel01Icon as BouncedIcon } from '@hugeicons/core-free-icons';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useBusiness } from '@/hooks/use-business'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { DataState } from '@/components/ui/data-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useTranslations } from 'next-intl'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { ChequeWithRelations } from '@/types'

export default function ChequesPage() {
  const t = useTranslations('Cheques')
  const tCommon = useTranslations('Common')
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id

  const {
    cheques,
    filteredCheques,
    isLoading,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    updateStatus,
  } = useCheques(businessId)

  const clearFilters = () => {
    setSearch('')
    setFilter('All')
    setSortBy('date')
    setSortOrder('desc')
  }

  const statusOptions = [
    { label: 'All', value: 'All', icon: AllIcon },
    { label: 'Issued', value: 'Issued', icon: IssuedIcon },
    { label: 'Received', value: 'Received', icon: ReceivedIcon },
    { label: 'Cleared', value: 'Cleared', icon: ClearedIcon },
    { label: 'Bounced', value: 'Bounced', icon: BouncedIcon },
  ] as const

  const sortOptions = [
    { label: t('sortDate'), value: 'date', icon: DateIcon },
    { label: t('sortAmount'), value: 'amount', icon: AmountIcon },
  ]

  const orderOptions = [
    { label: tCommon('ascending'), value: 'asc', icon: AscIcon },
    { label: tCommon('descending'), value: 'desc', icon: DescIcon },
  ]

  return (
    <div className="max-w-2xl space-y-8 pb-24">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <HugeiconsIcon icon={Search} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
          <Input 
            className="rounded-full pl-10 h-11 bg-canvas-parchment border-none"
            placeholder={t('searchPlaceholder')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Sheet>
          <SheetTrigger render={
            <Button 
              variant={(filter !== 'All' || sortBy !== 'date' || sortOrder !== 'desc') ? 'default' : 'outline'} 
              size="icon"
              className="rounded-full h-11 w-11 shrink-0 bg-white"
            >
              <HugeiconsIcon icon={Filter} className="h-5 w-5"/>
            </Button>
          } />
          <SheetContent className="max-h-[85dvh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{tCommon('sortAndFilter')}</SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tCommon('sortBy')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all active:scale-[0.98]",
                        sortBy === option.value 
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
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tCommon('order')}</h3>
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
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('filterStatus')}</h3>
                <div className="grid grid-cols-1 gap-2">
                  {statusOptions.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setFilter(s.value as any)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-xl border transition-all active:scale-[0.98]",
                        filter === s.value 
                          ? "bg-primary/5 border-primary text-primary" 
                          : "bg-muted/30 border-transparent text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <HugeiconsIcon icon={s.icon} className="h-4 w-4"/>
                        <span className="font-bold text-sm">{tCommon(s.value.toLowerCase() as any)}</span>
                      </div>
                      {filter === s.value && <HugeiconsIcon icon={Check} className="h-4 w-4 stroke-[3]"/>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        <DataState
          isLoading={isLoading}
          isError={!!error}
          data={filteredCheques}
          allData={cheques}
          onClearFilters={clearFilters}
          loadingComponent={
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg"/>
              ))}
            </div>
          }
          emptyState={
            <EmptyState
              icon={ReceiptText}
              title={t('noChequesTitle')}
              description={t('noChequesDesc')}
              action={{
                label: t('recordFirst'),
                href: "/cheques/create"
              }}
            />
          }
        >
          {filteredCheques?.map((cheque: ChequeWithRelations) => (
            <ChequeCard 
              key={cheque.id} 
              cheque={cheque} 
              onStatusUpdate={updateStatus}
            />
          ))}
        </DataState>
      </div>

      <Link href="/cheques/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900"size="icon">
          <HugeiconsIcon icon={Plus} className="h-8 w-8"/>
        </Button>
      </Link>
    </div>
  )
}


'use client'

import { useCheques } from '@/hooks/use-cheques'
import { ChequeCard } from '@/components/cheque-card'
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon as Plus, Search01Icon as Search, FilterIcon as Filter, Invoice01Icon as ReceiptText } from '@hugeicons/core-free-icons';
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useBusiness } from '@/hooks/use-business'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusPill } from '@/components/ui/status-pill'
import { cn } from '@/lib/utils'
import { DataState } from '@/components/ui/data-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useTranslations } from 'next-intl'

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
    updateStatus,
  } = useCheques(businessId)

  const clearFilters = () => {
    setSearch('')
    setFilter('All')
  }

  const statusOptions = ['All', 'Issued', 'Received', 'Cleared', 'Bounced'] as const

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
              <Button variant={filter !== 'All' ? 'default' : 'outline'} size="icon" className="rounded-full h-11 w-11 shrink-0">
                <HugeiconsIcon icon={Filter} className="h-4 w-4" />
              </Button>
            } 
          />
          <PopoverContent className="w-56 p-2 rounded-lg" align="end">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">{t('filterStatus')}</p>
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    "flex items-center justify-between rounded-sm px-3 py-2.5 text-sm font-semibold transition-all active:scale-95",
                    filter === s ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {tCommon(s.toLowerCase() as any)}
                  {filter === s ? (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  ) : (
                    <StatusPill status={s as any} className="scale-75 origin-right opacity-50" />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
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
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
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
          {filteredCheques?.map((cheque: any) => (
            <ChequeCard 
              key={cheque.id} 
              cheque={cheque} 
              onStatusUpdate={updateStatus}
            />
          ))}
        </DataState>
      </div>

      <Link href="/cheques/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <HugeiconsIcon icon={Plus} className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  )
}


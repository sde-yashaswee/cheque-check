'use client'

import { useAccountDetail } from '@/hooks/use-account-detail'
import { ChequeCard } from '@/components/cheque-card'
import { useParams } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { HugeiconsIcon } from '@hugeicons/react';
import { HashtagIcon as Hash, PencilEdit01Icon as Pencil, File02Icon as FileText, Search01Icon as Search, FilterIcon as Filter, Invoice01Icon as ReceiptText } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { StatusPill } from '@/components/ui/status-pill'
import { cn } from '@/lib/utils'
import { DataState } from '@/components/ui/data-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useTranslations } from 'next-intl'

export default function AccountDetailPage() {
  const t = useTranslations('Accounts')
  const tc = useTranslations('Common')
  const { id } = useParams() as { id: string }
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id

  const {
    account,
    accountCheques,
    filteredCheques,
    isLoading,
    updateChequeStatus,
    search,
    setSearch,
    filter,
    setFilter
  } = useAccountDetail(id, businessId)

  const clearFilters = () => {
    setSearch('')
    setFilter('All')
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-40 w-full rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!account) return <div className="text-center py-20 text-muted-foreground">{t('notFound')}</div>

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="rounded-lg border bg-card p-6 space-y-6 relative overflow-hidden border-primary/5">
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-4">
            <EntityAvatar 
              name={account.bank?.name || 'A'} 
              color={account.color} 
              icon={account.icon} 
              imageUrl={account.bank?.logo_url}
              size="lg" 
            />
            <div>
              <h2 className="text-2xl font-semibold">{account.bank?.name}</h2>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{account.account_name}</p>
            </div>
          </div>
          <Link href={`/accounts/${id}/edit`}>
            <Button variant="ghost" size="icon" className="rounded-full bg-canvas-parchment/50">
              <HugeiconsIcon icon={Pencil} className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('accountNumber')}</p>
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={Hash} className="h-3 w-3 text-primary" />
              <p className="font-mono font-semibold">{account.account_number}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t('ifscCode')}</p>
            <p className="font-mono font-semibold uppercase">{account.ifsc_code || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <HugeiconsIcon icon={FileText} className="h-3 w-3 text-muted-foreground opacity-80" />
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tc('chequeHistory')}</h3>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <HugeiconsIcon icon={Search} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              className="rounded-full pl-10 h-11 bg-canvas-parchment border-none" 
              placeholder={t('searchChequesPlaceholder')} 
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
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">{tc('filterStatus')}</p>
                {['All', 'Issued', 'Received', 'Cleared', 'Bounced'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s as any)}
                    className={cn(
                      "flex items-center justify-between rounded-sm px-3 py-2.5 text-sm font-semibold transition-all active:scale-95",
                      filter === s ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {tc(s.toLowerCase() as any)}
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

        <DataState
          isLoading={false}
          data={filteredCheques}
          allData={accountCheques}
          onClearFilters={clearFilters}
          loadingComponent={
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          }
          emptyState={
            <EmptyState
              icon={ReceiptText}
              title={tc('noData')}
              description={t('noChequesDesc')}
              action={{
                label: tc('recordNewCheque'),
                href: "/cheques/create"
              }}
            />
          }
        >
          <div className="space-y-4">
            {filteredCheques?.map((cheque: any) => (
              <ChequeCard 
                key={cheque.id} 
                cheque={cheque} 
                onStatusUpdate={updateChequeStatus}
              />
            ))}
          </div>
        </DataState>
      </div>
    </div>
  )
}


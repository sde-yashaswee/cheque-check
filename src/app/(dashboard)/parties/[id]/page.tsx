'use client'

import { usePartyDetail } from '@/hooks/use-party-detail'
import { ChequeCard } from '@/components/cheque-card'
import { useParams } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { useProfile } from '@/hooks/use-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { HugeiconsIcon } from '@hugeicons/react';
import { CallIcon as Phone, Mail01Icon as Mail, PencilEdit01Icon as Pencil, File02Icon as FileText, Search01Icon as Search, FilterIcon as Filter, Invoice01Icon as ReceiptText } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { StatusPill } from '@/components/ui/status-pill'
import { cn } from '@/lib/utils'
import { DataState } from '@/components/ui/data-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useTranslations } from 'next-intl'
import { ChequeWithRelations } from '@/types'

export default function PartyDetailPage() {
  const t = useTranslations('Parties')
  const tCommon = useTranslations('Common')
  const { id } = useParams() as { id: string }
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const businessId = activeBusiness?.id
  const currency = profile?.currency || '₹'

  const {
    party,
    partyCheques,
    filteredCheques,
    outstanding,
    isLoading,
    updateChequeStatus,
    search,
    setSearch,
    filter,
    setFilter
  } = usePartyDetail(id, businessId)

  const clearFilters = () => {
    setSearch('')
    setFilter('All')
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-40 w-full rounded-lg"/>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg"/>
          ))}
        </div>
      </div>
    )
  }

  if (!party) return <div className="text-center py-20 text-muted-foreground">{t('notFound')}</div>

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="rounded-lg border bg-card p-6 space-y-6 relative overflow-hidden border-primary/5">
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-4">
            <EntityAvatar 
              name={party.name} 
              color={party.color} 
              icon={party.icon} 
              imageUrl={party.avatar_url}
              size="lg"
            />
            <div>
              <h2 className="text-2xl font-semibold">{party.name}</h2>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{party.contact}</p>
            </div>
          </div>
          <Link href={`/parties/${id}/edit`}>
            <Button variant="ghost"size="icon"className="rounded-full bg-canvas-parchment/50">
              <HugeiconsIcon icon={Pencil} className="h-4 w-4"/>
            </Button>
          </Link>
        </div>

        <div className="flex gap-3 relative z-10">
          <a href={`tel:${party.contact}`} className="flex-1">
            <Button className="w-full rounded-sm h-12"variant="outline">
              <HugeiconsIcon icon={Phone} className="mr-2 h-4 w-4"/> {tCommon('contact')}
            </Button>
          </a>
          {party.email && (
            <a href={`mailto:${party.email}`} className="flex-1">
              <Button className="w-full rounded-sm h-12"variant="outline">
                <HugeiconsIcon icon={Mail} className="mr-2 h-4 w-4"/> {tCommon('email')}
              </Button>
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="rounded-sm bg-primary/5 p-4 border border-primary/10">
            <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">{tCommon('outstanding')}</p>
            <p className="mt-2 text-2xl font-semibold">{currency}{outstanding.toLocaleString()}</p>
          </div>
          <div className="rounded-sm bg-canvas-parchment p-4 border border-border/50">
            <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">{tCommon('totalCheques')}</p>
            <p className="mt-2 text-2xl font-semibold">{partyCheques.length}</p>
          </div>
        </div>
        
        {party.address && (
          <div className="pt-2 relative z-10">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{tCommon('address')}</p>
            <p className="text-sm font-semibold">{party.address}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <HugeiconsIcon icon={FileText} className="h-3 w-3 text-muted-foreground opacity-80"/>
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{tCommon('chequeHistory')}</h3>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <HugeiconsIcon icon={Search} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
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
                <Button variant={filter !== 'All' ? 'default' : 'outline'} size="icon"className="rounded-full h-11 w-11 shrink-0">
                  <HugeiconsIcon icon={Filter} className="h-4 w-4"/>
                </Button>
              } 
            />
            <PopoverContent className="w-56 p-2 rounded-lg"align="end">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">{tCommon('filterStatus')}</p>
                {['All', 'Issued', 'Received', 'Cleared', 'Bounced'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilter(s as any)}
                    className={cn(
                      "flex items-center justify-between rounded-sm px-3 py-2.5 text-sm font-semibold transition-all active:scale-95",
                      filter === s ? "bg-primary text-white": "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {tCommon(s.toLowerCase() as any)}
                    {filter === s ? (
                      <div className="h-2 w-2 rounded-full bg-white"/>
                    ) : (
                      <StatusPill status={s as any} className="scale-75 origin-right opacity-50"/>
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
          allData={partyCheques}
          onClearFilters={clearFilters}
          loadingComponent={
            <div className="space-y-4">
              {[1, 2].map((i) => (
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
                label: t('recordNewCheque'),
                href: "/cheques/create"
              }}
            />
          }
        >
          <div className="space-y-4">
            {filteredCheques?.map((cheque: ChequeWithRelations) => (
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



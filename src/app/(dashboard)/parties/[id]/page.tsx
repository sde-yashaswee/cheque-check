'use client'

import { usePartyDetail } from '@/hooks/use-party-detail'
import { ChequeCard } from '@/components/cheque-card'
import { useParams } from 'next/navigation'
import { UserIcon as User, Mail01Icon as Mail, LockPasswordIcon as Lock, CallIcon as Phone, Calendar03Icon as Calendar, HashtagIcon as Hash, Note01Icon as Note, Building03Icon as Building, Wallet01Icon as Wallet, Search01Icon as Search, Location01Icon as Location, TextFontIcon as TextIcon, PencilEdit01Icon as Pencil, File02Icon as FileText, FilterIcon as Filter, Invoice01Icon as ReceiptText, Tick02Icon as Check, Calendar03Icon as DateIcon, Money03Icon as AmountIcon, SortingAZ01Icon as AscIcon, SortingZA01Icon as DescIcon, CircleIcon as AllIcon, ArrowUpRight01Icon as IssuedIcon, ArrowDownLeft01Icon as ReceivedIcon, CheckmarkCircle01Icon as ClearedIcon, Cancel01Icon as BouncedIcon } from '@hugeicons/core-free-icons';
import { useBusiness } from '@/hooks/use-business'
import { useProfile } from '@/hooks/use-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

import { StatusPill } from '@/components/ui/status-pill'
import { cn } from '@/lib/utils'
import { DataState } from '@/components/ui/data-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useTranslations } from 'next-intl'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ChequeWithRelations } from '@/types'

export default function PartyDetailPage() {
  const t = useTranslations('Parties')
  const tCommon = useTranslations('Common')
  const tc = tCommon;
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
    setFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder
  } = usePartyDetail(id, businessId)

  const clearFilters = () => {
    setSearch('')
    setFilter('All')
    setSortBy('date')
    setSortOrder('desc')
  }

  const sortOptions = [
    { label: tc('date') || tCommon('date'), value: 'date', icon: DateIcon },
    { label: tc('amount') || tCommon('amount'), value: 'amount', icon: AmountIcon }
  ]

  const orderOptions = [
    { label: tc('descending') || tCommon('descending'), value: 'desc', icon: DescIcon },
    { label: tc('ascending') || tCommon('ascending'), value: 'asc', icon: AscIcon }
  ]

  const statusOptions = [
    { label: tc('all') || tCommon('all'), value: 'All', icon: AllIcon },
    { label: tc('issued') || tCommon('issued'), value: 'Issued', icon: IssuedIcon },
    { label: tc('received') || tCommon('received'), value: 'Received', icon: ReceivedIcon },
    { label: tc('cleared') || tCommon('cleared'), value: 'Cleared', icon: ClearedIcon },
    { label: tc('bounced') || tCommon('bounced'), value: 'Bounced', icon: BouncedIcon },
  ]

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-8 pb-20">
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
    <div className="max-w-2xl space-y-8 pb-20">
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
            <Input leftIcon={Search}  
              className="rounded-full  h-11 bg-canvas-parchment border-none"
              placeholder={t('searchChequesPlaceholder')} 
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
                <SheetTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Filter} className="h-5 w-5 text-primary" />
                  {tCommon ? tCommon('sortAndFilter') : tc('sortAndFilter')}
                </SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tCommon ? tCommon('sortBy') : tc('sortBy')}</h3>
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
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tCommon ? tCommon('order') : tc('order')}</h3>
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
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tCommon ? tCommon('filterStatus') : tc('filterStatus')}</h3>
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
                          <span className="font-bold text-sm">{s.label}</span>
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



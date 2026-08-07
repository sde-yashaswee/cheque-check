'use client'

import { useParties } from '@/hooks/use-parties'
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon as Plus, Search01Icon as Search, UserIcon as User, ArrowRight01Icon as ChevronRight, Sorting05Icon as Filter, Tick02Icon as Check, TextSquareIcon as NameIcon, Money03Icon as BalanceIcon, SortingAZ01Icon as AscIcon, SortingZA01Icon as DescIcon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useBusiness } from '@/hooks/use-business'
import { useProfile } from '@/hooks/use-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { DataState } from '@/components/ui/data-state'
import { EmptyState } from '@/components/ui/empty-state'
import { TextTruncate } from '@/components/ui/text-truncate'
import { useTranslations } from 'next-intl';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function PartiesPage() {
  const t = useTranslations('Parties');
  const tCommon = useTranslations('Common');
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const businessId = activeBusiness?.id

  const currency = profile?.currency || '₹'

  const {
    parties,
    filteredParties,
    isLoading,
    error,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    sortBy,
    setSortBy,
    getBalance,
  } = useParties(businessId)

  const clearFilters = () => {
    setSearch('')
  }

  const sortOptions = [
    { label: t('sortByName'), value: 'name', icon: NameIcon },
    { label: t('sortByBalance'), value: 'balance', icon: BalanceIcon },
  ]

  const orderOptions = [
    { label: tCommon('ascending'), value: 'asc', icon: AscIcon },
    { label: tCommon('descending'), value: 'desc', icon: DescIcon },
  ]

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <div className="flex gap-3">
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
              variant="outline"
              size="icon"
              className="rounded-full h-11 w-11 shrink-0 bg-white"
            >
              <HugeiconsIcon icon={Filter} className="h-5 w-5"/>
            </Button>
          } />
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <HugeiconsIcon icon={Filter} className="h-5 w-5 text-primary" />
                {tCommon('sortAndFilter')}
              </SheetTitle>
            </SheetHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tCommon('sortBy')}</h3>
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
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        <DataState
          isLoading={isLoading}
          isError={!!error}
          data={filteredParties}
          allData={parties}
          onClearFilters={clearFilters}
          loadingComponent={
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg"/>
              ))}
            </div>
          }
          emptyState={
            <EmptyState
              icon={User}
              title={t('noPartiesTitle')}
              description={t('noPartiesDesc')}
              action={{
                label: t('addFirstParty'),
                href:"/parties/create"
              }}
            />
          }
        >
          {filteredParties?.map((party) => (
            <Link key={party.id} href={`/parties/${party.id}`} className="block">
              <div className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all active:scale-95 border-zinc-200 dark:border-zinc-800">
                <EntityAvatar 
                  name={party.name} 
                  color={party.color} 
                  icon={party.icon} 
                  imageUrl={party.avatar_url}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <TextTruncate text={party.name} maxLength={25} className="font-bold text-base" />
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate">{party.contact}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{tCommon('balance')}</p>
                  <p className="text-sm font-bold text-primary">{currency}{getBalance(party.id).toLocaleString()}</p>
                </div>
                <HugeiconsIcon icon={ChevronRight} className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform"/>
              </div>
            </Link>
          ))}
        </DataState>
      </div>

      <Link href="/parties/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900"size="icon">
          <HugeiconsIcon icon={Plus} className="h-8 w-8"/>
        </Button>
      </Link>
    </div>
  )
}


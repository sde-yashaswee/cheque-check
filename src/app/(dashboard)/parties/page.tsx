'use client'

import { useParties } from '@/hooks/use-parties'
import { HugeiconsIcon } from '@hugeicons/react';
import { PlusSignIcon as Plus, Search01Icon as Search, UserIcon as User, ArrowRight01Icon as ChevronRight, TextSquareIcon as ArrowUpAz, SortingZA01Icon as ArrowDownAz } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useBusiness } from '@/hooks/use-business'
import { useProfile } from '@/hooks/use-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { DataState } from '@/components/ui/data-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useTranslations } from 'next-intl';

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
    getBalance,
  } = useParties(businessId)

  const clearFilters = () => {
    setSearch('')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-20">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <HugeiconsIcon icon={Search} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="rounded-full pl-10 h-11 bg-canvas-parchment border-none" 
            placeholder={t('searchPlaceholder')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-11 w-11 shrink-0 bg-white"
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? <HugeiconsIcon icon={ArrowUpAz} className="h-5 w-5" /> : <HugeiconsIcon icon={ArrowDownAz} className="h-5 w-5" />}
        </Button>
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
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
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
                href: "/parties/create"
              }}
            />
          }
        >
          {filteredParties?.map((party) => (
            <Link key={party.id} href={`/parties/${party.id}`} className="block">
              <div className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all active:scale-[0.98] border-zinc-200 dark:border-zinc-800 shadow-sm">
                <EntityAvatar 
                  name={party.name} 
                  color={party.color} 
                  icon={party.icon} 
                  imageUrl={party.avatar_url}
                  size="md" 
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate">{party.name}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate">{party.contact}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{tCommon('balance')}</p>
                  <p className="text-sm font-bold text-primary">{currency}{getBalance(party.id).toLocaleString()}</p>
                </div>
                <HugeiconsIcon icon={ChevronRight} className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </DataState>
      </div>

      <Link href="/parties/create">
        <Button className="fixed bottom-20 right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900" size="icon">
          <HugeiconsIcon icon={Plus} className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  )
}


'use client'

import { useCheques } from '@/hooks/use-cheques'
import { ChequeCard } from '@/components/cheque-card'
import { ChequeFilterBar } from '@/features/cheques/components/cheque-filter-bar'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PlusSignIcon as Plus,
  Invoice01Icon as ReceiptText,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useBusiness } from '@/hooks/use-business'
import { Skeleton } from '@/components/ui/skeleton'
import { DataState } from '@/components/ui/data-state'
import { EmptyState } from '@/components/ui/empty-state'
import { useTranslations } from 'next-intl'
import { DraftsLink } from '@/features/drafts'

import { ChequeWithRelations } from '@/types'

export default function ChequesPage() {
  const t = useTranslations('Cheques')
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

  return (
    <div className="max-w-2xl space-y-8 pb-24">
      <ChequeFilterBar
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      <DraftsLink entity="cheque" />

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
                href: '/cheques/create',
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
        <Button
          className="fixed bottom-20 right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900"
          size="icon"
        >
          <HugeiconsIcon icon={Plus} className="h-8 w-8" />
        </Button>
      </Link>
    </div>
  )
}

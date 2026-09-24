import * as React from 'react'
import {
  Search01Icon as Search,
  Alert02Icon as ShieldAlert,
  Alert01Icon as AlertCircle,
} from '@hugeicons/core-free-icons'
import { EmptyState } from './empty-state'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface DataStateProps {
  isLoading?: boolean
  isError?: boolean
  isUnauthorized?: boolean
  data?: unknown[]
  allData?: unknown[]
  loadingComponent?: React.ReactNode
  emptyState?: React.ReactNode
  errorState?: React.ReactNode
  unauthorizedState?: React.ReactNode
  noResultsState?: React.ReactNode
  onClearFilters?: () => void
  children: React.ReactNode
}

export function DataState({
  isLoading,
  isError,
  isUnauthorized,
  data = [],
  allData = [],
  loadingComponent,
  emptyState,
  errorState,
  unauthorizedState,
  noResultsState,
  onClearFilters,
  children,
}: DataStateProps) {
  const router = useRouter()
  const t = useTranslations('Common')

  // 1. Loading State
  if (isLoading) {
    return <>{loadingComponent}</>
  }

  // 2. Unauthorized State
  if (isUnauthorized) {
    return (
      unauthorizedState || (
        <EmptyState
          icon={ShieldAlert}
          title={t('notAuthorized')}
          description={t('notAuthorizedDesc')}
          action={{
            label: t('backToDashboard'),
            onClick: () => router.push('/'),
          }}
        />
      )
    )
  }

  // 3. Error State
  if (isError) {
    return (
      errorState || (
        <EmptyState
          icon={AlertCircle}
          title={t('error')}
          description={t('loadDataError')}
          action={{
            label: t('reloadPage'),
            onClick: () => window.location.reload(),
          }}
        />
      )
    )
  }

  // 4. Empty State (No data at all)
  if (allData.length === 0) {
    return <>{emptyState}</>
  }

  // 5. No Results State (Filters applied)
  if (data.length === 0) {
    return (
      noResultsState || (
        <EmptyState
          icon={Search}
          title={t('noRecordsFound')}
          description={t('noResultsMatch')}
          action={
            onClearFilters
              ? {
                  label: t('clearAllFilters'),
                  onClick: onClearFilters,
                }
              : undefined
          }
        />
      )
    )
  }

  // 6. Success State
  return <>{children}</>
}

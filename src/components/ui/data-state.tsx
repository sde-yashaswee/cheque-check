import * as React from "react"
import { Search, ShieldAlert, AlertCircle } from "lucide-react"
import { EmptyState } from "./empty-state"
import { useRouter } from "next/navigation"

interface DataStateProps {
  isLoading?: boolean
  isError?: boolean
  isUnauthorized?: boolean
  data?: any[]
  allData?: any[]
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
          title="Not Authorized"
          description="You don't have permission to view this content. Please contact your administrator."
          action={{
            label: "Back to Dashboard",
            onClick: () => router.push("/"),
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
          title="Something went wrong"
          description="We couldn't load the data. Please try again later."
          action={{
            label: "Reload Page",
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
          title="No records found"
          description="No results match your current filters. Try adjusting your search or filters."
          action={
            onClearFilters
              ? {
                  label: "Clear all filters",
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

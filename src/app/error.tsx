'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { ErrorView } from '@/components/ui/error-view'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <ErrorView error={error} reset={reset} />
    </div>
  )
}

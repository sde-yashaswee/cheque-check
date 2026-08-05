'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { ErrorView } from '@/components/ui/error-view'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center p-4">
        <ErrorView 
          title="Critical Application Error" 
          description="The application encountered a critical error and could not continue."
          error={error} 
          reset={reset} 
        />
      </body>
    </html>
  )
}

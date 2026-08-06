'use client'

import { useEffect } from 'react'
import { ErrorView } from '@/components/ui/error-view'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Global error caught by error boundary', error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <ErrorView error={error} reset={reset} />
    </div>
  )
}

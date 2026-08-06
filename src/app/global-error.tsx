'use client'

import { useEffect } from 'react'
import { ErrorView } from '@/components/ui/error-view'
import { NextIntlClientProvider, useTranslations } from 'next-intl'
import { logger } from '@/lib/logger'

function GlobalErrorContent({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('Common')
  return (
    <ErrorView 
      title={t('criticalError')} 
      description={t('criticalErrorDesc')}
      error={error} 
      reset={reset} 
    />
  )
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.fatal('Critical global error caught', error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center p-4">
        {/* We use a minimal provider here because this is the absolute root error boundary */}
        <NextIntlClientProvider locale="en"messages={{}}>
          <GlobalErrorContent error={error} reset={reset} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

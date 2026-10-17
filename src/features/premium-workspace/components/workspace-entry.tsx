'use client'

import { useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import { PremiumGate } from '@/features/monetization/components/premium-gate'
import { PremiumWorkspace } from './workspace'

const entryFeatures = [
  'bulk-import',
  'cheque-templates',
  'bulk-actions',
  'saved-views',
  'party-statements',
  'consolidated-dashboard',
  'message-templates',
] as const

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    window.removeEventListener('hashchange', onChange)
    window.removeEventListener('popstate', onChange)
  }
}

function entryFeature() {
  const fragment = window.location.hash.slice(1)
  return entryFeatures.find((feature) => feature === fragment) ?? 'bulk-import'
}

export function WorkspaceEntry() {
  const t = useTranslations('PremiumWorkspace')
  const feature = useSyncExternalStore(
    subscribe,
    entryFeature,
    () => 'bulk-import' as const,
  )
  return (
    <section className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:p-6">
      <header className="space-y-2">
        <h1 id="premium-workspace-title" className="text-2xl font-semibold">
          {t('title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('description')}</p>
      </header>
      <PremiumGate feature={feature}>
        <PremiumWorkspace />
      </PremiumGate>
    </section>
  )
}

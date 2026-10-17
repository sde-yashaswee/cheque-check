'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { usePremiumAccess } from '../hooks/use-premium-access'
import type { PremiumFeature } from '../lib/premium-access'
import { toast } from '@/components/ui/toast'
import { verifyLifetimePremium } from '../services/premium-authorization'
import { useRouter } from 'next/navigation'

export function PremiumGate({
  feature,
  children,
  testId = 'premium-gate',
}: {
  feature: PremiumFeature
  children: ReactNode
  testId?: string
}) {
  const access = usePremiumAccess()
  const t = useTranslations('Premium')
  if (access.isLoading)
    return (
      <div role="status" className="rounded-lg bg-muted p-5 text-sm">
        {t('loading')}
      </div>
    )
  if (access.canUse(feature)) return children
  return (
    <div
      className="space-y-4 rounded-lg border bg-card p-5"
      data-testid={testId}
    >
      <h2 className="text-lg font-semibold">{t(`features.${feature}`)}</h2>
      <p
        role={access.state === 'error' ? 'alert' : undefined}
        className="text-sm leading-relaxed text-muted-foreground"
      >
        {t(`states.${access.state}`)}
      </p>
      {access.state === 'error' ? (
        <Button
          variant="outline"
          size="pill"
          onClick={() => void access.refresh()}
        >
          {t('retry')}
        </Button>
      ) : (
        <Link
          href="/features"
          className="inline-flex min-h-11 items-center text-sm text-primary"
        >
          {t('viewPlan')}
        </Link>
      )}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t('coreUnaffected')}
      </p>
    </div>
  )
}

export function usePremiumAction() {
  const access = usePremiumAccess()
  const t = useTranslations('Premium')
  const router = useRouter()
  function requireAccess(feature: PremiumFeature) {
    if (access.canUse(feature)) return true
    toast.add({
      title: t(`features.${feature}`),
      description: t(`states.${access.state}`),
      type: access.state === 'error' ? 'error' : 'info',
      actionProps: {
        children: t('viewPlan'),
        onClick: () => router.push('/features'),
      },
    })
    return false
  }
  async function verifyAccess(feature: PremiumFeature) {
    if (!requireAccess(feature)) return false
    try {
      if (await verifyLifetimePremium()) return true
      await access.refresh()
      toast.add({
        title: t(`features.${feature}`),
        description: t('states.expired'),
        type: 'info',
      })
    } catch (error) {
      toast.add({
        title: t(`features.${feature}`),
        description: error instanceof Error ? error.message : t('states.error'),
        type: 'error',
      })
    }
    return false
  }
  return {
    ...access,
    requireAccess,
    verifyAccess,
    accessRequiredMessage: t('states.free'),
  }
}

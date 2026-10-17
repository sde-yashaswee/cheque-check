'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useBusiness } from '@/features/businesses/hooks/use-business'
import { useProfile } from '@/features/cheques/hooks/use-profile'
import { PremiumGate } from '@/features/monetization/components/premium-gate'
import { premiumWorkspaceService } from '../service'
import { ImportPanel } from './import-panel'
import { TemplatesPanel } from './templates-panel'
import { FiltersPanel } from './filters-panel'
import { ReportsPanel } from './reports-panel'
import { MessagePanel } from './message-panel'
import { SelectField } from './controls'

export type RunAction = (action: () => Promise<unknown>) => Promise<void>
const tabs = [
  ['import', 'bulk-import'],
  ['templates', 'cheque-templates'],
  ['bulk', 'bulk-actions'],
  ['views', 'saved-views'],
  ['statements', 'party-statements'],
  ['consolidated', 'consolidated-dashboard'],
  ['messages', 'message-templates'],
] as const
type Tab = (typeof tabs)[number][0]
const anchors: Record<Tab, string> = {
  import: 'bulk-import',
  templates: 'cheque-templates',
  bulk: 'bulk-actions',
  views: 'saved-views',
  statements: 'party-statements',
  consolidated: 'consolidated-dashboard',
  messages: 'message-templates',
}

function BusinessWorkspace({
  businessId,
  businessName,
  businesses,
  currency,
}: {
  businessId: string
  businessName: string
  businesses: { id: string; name: string }[]
  currency: string
}) {
  const t = useTranslations('PremiumWorkspace')
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('import')
  const [initialPartyId, setInitialPartyId] = useState('')
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const [notice, setNotice] = useState<'success' | 'error' | null>(null)
  const context = useQuery({
    queryKey: ['premium-workspace', 'context', businessId],
    queryFn: () => premiumWorkspaceService.context(businessId),
  })
  const tools = useQuery({
    queryKey: ['premium-workspace', 'tools', businessId],
    queryFn: () => premiumWorkspaceService.tools(businessId),
  })
  useEffect(() => {
    const applyLocation = () => {
      const entry = Object.entries(anchors).find(
        ([, anchor]) => `#${anchor}` === window.location.hash,
      )
      if (entry) setTab(entry[0] as Tab)
      setInitialPartyId(
        new URLSearchParams(window.location.search).get('partyId') ?? '',
      )
    }
    applyLocation()
    window.addEventListener('hashchange', applyLocation)
    return () => window.removeEventListener('hashchange', applyLocation)
  }, [])
  const run: RunAction = async (action) => {
    if (lock.current) return
    lock.current = true
    setBusy(true)
    setNotice(null)
    try {
      await action()
      // Refresh existing individual cheque/party surfaces as well as this workspace.
      await queryClient.invalidateQueries()
      setNotice('success')
    } catch {
      setNotice('error')
      void queryClient.invalidateQueries({ queryKey: ['premium-workspace'] })
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  if (context.isPending || tools.isPending)
    return <p role="status">{t('loading')}</p>
  if (context.isError || tools.isError)
    return (
      <div role="alert" className="space-y-3">
        <p>{t('loadError')}</p>
        <Button
          onClick={() => {
            void context.refetch()
            void tools.refetch()
          }}
        >
          {t('retry')}
        </Button>
      </div>
    )
  const common = { businessId, context: context.data, run, busy }
  const selectedTab = tabs.find(([id]) => id === tab)!
  return (
    <div className="space-y-5">
      <nav
        aria-label={t('sections')}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
      >
        {tabs.map(([id]) => (
          <Button
            key={id}
            className="h-auto min-h-11 whitespace-normal px-2 py-2 text-center leading-snug"
            variant={tab === id ? 'default' : 'outline'}
            disabled={busy}
            aria-pressed={tab === id}
            onClick={() => {
              setTab(id)
              setNotice(null)
              window.history.replaceState(null, '', `#${anchors[id]}`)
            }}
          >
            {t(`tabs.${id}`)}
          </Button>
        ))}
      </nav>
      {notice && (
        <p
          role={notice === 'error' ? 'alert' : 'status'}
          className={
            notice === 'error' ? 'text-destructive' : 'text-muted-foreground'
          }
        >
          {t(notice === 'error' ? 'operationError' : 'operationSuccess')}
        </p>
      )}
      {busy && <p role="status">{t('working')}</p>}
      <div
        id={anchors[tab]}
        className="scroll-mt-6 rounded-lg border border-border p-4 sm:p-6"
      >
        <h2 className="mb-4 text-lg font-semibold">{t(`tabs.${tab}`)}</h2>
        <PremiumGate feature={selectedTab[1]}>
          {tab === 'import' && <ImportPanel {...common} />}
          {tab === 'templates' && (
            <TemplatesPanel
              {...common}
              tools={tools.data.filter((s) => s.kind === 'cheque-template')}
            />
          )}
          {(tab === 'bulk' || tab === 'views') && (
            <FiltersPanel
              key={tab}
              {...common}
              mode={tab}
              currency={currency}
              tools={tools.data.filter((s) => s.kind === 'saved-view')}
            />
          )}
          {(tab === 'statements' || tab === 'consolidated') && (
            <ReportsPanel
              key={tab}
              {...common}
              businessName={businessName}
              businesses={businesses}
              currency={currency}
              mode={tab === 'statements' ? 'statement' : 'consolidated'}
              initialPartyId={initialPartyId}
            />
          )}
          {tab === 'messages' && (
            <MessagePanel
              {...common}
              businessName={businessName}
              currency={currency}
              tools={tools.data.filter((s) => s.kind === 'message-template')}
            />
          )}
        </PremiumGate>
      </div>
    </div>
  )
}

export function PremiumWorkspace() {
  const t = useTranslations('PremiumWorkspace')
  const { activeBusiness, businesses, setActiveBusiness, isLoading } =
    useBusiness()
  const { profile } = useProfile()
  return (
    <section
      aria-labelledby="premium-workspace-title"
      className="w-full space-y-5 pb-24"
    >
      {isLoading ? (
        <p role="status">{t('loading')}</p>
      ) : !activeBusiness ? (
        <p>{t('noBusiness')}</p>
      ) : (
        <>
          <SelectField
            label={t('business')}
            value={activeBusiness.id}
            onChange={(e) => {
              const business = businesses.find((b) => b.id === e.target.value)
              if (business) setActiveBusiness(business)
            }}
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </SelectField>
          <BusinessWorkspace
            key={activeBusiness.id}
            businessId={activeBusiness.id}
            businessName={activeBusiness.name}
            businesses={businesses}
            currency={profile?.currency || '₹'}
          />
        </>
      )}
    </section>
  )
}

'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { summarizeCheques } from '../logic'
import { premiumWorkspaceService } from '../service'
import { downloadStatementPdf } from '../statement-pdf'
import type { WorkspaceContext, WorkspaceSnapshot } from '../types'
import { ChequeTable } from './cheque-table'
import { SelectField, TextField } from './controls'
import type { RunAction } from './workspace'

function Summary({
  snapshot,
  currency,
}: {
  snapshot: WorkspaceSnapshot
  currency: string
}) {
  const t = useTranslations('PremiumWorkspace')
  const locale = useLocale()
  const totals = summarizeCheques(snapshot.cheques)
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {(
        [
          'count',
          'inward',
          'outward',
          'pending',
          'cleared',
          'bounced',
          'netCleared',
        ] as const
      ).map((key) => (
        <div key={key} className="rounded-md border p-3">
          <dt className="text-xs text-muted-foreground">
            {t(`summary.${key}`)}
          </dt>
          <dd className="break-words text-lg font-semibold">
            {key === 'count'
              ? totals[key]
              : `${currency}${totals[key].toLocaleString(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function ReportsPanel({
  businessId,
  businessName,
  businesses,
  context,
  currency,
  mode,
  busy,
  run,
  initialPartyId,
}: {
  businessId: string
  businessName: string
  businesses: { id: string; name: string }[]
  context: WorkspaceContext
  currency: string
  mode: 'statement' | 'consolidated'
  busy: boolean
  run: RunAction
  initialPartyId?: string
}) {
  const t = useTranslations('PremiumWorkspace')
  const locale = useLocale()
  const [partyId, setPartyId] = useState(() =>
    context.parties.some((p) => p.id === initialPartyId) ? initialPartyId! : '',
  )
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [scope, setScope] = useState(businesses.map((b) => b.id))
  const [snapshot, setSnapshot] = useState<WorkspaceSnapshot | null>(null)
  const invalid = !!from && !!to && from > to
  const disabled =
    busy || invalid || (mode === 'statement' ? !partyId : !scope.length)
  const fetchSnapshot = () =>
    premiumWorkspaceService.snapshot(
      mode === 'statement' ? [businessId] : scope,
      mode === 'statement' ? partyId : undefined,
      from,
      to,
    )
  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t(mode === 'statement' ? 'statementHelp' : 'consolidatedHelp')}
      </p>
      {mode === 'statement' ? (
        <SelectField
          disabled={busy}
          label={t('fields.party_id')}
          value={partyId}
          onChange={(e) => {
            setPartyId(e.target.value)
            setSnapshot(null)
          }}
        >
          <option value="">{t('choose')}</option>
          {context.parties.map((p) => (
            <option value={p.id} key={p.id}>
              {p.name}
            </option>
          ))}
        </SelectField>
      ) : (
        <fieldset disabled={busy} className="space-y-2 rounded-md border p-3">
          <legend className="px-1 text-sm font-medium">
            {t('businessScope')}
          </legend>
          {businesses.map((b) => (
            <label key={b.id} className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                className="size-5 accent-primary"
                checked={scope.includes(b.id)}
                onChange={() => {
                  setScope((current) =>
                    current.includes(b.id)
                      ? current.filter((id) => id !== b.id)
                      : [...current, b.id],
                  )
                  setSnapshot(null)
                }}
              />
              {b.name}
            </label>
          ))}
        </fieldset>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          disabled={busy}
          label={t('from')}
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value)
            setSnapshot(null)
          }}
        />
        <TextField
          disabled={busy}
          label={t('to')}
          type="date"
          value={to}
          min={from}
          onChange={(e) => {
            setTo(e.target.value)
            setSnapshot(null)
          }}
        />
      </div>
      {invalid && (
        <p role="alert" className="text-destructive">
          {t('dateRangeError')}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          disabled={disabled}
          onClick={() =>
            void run(async () => setSnapshot(await fetchSnapshot()))
          }
        >
          {t('generate')}
        </Button>
        {mode === 'statement' && (
          <Button
            variant="outline"
            disabled={disabled}
            onClick={() =>
              void run(async () => {
                // Never export a cached report after entitlement expiry.
                const fresh = await fetchSnapshot()
                setSnapshot(fresh)
                await downloadStatementPdf({
                  business: businessName,
                  party:
                    context.parties.find((p) => p.id === partyId)?.name ?? '',
                  period: `${from || t('all')} — ${to || t('all')}`,
                  cheques: fresh.cheques,
                  currency,
                  locale,
                  labels: {
                    title: t('tabs.statements'),
                    business: t('business'),
                    party: t('fields.party_id'),
                    period: t('period'),
                    columns: [
                      'cheque_date',
                      'cheque_number',
                      'amount',
                      'type',
                      'status',
                    ]
                      .map((k) => t(`fields.${k}`))
                      .concat(t('runningBalance')),
                    totals: t('summary.count'),
                    inward: t('summary.inward'),
                    outward: t('summary.outward'),
                    pending: t('summary.pending'),
                    netCleared: t('summary.netCleared'),
                    page: t('page'),
                    statuses: Object.fromEntries(
                      ['Issued', 'Received', 'Cleared', 'Bounced'].map((s) => [
                        s,
                        t(`statuses.${s}`),
                      ]),
                    ),
                    types: {
                      Inward: t('types.Inward'),
                      Outward: t('types.Outward'),
                    },
                  },
                })
              })
            }
          >
            {t('exportPdf')}
          </Button>
        )}
      </div>
      {snapshot && (
        <>
          <Summary snapshot={snapshot} currency={currency} />
          <p className="text-xs text-muted-foreground">{t('balanceHelp')}</p>
          {mode === 'consolidated' && (
            <div className="space-y-3">
              {snapshot.businesses.map((b) => (
                <section key={b.id} className="space-y-2 rounded-md border p-3">
                  <h3 className="font-semibold">{b.name}</h3>
                  <Summary
                    snapshot={{
                      businesses: [b],
                      cheques: snapshot.cheques.filter(
                        (c) => c.business_id === b.id,
                      ),
                    }}
                    currency={currency}
                  />
                </section>
              ))}
            </div>
          )}
          <ChequeTable cheques={snapshot.cheques} currency={currency} />
        </>
      )}
    </section>
  )
}

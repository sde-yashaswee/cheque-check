'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { canBulkTransition, filterCheques } from '../logic'
import { premiumWorkspaceService } from '../service'
import type {
  ChequeFilters,
  ChequeRow,
  SavedTool,
  WorkspaceContext,
} from '../types'
import { ChequeTable } from './cheque-table'
import { SavedTools } from './saved-tools'
import { Confirmation, SelectField, TextField } from './controls'
import type { RunAction } from './workspace'

export function FiltersPanel({
  businessId,
  context,
  tools,
  run,
  busy,
  mode,
  currency,
}: {
  businessId: string
  context: WorkspaceContext
  tools: SavedTool[]
  run: RunAction
  busy: boolean
  mode: 'bulk' | 'views'
  currency: string
}) {
  const t = useTranslations('PremiumWorkspace')
  const [filters, setFilters] = useState<ChequeFilters>({})
  const [selected, setSelected] = useState<string[]>([])
  const [status, setStatus] =
    useState<NonNullable<ChequeRow['status']>>('Cleared')
  const [confirming, setConfirming] = useState(false)
  const updateFilters = (next: ChequeFilters) => {
    setFilters(next)
    setSelected([])
    setConfirming(false)
  }
  const visible = filterCheques(context.cheques, filters)
  const valid =
    selected.length > 0 &&
    selected.length <= 500 &&
    selected.every((id) => {
      const cheque = context.cheques.find((c) => c.id === id)
      return cheque && canBulkTransition(cheque, status)
    })
  const rangeInvalid =
    !!filters.from && !!filters.to && filters.from > filters.to
  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t(mode === 'bulk' ? 'bulkHelp' : 'viewsHelp')}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <TextField
          label={t('search')}
          value={filters.search ?? ''}
          onChange={(e) =>
            updateFilters({ ...filters, search: e.target.value })
          }
        />
        <SelectField
          label={t('fields.status')}
          value={filters.status ?? ''}
          onChange={(e) =>
            updateFilters({
              ...filters,
              status: (e.target.value || undefined) as ChequeFilters['status'],
            })
          }
        >
          <option value="">{t('all')}</option>
          {(['Issued', 'Received', 'Cleared', 'Bounced'] as const).map((s) => (
            <option key={s} value={s}>
              {t(`statuses.${s}`)}
            </option>
          ))}
        </SelectField>
        <SelectField
          label={t('fields.type')}
          value={filters.type ?? ''}
          onChange={(e) =>
            updateFilters({
              ...filters,
              type: (e.target.value || undefined) as ChequeFilters['type'],
            })
          }
        >
          <option value="">{t('all')}</option>
          <option value="Inward">{t('types.Inward')}</option>
          <option value="Outward">{t('types.Outward')}</option>
        </SelectField>
        <SelectField
          label={t('fields.party_id')}
          value={filters.party_id ?? ''}
          onChange={(e) =>
            updateFilters({ ...filters, party_id: e.target.value || undefined })
          }
        >
          <option value="">{t('all')}</option>
          {context.parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </SelectField>
        <TextField
          label={t('from')}
          type="date"
          value={filters.from ?? ''}
          onChange={(e) =>
            updateFilters({ ...filters, from: e.target.value || undefined })
          }
        />
        <TextField
          label={t('to')}
          type="date"
          min={filters.from}
          value={filters.to ?? ''}
          onChange={(e) =>
            updateFilters({ ...filters, to: e.target.value || undefined })
          }
        />
      </div>
      <Button variant="outline" onClick={() => updateFilters({})}>
        {t('reset')}
      </Button>
      {rangeInvalid && (
        <p role="alert" className="text-destructive">
          {t('dateRangeError')}
        </p>
      )}
      {mode === 'views' && (
        <SavedTools
          businessId={businessId}
          kind="saved-view"
          tools={tools}
          payload={Object.fromEntries(
            Object.entries(filters).filter(
              ([, v]) => v !== undefined && v !== '',
            ),
          )}
          onApply={(value) => updateFilters(value as ChequeFilters)}
          run={run}
          busy={busy}
          disabled={rangeInvalid}
        />
      )}
      {mode === 'bulk' && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <Button
              variant="outline"
              disabled={busy || !visible.length || visible.length > 500}
              onClick={() => {
                setSelected(visible.map((c) => c.id))
                setConfirming(false)
              }}
            >
              {t('selectAll')}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => {
                setSelected([])
                setConfirming(false)
              }}
            >
              {t('clearSelection')}
            </Button>
            <SelectField
              label={t('targetStatus')}
              value={status}
              disabled={busy}
              onChange={(e) => {
                setStatus(e.target.value as typeof status)
                setConfirming(false)
              }}
            >
              {(['Cleared', 'Bounced', 'Issued', 'Received'] as const).map(
                (s) => (
                  <option key={s} value={s}>
                    {t(`statuses.${s}`)}
                  </option>
                ),
              )}
            </SelectField>
          </div>
          <p role="status">{t('selectedCount', { count: selected.length })}</p>
          {selected.length > 0 && !valid && (
            <p className="text-destructive">{t('invalidTransition')}</p>
          )}
          {!confirming ? (
            <Button
              disabled={busy || !valid}
              onClick={() => setConfirming(true)}
            >
              {t('updateSelected')}
            </Button>
          ) : (
            <Confirmation
              message={t('confirmBulk', {
                count: selected.length,
                status: t(`statuses.${status}`),
              })}
              confirm={t('confirm')}
              cancel={t('cancel')}
              busy={busy}
              onCancel={() => setConfirming(false)}
              onConfirm={() =>
                void run(async () => {
                  await premiumWorkspaceService.bulkStatus(
                    businessId,
                    selected,
                    status,
                  )
                  setSelected([])
                  setConfirming(false)
                })
              }
            />
          )}
        </>
      )}
      <ChequeTable
        cheques={visible}
        currency={currency}
        selected={selected}
        onSelect={
          mode === 'bulk' && !busy
            ? (id) => {
                setSelected((current) =>
                  current.includes(id)
                    ? current.filter((x) => x !== id)
                    : [...current, id],
                )
                setConfirming(false)
              }
            : undefined
        }
      />
    </section>
  )
}

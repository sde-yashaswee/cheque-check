'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { safeChequePrefill, validateImport } from '../logic'
import { premiumWorkspaceService } from '../service'
import type { SavedTool, WorkspaceContext } from '../types'
import { SavedTools } from './saved-tools'
import {
  Confirmation,
  Field,
  SelectField,
  TextField,
  controlClass,
} from './controls'
import type { RunAction } from './workspace'

const empty = () => ({
  party_id: '',
  account_id: '',
  amount: '',
  type: 'Outward',
  notes: '',
  cheque_number: '',
  cheque_date: new Date().toISOString().slice(0, 10),
  deposit_date: '',
})

export function TemplatesPanel({
  businessId,
  context,
  tools,
  run,
  busy,
}: {
  businessId: string
  context: WorkspaceContext
  tools: SavedTool[]
  run: RunAction
  busy: boolean
}) {
  const t = useTranslations('PremiumWorkspace')
  const [form, setForm] = useState(empty)
  const [confirming, setConfirming] = useState(false)
  const prefill = safeChequePrefill(form)
  const validation = validateImport('cheques', [form], context)[0]
  const set = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    setConfirming(false)
  }
  const apply = (value: Record<string, unknown>) => {
    const safe = safeChequePrefill(value)
    setForm({
      ...empty(),
      ...safe,
      amount: safe.amount ? String(safe.amount) : '',
    })
    setConfirming(false)
  }
  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('templatesHelp')}</p>
      <SelectField
        label={t('prefillFromCheque')}
        value=""
        onChange={(event) => {
          const cheque = context.cheques.find(
            (c) => c.id === event.target.value,
          )
          if (cheque) apply(cheque)
        }}
      >
        <option value="">{t('choose')}</option>
        {context.cheques.map((c) => (
          <option value={c.id} key={c.id}>
            {c.cheque_number} · {c.amount}
          </option>
        ))}
      </SelectField>
      <SavedTools
        businessId={businessId}
        kind="cheque-template"
        tools={tools}
        payload={{ ...prefill }}
        onApply={(value) => apply(value as Record<string, unknown>)}
        run={run}
        busy={busy}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField
          label={t('fields.party_id')}
          value={form.party_id}
          onChange={(e) => set('party_id', e.target.value)}
        >
          <option value="">{t('choose')}</option>
          {context.parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </SelectField>
        <SelectField
          label={t('fields.account_id')}
          value={form.account_id}
          onChange={(e) => set('account_id', e.target.value)}
        >
          <option value="">{t('choose')}</option>
          {context.accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.account_name} · {a.account_number}
            </option>
          ))}
        </SelectField>
        <SelectField
          label={t('fields.type')}
          value={form.type}
          onChange={(e) => set('type', e.target.value)}
        >
          <option value="Outward">{t('types.Outward')}</option>
          <option value="Inward">{t('types.Inward')}</option>
        </SelectField>
        <TextField
          label={t('fields.amount')}
          inputMode="decimal"
          value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
        />
        <TextField
          label={t('fields.cheque_number')}
          inputMode="numeric"
          maxLength={6}
          value={form.cheque_number}
          onChange={(e) => set('cheque_number', e.target.value)}
        />
        <TextField
          label={t('fields.cheque_date')}
          type="date"
          value={form.cheque_date}
          onChange={(e) => set('cheque_date', e.target.value)}
        />
        <TextField
          label={t('fields.deposit_date')}
          type="date"
          value={form.deposit_date}
          min={form.cheque_date}
          onChange={(e) => set('deposit_date', e.target.value)}
        />
        <Field label={t('fields.notes')}>
          {(id) => (
            <textarea
              id={id}
              className={controlClass}
              maxLength={2000}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          )}
        </Field>
      </div>
      <p className="text-sm text-muted-foreground">{t('newNumberHelp')}</p>
      {form.cheque_number && validation.issues.length > 0 && (
        <ul className="text-sm text-destructive">
          {validation.issues.map((issue, i) => (
            <li key={i}>
              {t(`fields.${issue.field}`)}: {t(`issues.${issue.code}`)}
            </li>
          ))}
        </ul>
      )}
      {!confirming ? (
        <Button
          disabled={busy || validation.issues.length > 0}
          onClick={() => setConfirming(true)}
        >
          {t('createCheque')}
        </Button>
      ) : (
        <Confirmation
          message={t('confirmCreate')}
          confirm={t('confirm')}
          cancel={t('cancel')}
          busy={busy}
          onCancel={() => setConfirming(false)}
          onConfirm={() =>
            void run(async () => {
              await premiumWorkspaceService.importRows(businessId, 'cheques', [
                form,
              ])
              setForm(empty())
              setConfirming(false)
            })
          }
        />
      )}
    </section>
  )
}

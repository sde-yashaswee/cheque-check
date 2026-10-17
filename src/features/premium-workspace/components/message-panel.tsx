'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  isValidMessageTemplate,
  placeholders,
  renderMessageTemplate,
} from '../logic'
import type { SavedTool, WorkspaceContext } from '../types'
import { SavedTools } from './saved-tools'
import { Field, SelectField, controlClass } from './controls'
import type { RunAction } from './workspace'

export function MessagePanel({
  businessId,
  businessName,
  context,
  tools,
  run,
  busy,
  currency,
}: {
  businessId: string
  businessName: string
  context: WorkspaceContext
  tools: SavedTool[]
  run: RunAction
  busy: boolean
  currency: string
}) {
  const t = useTranslations('PremiumWorkspace')
  const [body, setBody] = useState(() => {
    const latest = tools[0]?.payload
    return latest &&
      typeof latest === 'object' &&
      !Array.isArray(latest) &&
      typeof latest.body === 'string'
      ? latest.body
      : t(
          'defaultMessage',
          Object.fromEntries(placeholders.map((key) => [key, `{${key}}`])),
        )
  })
  const [chequeId, setChequeId] = useState(context.cheques[0]?.id ?? '')
  const cheque = context.cheques.find((c) => c.id === chequeId)
  const party = context.parties.find((p) => p.id === cheque?.party_id)
  const valid = isValidMessageTemplate(body)
  const preview = valid
    ? renderMessageTemplate(body, {
        party: party?.name || t('sampleParty'),
        cheque_number: cheque?.cheque_number || '000001',
        amount: `${currency}${cheque?.amount ?? '1000'}`,
        date: cheque?.cheque_date || new Date().toISOString().slice(0, 10),
        status: t(`statuses.${cheque?.status ?? 'Issued'}`),
        business: businessName,
      })
    : ''
  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('messageHelp')}</p>
      <p className="break-words text-sm">
        {t('approvedPlaceholders')}:{' '}
        {placeholders.map((p) => `{${p}}`).join(', ')}
      </p>
      <Field label={t('messageBody')}>
        {(id) => (
          <textarea
            id={id}
            rows={6}
            maxLength={2000}
            className={controlClass}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        )}
      </Field>
      {!valid && (
        <p role="alert" className="text-destructive">
          {t('messageInvalid')}
        </p>
      )}
      <SelectField
        label={t('previewCheque')}
        value={chequeId}
        onChange={(e) => setChequeId(e.target.value)}
      >
        <option value="">{t('sampleData')}</option>
        {context.cheques.map((c) => (
          <option key={c.id} value={c.id}>
            {c.cheque_number}
          </option>
        ))}
      </SelectField>
      <h3 className="font-medium">{t('preview')}</h3>
      <pre className="whitespace-pre-wrap break-words rounded-md border bg-muted p-4 font-sans text-sm">
        {preview}
      </pre>
      <SavedTools
        businessId={businessId}
        kind="message-template"
        tools={tools}
        payload={{ body }}
        run={run}
        busy={busy}
        disabled={!valid}
        onApply={(value) => {
          if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            typeof value.body === 'string'
          )
            setBody(value.body)
        }}
      />
    </section>
  )
}

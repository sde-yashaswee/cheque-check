'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { downloadImportSample, readImportFile } from '../import-file'
import { importColumns, validateImport } from '../logic'
import { premiumWorkspaceService } from '../service'
import type { ImportKind, ImportRow, WorkspaceContext } from '../types'
import { Confirmation, Field, SelectField, controlClass } from './controls'
import type { RunAction } from './workspace'

export function ImportPanel({
  businessId,
  context,
  run,
  busy,
}: {
  businessId: string
  context: WorkspaceContext
  run: RunAction
  busy: boolean
}) {
  const t = useTranslations('PremiumWorkspace')
  const [kind, setKind] = useState<ImportKind>('parties')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [fileError, setFileError] = useState(false)
  const [reading, setReading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const preview = validateImport(kind, rows, context)
  const invalid = preview.filter((r) => r.issues.length).length
  return (
    <section className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('importHelp')}</p>
      <SelectField
        label={t('importKind')}
        value={kind}
        disabled={busy || reading}
        onChange={(event) => {
          setKind(event.target.value as ImportKind)
          setRows([])
          setConfirming(false)
        }}
      >
        <option value="parties">{t('parties')}</option>
        <option value="cheques">{t('cheques')}</option>
      </SelectField>
      <Button variant="outline" onClick={() => downloadImportSample(kind)}>
        {t('downloadSample')}
      </Button>
      <p className="break-words text-sm">
        {t('columns')}: <code>{importColumns(kind).join(', ')}</code>
      </p>
      <Field label={t('file')}>
        {(id) => (
          <input
            id={id}
            type="file"
            className={controlClass}
            accept=".csv,.xls,.xlsx"
            disabled={busy || reading}
            onChange={async (event) => {
              const file = event.target.files?.[0]
              setConfirming(false)
              setRows([])
              setFileError(false)
              if (!file) return
              setReading(true)
              try {
                setRows(await readImportFile(file))
              } catch {
                setFileError(true)
              } finally {
                setReading(false)
              }
            }}
          />
        )}
      </Field>
      {reading && <p role="status">{t('loading')}</p>}
      {fileError && (
        <p role="alert" className="text-destructive">
          {t('fileError')}
        </p>
      )}
      {kind === 'cheques' && (
        <details className="rounded-md border p-3">
          <summary className="cursor-pointer font-medium">
            {t('referenceIds')}
          </summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <h3 className="font-medium">{t('parties')}</h3>
              {context.parties.map((p) => (
                <p className="break-all text-sm" key={p.id}>
                  {p.name}: <code>{p.id}</code>
                </p>
              ))}
            </div>
            <div>
              <h3 className="font-medium">{t('accounts')}</h3>
              {context.accounts.map((a) => (
                <p className="break-all text-sm" key={a.id}>
                  {a.account_name} ({a.account_number}): <code>{a.id}</code>
                </p>
              ))}
            </div>
          </div>
        </details>
      )}
      {rows.length > 0 && (
        <>
          <p role="status">
            {t('previewCount', { count: rows.length, invalid })}
          </p>
          <div className="max-h-96 overflow-auto rounded-md border">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">{t('preview')}</caption>
              <thead>
                <tr>
                  <th className="p-2">{t('row')}</th>
                  <th className="p-2">{t('preview')}</th>
                  <th className="p-2">{t('validation')}</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((row) => (
                  <tr key={row.row} className="border-t align-top">
                    <td className="p-2">{row.row}</td>
                    <td className="max-w-72 break-words p-2">
                      {Object.entries(row.data).map(([key, value]) => (
                        <div key={key}>
                          <code>{key}</code>: {String(value)}
                        </div>
                      ))}
                    </td>
                    <td className="p-2">
                      {row.issues.length
                        ? row.issues.map((issue, i) => (
                            <p key={i} className="text-destructive">
                              <code>{issue.field}</code>:{' '}
                              {t(`issues.${issue.code}`)}
                            </p>
                          ))
                        : t('valid')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!confirming ? (
            <Button
              disabled={busy || invalid > 0}
              onClick={() => setConfirming(true)}
            >
              {t('commitImport')}
            </Button>
          ) : (
            <Confirmation
              message={t('confirmImport', { count: rows.length })}
              confirm={t('confirm')}
              cancel={t('cancel')}
              busy={busy}
              onCancel={() => setConfirming(false)}
              onConfirm={() =>
                void run(async () => {
                  await premiumWorkspaceService.importRows(
                    businessId,
                    kind,
                    preview.map((r) => r.data),
                  )
                  setRows([])
                  setConfirming(false)
                })
              }
            />
          )}
        </>
      )}
    </section>
  )
}

'use client'

import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import type { ChequeRow } from '../types'

export function ChequeTable({
  cheques,
  selected,
  onSelect,
  currency,
}: {
  cheques: ChequeRow[]
  selected?: string[]
  onSelect?: (id: string) => void
  currency: string
}) {
  const t = useTranslations('PremiumWorkspace')
  const locale = useLocale()
  if (!cheques.length)
    return <p className="py-4 text-muted-foreground">{t('empty')}</p>
  return (
    <div className="max-h-[32rem] overflow-auto rounded-md border">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{t('cheques')}</caption>
        <thead>
          <tr>
            {onSelect && <th className="p-3">{t('select')}</th>}
            {['cheque_number', 'cheque_date', 'amount', 'type', 'status'].map(
              (key) => (
                <th key={key} className="whitespace-nowrap p-3">
                  {t(`fields.${key}`)}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {cheques.map((c) => (
            <tr key={c.id} className="border-t">
              {onSelect && (
                <td className="p-3">
                  <input
                    type="checkbox"
                    className="size-5 accent-primary"
                    aria-label={t('selectCheque', {
                      number: c.cheque_number ?? '',
                    })}
                    checked={selected?.includes(c.id) ?? false}
                    onChange={() => onSelect(c.id)}
                  />
                </td>
              )}
              <td className="p-3">
                <Link
                  className="underline underline-offset-4"
                  href={`/cheques/${c.id}`}
                >
                  {c.cheque_number}
                </Link>
              </td>
              <td className="whitespace-nowrap p-3">{c.cheque_date}</td>
              <td className="whitespace-nowrap p-3">
                {currency}
                {(c.amount ?? 0).toLocaleString(locale, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
              <td className="p-3">{c.type ? t(`types.${c.type}`) : ''}</td>
              <td className="p-3">
                {c.status ? t(`statuses.${c.status}`) : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

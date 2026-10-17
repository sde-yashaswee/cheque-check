import type {
  ChequeFilters,
  ChequeRow,
  ImportKind,
  ImportRow,
  PreviewRow,
  SafeChequePrefill,
  WorkspaceContext,
} from './types'
import { isValidE164Phone } from '@/lib/phone'

export const placeholders = [
  'party',
  'cheque_number',
  'amount',
  'date',
  'status',
  'business',
] as const
export type MessageValues = Record<(typeof placeholders)[number], string>

export function isValidMessageTemplate(body: string): boolean {
  return (
    body.trim().length > 0 &&
    body.length <= 2000 &&
    !/[{}]/.test(
      body.replace(
        /\{(party|cheque_number|amount|date|status|business)\}/g,
        '',
      ),
    )
  )
}

export function renderMessageTemplate(
  body: string,
  values: MessageValues,
): string {
  if (!isValidMessageTemplate(body)) throw new Error('Invalid message template')
  // Replace once: braces in user-supplied names must never become new placeholders.
  return body.replace(
    /\{(party|cheque_number|amount|date|status|business)\}/g,
    (_, key: keyof MessageValues) => values[key],
  )
}

export function safeChequePrefill(
  source: Record<string, unknown>,
): SafeChequePrefill {
  const result: SafeChequePrefill = {}
  if (typeof source.party_id === 'string' && source.party_id)
    result.party_id = source.party_id
  if (typeof source.account_id === 'string' && source.account_id)
    result.account_id = source.account_id
  const amount = Number(source.amount)
  if (validAmount(source.amount) && amount > 0) result.amount = amount
  if (source.type === 'Inward' || source.type === 'Outward')
    result.type = source.type
  if (typeof source.notes === 'string' && source.notes.length <= 2000)
    result.notes = source.notes
  return result
}

export function validDate(value: string): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < '1900-01-01' ||
    value > '2200-12-31'
  )
    return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  )
}

export function validAmount(value: unknown): boolean {
  return (
    /^(?:\d+)(?:\.\d{1,2})?$/.test(String(value)) &&
    Number(value) > 0 &&
    Number(value) <= 999999999999.99
  )
}

const columns = {
  parties: ['name', 'contact', 'email', 'address', 'notes'],
  cheques: [
    'party_id',
    'account_id',
    'cheque_number',
    'amount',
    'cheque_date',
    'deposit_date',
    'type',
    'notes',
  ],
}
export function importColumns(kind: ImportKind): string[] {
  return columns[kind]
}
const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase()
const phone = (s: string | null | undefined) => (s ?? '').replace(/\D/g, '')

export function validateImport(
  kind: ImportKind,
  rows: ImportRow[],
  context: WorkspaceContext,
): PreviewRow[] {
  const partyNames = new Set(context.parties.map((p) => norm(p.name)))
  const contacts = new Set(context.parties.map((p) => phone(p.contact)))
  const emails = new Set(
    context.parties.map((p) => norm(p.email)).filter(Boolean),
  )
  const chequeKeys = new Set(
    context.cheques
      .filter((c) => !c.is_draft)
      .map((c) => `${c.account_id}:${c.cheque_number}`),
  )
  const parties = new Set(context.parties.map((p) => p.id))
  const accounts = new Set(context.accounts.map((a) => a.id))
  return rows.map((input, index) => {
    const data = Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key.trim(),
        typeof value === 'string' ? value.trim() : value,
      ]),
    )
    const issues: PreviewRow['issues'] = []
    const add = (field: string, code: PreviewRow['issues'][number]['code']) =>
      issues.push({ field, code })
    if (rows.length > 500) add('rows', 'limit')
    for (const key of Object.keys(data))
      if (!columns[kind].includes(key)) add(key, 'unknownColumn')
    if (String(data.notes ?? '').length > 2000) add('notes', 'invalid')
    if (kind === 'parties') {
      const name = norm(String(data.name ?? ''))
      const contact = String(data.contact ?? '')
      const email = norm(String(data.email ?? ''))
      if (!name || name.length > 200) add('name', name ? 'invalid' : 'required')
      if (!isValidE164Phone(contact)) add('contact', 'invalid')
      if (
        email &&
        (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
      )
        add('email', 'invalid')
      if (String(data.address ?? '').length > 1000) add('address', 'invalid')
      if (
        partyNames.has(name) ||
        contacts.has(phone(contact)) ||
        (email && emails.has(email))
      )
        add('name', 'duplicate')
      partyNames.add(name)
      contacts.add(phone(contact))
      if (email) emails.add(email)
    } else {
      if (!parties.has(String(data.party_id))) add('party_id', 'reference')
      if (!accounts.has(String(data.account_id))) add('account_id', 'reference')
      if (!/^\d{6}$/.test(String(data.cheque_number ?? '')))
        add('cheque_number', 'invalid')
      if (!validAmount(data.amount)) add('amount', 'invalid')
      if (!validDate(String(data.cheque_date ?? '')))
        add('cheque_date', 'invalid')
      if (
        data.deposit_date &&
        (!validDate(String(data.deposit_date)) ||
          String(data.deposit_date) < String(data.cheque_date))
      )
        add('deposit_date', 'invalid')
      if (!['Inward', 'Outward'].includes(String(data.type)))
        add('type', 'invalid')
      const key = `${data.account_id}:${data.cheque_number}`
      if (chequeKeys.has(key)) add('cheque_number', 'duplicate')
      chequeKeys.add(key)
    }
    return { row: index + 2, data, issues }
  })
}

export function filterCheques(
  cheques: ChequeRow[],
  filters: ChequeFilters,
): ChequeRow[] {
  return cheques.filter(
    (c) =>
      !c.is_draft &&
      (!filters.search ||
        norm(`${c.cheque_number ?? ''} ${c.notes ?? ''}`).includes(
          norm(filters.search),
        )) &&
      (!filters.status || c.status === filters.status) &&
      (!filters.type || c.type === filters.type) &&
      (!filters.party_id || c.party_id === filters.party_id) &&
      (!filters.from || (c.cheque_date ?? '') >= filters.from) &&
      (!filters.to || (c.cheque_date ?? '') <= filters.to),
  )
}

export function canBulkTransition(
  cheque: ChequeRow,
  status: ChequeRow['status'],
): boolean {
  return (
    !cheque.is_draft &&
    !!cheque.status &&
    !!cheque.type &&
    !!status &&
    cheque.status !== status &&
    (status === 'Cleared' ||
      status === 'Bounced' ||
      status === (cheque.type === 'Inward' ? 'Received' : 'Issued'))
  )
}

export function summarizeCheques(cheques: ChequeRow[]) {
  const result = {
    count: 0,
    inward: 0,
    outward: 0,
    pending: 0,
    cleared: 0,
    bounced: 0,
    netCleared: 0,
  }
  for (const cheque of cheques) {
    if (cheque.is_draft) continue
    const amount = Math.round((cheque.amount ?? 0) * 100)
    result.count++
    if (cheque.type === 'Inward') result.inward += amount
    else result.outward += amount
    if (cheque.status === 'Issued' || cheque.status === 'Received')
      result.pending += amount
    if (cheque.status === 'Bounced') result.bounced += amount
    if (cheque.status === 'Cleared') {
      result.cleared += amount
      result.netCleared += cheque.type === 'Inward' ? amount : -amount
    }
  }
  for (const key of [
    'inward',
    'outward',
    'pending',
    'cleared',
    'bounced',
    'netCleared',
  ] as const)
    result[key] /= 100
  return result
}

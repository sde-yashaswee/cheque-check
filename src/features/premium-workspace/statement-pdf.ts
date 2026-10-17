import { summarizeCheques } from './logic'
import type { ChequeRow } from './types'

export interface StatementPdfLabels {
  title: string
  business: string
  party: string
  period: string
  columns: string[]
  totals: string
  inward: string
  outward: string
  pending: string
  netCleared: string
  statuses: Record<string, string>
  types: Record<string, string>
  page: string
}

/** Raster text uses browser fonts so Hindi names and labels survive PDF export without remote fonts. */
export async function downloadStatementPdf(input: {
  business: string
  party: string
  period: string
  cheques: ChequeRow[]
  currency: string
  locale: string
  labels: StatementPdfLabels
}): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  const labels = input.labels
  const money = (amount: number) =>
    `${input.currency}${amount.toLocaleString(input.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const summary = summarizeCheques(input.cheques)
  const pages: string[][] = []
  let lines: string[] = []
  const canvas = document.createElement('canvas')
  canvas.width = 1240
  canvas.height = 1754
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('PDF canvas unavailable')
  await document.fonts?.ready
  ctx.font = '22px sans-serif'
  const addLine = (text: string) => {
    // Wrap even long unbroken party names rather than cropping financial information.
    let line = ''
    for (const character of text) {
      if (ctx.measureText(line + character).width > 1110) {
        lines.push(line)
        line = ''
      }
      line += character
    }
    lines.push(line)
    if (lines.length >= 42) {
      pages.push(lines)
      lines = []
    }
  }
  addLine(labels.title)
  addLine(`${labels.business}: ${input.business}`)
  addLine(`${labels.party}: ${input.party}`)
  addLine(`${labels.period}: ${input.period}`)
  addLine('')
  addLine(labels.columns.join(' | '))
  let balance = 0
  for (const c of input.cheques) {
    if (c.status === 'Cleared')
      balance +=
        Math.round((c.amount ?? 0) * 100) * (c.type === 'Inward' ? 1 : -1)
    addLine(
      [
        c.cheque_date ?? '',
        c.cheque_number ?? '',
        money(c.amount ?? 0),
        labels.types[c.type ?? ''] ?? '',
        labels.statuses[c.status ?? ''] ?? '',
        money(balance / 100),
      ].join(' | '),
    )
  }
  addLine('')
  addLine(`${labels.totals}: ${input.cheques.length}`)
  addLine(
    `${labels.inward}: ${money(summary.inward)} | ${labels.outward}: ${money(summary.outward)}`,
  )
  addLine(
    `${labels.pending}: ${money(summary.pending)} | ${labels.netCleared}: ${money(summary.netCleared)}`,
  )
  if (lines.length) pages.push(lines)
  pages.forEach((page, index) => {
    if (index > 0) pdf.addPage()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#111111'
    ctx.font = '22px sans-serif'
    page.forEach((line, row) => ctx.fillText(line, 60, 80 + row * 36))
    ctx.fillText(`${labels.page} ${index + 1} / ${pages.length}`, 60, 1685)
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297)
  })
  pdf.save(`party-statement-${new Date().toISOString().slice(0, 10)}.pdf`)
}

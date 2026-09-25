import { ChequeWithRelations } from '@/types'

export interface IReportRepository {
  exportToCSV(cheques: ChequeWithRelations[], filename: string): void
}

export class BrowserReportRepository implements IReportRepository {
  exportToCSV(cheques: ChequeWithRelations[], filename: string): void {
    if (!cheques || cheques.length === 0) return

    const headers = [
      'Cheque Number',
      'Party',
      'Account',
      'Amount',
      'Date',
      'Type',
      'Status',
      'Notes',
    ]
    const rows = cheques.map((cheque) => [
      cheque.cheque_number,
      cheque.party?.name || '',
      (cheque.account as any)?.bank?.name || '',
      cheque.amount,
      cheque.cheque_date,
      cheque.type,
      cheque.status,
      cheque.notes || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }
}

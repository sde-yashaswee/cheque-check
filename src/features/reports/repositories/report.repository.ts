import { ChequeWithRelations } from '@/types'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

export interface IReportRepository {
  exportToCSV(cheques: ChequeWithRelations[], filename: string): void
  exportToJSON(cheques: ChequeWithRelations[], filename: string): void
  exportToPDF(cheques: ChequeWithRelations[], filename: string): void
  exportToExcel(cheques: ChequeWithRelations[], filename: string): void
}

export class BrowserReportRepository implements IReportRepository {
  private download(content: BlobPart, filename: string, type: string): void {
    const blob = new Blob([content], { type })
    const link = document.createElement('a')
    if (link.download === undefined) return
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = filename
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

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

    this.download(csvContent, filename, 'text/csv;charset=utf-8;')
  }

  exportToJSON(cheques: ChequeWithRelations[], filename: string): void {
    if (!cheques || cheques.length === 0) return
    this.download(
      JSON.stringify(cheques, null, 2),
      filename,
      'application/json;charset=utf-8;',
    )
  }

  exportToPDF(cheques: ChequeWithRelations[], filename: string): void {
    if (!cheques || cheques.length === 0) return

    const document = new jsPDF()
    document.setFontSize(16)
    document.text('ChequeCheck Report', 14, 18)
    document.setFontSize(9)

    let y = 30
    cheques.forEach((cheque, index) => {
      if (y > 275) {
        document.addPage()
        y = 18
      }
      const line = [
        `#${cheque.cheque_number}`,
        cheque.party?.name || 'Unknown party',
        `${cheque.amount}`,
        cheque.cheque_date,
        cheque.status,
      ].join(' | ')
      document.text(`${index + 1}. ${line}`, 14, y)
      y += 8
    })

    document.save(filename)
  }

  exportToExcel(cheques: ChequeWithRelations[], filename: string): void {
    if (!cheques || cheques.length === 0) return

    const rows = cheques.map((cheque) => ({
      'Cheque Number': cheque.cheque_number,
      Party: cheque.party?.name || '',
      Account: cheque.account?.bank?.name || '',
      Amount: cheque.amount,
      Date: cheque.cheque_date,
      Type: cheque.type,
      Status: cheque.status,
      Notes: cheque.notes || '',
    }))
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cheques')
    XLSX.writeFile(workbook, filename)
  }
}

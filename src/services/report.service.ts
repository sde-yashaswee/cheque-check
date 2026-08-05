import { ChequeWithRelations } from "@/types";

export class ReportService {
  static exportToCSV(cheques: ChequeWithRelations[], filename: string = 'cheques_report.csv') {
    if (!cheques || cheques.length === 0) return;

    const headers = ['Cheque Number', 'Party', 'Account', 'Amount', 'Date', 'Type', 'Status', 'Notes'];
    const rows = cheques.map(c => [
      c.cheque_number,
      c.party?.name || '',
      (c.account as any)?.bank?.name || '',
      c.amount,
      c.cheque_date,
      c.type,
      c.status,
      c.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

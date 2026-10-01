import { ChequeWithRelations } from '@/types'
import {
  BrowserReportRepository,
  IReportRepository,
} from '@/features/reports/repositories/report.repository'

let defaultReportService: ReportService | undefined

function getDefaultReportService(): ReportService {
  if (!defaultReportService) defaultReportService = new ReportService()
  return defaultReportService
}

export class ReportService {
  constructor(
    private readonly repository: IReportRepository = new BrowserReportRepository(),
  ) {}

  exportToCSV(
    cheques: ChequeWithRelations[],
    filename = 'cheques_report.csv',
  ): void {
    this.repository.exportToCSV(cheques, filename)
  }

  exportToJSON(
    cheques: ChequeWithRelations[],
    filename = 'cheques_report.json',
  ): void {
    this.repository.exportToJSON(cheques, filename)
  }

  exportToPDF(
    cheques: ChequeWithRelations[],
    filename = 'cheques_report.pdf',
  ): void {
    this.repository.exportToPDF(cheques, filename)
  }

  exportToExcel(
    cheques: ChequeWithRelations[],
    filename = 'cheques_report.xlsx',
  ): void {
    this.repository.exportToExcel(cheques, filename)
  }
}

export const reportService = new Proxy(Object.create(ReportService.prototype), {
  get(_target, property, receiver) {
    const service = getDefaultReportService()
    const value = Reflect.get(service, property, receiver)
    return typeof value === 'function' ? value.bind(service) : value
  },
})

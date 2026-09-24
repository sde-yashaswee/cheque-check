import { ChequeWithRelations } from '@/types'
import {
  BrowserReportRepository,
  IReportRepository,
} from '@/repositories/report.repository'

let defaultReportService: ReportService | undefined

function getDefaultReportService(): ReportService {
  if (!defaultReportService) defaultReportService = new ReportService()
  return defaultReportService
}

export class ReportService {
  constructor(
    private readonly repository: IReportRepository = new BrowserReportRepository(),
  ) {}

  static exportToCSV(
    cheques: ChequeWithRelations[],
    filename = 'cheques_report.csv',
  ) {
    return getDefaultReportService().exportToCSV(cheques, filename)
  }

  exportToCSV(
    cheques: ChequeWithRelations[],
    filename = 'cheques_report.csv',
  ): void {
    this.repository.exportToCSV(cheques, filename)
  }
}

export const reportService = new Proxy(Object.create(ReportService.prototype), {
  get(_target, property, receiver) {
    const service = getDefaultReportService()
    const value = Reflect.get(service, property, receiver)
    return typeof value === 'function' ? value.bind(service) : value
  },
})

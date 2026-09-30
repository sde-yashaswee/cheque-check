import { describe, expect, it, vi } from 'vitest'
import { ReportService } from './report.service'
import type { IReportRepository } from '@/repositories/report.repository'

describe('ReportService', () => {
  it('delegates CSV exports to the injected repository', () => {
    const repository = {
      exportToCSV: vi.fn(),
      exportToJSON: vi.fn(),
      exportToPDF: vi.fn(),
      exportToExcel: vi.fn(),
    } as unknown as IReportRepository
    const service = new ReportService(repository)

    service.exportToCSV([], 'report.csv')

    expect(repository.exportToCSV).toHaveBeenCalledWith([], 'report.csv')
  })

  it('delegates JSON exports to the injected repository', () => {
    const repository = {
      exportToCSV: vi.fn(),
      exportToJSON: vi.fn(),
    } as unknown as IReportRepository
    const service = new ReportService(repository)

    service.exportToJSON([], 'report.json')

    expect(repository.exportToJSON).toHaveBeenCalledWith([], 'report.json')
  })

  it('delegates PDF and Excel exports to the injected repository', () => {
    const repository = {
      exportToCSV: vi.fn(),
      exportToJSON: vi.fn(),
      exportToPDF: vi.fn(),
      exportToExcel: vi.fn(),
    } as unknown as IReportRepository
    const service = new ReportService(repository)

    service.exportToPDF([], 'report.pdf')
    service.exportToExcel([], 'report.xlsx')

    expect(repository.exportToPDF).toHaveBeenCalledWith([], 'report.pdf')
    expect(repository.exportToExcel).toHaveBeenCalledWith([], 'report.xlsx')
  })
})

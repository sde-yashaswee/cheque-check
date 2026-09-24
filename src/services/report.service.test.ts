import { describe, expect, it, vi } from 'vitest'
import { ReportService } from './report.service'
import type { IReportRepository } from '@/repositories/report.repository'

describe('ReportService', () => {
  it('delegates CSV exports to the injected repository', () => {
    const repository = {
      exportToCSV: vi.fn(),
    } as unknown as IReportRepository
    const service = new ReportService(repository)

    service.exportToCSV([], 'report.csv')

    expect(repository.exportToCSV).toHaveBeenCalledWith([], 'report.csv')
  })
})

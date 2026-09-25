import { describe, expect, it, vi } from 'vitest'
import { ChequeService } from './cheque.service'

describe('ChequeService', () => {
  it('updates status when the transition is valid', async () => {
    const repo = {
      getById: vi.fn().mockResolvedValue({
        id: '1',
        business_id: 'b1',
        party_id: 'p1',
        account_id: 'a1',
        cheque_number: '100',
        amount: 100,
        cheque_date: '2025-01-01',
        deposit_date: null,
        remind_before_days: null,
        status: 'Issued',
        type: 'Outward',
        notes: null,
        image_url: null,
        voice_call_sent: false,
        last_call_at: null,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }),
      updateStatus: vi.fn().mockResolvedValue({
        id: '1',
        business_id: 'b1',
        party_id: 'p1',
        account_id: 'a1',
        cheque_number: '100',
        amount: 100,
        cheque_date: '2025-01-01',
        deposit_date: null,
        remind_before_days: null,
        status: 'Cleared',
        type: 'Outward',
        notes: null,
        image_url: null,
        voice_call_sent: false,
        last_call_at: null,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }),
    }

    const service = new ChequeService(repo as any)
    await service.updateStatus('1', 'Cleared')

    expect(repo.getById).toHaveBeenCalledWith('1')
    expect(repo.updateStatus).toHaveBeenCalledWith('1', 'Cleared')
  })

  it('throws when a terminal status is transitioned again', async () => {
    const repo = {
      getById: vi.fn().mockResolvedValue({
        id: '1',
        business_id: 'b1',
        party_id: 'p1',
        account_id: 'a1',
        cheque_number: '100',
        amount: 100,
        cheque_date: '2025-01-01',
        deposit_date: null,
        remind_before_days: null,
        status: 'Cleared',
        type: 'Outward',
        notes: null,
        image_url: null,
        voice_call_sent: false,
        last_call_at: null,
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
      }),
      updateStatus: vi.fn(),
    }

    const service = new ChequeService(repo as any)

    await expect(service.updateStatus('1', 'Bounced')).rejects.toThrow(
      'Cannot transition',
    )
    expect(repo.updateStatus).not.toHaveBeenCalled()
  })
})

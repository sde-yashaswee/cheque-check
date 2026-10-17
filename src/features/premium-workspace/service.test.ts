import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getMessageTemplate,
  getPrintLayout,
  premiumWorkspaceService,
  savePrintLayout,
} from './services/workspace.service'

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock('@/lib/supabase/client', () => ({ createClient: () => ({ rpc }) }))

beforeEach(() => {
  rpc.mockReset()
  rpc.mockResolvedValue({ data: null, error: null })
})

describe('fresh authenticated premium RPC contracts', () => {
  it('fetches the current message template on every call, with optional business scope', async () => {
    rpc.mockResolvedValue({ data: 'Hello {party}', error: null })
    expect(await getMessageTemplate('b1')).toBe('Hello {party}')
    await getMessageTemplate()
    expect(rpc.mock.calls).toEqual([
      ['premium_workspace_message', { requested_business: 'b1' }],
      ['premium_workspace_message', {}],
    ])
  })
  it('does not silently use a cached template after entitlement expiry', async () => {
    rpc
      .mockResolvedValueOnce({ data: 'Hello', error: null })
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'Lifetime Premium required' },
      })
    expect(await getMessageTemplate()).toBe('Hello')
    await expect(getMessageTemplate()).rejects.toThrow(
      'Lifetime Premium required',
    )
  })
  it('commits imports in one atomic RPC, not individual cheque writes', async () => {
    rpc.mockResolvedValue({ data: 2, error: null })
    const rows = [
      { name: 'Asha', contact: '+919876543210' },
      { name: 'Other', contact: '+919111111111' },
    ]
    expect(
      await premiumWorkspaceService.importRows('b1', 'parties', rows),
    ).toBe(2)
    expect(rpc).toHaveBeenCalledExactlyOnceWith('premium_workspace_import', {
      requested_business: 'b1',
      requested_kind: 'parties',
      requested_rows: rows,
    })
  })
  it('submits the full batch and target status to one validating RPC', async () => {
    await premiumWorkspaceService.bulkStatus('b1', ['c1', 'c2'], 'Cleared')
    expect(rpc).toHaveBeenCalledWith('premium_workspace_bulk_status', {
      requested_business: 'b1',
      requested_ids: ['c1', 'c2'],
      requested_status: 'Cleared',
    })
  })
  it('revalidates stored tools on apply instead of applying a client-cached payload', async () => {
    await premiumWorkspaceService.applyTool('tool1')
    expect(rpc).toHaveBeenCalledWith('premium_workspace_apply_tool', {
      requested_id: 'tool1',
    })
  })
  it('sends explicit statement scope and dates to the ownership checked snapshot', async () => {
    await premiumWorkspaceService.snapshot(
      ['b1'],
      'p1',
      '2026-01-01',
      '2026-12-31',
    )
    expect(rpc).toHaveBeenCalledWith('premium_workspace_snapshot', {
      requested_businesses: ['b1'],
      requested_party: 'p1',
      requested_from: '2026-01-01',
      requested_to: '2026-12-31',
    })
  })
  it('persists and loads print layouts by account with fresh checks', async () => {
    const layout = {
      payeeX: 35,
      payeeY: 55,
      amountX: 150,
      amountY: 55,
      dateX: 165,
      dateY: 25,
      chequeNumberX: 165,
      chequeNumberY: 35,
    }
    rpc.mockResolvedValue({ data: layout, error: null })
    expect(await getPrintLayout('a1')).toEqual(layout)
    await savePrintLayout('a1', layout)
    expect(rpc).toHaveBeenLastCalledWith('premium_workspace_print_layout', {
      requested_account: 'a1',
      requested_layout: layout,
    })
  })
  it('propagates backend failures for batch writes', async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { message: 'Invalid status transition' },
    })
    await expect(
      premiumWorkspaceService.bulkStatus('b1', ['c1'], 'Received'),
    ).rejects.toThrow('Invalid status transition')
  })
})

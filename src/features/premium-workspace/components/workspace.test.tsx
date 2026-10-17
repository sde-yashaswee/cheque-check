import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import messages from '../../../../messages/en.json'
import { TemplatesPanel } from './templates-panel'
import { FiltersPanel } from './filters-panel'
import { ReportsPanel } from './reports-panel'
import { MessagePanel } from './message-panel'
import type { ChequeRow, SavedTool, WorkspaceContext } from '../types'

const { importRows, bulkStatus, snapshot, applyTool, saveTool, downloadPdf } =
  vi.hoisted(() => ({
    importRows: vi.fn(),
    bulkStatus: vi.fn(),
    snapshot: vi.fn(),
    applyTool: vi.fn(),
    saveTool: vi.fn(),
    downloadPdf: vi.fn(),
  }))
vi.mock('../service', () => ({
  premiumWorkspaceService: {
    importRows,
    bulkStatus,
    snapshot,
    applyTool,
    saveTool,
  },
}))
vi.mock('../statement-pdf', () => ({ downloadStatementPdf: downloadPdf }))
const cheque: ChequeRow = {
  id: 'c1',
  business_id: 'b1',
  party_id: 'p1',
  account_id: 'a1',
  cheque_number: '123456',
  amount: 125,
  cheque_date: '2025-01-01',
  deposit_date: '2025-01-02',
  type: 'Outward',
  status: 'Issued',
  notes: 'Recurring',
  image_url: null,
  is_draft: false,
  remind_before_days: null,
  created_at: null,
  updated_at: null,
}
const context: WorkspaceContext = {
  cheques: [cheque],
  parties: [
    {
      id: 'p1',
      business_id: 'b1',
      name: 'Asha',
      contact: '+919876543210',
      is_draft: false,
    } as WorkspaceContext['parties'][number],
  ],
  accounts: [
    {
      id: 'a1',
      business_id: 'b1',
      account_name: 'Main',
      account_number: '1111',
      is_draft: false,
    } as WorkspaceContext['accounts'][number],
  ],
}
const run = async (action: () => Promise<unknown>) => {
  await action()
}
const common = { businessId: 'b1', context, tools: [], run, busy: false }
const wrap = (node: React.ReactNode) =>
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  )

beforeEach(() => {
  vi.clearAllMocks()
})
afterEach(cleanup)

describe('workspace workflows', () => {
  it('prefills a recurring cheque without copying its number or dates and requires confirmation to create', async () => {
    wrap(<TemplatesPanel {...common} />)
    fireEvent.change(screen.getByLabelText('Start with a previous cheque'), {
      target: { value: 'c1' },
    })
    expect(screen.getByLabelText('Cheque number')).toHaveValue('')
    expect(screen.getByLabelText('Cheque date')).not.toHaveValue('2025-01-01')
    expect(screen.getByLabelText('Party')).toHaveValue('p1')
    expect(screen.getByLabelText('Amount')).toHaveValue('125')
    fireEvent.change(screen.getByLabelText('Cheque number'), {
      target: { value: '000002' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Create cheque' }))
    expect(importRows).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await waitFor(() =>
      expect(importRows).toHaveBeenCalledWith('b1', 'cheques', [
        expect.objectContaining({
          cheque_number: '000002',
          party_id: 'p1',
          amount: '125',
        }),
      ]),
    )
  })
  it('keeps individual cheque links and confirms selection before an atomic batch action', async () => {
    wrap(<FiltersPanel {...common} currency="₹" mode="bulk" />)
    expect(screen.getByRole('link', { name: '123456' })).toHaveAttribute(
      'href',
      '/cheques/c1',
    )
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select cheque 123456' }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Update selected' }))
    expect(bulkStatus).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Change all 1 selected cheques to Cleared?',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
    await waitFor(() =>
      expect(bulkStatus).toHaveBeenCalledExactlyOnceWith(
        'b1',
        ['c1'],
        'Cleared',
      ),
    )
  })
  it('blocks an opposite-direction status and clears selection when filters change', () => {
    wrap(<FiltersPanel {...common} currency="₹" mode="bulk" />)
    fireEvent.click(
      screen.getByRole('checkbox', { name: 'Select cheque 123456' }),
    )
    fireEvent.change(screen.getByLabelText('New status'), {
      target: { value: 'Received' },
    })
    expect(
      screen.getByRole('button', { name: 'Update selected' }),
    ).toBeDisabled()
    fireEvent.change(screen.getByLabelText('Search cheque number or notes'), {
      target: { value: '123' },
    })
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })
  it('applies a persisted view through the backend and filters the actual cheque list', async () => {
    applyTool.mockResolvedValue({ status: 'Cleared' })
    const tools: SavedTool[] = [
      {
        id: 'v1',
        user_id: 'u1',
        business_id: 'b1',
        name: 'Cleared view',
        kind: 'saved-view',
        payload: { status: 'Cleared' },
        created_at: '2026-10-17',
        updated_at: '2026-10-17',
      },
    ]
    wrap(<FiltersPanel {...common} tools={tools} currency="₹" mode="views" />)
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(applyTool).toHaveBeenCalledWith('v1'))
    expect(
      await screen.findByText('No cheques match this scope.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Status')).toHaveValue('Cleared')
  })
  it('re-fetches a fresh entitlement-checked statement for every PDF export', async () => {
    snapshot.mockResolvedValue({
      businesses: [{ id: 'b1', name: 'Acme' }],
      cheques: [cheque],
    })
    wrap(
      <ReportsPanel
        {...common}
        businessName="Acme"
        businesses={[{ id: 'b1', name: 'Acme' }]}
        currency="₹"
        mode="statement"
      />,
    )
    fireEvent.change(screen.getByLabelText('Party'), {
      target: { value: 'p1' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    await waitFor(() => expect(snapshot).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole('button', { name: 'Export PDF' }))
    await waitFor(() => expect(downloadPdf).toHaveBeenCalledTimes(1))
    expect(snapshot).toHaveBeenCalledTimes(2)
    expect(downloadPdf).toHaveBeenCalledWith(
      expect.objectContaining({
        business: 'Acme',
        party: 'Asha',
        cheques: [cheque],
      }),
    )
  })
  it('only submits the checked owned businesses for a consolidated dashboard', async () => {
    snapshot.mockResolvedValue({
      businesses: [{ id: 'b1', name: 'Acme' }],
      cheques: [cheque],
    })
    wrap(
      <ReportsPanel
        {...common}
        businessName="Acme"
        businesses={[
          { id: 'b1', name: 'Acme' },
          { id: 'b2', name: 'Other' },
        ]}
        currency="₹"
        mode="consolidated"
      />,
    )
    fireEvent.click(screen.getByLabelText('Other'))
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }))
    await waitFor(() =>
      expect(snapshot).toHaveBeenCalledWith(['b1'], undefined, '', ''),
    )
  })
  it('selects a deep-linked party only when that party belongs to the current owned business', () => {
    const { unmount } = wrap(
      <ReportsPanel
        {...common}
        businessName="Acme"
        businesses={[{ id: 'b1', name: 'Acme' }]}
        currency="₹"
        mode="statement"
        initialPartyId="foreign-party"
      />,
    )
    expect(screen.getByLabelText('Party')).toHaveValue('')
    unmount()
    wrap(
      <ReportsPanel
        {...common}
        businessName="Acme"
        businesses={[{ id: 'b1', name: 'Acme' }]}
        currency="₹"
        mode="statement"
        initialPartyId="p1"
      />,
    )
    expect(screen.getByLabelText('Party')).toHaveValue('p1')
  })
  it('renders a localized template preview without sending messages and blocks unapproved placeholders', () => {
    wrap(<MessagePanel {...common} businessName="Acme" currency="₹" />)
    expect(screen.getByText(/Hi Asha,/)).toHaveTextContent('Regards, Acme')
    expect(screen.getByLabelText('Message template')).toHaveValue(
      messages.PremiumWorkspace.defaultMessage,
    )
    fireEvent.change(screen.getByLabelText('Message template'), {
      target: { value: 'Hello {secret}' },
    })
    expect(screen.getByRole('alert')).toHaveTextContent('approved placeholders')
    fireEvent.change(screen.getByLabelText('Name for this saved tool'), {
      target: { value: 'Invalid template' },
    })
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
  })
})

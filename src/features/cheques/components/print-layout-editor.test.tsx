import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider } from 'next-intl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PrintLayoutEditor } from './print-layout-editor'
import {
  defaultPrintLayout,
  savePrintLayout as saveLocalPrintLayout,
} from '../lib/print-cheque'
import messages from '../../../../messages/en.json'
import type { ReactNode } from 'react'

const mocks = vi.hoisted(() => ({
  load: vi.fn(),
  save: vi.fn(),
  verify: vi.fn(),
  toast: vi.fn(),
  close: vi.fn(),
}))
vi.mock('@/features/premium-workspace/services/workspace.service', () => ({
  getPrintLayout: mocks.load,
  savePrintLayout: mocks.save,
}))
vi.mock('@/features/monetization/components/premium-gate', () => ({
  PremiumGate: ({ children }: { children: ReactNode }) => children,
  usePremiumAction: () => ({ verifyAccess: mocks.verify }),
}))
vi.mock('@/components/ui/toast', () => ({ toast: { add: mocks.toast } }))

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
  mocks.load.mockResolvedValue({ ...defaultPrintLayout, payeeX: 70 })
  mocks.save.mockResolvedValue(undefined)
  mocks.verify.mockResolvedValue(true)
})
afterEach(cleanup)

function renderEditor() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="en" messages={messages}>
        <PrintLayoutEditor
          accountId="account-1"
          open
          onOpenChange={mocks.close}
        />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  )
}

describe('Synced print layout editor', () => {
  it('loads the saved account layout and saves changes after fresh authorization', async () => {
    renderEditor()
    const input = await screen.findByLabelText('Payee X (mm)')
    expect(input).toHaveValue(70)
    fireEvent.change(input, { target: { value: '80' } })
    fireEvent.click(
      screen.getByRole('button', { name: messages.Cheques.savePrintLayout }),
    )
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith('account-1', {
        ...defaultPrintLayout,
        payeeX: 80,
      }),
    )
    expect(mocks.verify).toHaveBeenCalledWith('cheque-printing')
    expect(mocks.close).toHaveBeenCalledWith(false)
  })

  it('retains an existing local layout when no synced layout has been saved yet', async () => {
    mocks.load.mockResolvedValue(null)
    saveLocalPrintLayout('account-1', { ...defaultPrintLayout, payeeX: 62 })
    renderEditor()
    expect(await screen.findByLabelText('Payee X (mm)')).toHaveValue(62)
    expect(mocks.save).not.toHaveBeenCalled()
  })

  it.each([
    ['Payee X (mm)', ''],
    ['Payee X (mm)', '-1'],
    ['Payee X (mm)', '211'],
    ['Payee Y (mm)', '298'],
  ])('rejects invalid coordinates %s: %s', async (label, value) => {
    renderEditor()
    fireEvent.change(await screen.findByLabelText(label), { target: { value } })
    fireEvent.click(
      screen.getByRole('button', { name: messages.Cheques.savePrintLayout }),
    )
    expect(mocks.save).not.toHaveBeenCalled()
    expect(mocks.verify).not.toHaveBeenCalled()
    expect(mocks.toast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: messages.Cheques.printCoordinatesInvalid,
      }),
    )
  })

  it('does not persist a layout when access was revoked', async () => {
    mocks.verify.mockResolvedValue(false)
    renderEditor()
    await screen.findByLabelText('Payee X (mm)')
    fireEvent.click(
      screen.getByRole('button', { name: messages.Cheques.savePrintLayout }),
    )
    await waitFor(() => expect(mocks.verify).toHaveBeenCalledOnce())
    expect(mocks.save).not.toHaveBeenCalled()
    expect(mocks.close).not.toHaveBeenCalled()
  })

  it('shows load errors with retry instead of defaulting to an unsynced layout', async () => {
    mocks.load.mockRejectedValue(new Error('Layout sync unavailable'))
    renderEditor()
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Layout sync unavailable',
    )
    expect(screen.queryByLabelText('Payee X (mm)')).not.toBeInTheDocument()
    mocks.load.mockResolvedValue(defaultPrintLayout)
    fireEvent.click(
      screen.getByRole('button', { name: messages.Premium.retry }),
    )
    expect(await screen.findByLabelText('Payee X (mm)')).toHaveValue(
      defaultPrintLayout.payeeX,
    )
  })

  it('preserves the open form and reports a failed save', async () => {
    mocks.save.mockRejectedValue(new Error('Layout save failed'))
    renderEditor()
    await screen.findByLabelText('Payee X (mm)')
    fireEvent.click(
      screen.getByRole('button', { name: messages.Cheques.savePrintLayout }),
    )
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Layout save failed',
          type: 'error',
        }),
      ),
    )
    expect(mocks.close).not.toHaveBeenCalled()
  })
})

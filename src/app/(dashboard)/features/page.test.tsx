import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { NextIntlClientProvider, type AbstractIntlMessages } from 'next-intl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'
import type { Profile } from '@/types'
import type {
  Quota,
  Transaction,
} from '@/features/monetization/repositories/monetization.repository'
import type { PhoneInputProps } from '@/components/ui/phone-input'
import { FEATURE_IDS, PRODUCT_IDS } from '@/features/monetization/constants'
import { queryKeys } from '@/lib/query-keys'
import messages from '../../../../messages/en.json'
import hindi from '../../../../messages/hi.json'
import hinglish from '../../../../messages/hi-en.json'
import FeaturesPage from './page'

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
  payment: vi.fn(),
  transactions: vi.fn(),
  toast: vi.fn(),
}))

let profile: Profile
let premium = false
let subscribed: string[] = []
let quotas: Quota[] = []
let accessError: Error | null = null
let loading = false
let processing = false

afterEach(cleanup)

vi.mock('@/hooks/use-profile', () => ({
  useProfile: () => ({
    profile,
    updateProfile: mocks.update,
    isLoading: false,
  }),
}))
vi.mock('@/hooks/use-monetization', () => ({
  useMonetization: () => ({
    isLifetimePremium: premium,
    checkEntitlement: (id: string) => subscribed.includes(id),
    getQuota: (id: string) => quotas.find((quota) => quota.feature_id === id),
    entitlements: [],
    isLoading: loading,
    error: accessError,
  }),
}))
vi.mock('@/hooks/use-razorpay', () => ({
  useRazorpay: () => ({
    processPayment: mocks.payment,
    isProcessing: processing,
  }),
}))
vi.mock('@/features/monetization/services/monetization.service', () => ({
  monetizationService: { getTransactions: mocks.transactions },
}))
vi.mock('@/components/ui/toast', () => ({ toast: { add: mocks.toast } }))
vi.mock('@/components/ui/phone-input', () => ({
  PhoneInput: ({
    id,
    value,
    onChange,
    disabled,
    'aria-invalid': invalid,
  }: PhoneInputProps) => (
    <input
      id={id}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-invalid={invalid}
    />
  ),
}))

function voiceCredits(used = 0) {
  quotas = [
    {
      id: 'quota',
      user_id: 'user',
      feature_id: FEATURE_IDS.VOICE_REMINDER,
      used,
      limit: 100,
      reset_at: null,
    },
  ]
}

function renderPage(
  locale = 'en',
  translations: AbstractIntlMessages = messages,
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const view = render(<FeaturesPage />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>
        <NextIntlClientProvider
          locale={locale}
          messages={translations}
          timeZone="UTC"
        >
          {children}
        </NextIntlClientProvider>
      </QueryClientProvider>
    ),
  })
  return { ...view, client }
}

function voiceCard() {
  return screen.getByRole('article', { name: messages.Features.voiceReminder })
}

beforeEach(() => {
  vi.clearAllMocks()
  profile = {
    id: 'profile',
    user_id: 'user',
    name: 'Test',
    email: null,
    currency: 'INR',
    date_format: 'dd/MM/yyyy',
    time_format: '12h',
    time_zone: 'Asia/Kolkata',
    language: 'en',
    reminders_per_day: 1,
    default_reminder_days: 3,
    received_cheques_enabled: false,
    phone: '+919876543210',
    voice_call_enabled: false,
    sms_enabled: false,
    party_sms_enabled: false,
    push_enabled: false,
    whatsapp_enabled: false,
    reduce_motion: false,
    created_at: '',
    updated_at: '',
  }
  premium = false
  subscribed = []
  quotas = []
  accessError = null
  loading = false
  processing = false
  mocks.transactions.mockResolvedValue([])
  mocks.update.mockImplementation(async (changes: Partial<Profile>) => {
    profile = { ...profile, ...changes }
  })
})

describe('Features page', () => {
  it('keeps locked purchase actions clear and sends the correct product', async () => {
    renderPage()
    expect(
      await screen.findByText(messages.Features.noActivity),
    ).toBeInTheDocument()
    expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', {
        name: messages.Features.getLifetimePremium,
      }),
    )
    expect(mocks.payment).toHaveBeenCalledWith(
      expect.objectContaining({ productId: PRODUCT_IDS.LIFETIME_PREMIUM }),
    )
    fireEvent.click(
      within(voiceCard()).getByRole('button', {
        name: messages.Features.enableAddon,
      }),
    )
    expect(mocks.payment).toHaveBeenLastCalledWith(
      expect.objectContaining({ productId: PRODUCT_IDS.VOICE_REMINDER_30D }),
    )
  })

  it('lets premium users toggle inward tracking without repurchasing', async () => {
    premium = true
    renderPage()
    fireEvent.click(
      screen.getByRole('switch', { name: messages.Features.receivingMode }),
    )
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({
        received_cheques_enabled: true,
      }),
    )
    expect(
      screen.queryByRole('button', {
        name: messages.Features.getLifetimePremium,
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: messages.Features.openReports }),
    ).toHaveAttribute('href', '/reports')
  })

  it('keeps phone setup visible while voice reminders are off', () => {
    subscribed = [FEATURE_IDS.VOICE_REMINDER_SUB]
    voiceCredits()
    renderPage()
    const card = within(voiceCard())
    expect(card.getByText(messages.Features.paused)).toBeInTheDocument()
    expect(
      card.getByLabelText(messages.Features.yourPhoneNumber),
    ).toBeInTheDocument()
    expect(
      card.getByRole('button', { name: messages.Features.sendTestCall }),
    ).toBeDisabled()
    expect(
      card.getByText(messages.Features.voicePausedHelp),
    ).toBeInTheDocument()
  })

  it('shows phone setup rather than ready when reminders are on without a saved number', () => {
    subscribed = [FEATURE_IDS.VOICE_REMINDER_SUB]
    voiceCredits()
    profile.voice_call_enabled = true
    profile.phone = null
    renderPage()
    expect(
      within(voiceCard()).getByText(messages.Features.setupRequired),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: messages.Features.sendTestCall }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: messages.Features.savePhone }),
    ).toBeInTheDocument()
  })

  it('requires an explicit valid phone save before testing the persisted number', async () => {
    subscribed = [FEATURE_IDS.VOICE_REMINDER_SUB]
    voiceCredits()
    profile.voice_call_enabled = true
    const view = renderPage()
    const phone = screen.getByLabelText(messages.Features.yourPhoneNumber)
    fireEvent.change(phone, { target: { value: '123' } })
    fireEvent.click(
      screen.getByRole('button', { name: messages.Features.savePhone }),
    )
    expect(screen.getByText(messages.Common.invalidPhone)).toBeInTheDocument()
    expect(mocks.update).not.toHaveBeenCalled()
    fireEvent.change(phone, { target: { value: '+919876543211' } })
    expect(
      screen.getByRole('button', { name: messages.Features.sendTestCall }),
    ).toBeDisabled()
    expect(
      screen.getByText(messages.Features.saveBeforeTest),
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: messages.Features.savePhone }),
    )
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({ phone: '+919876543211' }),
    )
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' }),
      ),
    )
    view.rerender(<FeaturesPage />)
    expect(
      screen.getByRole('button', { name: messages.Features.sendTestCall }),
    ).toBeEnabled()
  })

  it('supports service controls for trial credits but not paid top-ups', async () => {
    voiceCredits()
    renderPage()
    expect(
      within(voiceCard()).getByText(messages.Features.trialAccess),
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('switch', { name: messages.Features.enableService }),
    )
    await waitFor(() =>
      expect(mocks.update).toHaveBeenCalledWith({ voice_call_enabled: true }),
    )
    expect(
      within(voiceCard()).getByRole('button', {
        name: messages.Features.upgradeSubscription,
      }),
    ).toBeInTheDocument()
    expect(
      within(voiceCard()).queryByRole('button', { name: /Top up/ }),
    ).not.toBeInTheDocument()
  })

  it('shows exhausted credits and offers the correct top-up without hiding setup', () => {
    subscribed = [FEATURE_IDS.VOICE_REMINDER_SUB]
    profile.voice_call_enabled = true
    voiceCredits(100)
    renderPage()
    const card = within(voiceCard())
    expect(card.getByText(messages.Features.outOfCredits)).toBeInTheDocument()
    expect(
      card.getByRole('button', { name: messages.Features.sendTestCall }),
    ).toBeDisabled()
    fireEvent.click(
      card.getByRole('button', { name: 'Top up 100 calls · ₹50' }),
    )
    expect(mocks.payment).toHaveBeenCalledWith(
      expect.objectContaining({ productId: PRODUCT_IDS.VOICE_REMINDER_100 }),
    )
    expect(
      card.getByLabelText(messages.Features.yourPhoneNumber),
    ).toBeInTheDocument()
  })

  it('does not suggest scanning when no scan credits remain', () => {
    subscribed = [FEATURE_IDS.AI_SCANNER_SUB]
    quotas = [
      {
        id: 'quota',
        user_id: 'user',
        feature_id: FEATURE_IDS.AI_SCAN,
        used: 250,
        limit: 250,
        reset_at: null,
      },
    ]
    renderPage()
    const scanner = within(
      screen.getByRole('article', { name: messages.Features.aiScanner }),
    )
    expect(
      scanner.getByText(messages.Features.outOfCredits),
    ).toBeInTheDocument()
    expect(
      scanner.queryByRole('link', { name: messages.Features.scanCheque }),
    ).not.toBeInTheDocument()
    expect(
      scanner.getByRole('button', { name: 'Top up 250 scans · ₹50' }),
    ).toBeEnabled()
  })

  it('refreshes quota after a queued test call without claiming the call was delivered', async () => {
    subscribed = [FEATURE_IDS.VOICE_REMINDER_SUB]
    profile.voice_call_enabled = true
    voiceCredits()
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(
        new Response(JSON.stringify({ queued: true }), { status: 200 }),
      )
    const { client } = renderPage()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    fireEvent.click(
      screen.getByRole('button', { name: messages.Features.sendTestCall }),
    )
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: messages.Features.testCallQueued,
        }),
      ),
    )
    expect(fetchMock).toHaveBeenCalledWith('/api/notifications/test-voice', {
      method: 'POST',
    })
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: queryKeys.monetization.quotas(),
    })
    fetchMock.mockRestore()
  })

  it('surfaces failed profile saves without a success notification', async () => {
    premium = true
    mocks.update.mockRejectedValue(new Error('Save unavailable'))
    renderPage()
    fireEvent.click(
      screen.getByRole('switch', { name: messages.Features.receivingMode }),
    )
    await waitFor(() =>
      expect(mocks.toast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Save unavailable',
          type: 'error',
        }),
      ),
    )
    expect(
      screen.getByRole('switch', { name: messages.Features.receivingMode }),
    ).not.toBeChecked()
  })

  it('tracks pending orders and refreshes transactions, entitlements and quotas together', async () => {
    const transaction: Transaction = {
      id: 'transaction',
      user_id: 'user',
      feature_id: FEATURE_IDS.AI_SCANNER_SUB,
      type: 'subscription',
      status: 'authorized',
      amount: 5000,
      currency: 'INR',
      razorpay_order_id: 'order_pending',
      razorpay_payment_id: null,
      created_at: '2026-10-17T00:00:00Z',
      updated_at: '2026-10-17T00:00:00Z',
    }
    mocks.transactions.mockResolvedValue([transaction])
    const { client } = renderPage()
    expect(
      await screen.findByText(messages.Features.paymentAuthorizedHelp),
    ).toBeInTheDocument()
    expect(screen.getByText('₹50.00')).toBeInTheDocument()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    fireEvent.click(
      screen.getByRole('button', { name: messages.Features.refreshStatus }),
    )
    await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(3))
    for (const key of ['entitlements', 'quotas', 'transactions']) {
      expect(invalidate).toHaveBeenCalledWith(
        { queryKey: [key] },
        { throwOnError: true },
      )
    }
  })

  it('does not offer purchases when access failed to load', async () => {
    accessError = new Error('Unavailable')
    renderPage()
    expect(
      await screen.findByText(messages.Features.loadFailed),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: messages.Features.getLifetimePremium,
      }),
    ).not.toBeInTheDocument()
  })

  it('surfaces transaction errors rather than showing an empty purchase history', async () => {
    mocks.transactions.mockRejectedValue(new Error('Unavailable'))
    renderPage()
    expect(
      await screen.findByText(messages.Features.activityFailed),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(messages.Features.noActivity),
    ).not.toBeInTheDocument()
  })

  it('disables all purchase actions while checkout is open', () => {
    processing = true
    subscribed = [FEATURE_IDS.VOICE_REMINDER_SUB]
    voiceCredits()
    renderPage()
    expect(
      screen.getByRole('button', {
        name: messages.Features.getLifetimePremium,
      }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: messages.Features.enableAddon }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Top up 100 calls · ₹50' }),
    ).toBeDisabled()
  })

  it.each([
    ['hi', { ...messages, ...hindi }],
    ['hi-en', hinglish],
  ])(
    'renders the management and activity flows in %s',
    async (locale, translations) => {
      subscribed = [FEATURE_IDS.VOICE_REMINDER_SUB]
      voiceCredits()
      renderPage(locale, translations)
      expect(
        await screen.findByText(translations.Features.noActivity),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: translations.Features.pageTitle }),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(translations.Features.yourPhoneNumber),
      ).toBeInTheDocument()
    },
  )
})

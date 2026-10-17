'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useFormatter, useTranslations } from 'next-intl'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon, RefreshIcon } from '@hugeicons/core-free-icons'
import { useProfile } from '@/hooks/use-profile'
import { useMonetization } from '@/hooks/use-monetization'
import { useRazorpay } from '@/hooks/use-razorpay'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { PhoneInput } from '@/components/ui/phone-input'
import { toast } from '@/components/ui/toast'
import { isValidE164Phone } from '@/lib/phone'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'
import { FEATURE_IDS, PRODUCT_IDS } from '@/features/monetization/constants'
import { monetizationService } from '@/features/monetization/services/monetization.service'
import type { Transaction } from '@/features/monetization/repositories/monetization.repository'
import { getPaymentProductIcon } from '@/features/monetization/lib/payment-product-icons'
import type { Profile } from '@/types'

function FeatureStatus({
  children,
  active = false,
}: {
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold',
        active && 'bg-primary/10 text-primary',
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  )
}

export default function FeaturesPage() {
  const t = useTranslations('Features')
  const tc = useTranslations('Common')
  const tt = useTranslations('Transactions')
  const format = useFormatter()
  const queryClient = useQueryClient()
  const { profile, updateProfile, isLoading: isLoadingProfile } = useProfile()
  const {
    isLifetimePremium,
    checkEntitlement,
    getQuota,
    entitlements,
    isLoading,
    error,
  } = useMonetization()
  const { processPayment, isProcessing } = useRazorpay()
  const transactions = useQuery<Transaction[]>({
    queryKey: queryKeys.monetization.transactions(),
    queryFn: () => monetizationService.getTransactions(),
  })
  const [profilePhone, setProfilePhone] = useState<string>()
  const [saving, setSaving] = useState<string | null>(null)
  const [isSendingTestCall, setIsSendingTestCall] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [phoneError, setPhoneError] = useState(false)
  const phone = profilePhone ?? profile?.phone ?? ''
  const phoneChanged = phone !== (profile?.phone ?? '')
  const validPhone = isValidE164Phone(phone)
  const voiceQuota = getQuota(FEATURE_IDS.VOICE_REMINDER)
  const remainingCalls = Math.max(
    0,
    (voiceQuota?.limit ?? 0) - (voiceQuota?.used ?? 0),
  )

  function notifyError(error: unknown) {
    toast.add({
      title: tc('error'),
      description: error instanceof Error ? error.message : t('updateFailed'),
      type: 'error',
    })
  }

  async function saveProfile(key: string, changes: Partial<Profile>) {
    setSaving(key)
    try {
      await updateProfile(changes)
      toast.add({
        title: tc('success'),
        description: t('settingsSaved'),
        type: 'success',
      })
    } catch (error) {
      notifyError(error)
    } finally {
      setSaving(null)
    }
  }

  async function refreshAccess() {
    setIsRefreshing(true)
    try {
      await Promise.all([
        queryClient.invalidateQueries(
          { queryKey: queryKeys.monetization.entitlements() },
          { throwOnError: true },
        ),
        queryClient.invalidateQueries(
          { queryKey: queryKeys.monetization.quotas() },
          { throwOnError: true },
        ),
        queryClient.invalidateQueries(
          { queryKey: queryKeys.monetization.transactions() },
          { throwOnError: true },
        ),
      ])
    } catch (error) {
      notifyError(error)
    } finally {
      setIsRefreshing(false)
    }
  }

  async function sendTestCall() {
    setIsSendingTestCall(true)
    try {
      const response = await fetch('/api/notifications/test-voice', {
        method: 'POST',
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || t('testCallFailed'))
      toast.add({
        title: tc('success'),
        description: body.queued ? t('testCallQueued') : t('testCallSent'),
        type: 'success',
      })
      await queryClient.invalidateQueries({
        queryKey: queryKeys.monetization.quotas(),
      })
    } catch (error) {
      notifyError(error)
    } finally {
      setIsSendingTestCall(false)
    }
  }

  const addons = [
    {
      id: 'ai',
      name: t('aiScanner'),
      description: t('aiScannerDesc'),
      productId: PRODUCT_IDS.AI_SCANNER_30D,
      topUpProductId: PRODUCT_IDS.AI_SCAN_250,
      subscriptionId: FEATURE_IDS.AI_SCANNER_SUB,
      quotaId: FEATURE_IDS.AI_SCAN,
      count: 250,
      unit: t('scans'),
    },
    {
      id: 'voice',
      name: t('voiceReminder'),
      description: t('voiceReminderDesc'),
      productId: PRODUCT_IDS.VOICE_REMINDER_30D,
      topUpProductId: PRODUCT_IDS.VOICE_REMINDER_100,
      subscriptionId: FEATURE_IDS.VOICE_REMINDER_SUB,
      quotaId: FEATURE_IDS.VOICE_REMINDER,
      count: 100,
      unit: t('calls'),
    },
  ] as const

  return (
    <div
      className="@container mx-auto w-full min-w-0 max-w-5xl space-y-10 pb-24 pt-2"
      data-testid="features-page"
    >
      <header className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold text-primary">{t('pageEyebrow')}</p>
        <h1 className="font-heading text-[28px] font-semibold leading-[1.1] tracking-tight @min-[420px]:text-[34px] @min-[640px]:text-[40px]">
          {t('pageTitle')}
        </h1>
        <p className="text-[17px] leading-relaxed text-muted-foreground">
          {t('pageDescription')}
        </p>
        <a
          href="#feature-activity"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-primary hover:underline"
        >
          {t('trackPayments')}{' '}
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
        </a>
      </header>

      {isLoading || isLoadingProfile ? (
        <div role="status" className="rounded-lg bg-canvas-parchment p-6">
          {t('loading')}
        </div>
      ) : error || !profile ? (
        <div role="alert" className="space-y-4 rounded-lg border p-6">
          <p>{t('loadFailed')}</p>
          <Button
            variant="outline"
            size="pill"
            onClick={() => window.location.reload()}
          >
            {t('tryAgain')}
          </Button>
        </div>
      ) : (
        <>
          <section
            aria-labelledby="lifetime-title"
            className="overflow-hidden rounded-lg border bg-card"
          >
            <div className="grid gap-6 bg-canvas-parchment p-5 @min-[640px]:grid-cols-[1fr_auto] @min-[640px]:items-center @min-[640px]:p-8">
              <div className="space-y-3">
                <FeatureStatus active={!!isLifetimePremium}>
                  {isLifetimePremium ? t('owned') : t('oneTimeLabel')}
                </FeatureStatus>
                <h2
                  id="lifetime-title"
                  className="text-2xl font-semibold tracking-tight @min-[640px]:text-3xl"
                >
                  {t('lifetimePremium')}
                </h2>
                <p className="max-w-lg text-[17px] leading-relaxed text-muted-foreground">
                  {t('lifetimeAccess')}
                </p>
              </div>
              <div className="space-y-3 @min-[640px]:max-w-64">
                {isLifetimePremium ? (
                  <p className="text-sm font-semibold">
                    {t('alreadyUnlocked')}
                  </p>
                ) : (
                  <>
                    <p className="text-2xl font-semibold tracking-tight">
                      {t('receivingPrice')}
                    </p>
                    <Button
                      size="pill"
                      className="h-auto min-h-11 w-full whitespace-normal py-3 font-normal"
                      disabled={isProcessing}
                      onClick={() =>
                        processPayment({
                          productId: PRODUCT_IDS.LIFETIME_PREMIUM,
                          onSuccess: refreshAccess,
                        })
                      }
                    >
                      {t('getLifetimePremium')}
                    </Button>
                  </>
                )}
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {t('oneTimePurchase')}
                </p>
              </div>
            </div>
            <div className="divide-y px-5 @min-[640px]:px-8">
              <div className="flex items-start justify-between gap-4 py-6">
                <div className="min-w-0 space-y-1">
                  <h3 className="text-[17px] font-semibold">
                    {t('receivingMode')}
                  </h3>
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                    {t('receivingModeDesc')}
                  </p>
                  <p className="pt-2 text-xs font-semibold">
                    {isLifetimePremium
                      ? profile.received_cheques_enabled
                        ? t('inwardEnabled')
                        : t('inwardDisabled')
                      : t('includedPremium')}
                  </p>
                </div>
                {isLifetimePremium && (
                  <div className="flex min-h-11 shrink-0 items-center">
                    <Switch
                      checked={!!profile.received_cheques_enabled}
                      disabled={saving !== null}
                      onCheckedChange={(value) =>
                        saveProfile('inward', {
                          received_cheques_enabled: value,
                        })
                      }
                      aria-label={t('receivingMode')}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start justify-between gap-3 py-6 @min-[640px]:flex-row @min-[640px]:items-center">
                <div className="space-y-1">
                  <h3 className="text-[17px] font-semibold">
                    {t('reportsTitle')}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t('reportsDescription')}
                  </p>
                </div>
                {isLifetimePremium ? (
                  <Link
                    href="/reports"
                    className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm text-primary hover:underline"
                  >
                    {t('openReports')}{' '}
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {t('includedPremium')}
                  </span>
                )}
              </div>
            </div>
          </section>

          <section aria-labelledby="addons-title" className="space-y-5">
            <div className="space-y-2">
              <h2
                id="addons-title"
                className="text-2xl font-semibold tracking-tight"
              >
                {t('addOnServices')}
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {t('addOnServicesDescription')}
              </p>
            </div>
            <div className="grid items-start gap-5 @min-[640px]:grid-cols-2">
              {addons.map((addon) => {
                const subscribed = !!checkEntitlement(addon.subscriptionId)
                const quota = getQuota(addon.quotaId)
                const hasAccess = subscribed || (quota?.limit ?? 0) > 0
                const remaining = Math.max(
                  0,
                  (quota?.limit ?? 0) - (quota?.used ?? 0),
                )
                const isVoice = addon.id === 'voice'
                const paused = isVoice && !profile.voice_call_enabled
                const needsPhone =
                  isVoice && !isValidE164Phone(profile.phone ?? '')
                const status = !hasAccess
                  ? 'notEnabled'
                  : remaining === 0
                    ? 'outOfCredits'
                    : paused
                      ? 'paused'
                      : needsPhone
                        ? 'setupRequired'
                        : 'ready'
                const entitlement = entitlements?.find(
                  (e) => e.feature_id === addon.subscriptionId,
                )
                return (
                  <article
                    key={addon.id}
                    aria-labelledby={`${addon.id}-title`}
                    className="min-w-0 rounded-lg border bg-card"
                  >
                    <div className="space-y-5 p-5 @min-[640px]:p-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex size-11 items-center justify-center rounded-md bg-canvas-parchment text-primary">
                          <HugeiconsIcon
                            icon={getPaymentProductIcon(addon.productId)}
                            className="size-6"
                          />
                        </div>
                        <FeatureStatus active={status === 'ready'}>
                          {t(status)}
                        </FeatureStatus>
                      </div>
                      <div className="space-y-2">
                        <h3
                          id={`${addon.id}-title`}
                          className="text-xl font-semibold tracking-tight"
                        >
                          {addon.name}
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {addon.description}
                        </p>
                      </div>
                      {!subscribed && (
                        <div className="space-y-1">
                          <p className="text-[17px] font-semibold">
                            {t('monthlyPrice')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t('includedUsage', {
                              count: addon.count,
                              unit: addon.unit,
                            })}
                          </p>
                        </div>
                      )}

                      {hasAccess && (
                        <div className="space-y-3 rounded-md bg-canvas-parchment p-4">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                            <p className="text-sm font-semibold">
                              {t('remainingUsage', {
                                count: remaining,
                                unit: addon.unit,
                              })}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {subscribed
                                ? t('activeSubscription')
                                : t('trialAccess')}
                            </span>
                          </div>
                          <Progress
                            value={
                              quota?.limit
                                ? Math.min(
                                    100,
                                    Math.max(
                                      0,
                                      (quota.used / quota.limit) * 100,
                                    ),
                                  )
                                : 0
                            }
                            role="progressbar"
                            aria-label={`${addon.name}: ${t('currentUsage')}`}
                            aria-valuemin={0}
                            aria-valuemax={quota?.limit || 1}
                            aria-valuenow={Math.min(
                              quota?.used ?? 0,
                              quota?.limit || 1,
                            )}
                          />
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {t('usedUsage', {
                              used: quota?.used ?? 0,
                              limit: quota?.limit ?? 0,
                              unit: addon.unit,
                            })}
                          </p>
                          {subscribed && entitlement?.valid_until && (
                            <p className="text-xs text-muted-foreground">
                              {t('accessUntil', {
                                date: format.dateTime(
                                  new Date(entitlement.valid_until),
                                  { dateStyle: 'medium' },
                                ),
                              })}
                            </p>
                          )}
                          {quota?.reset_at &&
                            quota.reset_at !== entitlement?.valid_until && (
                              <p className="text-xs text-muted-foreground">
                                {t('quotaReset', {
                                  date: format.dateTime(
                                    new Date(quota.reset_at),
                                    { dateStyle: 'medium' },
                                  ),
                                })}
                              </p>
                            )}
                          {remaining === 0 && (
                            <p className="text-sm leading-relaxed">
                              {subscribed
                                ? t('topUpToContinue')
                                : t('subscribeToContinue')}
                            </p>
                          )}
                        </div>
                      )}

                      {subscribed ? (
                        <Button
                          size="pill"
                          variant="outline"
                          className="h-auto min-h-11 w-full whitespace-normal py-3 font-normal"
                          disabled={isProcessing}
                          onClick={() =>
                            processPayment({
                              productId: addon.topUpProductId,
                              onSuccess: refreshAccess,
                            })
                          }
                        >
                          {t('topUpOffer', {
                            count: addon.count,
                            unit: addon.unit,
                          })}
                        </Button>
                      ) : (
                        <Button
                          size="pill"
                          className="h-auto min-h-11 w-full whitespace-normal py-3 font-normal"
                          disabled={isProcessing}
                          onClick={() =>
                            processPayment({
                              productId: addon.productId,
                              onSuccess: refreshAccess,
                            })
                          }
                        >
                          {hasAccess
                            ? t('upgradeSubscription')
                            : t('enableAddon')}
                        </Button>
                      )}
                      {!subscribed && hasAccess && (
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {t('topUpRequiresSubscription')}
                        </p>
                      )}
                      {hasAccess && !isVoice && remaining > 0 && (
                        <Link
                          href="/cheques/create"
                          className="inline-flex min-h-11 items-center gap-1 text-sm text-primary hover:underline"
                        >
                          {t('scanCheque')}{' '}
                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            className="size-4"
                          />
                        </Link>
                      )}
                    </div>

                    {isVoice && hasAccess && (
                      <div className="space-y-5 border-t p-5 @min-[640px]:p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <label
                              htmlFor="voice-enabled"
                              className="text-sm font-semibold"
                            >
                              {t('enableService')}
                            </label>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {profile.voice_call_enabled
                                ? t('voiceEnabledHelp')
                                : t('voicePausedHelp')}
                            </p>
                          </div>
                          <div className="flex min-h-11 shrink-0 items-center">
                            <Switch
                              id="voice-enabled"
                              aria-label={t('enableService')}
                              checked={!!profile.voice_call_enabled}
                              disabled={saving !== null || isSendingTestCall}
                              onCheckedChange={(value) =>
                                saveProfile('voice', {
                                  voice_call_enabled: value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <form
                          className="space-y-3"
                          onSubmit={(event) => {
                            event.preventDefault()
                            if (!validPhone) {
                              setPhoneError(true)
                              return
                            }
                            setPhoneError(false)
                            void saveProfile('phone', { phone })
                          }}
                        >
                          <label
                            htmlFor="voice-phone"
                            className="text-sm font-semibold"
                          >
                            {t('yourPhoneNumber')}
                          </label>
                          <PhoneInput
                            id="voice-phone"
                            value={phone}
                            onChange={(value) => {
                              setProfilePhone(value)
                              setPhoneError(false)
                            }}
                            disabled={saving !== null || isSendingTestCall}
                            aria-invalid={
                              phoneError || (!!phone && !validPhone)
                            }
                            className="h-12 rounded-md"
                          />
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {t('countryCodeHelp')}
                          </p>
                          {(phoneError || (!!phone && !validPhone)) && (
                            <p
                              role="alert"
                              className="text-sm text-destructive"
                            >
                              {tc('invalidPhone')}
                            </p>
                          )}
                          {(phoneChanged || needsPhone) && (
                            <Button
                              type="submit"
                              variant="outline"
                              size="pill"
                              className="w-full font-normal"
                              disabled={
                                saving !== null ||
                                !phoneChanged ||
                                isSendingTestCall
                              }
                            >
                              {saving === 'phone'
                                ? t('savingPhone')
                                : t('savePhone')}
                            </Button>
                          )}
                        </form>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="pill"
                            className="w-full font-normal"
                            disabled={
                              isSendingTestCall ||
                              saving !== null ||
                              !profile.voice_call_enabled ||
                              !validPhone ||
                              phoneChanged ||
                              remainingCalls === 0
                            }
                            onClick={sendTestCall}
                          >
                            {isSendingTestCall
                              ? t('sendingTestCall')
                              : t('sendTestCall')}
                          </Button>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {phoneChanged
                              ? t('saveBeforeTest')
                              : !validPhone
                                ? t('saveValidPhone')
                                : !profile.voice_call_enabled
                                  ? t('enableBeforeTest')
                                  : t('testCallHelp')}
                          </p>
                        </div>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        </>
      )}

      <section
        id="feature-activity"
        aria-labelledby="activity-title"
        className="scroll-mt-24 space-y-5 border-t pt-8"
      >
        <div className="flex flex-col justify-between gap-3 @min-[640px]:flex-row @min-[640px]:items-center">
          <div className="space-y-2">
            <h2
              id="activity-title"
              className="text-xl font-semibold tracking-tight"
            >
              {t('activityTitle')}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t('activityDescription')}
            </p>
          </div>
          <Button
            variant="outline"
            size="pill"
            disabled={isRefreshing || transactions.isFetching}
            onClick={refreshAccess}
            className="self-start font-normal"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              className={cn(
                'size-4',
                isRefreshing && 'motion-safe:animate-spin',
              )}
            />{' '}
            {t('refreshStatus')}
          </Button>
        </div>
        <div aria-live="polite">
          {transactions.isPending ? (
            <p role="status" className="text-sm text-muted-foreground">
              {t('loadingActivity')}
            </p>
          ) : transactions.isError ? (
            <p role="alert" className="text-sm text-destructive">
              {t('activityFailed')}
            </p>
          ) : !transactions.data?.length ? (
            <p className="rounded-lg bg-canvas-parchment p-5 text-sm text-muted-foreground">
              {t('noActivity')}
            </p>
          ) : (
            <ul className="divide-y rounded-lg border px-5 @min-[640px]:px-6">
              {transactions.data.slice(0, 3).map((transaction) => {
                const name =
                  transaction.feature_id === FEATURE_IDS.LIFETIME_PREMIUM
                    ? t('lifetimePremium')
                    : transaction.feature_id === FEATURE_IDS.AI_SCAN ||
                        transaction.feature_id === FEATURE_IDS.AI_SCANNER_SUB
                      ? t('aiScanner')
                      : t('voiceReminder')
                return (
                  <li key={transaction.id} className="space-y-3 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-semibold">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {tt(
                            transaction.type === 'top_up'
                              ? 'topUp'
                              : transaction.type === 'lifetime'
                                ? 'lifetimePremium'
                                : 'subscription',
                          )}{' '}
                          &middot;{' '}
                          {format.dateTime(new Date(transaction.created_at), {
                            dateStyle: 'medium',
                          })}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm tabular-nums">
                          {format.number(transaction.amount / 100, {
                            style: 'currency',
                            currency: transaction.currency,
                          })}
                        </span>
                        <FeatureStatus
                          active={transaction.status === 'captured'}
                        >
                          {tt(transaction.status)}
                        </FeatureStatus>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {t(
                        transaction.status === 'captured'
                          ? 'paymentCapturedHelp'
                          : transaction.status === 'authorized'
                            ? 'paymentAuthorizedHelp'
                            : transaction.status === 'created'
                              ? 'paymentCreatedHelp'
                              : transaction.status === 'failed'
                                ? 'paymentFailedHelp'
                                : 'paymentRefundedHelp',
                      )}
                    </p>
                    <p className="break-all text-xs text-muted-foreground">
                      {tt('orderId')}:{' '}
                      {transaction.razorpay_order_id ?? transaction.id}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <Link
          href="/settings/transactions"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-primary hover:underline"
        >
          {t('allTransactions')}{' '}
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
        </Link>
      </section>
    </div>
  )
}

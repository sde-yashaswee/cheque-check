'use client'

import { useCreateAccount } from '@/hooks/use-create-account'
import { useProfile } from '@/hooks/use-profile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyPrefixInput } from '@/components/ui/currency-prefix-input'
import { Label } from '@/components/ui/label'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon as ArrowLeft,
  ArrowRight01Icon as ArrowRight,
  Tick02Icon as Check,
  CreditCardIcon as CreditCard,
  UserIcon as User,
  HashtagIcon as Hash,
  Invoice01Icon as ReceiptText,
  TextFontIcon as TextIcon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTrigger,
} from '@/components/reui/stepper'
import { useEffect, useState } from 'react'
import { getSafeChequeReturnTo } from '@/lib/cheque-draft'
import { DraftLeaveDialog, DraftSaveFab, DraftToolbar } from '@/features/drafts'
import { Checkbox } from '@/components/ui/checkbox'
import { CreationSuccessScreen } from '@/components/ui/creation-success-screen'
import { TagSelector } from '@/features/tags/components/tag-selector'
import { tagService } from '@/features/tags/services/tag.service'

const BankSelector = dynamic(
  () => import('@/components/bank-selector').then((mod) => mod.BankSelector),
  {
    loading: () => <Skeleton className="h-14 w-full rounded-2xl" />,
    ssr: false,
  },
)

export default function CreateAccountPage() {
  const t = useTranslations('Accounts')
  const tc = useTranslations('Common')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { activeBusiness } = useBusiness()
  const { profile } = useProfile()
  const currency = profile?.currency || '₹'
  const returnTo = getSafeChequeReturnTo(searchParams.get('returnTo'))
  // Read once: autosave later writes a new draftId into the URL for the same form.
  const [initialDraftId] = useState(() => searchParams.get('draftId'))
  const [prefill] = useState(() => ({
    name: searchParams.get('name'),
    number: searchParams.get('number'),
    ifsc: searchParams.get('ifsc'),
    auto: searchParams.get('auto') === 'true',
  }))
  const [tagIds, setTagIds] = useState<string[]>([])

  const {
    form,
    step,
    nextStep,
    prevStep,
    isSaving,
    isSuccess,
    continueAfterSuccess,
    onSubmit,
    draft,
  } = useCreateAccount(activeBusiness?.id, {
    returnTo,
    draftId: initialDraftId,
    onCreated: async (account) => {
      await Promise.all(
        tagIds.map((tagId) =>
          tagService.attach({
            tag_id: tagId,
            entity_type: 'account',
            entity_id: account.id,
          }),
        ),
      )
    },
  })

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form
  const { setUserValue } = draft

  useEffect(() => {
    if (initialDraftId) return
    if (prefill.name) setValue('account_name', prefill.name)
    if (prefill.number) setValue('account_number', prefill.number)
    if (prefill.ifsc) setValue('ifsc_code', prefill.ifsc)
    if (prefill.auto)
      setValue('notes', 'Automatically Generated from Cheque Scan')
  }, [initialDraftId, prefill, setValue])

  const colors = [
    '#007AFF',
    '#5856D6',
    '#AF52DE',
    '#FF2D55',
    '#FF3B30',
    '#FF9500',
    '#34C759',
  ]

  if (isSuccess) {
    return (
      <div className="max-w-2xl">
        <CreationSuccessScreen
          title={t('successTitle')}
          description={t('successDescription')}
          ctaLabel={t('successCta')}
          onContinue={continueAfterSuccess}
        />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      {prefill.auto && !initialDraftId && (
        <div className="bg-primary/5 border border-primary/10 rounded-sm p-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <p className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
            <HugeiconsIcon icon={ReceiptText} className="h-4 w-4" />
            Automatically Generated from Cheque Scan
          </p>
        </div>
      )}

      <Stepper
        value={step}
        className="w-full max-w-xl mx-auto space-y-8"
        indicators={{
          completed: <HugeiconsIcon icon={Check} className="size-3.5" />,
        }}
      >
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevStep}
            disabled={step === 1}
            className="rounded-full h-8 w-8 shrink-0 hover:bg-canvas-parchment"
          >
            <HugeiconsIcon icon={ArrowLeft} className="h-4 w-4" />
          </Button>

          <StepperNav className="gap-3 flex-1">
            {[
              {
                title: t('accountInfo'),
                icon: <HugeiconsIcon icon={User} className="size-4" />,
              },
              {
                title: t('bankDetails'),
                icon: <HugeiconsIcon icon={CreditCard} className="size-4" />,
              },
              {
                title: t('moreDetails'),
                icon: <HugeiconsIcon icon={Hash} className="size-4" />,
              },
            ].map((s, index) => (
              <StepperItem
                key={index}
                step={index + 1}
                className="relative flex-1 items-center"
              >
                <StepperTrigger className="flex grow flex-col items-center justify-center gap-2.5">
                  <StepperIndicator className="data-[state=inactive]:border-border data-[state=inactive]:text-muted-foreground data-[state=completed]:bg-success size-8 border-2 data-[state=completed]:text-white data-[state=inactive]:bg-background z-10">
                    {s.icon}
                  </StepperIndicator>
                </StepperTrigger>
                {3 > index + 1 && (
                  <StepperSeparator className="group-data-[state=completed]/step:bg-success absolute inset-x-0 left-[50%] top-4 m-0 w-full z-0" />
                )}
              </StepperItem>
            ))}
          </StepperNav>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextStep}
            disabled={step === 3 || (step === 1 && !watch('bank_id'))}
            className="rounded-full h-8 w-8 shrink-0 hover:bg-canvas-parchment"
          >
            <HugeiconsIcon icon={ArrowRight} className="h-4 w-4" />
          </Button>
        </div>
      </Stepper>

      <DraftToolbar status={draft.status} />
      <DraftLeaveDialog {...draft.leaveDialogProps} />
      <DraftSaveFab
        status={draft.status}
        hasUserChanges={draft.hasUserChanges}
        onSave={() => void draft.saveDraft()}
      />

      <form onSubmit={onSubmit} className="space-y-8">
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  {t('selectBank')}
                </Label>
                <BankSelector
                  value={watch('bank_id')}
                  onValueChange={(val) => setUserValue('bank_id', val)}
                  className="rounded-sm"
                />
                {errors.bank_id && (
                  <p className="text-xs text-destructive ml-1">
                    {errors.bank_id.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                  {tc('themeColor')}
                </Label>
                <div className="flex flex-wrap gap-3 p-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setUserValue('color', c)}
                      className={cn(
                        'h-10 w-10 rounded-full transition-all active:scale-95 ring-offset-2',
                        (watch as any)('color') === c
                          ? 'ring-2 ring-primary scale-110'
                          : 'hover:scale-105',
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="button"
              data-testid="account-step1-continue"
              className="w-full rounded-full h-14 text-lg"
              onClick={nextStep}
              disabled={!watch('bank_id')}
            >
              {tc('continue')}{' '}
              <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label
                htmlFor="account_name"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {t('accountName')}
              </Label>
              <div className="relative">
                <HugeiconsIcon
                  icon={User}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"
                />
                <Input
                  leftIcon={TextIcon}
                  id="account_name"
                  {...register('account_name')}
                  placeholder={t('accountNamePlaceholder')}
                  className="h-14  bg-canvas-parchment border-none rounded-sm"
                />
              </div>
              {errors.account_name && (
                <p className="text-xs text-destructive ml-1">
                  {errors.account_name.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="account_number"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {t('accountNumber')}
              </Label>
              <div className="relative">
                <HugeiconsIcon
                  icon={CreditCard}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"
                />
                <Input
                  leftIcon={TextIcon}
                  id="account_number"
                  {...register('account_number')}
                  placeholder={t('accountNumberPlaceholder')}
                  className="h-14  bg-canvas-parchment border-none rounded-sm"
                />
              </div>
              {errors.account_number && (
                <p className="text-xs text-destructive ml-1">
                  {errors.account_number.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="opening_balance"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {t('openingBalance')}
              </Label>
              <CurrencyPrefixInput
                currency={currency}
                id="opening_balance"
                type="number"
                step="0.01"
                inputMode="decimal"
                {...register('opening_balance', { valueAsNumber: true })}
                placeholder="0.00"
                className="h-14 bg-canvas-parchment border-none rounded-sm"
              />
              {errors.opening_balance && (
                <p className="text-xs text-destructive ml-1">
                  {errors.opening_balance.message as string}
                </p>
              )}
            </div>
            <label className="flex items-center gap-3 rounded-sm border border-primary/10 bg-primary/5 p-4">
              <Checkbox
                checked={watch('is_default')}
                onCheckedChange={(checked) =>
                  setUserValue('is_default', checked === true)
                }
              />
              <span className="text-sm font-semibold">{t('setAsDefault')}</span>
            </label>

            <Button
              type="button"
              data-testid="account-step2-continue"
              className="w-full rounded-full h-14 text-lg"
              onClick={nextStep}
              disabled={!watch('account_name') || !watch('account_number')}
            >
              {tc('continue')}{' '}
              <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label
                htmlFor="ifsc_code"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {t('ifscCode')}
              </Label>
              <div className="relative">
                <HugeiconsIcon
                  icon={Hash}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"
                />
                <Input
                  leftIcon={TextIcon}
                  id="ifsc_code"
                  {...register('ifsc_code')}
                  placeholder={t('ifscPlaceholder')}
                  className="h-14  bg-canvas-parchment border-none uppercase rounded-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                {tc('tags')}
              </Label>
              <TagSelector
                businessId={activeBusiness?.id}
                value={tagIds}
                onChange={setTagIds}
                placeholder={tc('addTags')}
              />
            </div>

            <Button
              type="submit"
              data-testid="account-submit-button"
              className="w-full rounded-full h-14 text-lg"
              disabled={isSaving}
            >
              {isSaving ? t('addingAccount') : t('addAccount')}{' '}
              <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>
    </div>
  )
}

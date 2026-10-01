'use client'

import { useCreateCheque } from '@/hooks/use-create-cheque'
import { useParties } from '@/hooks/use-parties'
import { useAccounts } from '@/hooks/use-accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyPrefixInput } from '@/components/ui/currency-prefix-input'
import { Label } from '@/components/ui/label'
import { useSearchParams } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon as ArrowLeft,
  ArrowRight01Icon as ArrowRight,
  Tick02Icon as Check,
  Camera01Icon as Camera,
  Cancel01Icon as X,
  ArrowUpRight01Icon as ArrowUpRight,
  ArrowDownLeft01Icon as ArrowDownLeft,
  Invoice01Icon as ReceiptText,
  UserIcon as User,
  CreditCardIcon as CreditCard,
  BankIcon as Bank,
  Delete02Icon as Trash,
  HashtagIcon as Hash,
  Calendar03Icon as Calendar,
  Note01Icon as Note,
  Loading03Icon,
} from '@hugeicons/core-free-icons'
import { cn, numberToIndianWords } from '@/lib/utils'
import { useBusiness } from '@/hooks/use-business'
import { Combobox } from '@/components/ui/combobox'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { SkeletonImage } from '@/components/ui/skeleton-image'
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTrigger,
} from '@/components/reui/stepper'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreationSuccessScreen } from '@/components/ui/creation-success-screen'
import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import { useBanks } from '@/hooks/use-banks'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import type { Account, Party } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { BankSelector } from '@/components/bank-selector'
import { ScanStore } from '@/lib/scan-store'
import { useProfile } from '@/hooks/use-profile'
import { buildChequeReturnTo } from '@/lib/cheque-draft'
import { TagSelector } from '@/features/tags/components/tag-selector'
import { tagService } from '@/features/tags/services/tag.service'
import { useOcrExtraction } from '@/features/cheques/hooks/use-ocr-extraction'
import {
  chequeDraftService,
  DraftLeaveDialog,
  DraftSaveFab,
  DraftToolbar,
} from '@/features/drafts'

export default function CreateChequePage() {
  const t = useTranslations('Cheques')
  const tCommon = useTranslations('Common')
  const tDrafts = useTranslations('Drafts')
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')
  const imageUrlParam = searchParams.get('imageUrl')
  // Computed once at mount: whether the user arrived here from scanning/OCR,
  // so the photo widget can be shown first instead of buried at the bottom.
  const [cameFromScan] = useState(() => !!imageUrlParam || ScanStore.hasFile())
  // Read once: autosave later writes a new draftId into the URL for the same form.
  const [initialDraftId] = useState(() => searchParams.get('draftId'))
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id
  const { profile } = useProfile()
  const currency = profile?.currency || '₹'
  const [tagIds, setTagIds] = useState<string[]>([])
  const { data: banks } = useBanks()

  const {
    form,
    step,
    nextStep,
    prevStep,
    isUploading,
    handleImageUpload,
    isSaving,
    isSuccess,
    continueAfterSuccess,
    onSubmit,
    draft,
  } = useCreateCheque(businessId, typeParam, {
    draftId: initialDraftId,
    onCreated: async (cheque) => {
      await Promise.all(
        tagIds.map((tagId) =>
          tagService.attach({
            tag_id: tagId,
            entity_type: 'cheque',
            entity_id: cheque.id,
          }),
        ),
      )
    },
  })

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form
  const { setUserValue } = draft

  const openCreatePage = (path: string, params: Record<string, string> = {}) =>
    draft.navigateAfterSave(
      (id) =>
        `${path}?${new URLSearchParams({ ...params, returnTo: buildChequeReturnTo(id) })}`,
    )

  const chequeNumber = watch('cheque_number') ?? ''
  const selectedAccountId = watch('account_id')
  const { data: hasNumberConflict } = useQuery({
    queryKey: queryKeys.cheques.numberConflict(
      businessId,
      selectedAccountId,
      chequeNumber,
    ),
    queryFn: () =>
      chequeDraftService.hasNumberConflict(
        businessId!,
        selectedAccountId,
        chequeNumber,
      ),
    enabled:
      !!businessId && !!selectedAccountId && /^\d{6}$/.test(chequeNumber),
  })
  const numberConflictWarning = (
    <p
      className={cn(
        'text-xs text-amber-600 ml-1 min-h-4',
        !hasNumberConflict && 'invisible',
      )}
    >
      {hasNumberConflict ? tDrafts('duplicateNumber') : '\u00A0'}
    </p>
  )

  const { parties } = useParties(businessId)
  const { accounts } = useAccounts(businessId)

  useEffect(() => {
    if (!watch('account_id')) {
      const defaultAccount = accounts?.find((account) => account.is_default)
      if (defaultAccount) setValue('account_id', defaultAccount.id)
    }
  }, [accounts, setValue, watch])

  const {
    isExtracting,
    unmatchedEntities,
    setUnmatchedEntities,
    createOptions,
    setCreateOptions,
    isCreatingInline,
    extractData,
    handleInlineCreate,
  } = useOcrExtraction({
    businessId,
    imageUrlParam,
    parties,
    accounts,
    banks,
    watch,
    setValue,
    handleImageUpload,
  })

  const partyOptions =
    parties?.map((p: Party) => ({
      label: p.name,
      value: p.id,
      color: (p as any).color,
      icon: (p as any).icon,
      imageUrl: (p as any).avatar_url,
    })) || []

  const accountOptions =
    accounts?.map((b: Account) => ({
      label: `${(b as any).bank?.name || tCommon('bank')} (${b.account_number.slice(-4)})`,
      value: b.id,
      color: (b as any).color,
      icon: (b as any).icon,
      imageUrl: (b as any).bank?.logo_url,
    })) || []

  const selectedParty = parties?.find((p: Party) => p.id === watch('party_id'))
  const selectedAccount = accounts?.find(
    (a: Account) => a.id === watch('account_id'),
  )

  const amountInWords = numberToIndianWords(watch('amount') || 0, currency)

  const photoWidget = (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
        {t('photo')}
      </Label>
      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-canvas-parchment/30 min-h-[140px] transition-colors hover:bg-canvas-parchment/50 border-primary/10 relative overflow-hidden">
        {watch('image_url' as any) ? (
          <div className="relative w-full aspect-video rounded-sm overflow-hidden border">
            <SkeletonImage
              src={watch('image_url' as any)}
              alt="Cheque"
              containerClassName="h-full w-full"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => setUserValue('image_url', null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors z-20"
            >
              <HugeiconsIcon icon={X} className="h-4 w-4" />
            </button>
            {isExtracting && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-10 animate-in fade-in duration-300">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="h-7 w-7 animate-spin"
                  />
                </div>
                <div className="text-center">
                  <span className="text-sm font-semibold text-primary block">
                    {t('loading')}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                    {t('photoInstruction')}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center gap-3 cursor-pointer py-6 w-full relative">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {isUploading || isExtracting ? (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="h-7 w-7 animate-spin"
                />
              ) : (
                <HugeiconsIcon icon={Camera} className="h-7 w-7" />
              )}
            </div>
            <div className="text-center">
              <span className="text-sm font-semibold text-primary block">
                {isUploading || isExtracting ? t('loading') : t('scanUpload')}
              </span>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                {t('photoInstruction')}
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const url = await handleImageUpload(file)
                  if (url) extractData(url)
                }
              }}
              disabled={isUploading || isExtracting}
            />
          </label>
        )}
      </div>
    </div>
  )

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
      <div className="flex flex-col gap-4">
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
                  title: t('scanDetails'),
                  icon: <HugeiconsIcon icon={Camera} className="size-4" />,
                },
                {
                  title: t('entities'),
                  icon: <HugeiconsIcon icon={User} className="size-4" />,
                },
                {
                  title: t('datesReview'),
                  icon: <HugeiconsIcon icon={ReceiptText} className="size-4" />,
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
              disabled={
                step === 3 ||
                (step === 1 && !watch('amount')) ||
                (step === 2 && (!watch('party_id') || !watch('account_id')))
              }
              className="rounded-full h-8 w-8 shrink-0 hover:bg-canvas-parchment"
            >
              <HugeiconsIcon icon={ArrowRight} className="h-4 w-4" />
            </Button>
          </div>
        </Stepper>
      </div>

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
            {cameFromScan && photoWidget}

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                {t('type')}
              </Label>
              <Tabs
                value={watch('type')}
                onValueChange={(value) =>
                  setUserValue('type', value as 'Outward' | 'Inward')
                }
              >
                <TabsList className="h-14 w-full rounded-lg bg-canvas-parchment p-1">
                  <TabsTrigger
                    value="Outward"
                    data-testid="cheque-type-outward"
                    className={cn(
                      'h-full flex-1 gap-2 rounded-md text-xs font-semibold uppercase tracking-wider',
                      'data-active:bg-primary data-active:text-white',
                    )}
                  >
                    <HugeiconsIcon icon={ArrowUpRight} className="h-4 w-4" />
                    {t('issued')}
                  </TabsTrigger>
                  <TabsTrigger
                    value="Inward"
                    data-testid="cheque-type-inward"
                    className={cn(
                      'h-full flex-1 gap-2 rounded-md text-xs font-semibold uppercase tracking-wider',
                      'data-active:bg-green-500 data-active:text-white',
                    )}
                  >
                    <HugeiconsIcon icon={ArrowDownLeft} className="h-4 w-4" />
                    {t('received')}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="amount"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {t('amount')}
              </Label>
              <CurrencyPrefixInput
                currency={currency}
                id="amount"
                type="number"
                min={0}
                step="any"
                data-testid="cheque-amount-input"
                {...register('amount', { valueAsNumber: true })}
                className="h-12 font-semibold rounded-sm"
              />
              <div className="flex flex-col gap-1 ml-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {amountInWords}
                </p>
              </div>
              <p
                className={cn(
                  'text-xs text-destructive ml-1 min-h-4',
                  !errors.amount && 'invisible',
                )}
              >
                {(errors.amount?.message as string) || '\u00A0'}
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="cheque_number"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {t('chequeNumber')}
              </Label>
              <Input
                leftIcon={Hash}
                id="cheque_number"
                inputMode="numeric"
                maxLength={6}
                data-testid="cheque-number-input"
                {...register('cheque_number')}
                placeholder={t('chequeNumberPlaceholder')}
                className="h-12 rounded-sm"
              />
              <p
                className={cn(
                  'text-xs text-destructive ml-1 min-h-4',
                  !errors.cheque_number && 'invisible',
                )}
              >
                {(errors.cheque_number?.message as string) || '\u00A0'}
              </p>
              {numberConflictWarning}
            </div>

            {!cameFromScan && photoWidget}

            <Button
              type="button"
              data-testid="cheque-step1-continue"
              className="w-full rounded-full h-14 text-lg"
              onClick={nextStep}
            >
              {tCommon('continue')}{' '}
              <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                {t('party')}
              </Label>
              <Combobox
                options={partyOptions}
                value={watch('party_id')}
                onValueChange={(val) => setUserValue('party_id', val)}
                placeholder={t('partyPlaceholder')}
                createLabel={t('addParty')}
                testId="cheque-party-combobox"
                onCreateClick={(query) =>
                  openCreatePage('/parties/create', { name: query })
                }
                className="h-14 bg-canvas-parchment border-none rounded-sm"
              />
              <p
                className={cn(
                  'text-xs text-destructive ml-1 min-h-4',
                  !errors.party_id && 'invisible',
                )}
              >
                {(errors.party_id?.message as string) || '\u00A0'}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                {t('account')}
              </Label>
              <Combobox
                options={accountOptions}
                value={watch('account_id')}
                onValueChange={(val) => setUserValue('account_id', val)}
                placeholder={t('accountPlaceholder')}
                createLabel={t('addAccount')}
                testId="cheque-account-combobox"
                onCreateClick={(query) =>
                  openCreatePage('/accounts/create', {
                    name: unmatchedEntities?.account_name || query,
                    number: unmatchedEntities?.account_number || '',
                    ifsc: unmatchedEntities?.ifsc_code || '',
                    auto: unmatchedEntities?.account_name ? 'true' : 'false',
                  })
                }
                className="h-14 bg-canvas-parchment border-none rounded-sm"
              />
              <p
                className={cn(
                  'text-xs text-destructive ml-1 min-h-4',
                  !errors.account_id && 'invisible',
                )}
              >
                {(errors.account_id?.message as string) || '\u00A0'}
              </p>
              {numberConflictWarning}
            </div>

            <Button
              type="button"
              data-testid="cheque-step2-continue"
              className="w-full rounded-full h-14 text-lg"
              onClick={nextStep}
              disabled={!watch('party_id') || !watch('account_id')}
            >
              {tCommon('continue')}{' '}
              <HugeiconsIcon icon={ArrowRight} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="space-y-2">
              <Label
                htmlFor="cheque_date"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {t('chequeDate')}
              </Label>
              <Input
                leftIcon={Calendar}
                id="cheque_date"
                type="date"
                data-testid="cheque-date-input"
                {...register('cheque_date')}
                className="h-12 rounded-sm"
              />
              {errors.cheque_date && (
                <p className="text-xs text-destructive ml-1">
                  {errors.cheque_date.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="deposit_date"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {t('depositDate')}
              </Label>
              <Input
                leftIcon={Calendar}
                id="deposit_date"
                type="date"
                {...register('deposit_date')}
                className="h-14 bg-canvas-parchment border-none rounded-sm"
              />
              {errors.deposit_date && (
                <p className="text-xs text-destructive ml-1">
                  {errors.deposit_date.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
              >
                {t('notes')}
              </Label>
              <Input
                leftIcon={Note}
                id="notes"
                {...register('notes')}
                placeholder={t('notesPlaceholder')}
                className="h-14 bg-canvas-parchment border-none rounded-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
                {t('tags')}
              </Label>
              <TagSelector
                businessId={businessId}
                value={tagIds}
                onChange={setTagIds}
                placeholder={t('addTags')}
              />
            </div>

            <div className="rounded-lg bg-primary/5 p-6 space-y-4 border border-primary/10">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={ReceiptText}
                  className="h-3 w-3 text-primary opacity-80"
                />
                <h3 className="font-semibold text-primary uppercase tracking-wider text-[10px]">
                  {t('summary')}
                </h3>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">
                  {t('amount')}
                </span>
                <span className="text-xl font-semibold text-primary">
                  {currency}
                  {Number(watch('amount') || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">
                  {t('number')}
                </span>
                <span className="font-semibold font-mono bg-white px-2 py-0.5 rounded border border-primary/10 text-primary">
                  #{watch('cheque_number')}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">
                  {t('party')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {selectedParty?.name || '-'}
                  </span>
                  {selectedParty && (
                    <EntityAvatar
                      name={selectedParty.name}
                      color={(selectedParty as any).color}
                      icon={(selectedParty as any).icon}
                      imageUrl={(selectedParty as any).avatar_url}
                      size="sm"
                    />
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-semibold">
                  {t('account')}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {selectedAccount
                      ? `${(selectedAccount as any).bank?.name || tCommon('bank')} (${selectedAccount.account_number.slice(-4)})`
                      : '-'}
                  </span>
                  {selectedAccount && (
                    <EntityAvatar
                      name={
                        (selectedAccount as any).bank?.name || tCommon('bank')
                      }
                      color={(selectedAccount as any).color}
                      icon={(selectedAccount as any).icon}
                      imageUrl={(selectedAccount as any).bank?.logo_url}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            </div>

            {numberConflictWarning}
            <Button
              type="submit"
              data-testid="cheque-submit-button"
              className="w-full rounded-full h-14 text-lg"
              disabled={isSaving}
            >
              {isSaving ? tCommon('saving') : t('saveAction')}{' '}
              <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </form>

      <Dialog
        open={!!unmatchedEntities}
        onOpenChange={(open) => !open && setUnmatchedEntities(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('newEntitiesFound')}</DialogTitle>
            <DialogDescription>
              We found a party and/or account on the cheque that aren&apos;t in
              your business. Would you like to create them?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {unmatchedEntities?.payee_name && (
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-canvas-parchment/30">
                <Checkbox
                  id="create-party"
                  checked={createOptions.party}
                  onCheckedChange={(checked) =>
                    setCreateOptions((prev) => ({ ...prev, party: !!checked }))
                  }
                  className="mt-1"
                />
                <div className="flex-1 grid gap-1.5 leading-none">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={User}
                      className="h-3 w-3 text-primary"
                    />
                    <label
                      htmlFor="create-party"
                      className="text-sm font-semibold"
                    >
                      Create Party: {unmatchedEntities.payee_name}
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This name was extracted as the payee.
                  </p>
                </div>
              </div>
            )}

            {unmatchedEntities?.account_number && (
              <div className="space-y-4 p-3 rounded-lg border bg-canvas-parchment/30">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="create-account"
                    checked={createOptions.account}
                    onCheckedChange={(checked) =>
                      setCreateOptions((prev) => ({
                        ...prev,
                        account: !!checked,
                      }))
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 grid gap-1.5 leading-none">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={CreditCard}
                        className="h-3 w-3 text-primary"
                      />
                      <label
                        htmlFor="create-account"
                        className="text-sm font-semibold"
                      >
                        Create Account:{' '}
                        {unmatchedEntities.account_name ||
                          unmatchedEntities.account_number}
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Extracted account details from the scan.
                    </p>
                  </div>
                </div>

                {createOptions.account && (
                  <div className="space-y-2 ml-7">
                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <HugeiconsIcon icon={Bank} className="h-3 w-3" />
                      Select Bank
                    </Label>
                    <BankSelector
                      value={unmatchedEntities.bank_id}
                      onValueChange={(val) =>
                        setUnmatchedEntities((prev) =>
                          prev ? { ...prev, bank_id: val } : null,
                        )
                      }
                      className="h-10 text-sm rounded-xl"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex-row gap-3">
            <Button
              variant="ghost"
              className="flex-1 rounded-full gap-2"
              onClick={() => setUnmatchedEntities(null)}
            >
              <HugeiconsIcon icon={Trash} className="h-4 w-4" />
              Skip
            </Button>
            <Button
              className="flex-1 rounded-full gap-2"
              onClick={handleInlineCreate}
              disabled={
                isCreatingInline ||
                (!createOptions.party && !createOptions.account)
              }
            >
              {isCreatingInline ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <HugeiconsIcon icon={Check} className="h-4 w-4" />
              )}
              {isCreatingInline ? 'Creating...' : 'Create Selected'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

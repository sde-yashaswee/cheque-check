'use client'

import { useEditCheque } from '@/hooks/use-edit-cheque'
import { useParties } from '@/hooks/use-parties'
import { useAccounts } from '@/hooks/use-accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyPrefixInput } from '@/components/ui/currency-prefix-input'
import { Label } from '@/components/ui/label'
import { useParams } from 'next/navigation'
import {
  Calendar03Icon as Calendar,
  HashtagIcon as Hash,
  Note01Icon as Note,
  Tick02Icon as Check,
  Delete02Icon as Trash2,
  ArrowUpRight01Icon as ArrowUpRight,
  ArrowDownLeft01Icon as ArrowDownLeft,
  Camera01Icon as Camera,
  Cancel01Icon as X,
  Invoice01Icon as ReceiptText,
  UserIcon as User,
  Loading03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn, numberToIndianWords } from '@/lib/utils'
import { useBusiness } from '@/hooks/use-business'
import { Combobox } from '@/components/ui/combobox'
import { FormSection } from '@/components/ui/form-section'
import { Skeleton } from '@/components/ui/skeleton'
import { SkeletonImage } from '@/components/ui/skeleton-image'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import dynamic from 'next/dynamic'
import { Party, AccountWithRelations } from '@/types'
import { useTranslations } from 'next-intl'
import { useProfile } from '@/hooks/use-profile'

const DeleteConfirmationDialog = dynamic(
  () =>
    import('@/components/ui/delete-dialog').then(
      (mod) => mod.DeleteConfirmationDialog,
    ),
  {
    loading: () => <Skeleton className="h-14 w-full rounded-full" />,
    ssr: false,
  },
)

export default function EditChequePage() {
  const t = useTranslations('Cheques')
  const tCommon = useTranslations('Common')
  const { id } = useParams() as { id: string }
  const { activeBusiness } = useBusiness()
  const businessId = activeBusiness?.id
  const { profile } = useProfile()
  const currency = profile?.currency || '₹'

  const {
    form,
    cheque,
    isLoading,
    isSaving,
    isUploading,
    handleImageUpload,
    onSubmit,
    onDelete,
  } = useEditCheque(id)

  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form

  const { parties } = useParties(businessId)

  const { accounts } = useAccounts(businessId)

  const partyOptions =
    parties?.map((p: Party) => ({
      label: p.name,
      value: p.id,
      color: p.color,
      icon: p.icon,
      imageUrl: p.avatar_url,
    })) || []

  const accountOptions =
    accounts?.map((b: AccountWithRelations) => ({
      label: `${b.bank?.name || tCommon('bank')} (${b.account_number.slice(-4)})`,
      value: b.id,
      color: b.color,
      icon: b.icon,
      imageUrl: b.bank?.logo_url,
    })) || []

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-36 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-sm" />
        <Skeleton className="h-12 w-full rounded-sm" />
        <Skeleton className="h-14 w-full rounded-sm" />
        <Skeleton className="h-14 w-full rounded-sm" />
      </div>
    )
  }

  const setField = <K extends 'type' | 'party_id' | 'account_id'>(
    field: K,
    value: string,
  ) => setValue(field, value as never, { shouldDirty: true })
  const imageUrl = watch('image_url')
  const isBusy = isUploading || isSaving

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <form onSubmit={onSubmit} className="space-y-10">
        <FormSection title={t('scanDetails')} icon={Camera}>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              {t('photo')}
            </Label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-canvas-parchment/30 min-h-[140px] transition-colors hover:bg-canvas-parchment/50 border-primary/10 relative overflow-hidden">
              {imageUrl ? (
                <div className="relative w-full aspect-video rounded-sm overflow-hidden border">
                  <SkeletonImage
                    src={imageUrl}
                    alt={t('photo')}
                    containerClassName="h-full w-full"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    disabled={isBusy}
                    aria-label={t('removePhoto')}
                    onClick={() =>
                      setValue('image_url', null, { shouldDirty: true })
                    }
                    className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors z-20"
                  >
                    <HugeiconsIcon icon={X} className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  className={cn(
                    'flex flex-col items-center gap-3 cursor-pointer py-6 w-full relative',
                    isBusy && 'pointer-events-none opacity-50',
                  )}
                >
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <HugeiconsIcon
                      icon={isUploading ? Loading03Icon : Camera}
                      className={cn('h-7 w-7', isUploading && 'animate-spin')}
                    />
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-semibold text-primary block">
                      {isUploading ? t('uploading') : t('scanUpload')}
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
                    disabled={isBusy}
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      event.target.value = ''
                      if (file) void handleImageUpload(file)
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              {t('type')}
            </Label>
            <Tabs
              value={watch('type')}
              onValueChange={(value) => setField('type', value as string)}
            >
              <TabsList className="h-14 w-full rounded-lg bg-canvas-parchment p-1">
                <TabsTrigger
                  value="Outward"
                  className="h-full flex-1 gap-2 rounded-md text-xs font-semibold uppercase tracking-wider data-active:bg-primary data-active:text-white"
                >
                  <HugeiconsIcon icon={ArrowUpRight} className="h-4 w-4" />
                  {t('issued')}
                </TabsTrigger>
                <TabsTrigger
                  value="Inward"
                  className="h-full flex-1 gap-2 rounded-md text-xs font-semibold uppercase tracking-wider data-active:bg-green-500 data-active:text-white"
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
              {...register('amount', { valueAsNumber: true })}
              className="h-12 font-semibold rounded-sm"
            />
            <p className="ml-1 text-[10px] text-muted-foreground uppercase tracking-widest">
              {numberToIndianWords(watch('amount') || 0, currency)}
            </p>
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
          </div>
        </FormSection>

        <FormSection title={t('entities')} icon={User}>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              {t('party')}
            </Label>
            <Combobox
              options={partyOptions}
              value={watch('party_id')}
              onValueChange={(val) => setField('party_id', val)}
              placeholder={t('partyPlaceholder')}
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
              onValueChange={(val) => setField('account_id', val)}
              placeholder={t('accountPlaceholder')}
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
          </div>
        </FormSection>

        <FormSection title={t('datesReview')} icon={ReceiptText}>
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
              {...register('cheque_date')}
              className="h-12 rounded-sm"
            />
            <p
              className={cn(
                'text-xs text-destructive ml-1 min-h-4',
                !errors.cheque_date && 'invisible',
              )}
            >
              {(errors.cheque_date?.message as string) || '\u00A0'}
            </p>
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
        </FormSection>

        <div className="pt-4 flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full rounded-full h-14 text-lg"
            disabled={isBusy}
          >
            {isSaving ? tCommon('saving') : t('updateAction')}{' '}
            <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5" />
          </Button>

          <DeleteConfirmationDialog
            title={t('deleteConfirmTitle')}
            description={t('deleteConfirmDesc')}
            confirmName={cheque?.cheque_number || 'Cheque'}
            onDelete={async () => {
              onDelete()
            }}
            trigger={
              <Button
                type="button"
                variant="ghost"
                className="w-full rounded-full h-14 text-muted-foreground hover:text-destructive transition-colors"
              >
                <HugeiconsIcon icon={Trash2} className="mr-2 h-5 w-5" />{' '}
                {t('deleteAction')}
              </Button>
            }
          />
        </div>
      </form>
    </div>
  )
}

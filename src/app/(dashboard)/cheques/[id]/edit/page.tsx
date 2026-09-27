'use client'

import { useEditCheque } from '@/hooks/use-edit-cheque'
import { useParties } from '@/hooks/use-parties'
import { useAccounts } from '@/hooks/use-accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useParams } from 'next/navigation'
import {
  UserIcon as User,
  Mail01Icon as Mail,
  LockPasswordIcon as Lock,
  CallIcon as Phone,
  Calendar03Icon as Calendar,
  HashtagIcon as Hash,
  Note01Icon as Note,
  Building03Icon as Building,
  Wallet01Icon as Wallet,
  Search01Icon as Search,
  Location01Icon as Location,
  TextFontIcon as TextIcon,
  Tick02Icon as Check,
  Delete02Icon as Trash2,
  ArrowUpRight01Icon as ArrowUpRight,
  ArrowDownLeft01Icon as ArrowDownLeft,
  Camera01Icon as Camera,
  Loading03Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'
import { useBusiness } from '@/hooks/use-business'
import { Combobox } from '@/components/ui/combobox'
import { Skeleton } from '@/components/ui/skeleton'
import { SkeletonImage } from '@/components/ui/skeleton-image'
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
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              {t('photo')}
            </Label>
            {watch('image_url') ? (
              <div className="space-y-3">
                <div className="aspect-video overflow-hidden rounded-sm border">
                  <SkeletonImage
                    src={watch('image_url')!}
                    alt={t('photo')}
                    containerClassName="h-full w-full"
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex gap-3">
                  <label
                    htmlFor="cheque-image"
                    className={cn(
                      'flex h-10 items-center justify-center gap-2 rounded-sm border px-4 text-sm font-medium cursor-pointer',
                      (isUploading || isSaving) &&
                        'pointer-events-none opacity-50',
                    )}
                  >
                    <HugeiconsIcon icon={Camera} className="size-4" />
                    {t('replacePhoto')}
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isUploading || isSaving}
                    onClick={() =>
                      setValue('image_url', null, { shouldDirty: true })
                    }
                    className="rounded-sm text-destructive"
                  >
                    <HugeiconsIcon icon={Trash2} className="size-4" />
                    {t('removePhoto')}
                  </Button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="cheque-image"
                className={cn(
                  'flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-primary/10 bg-canvas-parchment/30 text-primary',
                  (isUploading || isSaving) && 'pointer-events-none opacity-50',
                )}
              >
                <HugeiconsIcon
                  icon={isUploading ? Loading03Icon : Camera}
                  className={cn('size-7', isUploading && 'animate-spin')}
                />
                <span className="text-sm font-semibold">
                  {isUploading ? t('uploading') : t('scanUpload')}
                </span>
              </label>
            )}
            <input
              id="cheque-image"
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={isUploading || isSaving}
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) void handleImageUpload(file)
              }}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              {t('type')}
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue('type', 'Outward')}
                className={cn(
                  'flex flex-col items-center justify-center gap-3 rounded-lg p-6 border transition-all active:scale-95',
                  watch('type') === 'Outward'
                    ? 'bg-primary/5 border-primary'
                    : 'bg-card border-primary/5',
                )}
              >
                <div
                  className={cn(
                    'h-12 w-12 rounded-sm flex items-center justify-center transition-colors',
                    watch('type') === 'Outward'
                      ? 'bg-primary text-white'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  <HugeiconsIcon icon={ArrowUpRight} className="h-6 w-6" />
                </div>
                <span
                  className={cn(
                    'font-semibold text-xs uppercase tracking-wider',
                    watch('type') === 'Outward'
                      ? 'text-primary'
                      : 'text-muted-foreground',
                  )}
                >
                  {t('issued')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setValue('type', 'Inward')}
                className={cn(
                  'flex flex-col items-center justify-center gap-3 rounded-lg p-6 border transition-all active:scale-95',
                  watch('type') === 'Inward'
                    ? 'bg-green-500/5 border-green-500'
                    : 'bg-card border-primary/5',
                )}
              >
                <div
                  className={cn(
                    'h-12 w-12 rounded-sm flex items-center justify-center transition-colors',
                    watch('type') === 'Inward'
                      ? 'bg-green-500 text-white'
                      : 'bg-green-500/10 text-green-600',
                  )}
                >
                  <HugeiconsIcon icon={ArrowDownLeft} className="h-6 w-6" />
                </div>
                <span
                  className={cn(
                    'font-semibold text-xs uppercase tracking-wider',
                    watch('type') === 'Inward'
                      ? 'text-green-600'
                      : 'text-muted-foreground',
                  )}
                >
                  {t('received')}
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {t('amount')}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-base font-semibold text-muted-foreground pointer-events-none">
                {currency}
              </span>
              <Input
                id="amount"
                type="number"
                min={0}
                step="any"
                {...register('amount', { valueAsNumber: true })}
                className="h-12 pl-10 font-semibold rounded-sm bg-canvas-parchment border-none"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive ml-1">
                {errors.amount.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                className="h-12 rounded-sm bg-canvas-parchment border-none"
              />
              {errors.cheque_number && (
                <p className="text-xs text-destructive ml-1">
                  {errors.cheque_number.message as string}
                </p>
              )}
            </div>

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
                className="h-12 rounded-sm bg-canvas-parchment border-none"
              />
              {errors.cheque_date && (
                <p className="text-xs text-destructive ml-1">
                  {errors.cheque_date.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              {t('party')}
            </Label>
            <Combobox
              options={partyOptions}
              value={watch('party_id')}
              onValueChange={(val) => setValue('party_id', val)}
              placeholder={t('partyPlaceholder')}
            />
            {errors.party_id && (
              <p className="text-xs text-destructive ml-1">
                {errors.party_id.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              {t('account')}
            </Label>
            <Combobox
              options={accountOptions}
              value={watch('account_id')}
              onValueChange={(val) => setValue('account_id', val)}
              placeholder={t('accountPlaceholder')}
            />
            {errors.account_id && (
              <p className="text-xs text-destructive ml-1">
                {errors.account_id.message as string}
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
              className="h-12 rounded-sm bg-canvas-parchment border-none"
            />
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
              className="h-12 rounded-sm bg-canvas-parchment border-none"
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full rounded-full h-14 text-lg"
            disabled={isSaving || isUploading}
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

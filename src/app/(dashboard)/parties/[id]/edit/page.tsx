'use client'

import { useEditParty } from '@/hooks/use-edit-party'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter, useParams } from 'next/navigation'
import { useBusiness } from '@/hooks/use-business'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Tick02Icon as Check,
  UserIcon as User,
  CallIcon as Phone,
  Location01Icon as MapPin,
  Delete02Icon as Trash2,
  Mail01Icon as Mail,
  Note01Icon as Note,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { FormSection } from '@/components/ui/form-section'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { EditableAvatar } from '@/components/ui/editable-avatar'
import { PhoneInput } from '@/components/ui/phone-input'
import { Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'

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

export default function EditPartyPage() {
  const t = useTranslations('Parties')
  const tCommon = useTranslations('Common')
  const { id } = useParams() as { id: string }
  const { activeBusiness } = useBusiness()

  const { form, party, isLoading, isSaving, onSubmit, onDelete } = useEditParty(
    id,
    activeBusiness?.id,
  )

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form

  const colors = [
    '#FF3B30',
    '#FF9500',
    '#FFCC00',
    '#34C759',
    '#007AFF',
    '#5856D6',
    '#AF52DE',
  ]

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-8 pb-20">
        <div className="flex justify-center">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
        <Skeleton className="h-14 w-full rounded-sm" />
        <Skeleton className="h-10 w-2/3 rounded-full" />
        <Skeleton className="h-14 w-full rounded-sm" />
        <Skeleton className="h-14 w-full rounded-sm" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <form onSubmit={onSubmit} className="space-y-10">
        <FormSection title={t('basicDetails')} icon={User}>
          <div className="flex justify-center">
            <EditableAvatar
              name={watch('name')}
              color={(watch as any)('color')}
              imageUrl={watch('avatar_url' as any)}
              onUpload={async (url) => {
                setValue('avatar_url' as any, url, { shouldDirty: true })
              }}
              onDelete={async () => {
                setValue('avatar_url' as any, null, { shouldDirty: true })
              }}
              size="xl"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {t('partyName')}
            </Label>
            <Input
              leftIcon={User}
              id="name"
              {...register('name')}
              placeholder={t('enterFullName')}
              className="h-14 bg-canvas-parchment border-none text-lg font-semibold rounded-sm"
            />
            {errors.name && (
              <p className="text-xs text-destructive ml-1">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              {tCommon('themeColor')}
            </Label>
            <div className="flex flex-wrap gap-3 p-1">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={c}
                  onClick={() =>
                    setValue('color' as any, c, { shouldDirty: true })
                  }
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
        </FormSection>

        <FormSection title={t('contactInfo')} icon={Phone}>
          <div className="space-y-2">
            <Label
              htmlFor="contact"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {t('contactNumber')}
            </Label>
            <Controller
              control={control}
              name="contact"
              render={({ field }) => (
                <PhoneInput
                  id="contact"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={t('phoneNumber')}
                  aria-invalid={!!errors.contact}
                />
              )}
            />
            {errors.contact && (
              <p className="text-xs text-destructive ml-1">
                {errors.contact.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {tCommon('email')}
            </Label>
            <Input
              leftIcon={Mail}
              id="email"
              {...register('email')}
              placeholder={t('emailPlaceholder')}
              className="h-14 bg-canvas-parchment border-none rounded-sm"
            />
          </div>
        </FormSection>

        <FormSection title={t('locationNotes')} icon={MapPin}>
          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {tCommon('address')}
            </Label>
            <Input
              leftIcon={MapPin}
              id="address"
              {...register('address')}
              placeholder={t('locationDetails')}
              className="h-14 bg-canvas-parchment border-none rounded-sm"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="notes"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {tCommon('notes')}
            </Label>
            <Input
              leftIcon={Note}
              id="notes"
              {...register('notes')}
              placeholder={t('anyAdditionalNotes')}
              className="h-14 bg-canvas-parchment border-none rounded-sm"
            />
          </div>
        </FormSection>

        <div className="pt-4 flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full rounded-full h-14 text-lg"
            disabled={isSaving}
          >
            {isSaving ? tCommon('saving') : t('updateParty')}{' '}
            <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5" />
          </Button>

          <DeleteConfirmationDialog
            title={t('deleteConfirmTitle')}
            description={t('deleteConfirmDesc')}
            confirmName={party?.name || ''}
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
                {t('deleteParty')}
              </Button>
            }
          />
        </div>
      </form>
    </div>
  )
}

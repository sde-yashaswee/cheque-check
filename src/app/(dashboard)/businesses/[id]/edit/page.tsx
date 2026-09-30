'use client'

import { useEditBusiness } from '@/hooks/use-edit-business'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useParams } from 'next/navigation'
import {
  Mail01Icon as Mail,
  CallIcon as Phone,
  Tick02Icon as Check,
  Store01Icon as Store,
  Location01Icon as MapPin,
  Delete02Icon as Trash2,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'
import { FormSection } from '@/components/ui/form-section'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { EditableAvatar } from '@/components/ui/editable-avatar'
import { PhoneInput } from '@/components/ui/phone-input'
import { Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { toast } from '@/components/ui/toast'
import { TagSelector } from '@/features/tags/components/tag-selector'
import { useEntityTagsDraft } from '@/features/tags/hooks/use-entity-tags'

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

export default function EditBusinessPage() {
  const t = useTranslations('Businesses')
  const tc = useTranslations('Common')
  const { id } = useParams() as { id: string }

  const { form, business, isLoading, isSaving, onSubmit, onDelete } =
    useEditBusiness(id)

  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = form
  const tagsDraft = useEntityTagsDraft('business', id)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (await form.trigger()) {
      try {
        await tagsDraft.commit()
      } catch {
        toast.add({ title: tc('error'), type: 'error' })
        return
      }
    }
    await onSubmit(event)
  }

  const colors = [
    '#007AFF',
    '#34C759',
    '#FF9500',
    '#FF3B30',
    '#AF52DE',
    '#5856D6',
    '#8E8E93',
  ]

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-8 pb-20">
        <Skeleton className="h-14 w-full rounded-sm" />
        <div className="flex justify-center">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
        <Skeleton className="h-10 w-2/3 rounded-full" />
        <Skeleton className="h-14 w-full rounded-sm" />
        <Skeleton className="h-14 w-full rounded-sm" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <form onSubmit={handleSubmit} className="space-y-10">
        <FormSection title={t('businessProfile')} icon={Store}>
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {t('businessName')}
            </Label>
            <Input
              leftIcon={Store}
              id="name"
              {...register('name')}
              placeholder={t('businessNamePlaceholder')}
              className="h-14 bg-canvas-parchment border-none text-lg font-semibold rounded-sm"
            />
            {errors.name && (
              <p className="text-xs text-destructive ml-1">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 py-2">
            <EditableAvatar
              name={watch('name') || t('businessName')}
              color={watch('color' as any)}
              icon={watch('icon' as any)}
              imageUrl={watch('logo_url' as any)}
              onUpload={async (url) => {
                ;(setValue as any)('logo_url', url, { shouldDirty: true })
              }}
              onDelete={async () => {
                ;(setValue as any)('logo_url', null, { shouldDirty: true })
              }}
              size="xl"
            />
            <p className="text-xs text-muted-foreground">{t('businessLogo')}</p>
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
                  aria-label={c}
                  onClick={() => setValue('color', c, { shouldDirty: true })}
                  className={cn(
                    'h-10 w-10 rounded-full transition-all active:scale-95 ring-offset-2',
                    watch('color') === c
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
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {t('businessEmail')}
            </Label>
            <Input
              leftIcon={Mail}
              id="email"
              type="email"
              {...register('email')}
              placeholder={t('contactEmailPlaceholder')}
              className="h-14 bg-canvas-parchment border-none rounded-sm"
            />
            {errors.email && (
              <p className="text-xs text-destructive ml-1">
                {errors.email.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {t('businessPhone')}
            </Label>
            <Controller
              control={control}
              name="phone"
              render={({ field }) => (
                <PhoneInput
                  id="phone"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={t('businessPhone')}
                  aria-invalid={!!errors.phone}
                />
              )}
            />
            {errors.phone && (
              <p className="text-xs text-destructive ml-1">
                {errors.phone.message as string}
              </p>
            )}
          </div>
        </FormSection>

        <FormSection title={t('location')} icon={MapPin}>
          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {t('businessAddress')}
            </Label>
            <Input
              leftIcon={MapPin}
              id="address"
              {...register('address')}
              placeholder={t('headquartersPlaceholder')}
              className="h-14 bg-canvas-parchment border-none rounded-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              {tc('tags')}
            </Label>
            <TagSelector
              businessId={id}
              value={tagsDraft.tagIds}
              onChange={tagsDraft.setTagIds}
              placeholder={tc('addTags')}
            />
          </div>
        </FormSection>

        <div className="pt-4 flex flex-col gap-3">
          <Button
            type="submit"
            className="w-full rounded-full h-14 text-lg"
            disabled={isSaving}
          >
            {isSaving ? tc('saving') : t('updateBusiness')}{' '}
            <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5" />
          </Button>

          <DeleteConfirmationDialog
            title={t('deleteConfirmTitle')}
            description={t('deleteConfirmDesc')}
            confirmName={business?.name || ''}
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
                {t('deleteBusiness')}
              </Button>
            }
          />
        </div>
      </form>
    </div>
  )
}

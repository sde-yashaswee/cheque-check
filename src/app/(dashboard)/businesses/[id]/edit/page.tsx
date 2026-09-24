'use client'

import { useEditBusiness } from '@/hooks/use-edit-business'
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
  Store01Icon as Store,
  Location01Icon as MapPin,
  Delete02Icon as Trash2,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import dynamic from 'next/dynamic'
import { EditableAvatar } from '@/components/ui/editable-avatar'
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

export default function EditBusinessPage() {
  const t = useTranslations('Businesses')
  const tc = useTranslations('Common')
  const { id } = useParams() as { id: string }

  const { form, business, isLoading, isSaving, onSubmit, onDelete } =
    useEditBusiness(id)

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  const colors = [
    '#007AFF',
    '#5856D6',
    '#AF52DE',
    '#FF2D55',
    '#FF3B30',
    '#FF9500',
    '#34C759',
  ]

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
      <div className="flex flex-col items-center gap-4 py-4">
        <EditableAvatar
          name={watch('name')}
          color={watch('color' as any)}
          icon={watch('icon' as any)}
          imageUrl={watch('logo_url' as any)}
          onUpload={async (url) => {
            ;(setValue as any)('logo_url', url)
          }}
          onDelete={async () => {
            ;(setValue as any)('logo_url', null)
          }}
          size="xl"
        />
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {t('businessName')}
            </Label>
            <div className="relative">
              <HugeiconsIcon
                icon={Store}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"
              />
              <Input
                leftIcon={User}
                id="name"
                {...register('name')}
                placeholder={t('businessNamePlaceholder')}
                className="h-14  bg-canvas-parchment border-none text-lg font-semibold rounded-sm"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive ml-1">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {t('phoneNumber')}
            </Label>
            <div className="relative">
              <HugeiconsIcon
                icon={Phone}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"
              />
              <Input
                leftIcon={Phone}
                id="phone"
                {...register('phone')}
                placeholder={t('businessPhonePlaceholder')}
                className="h-14  bg-canvas-parchment border-none rounded-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {tc('email')}
            </Label>
            <div className="relative">
              <HugeiconsIcon
                icon={Mail}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50"
              />
              <Input
                leftIcon={Mail}
                id="email"
                {...register('email')}
                placeholder={t('businessEmailPlaceholder')}
                className="h-14  bg-canvas-parchment border-none rounded-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="address"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
            >
              {tc('address')}
            </Label>
            <div className="relative">
              <HugeiconsIcon
                icon={MapPin}
                className="absolute left-4 top-4 h-5 w-5 text-muted-foreground opacity-50"
              />
              <Input
                leftIcon={MapPin}
                id="address"
                {...register('address')}
                placeholder={t('businessLocationPlaceholder')}
                className="h-14  bg-canvas-parchment border-none rounded-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">
              {t('businessColor')}
            </Label>
            <div className="flex flex-wrap gap-3 p-1">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
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
        </div>

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

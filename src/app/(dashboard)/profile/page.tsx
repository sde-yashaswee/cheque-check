'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight01Icon as ChevronRight,
  Delete02Icon as Trash2,
  Mail01Icon as Mail,
  Settings02Icon as Settings2,
  Tick02Icon as Check,
  UserIcon as User,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { EditableAvatar } from '@/components/ui/editable-avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { useProfile } from '@/hooks/use-profile'
import { useSettings } from '@/hooks/use-settings'

const DeleteConfirmationDialog = dynamic(
  () =>
    import('@/components/ui/delete-dialog').then(
      (mod) => mod.DeleteConfirmationDialog,
    ),
  {
    loading: () => <Skeleton className="h-16 w-full rounded-lg" />,
    ssr: false,
  },
)

async function clearPwaCache() {
  if ('caches' in window) {
    await Promise.all((await caches.keys()).map((key) => caches.delete(key)))
  }
  if ('serviceWorker' in navigator) {
    await Promise.all(
      (await navigator.serviceWorker.getRegistrations()).map((registration) =>
        registration.unregister(),
      ),
    )
  }
  window.location.reload()
}

export default function ProfilePage() {
  const t = useTranslations('Settings')
  const tc = useTranslations('Common')
  const { profile, updateProfile, isLoading } = useProfile()
  const { handleDeleteProfile } = useSettings()
  const [draftName, setDraftName] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const name = draftName ?? profile?.name ?? ''

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-8 pb-20">
        <div className="flex justify-center py-4">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    )
  }

  const trimmedName = name.trim()
  const isDirty = trimmedName !== (profile?.name ?? '')

  const saveName = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!trimmedName || !isDirty) return
    setIsSaving(true)
    try {
      await updateProfile({ name: trimmedName })
      setDraftName(null)
      toast.add({ title: t('profileUpdated'), type: 'success' })
    } catch {
      toast.add({ title: t('profileUpdateFailed'), type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <div className="flex flex-col items-center gap-4 py-4">
        <EditableAvatar
          name={profile?.name || t('user')}
          imageUrl={profile?.avatar_url}
          size="xl"
          onUpload={async (url) => {
            await updateProfile({ avatar_url: url })
          }}
          onDelete={async () => {
            await updateProfile({ avatar_url: null })
          }}
        />
      </div>

      <form onSubmit={saveName} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="profile-name"
            className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {t('fullName')}
          </Label>
          <Input
            leftIcon={User}
            id="profile-name"
            value={name}
            maxLength={100}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder={t('fullNamePlaceholder')}
            className="h-14 rounded-sm border-none bg-canvas-parchment text-lg font-semibold dark:bg-surface-tile-1"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="profile-email"
            className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {tc('email')}
          </Label>
          <Input
            leftIcon={Mail}
            id="profile-email"
            value={profile?.email ?? ''}
            readOnly
            disabled
            className="h-14 rounded-sm border-none bg-canvas-parchment dark:bg-surface-tile-1"
          />
        </div>

        <Button
          type="submit"
          className="h-14 w-full rounded-full text-lg"
          disabled={!trimmedName || !isDirty || isSaving}
        >
          {isSaving ? tc('saving') : t('saveProfile')}
          <HugeiconsIcon icon={Check} className="ml-2 h-5 w-5" />
        </Button>
      </form>

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <HugeiconsIcon icon={Trash2} className="h-3 w-3" />
          </div>
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-destructive">
            {t('dangerZone')}
          </h3>
        </div>
        <div className="divide-y overflow-hidden rounded-lg border border-destructive/20 bg-destructive/5">
          <DeleteConfirmationDialog
            title={t('clearCacheTitle')}
            description={t('clearCacheDescription')}
            confirmName="CLEAR"
            onDelete={clearPwaCache}
            trigger={
              <div className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-destructive/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground shadow-sm">
                    <HugeiconsIcon icon={Settings2} className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-destructive">
                      {t('clearCache')}
                    </span>
                    <span className="mt-0.5 text-[10px] font-medium leading-tight text-destructive/70">
                      {t('clearCacheDesc')}
                    </span>
                  </div>
                </div>
                <HugeiconsIcon
                  icon={ChevronRight}
                  className="h-4 w-4 text-destructive opacity-30"
                />
              </div>
            }
          />
          <DeleteConfirmationDialog
            title={t('deleteProfileTitle')}
            description={t('deleteProfileDescription')}
            confirmName={profile?.name || profile?.email || ''}
            onDelete={handleDeleteProfile}
            trigger={
              <div className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-destructive/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground shadow-sm">
                    <HugeiconsIcon icon={Trash2} className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-destructive">
                      {t('deleteMyAccount')}
                    </span>
                    <span className="mt-0.5 text-[10px] font-medium leading-tight text-destructive/70">
                      {t('deleteMyAccountDesc')}
                    </span>
                  </div>
                </div>
                <HugeiconsIcon
                  icon={ChevronRight}
                  className="h-4 w-4 text-destructive opacity-30"
                />
              </div>
            }
          />
        </div>
      </div>
    </div>
  )
}

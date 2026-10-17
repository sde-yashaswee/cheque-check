'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Combobox } from '@/components/ui/combobox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useProfile } from '@/hooks/use-profile'
import { usePremiumAction } from '@/features/monetization/components/premium-gate'
import { toast } from '@/components/ui/toast'
import type { Profile } from '@/types'

export default function NotificationsPage() {
  const t = useTranslations('Settings')
  const tc = useTranslations('Common')
  const { profile, updateProfile, isLoading } = useProfile()
  const premium = usePremiumAction()
  const [isSaving, setIsSaving] = useState(false)
  const savePreferences = async (changes: Partial<Profile>) => {
    setIsSaving(true)
    try {
      await updateProfile(changes)
    } catch (error) {
      toast.add({
        title: tc('error'),
        description: error instanceof Error ? error.message : tc('error'),
        type: 'error',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="p-4">{t('loadingPreferences')}</div>
  if (!profile) return null

  const channels = [
    {
      key: 'party_sms_enabled' as const,
      label: t('partySmsNotifications'),
      description: t('partySmsNotificationsDesc'),
    },
    {
      key: 'voice_call_enabled' as const,
      label: t('voiceNotifications'),
      description: t('voiceNotificationsDesc'),
    },
    {
      key: 'sms_enabled' as const,
      label: t('smsNotifications'),
      description: t('smsNotificationsDesc'),
    },
    {
      key: 'push_enabled' as const,
      label: t('pushNotifications'),
      description: t('pushNotificationsDesc'),
    },
    {
      key: 'whatsapp_enabled' as const,
      label: t('whatsappNotifications'),
      description: t('whatsappNotificationsDesc'),
    },
  ]

  const warningOptions = [1, 3, 7].map((days) => ({
    label: t('daysBefore', { count: days }),
    value: String(days),
  }))

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{t('notifications')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('notificationsPageDesc')}
        </p>
      </div>

      <div className="space-y-3">
        {channels.map((channel) => (
          <div
            key={channel.key}
            className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4"
          >
            <div className="space-y-1">
              <Label className="font-semibold">{channel.label}</Label>
              <p className="text-xs text-muted-foreground">
                {channel.description}
              </p>
            </div>
            <Switch
              checked={profile[channel.key]}
              onCheckedChange={(checked) => {
                if (
                  channel.key === 'party_sms_enabled' &&
                  checked &&
                  !premium.requireAccess('notify-party')
                )
                  return
                void savePreferences({ [channel.key]: checked })
              }}
              disabled={isSaving}
              aria-label={channel.label}
              data-testid={`notifications-toggle-${channel.key}`}
            />
          </div>
        ))}
      </div>

      <fieldset
        disabled={isSaving}
        className="space-y-2 border-t border-border/50 pt-6"
      >
        <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {t('advancedWarning')}
        </Label>
        <Combobox
          options={warningOptions}
          value={String(profile.default_reminder_days || 3)}
          testId="notifications-reminder-days"
          onValueChange={(value) =>
            void savePreferences({ default_reminder_days: Number(value) })
          }
          className="h-14 rounded-sm border-none bg-canvas-parchment text-lg dark:bg-surface-tile-1"
        />
        <p className="text-xs text-muted-foreground">
          {t('notificationsLeadTimeDesc')}
        </p>
      </fieldset>
    </div>
  )
}

'use client'

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { useTranslations } from "next-intl"
import { useProfile } from "@/hooks/use-profile"

const CURRENCY_OPTIONS = [
  { label: '₹ (INR)', value: '₹' },
  { label: '$ (USD)', value: '$' },
  { label: '€ (EUR)', value: '€' },
  { label: '£ (GBP)', value: '£' },
]

const DATE_FORMAT_OPTIONS = [
  { label: 'DD/MM/YYYY', value: 'dd/MM/yyyy' },
  { label: 'MM/DD/YYYY', value: 'MM/dd/yyyy' },
  { label: 'YYYY-MM-DD', value: 'yyyy-MM-dd' },
]

const TIME_FORMAT_OPTIONS = [
  { label: '12-hour (AM/PM)', value: '12h' },
  { label: '24-hour', value: '24h' },
]

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Hinglish', value: 'hi-en' },
]

const TIMEZONE_OPTIONS = [
  { label: 'IST (UTC+5:30)', value: 'Asia/Kolkata' },
  { label: 'UTC', value: 'UTC' },
  { label: 'EST (UTC-5)', value: 'America/New_York' },
  { label: 'GMT (UTC+0)', value: 'Europe/London' },
]

export default function PreferencesPage() {
  const t = useTranslations('Onboarding')
  const ts = useTranslations('Settings')
  const { profile, updateProfile, isLoading } = useProfile()
  
  const REMINDERS_PER_DAY_OPTIONS = [
    { label: t('remindersPerDay', { count: 1 }), value: '1' },
    { label: t('remindersPerDay', { count: 2 }), value: '2' },
    { label: t('remindersPerDay', { count: 3 }), value: '3' },
  ]

  const REMINDER_FREQUENCY_OPTIONS = [
    { label: t('reminderDays', { count: 1 }), value: '1' },
    { label: t('reminderDays', { count: 3 }), value: '3' },
    { label: t('reminderDays', { count: 7 }), value: '7' },
  ]

  if (isLoading) {
    return <div className="p-4">Loading preferences...</div>
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl space-y-8 pb-20">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('currency')}</Label>
            <Combobox 
              options={CURRENCY_OPTIONS} 
              value={profile.currency} 
              onValueChange={(v) => updateProfile({ currency: v })}
              className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('language')}</Label>
            <Combobox 
              options={LANGUAGE_OPTIONS} 
              value={profile.language} 
              onValueChange={(v) => {
                updateProfile({ language: v })
                document.cookie = `NEXT_LOCALE=${v}; path=/; max-age=31536000`
                window.location.reload()
              }}
              className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('dateFormat')}</Label>
          <Combobox 
            options={DATE_FORMAT_OPTIONS} 
            value={profile.date_format} 
            onValueChange={(v) => updateProfile({ date_format: v })}
            className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('timeFormat')}</Label>
            <Combobox 
              options={TIME_FORMAT_OPTIONS} 
              value={profile.time_format || '12h'} 
              onValueChange={(v) => updateProfile({ time_format: v })}
              className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('timeZone')}</Label>
            <Combobox 
              options={TIMEZONE_OPTIONS} 
              value={profile.time_zone} 
              onValueChange={(v) => updateProfile({ time_zone: v })}
              className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-border/50">
        <h3 className="text-lg font-medium">{t('notifications')}</h3>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('dailyFrequency')}</Label>
            <Combobox 
              options={REMINDERS_PER_DAY_OPTIONS} 
              value={profile.reminders_per_day?.toString() || '1'} 
              onValueChange={(v) => updateProfile({ reminders_per_day: parseInt(v) })}
              className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
            />
            <p className="text-[11px] text-muted-foreground px-1">{t('dailyFrequencyHelp')}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{t('advancedWarning')}</Label>
            <Combobox 
              options={REMINDER_FREQUENCY_OPTIONS} 
              value={profile.default_reminder_days?.toString() || '3'} 
              onValueChange={(v) => updateProfile({ default_reminder_days: parseInt(v) })}
              className="h-14 bg-canvas-parchment dark:bg-surface-tile-1 border-none rounded-sm text-lg"
            />
            <p className="text-[11px] text-muted-foreground px-1">{t('advancedWarningHelp')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

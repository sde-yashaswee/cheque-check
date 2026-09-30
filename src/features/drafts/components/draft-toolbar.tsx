'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { DraftSaveStatus } from '../hooks/use-draft-autosave'

interface DraftToolbarProps {
  status: DraftSaveStatus
}

// The draft-save FAB now carries the save action; this just surfaces the status.
export function DraftToolbar({ status }: DraftToolbarProps) {
  const t = useTranslations('Drafts')
  const label =
    status === 'saving'
      ? t('saving')
      : status === 'saved'
        ? t('saved')
        : status === 'error'
          ? t('saveFailed')
          : null

  if (!label) return null

  return (
    <span
      className={cn(
        'text-[10px] font-semibold uppercase tracking-wider',
        status === 'error' ? 'text-destructive' : 'text-muted-foreground',
      )}
      aria-live="polite"
    >
      {label}
    </span>
  )
}

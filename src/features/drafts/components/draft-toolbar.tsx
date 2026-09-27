'use client'

import { useTranslations } from 'next-intl'
import { HugeiconsIcon } from '@hugeicons/react'
import { FloppyDiskIcon as SaveIcon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { DraftSaveStatus } from '../hooks/use-draft-autosave'

interface DraftToolbarProps {
  status: DraftSaveStatus
  onSaveDraft: () => void
}

export function DraftToolbar({ status, onSaveDraft }: DraftToolbarProps) {
  const t = useTranslations('Drafts')
  const label =
    status === 'saving'
      ? t('saving')
      : status === 'saved'
        ? t('saved')
        : status === 'error'
          ? t('saveFailed')
          : null

  return (
    <div className="flex items-center justify-between gap-3">
      <span
        className={cn(
          'text-[10px] font-semibold uppercase tracking-wider',
          status === 'error' ? 'text-destructive' : 'text-muted-foreground',
        )}
        aria-live="polite"
      >
        {label}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-full gap-2"
        onClick={onSaveDraft}
        disabled={status === 'saving'}
      >
        <HugeiconsIcon icon={SaveIcon} className="h-4 w-4" />
        {t('saveDraft')}
      </Button>
    </div>
  )
}

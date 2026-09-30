'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import {
  FloppyDiskIcon as SaveIcon,
  Loading03Icon,
  Tick02Icon as Check,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import type { DraftSaveStatus } from '@/features/drafts'

interface DraftSaveFabProps {
  status: DraftSaveStatus
  hasUserChanges: boolean
  onSave: () => void
}

// Idle+no-changes = disabled/silver (nothing to save yet); saving = spinner;
// saved = blue and still clickable, so tapping again re-saves in place.
export function DraftSaveFab({
  status,
  hasUserChanges,
  onSave,
}: DraftSaveFabProps) {
  const isSaving = status === 'saving'
  const isSaved = status === 'saved'
  const isUntouched = status === 'idle' && !hasUserChanges
  const disabled = isSaving || isUntouched

  return (
    <button
      type="button"
      onClick={onSave}
      disabled={disabled}
      aria-label="Save draft"
      className={cn(
        'fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white shadow-lg transition-colors active:scale-95 disabled:active:scale-100 dark:border-zinc-900',
        isSaving && 'bg-zinc-700 text-white',
        !isSaving && isSaved && 'bg-primary text-white',
        !isSaving && !isSaved && hasUserChanges && 'bg-zinc-700 text-white',
        isUntouched && 'bg-muted text-muted-foreground cursor-not-allowed',
      )}
    >
      {isSaving ? (
        <HugeiconsIcon icon={Loading03Icon} className="h-7 w-7 animate-spin" />
      ) : isSaved ? (
        <HugeiconsIcon icon={Check} className="h-7 w-7" />
      ) : (
        <HugeiconsIcon icon={SaveIcon} className="h-7 w-7" />
      )}
    </button>
  )
}

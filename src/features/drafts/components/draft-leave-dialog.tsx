'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface DraftLeaveDialogProps {
  open: boolean
  onSave: () => Promise<void>
  onDiscard: () => Promise<void>
  onCancel: () => void
}

export function DraftLeaveDialog({
  open,
  onSave,
  onDiscard,
  onCancel,
}: DraftLeaveDialogProps) {
  const t = useTranslations('Drafts')
  const [busy, setBusy] = useState<'save' | 'discard' | null>(null)

  const run = async (action: 'save' | 'discard') => {
    setBusy(action)
    try {
      await (action === 'save' ? onSave() : onDiscard())
    } finally {
      setBusy(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !busy && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('leaveTitle')}</DialogTitle>
          <DialogDescription>{t('leaveDescription')}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            className="w-full rounded-full"
            onClick={() => run('save')}
            disabled={!!busy}
          >
            {busy === 'save' ? t('saving') : t('saveDraft')}
          </Button>
          <Button
            variant="destructive"
            className="w-full rounded-full"
            onClick={() => run('discard')}
            disabled={!!busy}
          >
            {t('discard')}
          </Button>
          <Button
            variant="ghost"
            className="w-full rounded-full"
            onClick={onCancel}
            disabled={!!busy}
          >
            {t('keepEditing')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

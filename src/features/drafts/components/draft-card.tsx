'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSwipeable } from 'react-swipeable'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'
import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon as Trash } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EntityAvatar } from '@/components/ui/entity-avatar'
import { TextTruncate } from '@/components/ui/text-truncate'
import { cn } from '@/lib/utils'

export interface DraftCardProps {
  href: string
  title: string
  subtitle?: string | null
  meta?: string | null
  avatar: { name: string; color?: string | null; imageUrl?: string | null }
  updatedAt: string
  onDelete: () => Promise<void>
}

const SWIPE_DELETE_THRESHOLD = 120

export function DraftCard({
  href,
  title,
  subtitle,
  meta,
  avatar,
  updatedAt,
  onDelete,
}: DraftCardProps) {
  const t = useTranslations('Drafts')
  const tc = useTranslations('Common')
  const [offset, setOffset] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handlers = useSwipeable({
    onSwiping: (event) => setOffset(Math.min(0, event.deltaX)),
    onSwipedLeft: (event) => {
      if (event.absX > SWIPE_DELETE_THRESHOLD) setConfirmOpen(true)
      setOffset(0)
    },
    onSwiped: () => setOffset(0),
    trackMouse: true,
  })

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete()
      setConfirmOpen(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="relative overflow-hidden rounded-lg">
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-end px-6 transition-opacity',
          offset < -50 ? 'opacity-100' : 'opacity-0',
        )}
      >
        <span className="font-bold text-destructive uppercase">
          {tc('delete')}
        </span>
        <HugeiconsIcon icon={Trash} className="ml-2 h-5 w-5 text-destructive" />
      </div>

      <motion.div
        {...handlers}
        style={{ x: offset }}
        className="relative z-10 flex items-center gap-4 rounded-lg border border-dashed border-primary/30 bg-card p-4"
      >
        <Link href={href} className="absolute inset-0 z-0" aria-label={title} />
        <EntityAvatar
          name={avatar.name}
          color={avatar.color ?? undefined}
          imageUrl={avatar.imageUrl}
          size="md"
        />
        <div className="relative z-10 flex-1 min-w-0 pointer-events-none">
          <div className="flex items-center gap-2">
            <TextTruncate
              text={title}
              maxLength={24}
              className="font-semibold block"
            />
            <Badge variant="outline" className="border-primary/30 text-primary">
              {t('draftBadge')}
            </Badge>
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
            {meta ? `${meta} · ` : ''}
            {t('edited', {
              date: format(new Date(updatedAt), 'dd MMM, HH:mm'),
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="relative z-10 p-2 text-muted-foreground hover:text-destructive transition-colors"
          aria-label={tc('delete')}
        >
          <HugeiconsIcon icon={Trash} className="h-4 w-4" />
        </button>
      </motion.div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => !deleting && setConfirmOpen(open)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('deleteTitle')}</DialogTitle>
            <DialogDescription>{t('deleteDescription')}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-3">
            <Button
              variant="ghost"
              className="flex-1 rounded-full"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              {tc('cancel')}
            </Button>
            <Button
              variant="destructive"
              className="flex-1 rounded-full"
              onClick={handleDelete}
              disabled={deleting}
            >
              {tc('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

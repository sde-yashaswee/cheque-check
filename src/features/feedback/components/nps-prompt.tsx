'use client'

import { useState, useSyncExternalStore } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'
import {
  getNpsService,
  npsCategory,
  NPS_COMMENT_MAX_LENGTH,
} from '@/features/feedback/services/nps.service'

const DESKTOP_QUERY = '(min-width: 640px)'
const SCORES = Array.from({ length: 11 }, (_, i) => i)

function subscribeDesktop(onChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  )
}

const SCORE_TONE = {
  detractor:
    'border-rose-500/30 text-rose-600 data-[selected=true]:bg-rose-500',
  passive:
    'border-amber-500/30 text-amber-600 data-[selected=true]:bg-amber-500',
  promoter:
    'border-emerald-500/30 text-emerald-600 data-[selected=true]:bg-emerald-500',
} as const

export interface NpsContext {
  chequeId: string
  businessId: string
}

interface NpsPromptProps {
  context: NpsContext | null
  onClose: () => void
}

export function NpsPrompt({ context, onClose }: NpsPromptProps) {
  const isDesktop = useIsDesktop()
  const open = !!context
  const onOpenChange = (next: boolean) => {
    if (!next) onClose()
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md p-6">
          {context && (
            <NpsForm
              key={context.chequeId}
              context={context}
              onDone={onClose}
              Header={DialogHeader}
              Title={DialogTitle}
              Description={DialogDescription}
            />
          )}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {context && (
          <NpsForm
            key={context.chequeId}
            context={context}
            onDone={onClose}
            Header={SheetHeader}
            Title={SheetTitle}
            Description={SheetDescription}
          />
        )}
      </SheetContent>
    </Sheet>
  )
}

interface NpsFormProps {
  context: NpsContext
  onDone: () => void
  Header: React.ComponentType<React.ComponentProps<'div'>>
  Title: React.ComponentType<{ children: React.ReactNode }>
  Description: React.ComponentType<{ children: React.ReactNode }>
}

function NpsForm({
  context,
  onDone,
  Header,
  Title,
  Description,
}: NpsFormProps) {
  const t = useTranslations('Feedback')
  const tc = useTranslations('Common')
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    if (score === null) return
    setIsSubmitting(true)
    try {
      await getNpsService().submit({
        score,
        comment,
        businessId: context.businessId,
        chequeId: context.chequeId,
      })
      toast.add({
        title: t('thanksTitle'),
        description: t('thanksDescription'),
        type: 'success',
      })
      onDone()
    } catch (error) {
      logger.error('Failed to submit NPS response', error)
      toast.add({
        title: tc('error'),
        description: t('submitFailed'),
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Header className="text-center">
        <Title>{t('title')}</Title>
        <Description>{t('question')}</Description>
      </Header>

      <div className="space-y-2">
        <div
          role="radiogroup"
          aria-label={t('question')}
          className="grid grid-cols-11 gap-1"
        >
          {SCORES.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={score === value}
              data-selected={score === value}
              onClick={() => setScore(value)}
              className={cn(
                'aspect-square rounded-md border text-sm font-semibold transition-all active:scale-90 data-[selected=true]:scale-110 data-[selected=true]:text-white',
                SCORE_TONE[npsCategory(value)],
              )}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span>{t('notLikely')}</span>
          <span>{t('veryLikely')}</span>
        </div>
      </div>

      {score !== null && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <label
            htmlFor="nps-comment"
            className="text-xs font-semibold text-muted-foreground"
          >
            {t(`followUp.${npsCategory(score)}`)}
          </label>
          <Textarea
            id="nps-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={NPS_COMMENT_MAX_LENGTH}
            placeholder={t('commentPlaceholder')}
            className="min-h-20"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          className="h-12 rounded-full"
          disabled={score === null || isSubmitting}
          onClick={submit}
        >
          {isSubmitting ? t('submitting') : t('submit')}
        </Button>
        <Button variant="ghost" className="h-10 rounded-full" onClick={onDone}>
          {t('notNow')}
        </Button>
      </div>
    </div>
  )
}

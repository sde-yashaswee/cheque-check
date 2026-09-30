'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  PencilEdit01Icon as Pencil,
  MoreVerticalIcon as More,
  Cancel01Icon as Close,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SpeedDialAction {
  label: string
  icon: IconSvgElement
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}

interface SpeedDialFabProps {
  editHref: string
  editLabel: string
  actions?: SpeedDialAction[]
}

/** View-page FAB: primary edit button plus an optional menu of secondary actions. */
export function SpeedDialFab({
  editHref,
  editLabel,
  actions = [],
}: SpeedDialFabProps) {
  const t = useTranslations('Common')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
      {open && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {open && (
          <ul
            role="menu"
            aria-label={t('moreActions')}
            className="flex flex-col items-end gap-2"
          >
            {actions.map((action, index) => (
              <li
                key={action.label}
                role="none"
                className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-200"
                style={{
                  animationDelay: `${(actions.length - 1 - index) * 35}ms`,
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled={action.disabled}
                  onClick={() => {
                    setOpen(false)
                    action.onClick()
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-full bg-background py-1.5 pl-4 pr-1.5 text-sm font-semibold shadow-lg ring-1 ring-border transition-transform active:scale-95 disabled:opacity-50',
                    action.destructive && 'text-destructive',
                  )}
                >
                  {action.label}
                  <span
                    className={cn(
                      'flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary',
                      action.destructive &&
                        'bg-destructive/10 text-destructive',
                    )}
                  >
                    <HugeiconsIcon icon={action.icon} className="size-4" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {actions.length > 0 && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={open ? t('close') : t('moreActions')}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="h-12 w-12 rounded-full shadow-lg ring-1 ring-border"
          >
            <HugeiconsIcon icon={open ? Close : More} className="h-5 w-5" />
          </Button>
        )}

        <Link href={editHref} aria-label={editLabel}>
          <Button
            size="icon"
            tabIndex={-1}
            className="h-16 w-16 rounded-full border-4 border-white shadow-xl dark:border-zinc-900"
          >
            <HugeiconsIcon icon={Pencil} className="h-7 w-7" />
          </Button>
        </Link>
      </div>
    </>
  )
}

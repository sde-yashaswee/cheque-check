'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon as Plus } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'

// Shell-mounted (outside PageTransition/loading.tsx) so it survives route changes
// without unmounting/re-fading — create pages render their own DraftSaveFab instead.
const LIST_FAB_TARGETS: Record<
  string,
  { href: string; bottomClassName: string }
> = {
  '/': { href: '/cheques/create', bottomClassName: 'bottom-24' },
  '/cheques': { href: '/cheques/create', bottomClassName: 'bottom-20' },
  '/parties': { href: '/parties/create', bottomClassName: 'bottom-20' },
  '/accounts': { href: '/accounts/create', bottomClassName: 'bottom-20' },
  '/businesses': { href: '/businesses/create', bottomClassName: 'bottom-20' },
}

export function AppFab() {
  const pathname = usePathname()
  const target = LIST_FAB_TARGETS[pathname]

  if (!target) return null

  return (
    <Link href={target.href}>
      <Button
        className={`fixed ${target.bottomClassName} right-6 h-16 w-16 rounded-full z-40 border-4 border-white dark:border-zinc-900`}
        size="icon"
      >
        <HugeiconsIcon icon={Plus} className="h-8 w-8" />
      </Button>
    </Link>
  )
}

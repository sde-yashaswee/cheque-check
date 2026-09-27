'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import {
  celebrate,
  clearPendingCelebration,
  getPendingCelebration,
  subscribeCelebrations,
} from '@/lib/celebrate'

export function CelebrationHost() {
  const pathname = usePathname()
  const pending = useSyncExternalStore(
    subscribeCelebrations,
    getPendingCelebration,
    () => null,
  )

  useEffect(() => {
    if (!pending || pending.target !== pathname) return
    clearPendingCelebration()
    celebrate()
  }, [pending, pathname])

  return null
}

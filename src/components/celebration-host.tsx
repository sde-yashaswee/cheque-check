'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import {
  celebrate,
  clearPendingCelebration,
  getPendingCelebration,
  subscribeCelebrations,
} from '@/lib/celebrate'
import { logger } from '@/lib/logger'
import { getNpsService, NpsPrompt, type NpsContext } from '@/features/feedback'

const NPS_DELAY_MS = 1500

export function CelebrationHost() {
  const pathname = usePathname()
  const pending = useSyncExternalStore(
    subscribeCelebrations,
    getPendingCelebration,
    () => null,
  )
  const [npsContext, setNpsContext] = useState<NpsContext | null>(null)

  useEffect(() => {
    if (!pending || pending.target !== pathname) return
    clearPendingCelebration()
    celebrate()

    const cheque = pending.cheque
    if (!cheque) return
    // Not cleared on cleanup: clearing the pending celebration re-runs this effect.
    setTimeout(() => {
      getNpsService()
        .shouldPrompt()
        .then((show) => {
          if (show)
            setNpsContext({
              chequeId: cheque.id,
              businessId: cheque.businessId,
            })
        })
        .catch((error) =>
          logger.error('Failed to check NPS eligibility', error),
        )
    }, NPS_DELAY_MS)
  }, [pending, pathname])

  return <NpsPrompt context={npsContext} onClose={() => setNpsContext(null)} />
}

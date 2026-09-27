import { describe, expect, it, vi } from 'vitest'
import {
  clearPendingCelebration,
  getPendingCelebration,
  queueCelebration,
  subscribeCelebrations,
} from './celebrate'

describe('celebration queue', () => {
  it('stores the pending celebration and notifies subscribers', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeCelebrations(listener)

    queueCelebration({ target: '/cheques' })
    expect(getPendingCelebration()).toEqual({ target: '/cheques' })

    clearPendingCelebration()
    expect(getPendingCelebration()).toBeNull()
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    queueCelebration({ target: '/businesses' })
    expect(listener).toHaveBeenCalledTimes(2)
    clearPendingCelebration()
  })
})

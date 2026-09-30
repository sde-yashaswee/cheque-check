import { describe, expect, it } from 'vitest'
import {
  STAGGER_MAX_STEPS,
  STAGGER_STEP_MS,
  createStaggerCounter,
  staggerDelay,
} from './skeleton-stagger'

describe('staggerDelay', () => {
  it('grows linearly and caps at the max step', () => {
    expect(staggerDelay(0)).toBe(0)
    expect(staggerDelay(2)).toBe(2 * STAGGER_STEP_MS)
    expect(staggerDelay(STAGGER_MAX_STEPS + 10)).toBe(
      STAGGER_MAX_STEPS * STAGGER_STEP_MS,
    )
  })
})

describe('createStaggerCounter', () => {
  it('counts within a tick and resets on the next', async () => {
    const next = createStaggerCounter()
    expect([next(), next(), next()]).toEqual([0, 1, 2])
    await Promise.resolve()
    expect(next()).toBe(0)
  })
})

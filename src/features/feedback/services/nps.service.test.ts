import { describe, expect, it, vi } from 'vitest'
import { NpsService, npsCategory } from './nps.service'

const repo = (last: Date | null) => ({
  getLastSubmittedAt: vi.fn().mockResolvedValue(last),
  submit: vi.fn().mockResolvedValue(undefined),
})

describe('npsCategory', () => {
  it('buckets scores into NPS categories', () => {
    expect(npsCategory(0)).toBe('detractor')
    expect(npsCategory(6)).toBe('detractor')
    expect(npsCategory(7)).toBe('passive')
    expect(npsCategory(8)).toBe('passive')
    expect(npsCategory(9)).toBe('promoter')
    expect(npsCategory(10)).toBe('promoter')
  })
})

describe('NpsService.shouldPrompt', () => {
  const now = new Date(2026, 8, 28)

  it('prompts users who never responded', async () => {
    expect(await new NpsService(repo(null)).shouldPrompt(now)).toBe(true)
  })

  it('waits 30 days after a submission', async () => {
    expect(
      await new NpsService(repo(new Date(2026, 8, 1))).shouldPrompt(now),
    ).toBe(false)
    expect(
      await new NpsService(repo(new Date(2026, 7, 29))).shouldPrompt(now),
    ).toBe(true)
  })
})

describe('NpsService.submit', () => {
  it('trims comments and stores blanks as null', async () => {
    const repository = repo(null)
    await new NpsService(repository).submit({
      score: 9,
      comment: '   ',
      businessId: 'b1',
      chequeId: 'c1',
    })
    expect(repository.submit).toHaveBeenCalledWith({
      score: 9,
      comment: null,
      businessId: 'b1',
      chequeId: 'c1',
    })
  })

  it('rejects out-of-range scores', async () => {
    await expect(
      new NpsService(repo(null)).submit({
        score: 11,
        comment: null,
        businessId: null,
        chequeId: null,
      }),
    ).rejects.toBeInstanceOf(RangeError)
  })
})

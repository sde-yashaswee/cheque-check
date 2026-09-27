import { describe, expect, it } from 'vitest'
import { filterByChequeDate, resolveDateRange } from './date-range'

// Wednesday, 2026-09-16
const now = new Date(2026, 8, 16, 12)

describe('resolveDateRange', () => {
  it('returns an unbounded range for all time', () => {
    expect(resolveDateRange('all', now)).toEqual({})
  })

  it('starts the week on Monday', () => {
    expect(resolveDateRange('thisWeek', now)).toEqual({
      from: '2026-09-14',
      to: '2026-09-20',
    })
  })

  it('resolves month and year presets', () => {
    expect(resolveDateRange('thisMonth', now)).toEqual({
      from: '2026-09-01',
      to: '2026-09-30',
    })
    expect(resolveDateRange('lastMonth', now)).toEqual({
      from: '2026-08-01',
      to: '2026-08-31',
    })
    expect(resolveDateRange('thisYear', now)).toEqual({
      from: '2026-01-01',
      to: '2026-12-31',
    })
  })

  it('treats a single custom day as a one-day range', () => {
    expect(
      resolveDateRange('custom', now, { from: new Date(2026, 1, 3) }),
    ).toEqual({ from: '2026-02-03', to: '2026-02-03' })
  })
})

describe('filterByChequeDate', () => {
  const cheques = [
    { id: 'a', cheque_date: '2026-08-31' },
    { id: 'b', cheque_date: '2026-09-01' },
    { id: 'c', cheque_date: '2026-09-30' },
    { id: 'd', cheque_date: null },
  ]

  it('keeps cheques within the inclusive range', () => {
    expect(
      filterByChequeDate(cheques, {
        from: '2026-09-01',
        to: '2026-09-30',
      })?.map((c) => c.id),
    ).toEqual(['b', 'c'])
  })

  it('returns the input untouched for an unbounded range', () => {
    expect(filterByChequeDate(cheques, {})).toBe(cheques)
  })
})

import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
} from 'date-fns'

export const DATE_RANGE_PRESETS = [
  'all',
  'thisWeek',
  'thisMonth',
  'lastMonth',
  'thisYear',
  'custom',
] as const

export type DateRangePreset = (typeof DATE_RANGE_PRESETS)[number]

/** Inclusive `yyyy-MM-dd` bounds; a missing side is unbounded. */
export interface ChequeDateRange {
  from?: string
  to?: string
}

const toDay = (date: Date) => format(date, 'yyyy-MM-dd')

export function resolveDateRange(
  preset: DateRangePreset,
  now: Date = new Date(),
  custom: { from?: Date; to?: Date } = {},
): ChequeDateRange {
  switch (preset) {
    case 'thisWeek':
      return {
        from: toDay(startOfWeek(now, { weekStartsOn: 1 })),
        to: toDay(endOfWeek(now, { weekStartsOn: 1 })),
      }
    case 'thisMonth':
      return { from: toDay(startOfMonth(now)), to: toDay(endOfMonth(now)) }
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1)
      return {
        from: toDay(startOfMonth(lastMonth)),
        to: toDay(endOfMonth(lastMonth)),
      }
    }
    case 'thisYear':
      return { from: toDay(startOfYear(now)), to: toDay(endOfYear(now)) }
    case 'custom':
      return {
        from: custom.from ? toDay(custom.from) : undefined,
        to: custom.to
          ? toDay(custom.to)
          : custom.from
            ? toDay(custom.from)
            : undefined,
      }
    case 'all':
      return {}
  }
}

export function filterByChequeDate<T extends { cheque_date: string | null }>(
  cheques: T[] | undefined,
  { from, to }: ChequeDateRange,
): T[] | undefined {
  if (!cheques || (!from && !to)) return cheques
  return cheques.filter((c) => {
    if (!c.cheque_date) return false
    if (from && c.cheque_date < from) return false
    if (to && c.cheque_date > to) return false
    return true
  })
}

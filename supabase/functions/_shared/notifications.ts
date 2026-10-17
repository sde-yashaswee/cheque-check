// Keep in sync with src/types/index.ts (NotificationChannel, NotificationJobStatus).
// `purpose` is intentionally free-form TEXT in the DB (not an enum) so new
// business events don't need a migration - these are just the values this
// codebase currently emits/consumes.
export type NotificationChannel =
  'voice' | 'whatsapp' | 'email' | 'push' | 'sms'

export const NOTIFICATION_PURPOSE = {
  CHEQUE_REMINDER: 'cheque_reminder',
  SAMPLE_VOICE_TEST: 'sample_voice_test',
} as const

/** Reminder slots within a day, keyed by profiles.reminders_per_day (1-3). */
export const REMINDER_SLOTS: Record<
  number,
  { label: string; minutesOfDay: number }[]
> = {
  1: [{ label: 'morning', minutesOfDay: 9 * 60 }],
  2: [
    { label: 'morning', minutesOfDay: 9 * 60 },
    { label: 'evening', minutesOfDay: 17 * 60 },
  ],
  3: [
    { label: 'morning', minutesOfDay: 9 * 60 },
    { label: 'afternoon', minutesOfDay: 13 * 60 },
    { label: 'evening', minutesOfDay: 18 * 60 },
  ],
}

/** How wide a cron tick's catch-up window is (must be >= the scheduler's cron interval). */
export const SLOT_MATCH_WINDOW_MINUTES = 15

export interface LocalTime {
  /** YYYY-MM-DD in the target IANA time zone. */
  date: string
  minutesOfDay: number
}

/** Resolves the wall-clock date/time in `timeZone` for `instant`, without external deps. */
export function getLocalTime(instant: Date, timeZone: string): LocalTime {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(instant)
  const part = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '00'
  const hour = Number(part('hour')) % 24 // midnight can format as "24"

  return {
    date: `${part('year')}-${part('month')}-${part('day')}`,
    minutesOfDay: hour * 60 + Number(part('minute')),
  }
}

export function resolveReminderSlots(remindersPerDay: number | null) {
  const count = Math.min(Math.max(remindersPerDay ?? 1, 1), 3)
  return REMINDER_SLOTS[count] ?? REMINDER_SLOTS[1]
}

/** Days between two YYYY-MM-DD/ISO date strings, ignoring time-of-day. */
export function daysBetween(fromIsoDate: string, toIsoDate: string): number {
  const from = new Date(`${fromIsoDate.slice(0, 10)}T00:00:00Z`)
  const to = new Date(`${toIsoDate.slice(0, 10)}T00:00:00Z`)
  return Math.round((to.getTime() - from.getTime()) / 86_400_000)
}

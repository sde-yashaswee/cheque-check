import { SchedulerDatabaseService } from '../services/database.service.ts'
import {
  NOTIFICATION_PURPOSE,
  SLOT_MATCH_WINDOW_MINUTES,
  daysBetween,
  getLocalTime,
  resolveReminderSlots,
} from '../../_shared/notifications.ts'
import { Logger } from '../../_shared/logger.ts'
import { NewNotificationJob, ReminderCheque } from '../types.ts'

export class SchedulerOrchestrator {
  constructor(private db: SchedulerDatabaseService) {}

  /** forceRun bypasses the slot-time window - for manual testing only. */
  async run(
    now: Date = new Date(),
    forceRun = false,
  ): Promise<{ enqueued: number }> {
    const profiles = await this.db.fetchEligibleProfiles()
    let enqueued = 0

    for (const profile of profiles) {
      if (!profile.time_zone || !profile.phone) continue

      const local = getLocalTime(now, profile.time_zone)
      const slots = resolveReminderSlots(profile.reminders_per_day)
      const matchedSlot = forceRun
        ? slots[0]
        : slots.find(
            (slot) =>
              local.minutesOfDay >= slot.minutesOfDay &&
              local.minutesOfDay <
                slot.minutesOfDay + SLOT_MATCH_WINDOW_MINUTES,
          )
      if (!matchedSlot) continue

      const cheques = await this.db.fetchActiveChequesForUser(
        profile.user_id,
        local.date,
      )
      const due = cheques.filter((cheque) =>
        isDueForReminder(cheque, local.date),
      )
      if (due.length === 0) continue

      const jobs = groupByBusiness(due).map(
        ([businessId, businessCheques]): NewNotificationJob => ({
          user_id: profile.user_id,
          business_id: businessId,
          channel: 'voice',
          purpose: NOTIFICATION_PURPOSE.CHEQUE_REMINDER,
          payload: {
            cheque_ids: businessCheques.map((c) => c.id),
            slot: matchedSlot.label,
          },
          scheduled_at: now.toISOString(),
          idempotency_key: `${NOTIFICATION_PURPOSE.CHEQUE_REMINDER}:voice:${businessId}:${local.date}:${matchedSlot.label}`,
        }),
      )

      await this.db.enqueueJobs(jobs)
      enqueued += jobs.length
      Logger.info(
        `Enqueued ${jobs.length} voice job(s) for user ${profile.user_id} (slot=${matchedSlot.label})`,
      )
    }

    return { enqueued }
  }
}

function isDueForReminder(cheque: ReminderCheque, localToday: string): boolean {
  if (cheque.deposit_date) {
    if (cheque.remind_before_days == null) return false
    const daysUntilDue = daysBetween(localToday, cheque.deposit_date)
    return daysUntilDue >= 0 && daysUntilDue <= cheque.remind_before_days
  }

  // No deposit date set - fall back to the cheque date itself, same-day only
  // (there's no "before" reference to count down from).
  return cheque.cheque_date === localToday
}

function groupByBusiness(
  cheques: ReminderCheque[],
): [string, ReminderCheque[]][] {
  const byBusiness = new Map<string, ReminderCheque[]>()
  for (const cheque of cheques) {
    const list = byBusiness.get(cheque.business.id) ?? []
    list.push(cheque)
    byBusiness.set(cheque.business.id, list)
  }
  return [...byBusiness.entries()]
}

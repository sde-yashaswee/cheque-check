import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TABLES } from '../../_shared/tables.ts'
import {
  NewNotificationJob,
  ReminderCheque,
  ReminderProfile,
} from '../types.ts'

export class SchedulerDatabaseService {
  constructor(private supabase: SupabaseClient) {}

  async fetchEligibleProfiles(): Promise<ReminderProfile[]> {
    const { data, error } = await this.supabase
      .from(TABLES.PROFILES)
      .select(
        'user_id, name, time_zone, reminders_per_day, voice_call_enabled, phone',
      )
      .eq('voice_call_enabled', true)
      .not('phone', 'is', null)
      .not('time_zone', 'is', null)

    if (error) throw error
    return (data || []) as unknown as ReminderProfile[]
  }

  /**
   * Broad candidate set for a user: deposit_date hasn't passed yet, or (no
   * deposit_date) cheque_date is today. The remind_before_days countdown
   * window is narrowed further in JS (see scheduler.orchestrator.ts) since
   * it isn't expressible as a single PostgREST filter.
   */
  async fetchActiveChequesForUser(
    userId: string,
    localToday: string,
  ): Promise<ReminderCheque[]> {
    const { data, error } = await this.supabase
      .from(TABLES.CHEQUES)
      .select(
        `
        id, deposit_date, cheque_date, remind_before_days,
        business:businesses!inner(id, user_id)
      `,
      )
      .eq('business.user_id', userId)
      .eq('status', 'Issued')
      .eq('is_draft', false)
      .or(
        `deposit_date.gte.${localToday},and(deposit_date.is.null,cheque_date.eq.${localToday})`,
      )

    if (error) throw error
    return (data || []) as unknown as ReminderCheque[]
  }

  async enqueueJobs(jobs: NewNotificationJob[]): Promise<void> {
    if (jobs.length === 0) return

    const { error } = await this.supabase
      .from(TABLES.NOTIFICATION_JOBS)
      .upsert(jobs, { onConflict: 'idempotency_key', ignoreDuplicates: true })

    if (error) throw error
  }
}

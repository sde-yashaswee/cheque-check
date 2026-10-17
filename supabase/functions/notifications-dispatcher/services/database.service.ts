import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { TABLES } from '../../_shared/tables.ts'
import { ClaimedJob, DispatchCheque, DispatchProfile } from '../types.ts'

const RETRY_BACKOFF_MINUTES = [10, 30, 120]
const MAX_ATTEMPTS = 3

export interface NotificationLogEntry {
  job_id: string
  user_id: string
  channel: string
  purpose: string
  recipient: string | null
  status: 'success' | 'failed'
  provider: string
  provider_message_id?: string | null
  provider_response?: unknown
  error?: string | null
}

export class DispatcherDatabaseService {
  constructor(private supabase: SupabaseClient) {}

  /** Atomically claims+locks a batch of due jobs (safe across overlapping ticks). */
  async claimJobs(batchSize: number): Promise<ClaimedJob[]> {
    const { data, error } = await this.supabase.rpc('claim_notification_jobs', {
      p_batch_size: batchSize,
    })
    if (error) throw error
    return (data || []) as unknown as ClaimedJob[]
  }

  async fetchProfile(userId: string): Promise<DispatchProfile | null> {
    const { data, error } = await this.supabase
      .from(TABLES.PROFILES)
      .select('user_id, name, phone, language')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return data as DispatchProfile | null
  }

  async fetchCheques(chequeIds: string[]): Promise<DispatchCheque[]> {
    if (chequeIds.length === 0) return []

    const { data, error } = await this.supabase
      .from(TABLES.CHEQUES)
      .select('id, amount, account:accounts(bank:banks(name))')
      .in('id', chequeIds)

    if (error) throw error
    return (data || []) as unknown as DispatchCheque[]
  }

  /** Reserves one unit of quota atomically; false means quota is exhausted. */
  async consumeVoiceQuota(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('admin_increment_quota', {
      p_user_id: userId,
      p_feature_id: 'voice_reminder',
    })
    if (error) throw error
    return Boolean(data)
  }

  async markSent(jobId: string): Promise<void> {
    const { error } = await this.supabase
      .from(TABLES.NOTIFICATION_JOBS)
      .update({ status: 'sent', updated_at: new Date().toISOString() })
      .eq('id', jobId)
    if (error) throw error
  }

  async markSkipped(jobId: string, reason: string): Promise<void> {
    const { error } = await this.supabase
      .from(TABLES.NOTIFICATION_JOBS)
      .update({
        status: 'skipped',
        last_error: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
    if (error) throw error
  }

  /** attempts has already been incremented by claimJobs()'s UPDATE. */
  async markFailedOrRetry(
    job: ClaimedJob,
    errorMessage: string,
  ): Promise<void> {
    const update =
      job.attempts >= MAX_ATTEMPTS
        ? {
            status: 'failed',
            last_error: errorMessage,
            updated_at: new Date().toISOString(),
          }
        : {
            status: 'pending',
            last_error: errorMessage,
            scheduled_at: new Date(
              Date.now() +
                RETRY_BACKOFF_MINUTES[
                  Math.min(job.attempts - 1, RETRY_BACKOFF_MINUTES.length - 1)
                ] *
                  60_000,
            ).toISOString(),
            updated_at: new Date().toISOString(),
          }

    const { error } = await this.supabase
      .from(TABLES.NOTIFICATION_JOBS)
      .update(update)
      .eq('id', job.id)
    if (error) throw error
  }

  async writeLog(entry: NotificationLogEntry): Promise<void> {
    const { error } = await this.supabase
      .from(TABLES.NOTIFICATION_LOGS)
      .insert([entry])
    if (error) throw error
  }
}

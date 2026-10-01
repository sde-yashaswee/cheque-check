import { SupabaseRepository } from '@/repositories/base.repository'
import { TABLES } from '@/lib/supabase/tables'

export interface NpsSubmission {
  score: number
  comment: string | null
  businessId: string | null
  chequeId: string | null
}

export interface INpsRepository {
  getLastSubmittedAt(): Promise<Date | null>
  submit(submission: NpsSubmission): Promise<void>
}

export class SupabaseNpsRepository
  extends SupabaseRepository
  implements INpsRepository
{
  async getLastSubmittedAt(): Promise<Date | null> {
    const data = (await this.query(
      this.supabase
        .from(TABLES.NPS_RESPONSES)
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    )) as { created_at: string } | null
    return data ? new Date(data.created_at) : null
  }

  async submit({
    score,
    comment,
    businessId,
    chequeId,
  }: NpsSubmission): Promise<void> {
    await this.handleVoid(
      this.supabase.from(TABLES.NPS_RESPONSES).insert({
        score,
        comment,
        business_id: businessId,
        cheque_id: chequeId,
      }),
    )
  }
}

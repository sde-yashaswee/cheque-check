import { differenceInCalendarDays } from 'date-fns'
import {
  SupabaseNpsRepository,
  type INpsRepository,
  type NpsSubmission,
} from '@/features/feedback/repositories/nps.repository'

export const NPS_COOLDOWN_DAYS = 30
export const NPS_COMMENT_MAX_LENGTH = 1000

export type NpsCategory = 'detractor' | 'passive' | 'promoter'

export function npsCategory(score: number): NpsCategory {
  if (score >= 9) return 'promoter'
  if (score >= 7) return 'passive'
  return 'detractor'
}

export class NpsService {
  constructor(
    private readonly repository: INpsRepository = new SupabaseNpsRepository(),
  ) {}

  async shouldPrompt(now: Date = new Date()): Promise<boolean> {
    const last = await this.repository.getLastSubmittedAt()
    return !last || differenceInCalendarDays(now, last) >= NPS_COOLDOWN_DAYS
  }

  async submit(submission: NpsSubmission): Promise<void> {
    if (
      !Number.isInteger(submission.score) ||
      submission.score < 0 ||
      submission.score > 10
    ) {
      throw new RangeError('NPS score must be an integer between 0 and 10')
    }
    const comment = submission.comment?.trim().slice(0, NPS_COMMENT_MAX_LENGTH)
    await this.repository.submit({ ...submission, comment: comment || null })
  }
}

let defaultNpsService: NpsService | undefined

export function getNpsService(): NpsService {
  defaultNpsService ??= new NpsService()
  return defaultNpsService
}

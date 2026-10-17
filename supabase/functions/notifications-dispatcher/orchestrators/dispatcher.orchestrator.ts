import { DispatcherDatabaseService } from '../services/database.service.ts'
import { TwilioVoiceService } from '../../_shared/twilio-voice.service.ts'
import { Logger } from '../../_shared/logger.ts'
import { ClaimedJob, DispatchCheque, DispatchResult } from '../types.ts'

export interface TestModeConfig {
  enabled: boolean
  phone: string
}

export class DispatcherOrchestrator {
  constructor(
    private db: DispatcherDatabaseService,
    private twilio: TwilioVoiceService,
    private testMode: TestModeConfig = { enabled: false, phone: '' },
  ) {}

  async run(batchSize = 50): Promise<DispatchResult[]> {
    const jobs = await this.db.claimJobs(batchSize)
    const results: DispatchResult[] = []

    for (const job of jobs) {
      results.push(await this.dispatch(job))
    }

    return results
  }

  private async dispatch(job: ClaimedJob): Promise<DispatchResult> {
    if (job.channel !== 'voice') {
      await this.db.markSkipped(
        job.id,
        `channel '${job.channel}' is not implemented yet`,
      )
      return { jobId: job.id, status: 'skipped' }
    }

    return this.dispatchVoice(job)
  }

  private async dispatchVoice(job: ClaimedJob): Promise<DispatchResult> {
    const profile = await this.db.fetchProfile(job.user_id)
    if (!profile?.phone) {
      await this.db.markSkipped(job.id, 'Profile has no phone number')
      return { jobId: job.id, status: 'skipped' }
    }

    const hasQuota = await this.db.consumeVoiceQuota(job.user_id)
    if (!hasQuota) {
      await this.db.markSkipped(job.id, 'Voice reminder quota exhausted')
      return { jobId: job.id, status: 'skipped' }
    }

    const cheques = await this.db.fetchCheques(job.payload.cheque_ids ?? [])
    const language = profile.language || 'en'
    const message = this.buildMessage(profile.name || 'User', cheques, language)
    const twiml = this.twilio.generateTwiML(message, language)
    const to = this.testMode.enabled ? this.testMode.phone : profile.phone

    const call = await this.twilio.initiateCall(to, twiml)

    if (call.success) {
      await this.db.markSent(job.id)
      await this.db.writeLog({
        job_id: job.id,
        user_id: job.user_id,
        channel: 'voice',
        purpose: job.purpose,
        recipient: profile.phone,
        status: 'success',
        provider: 'twilio_voice',
        provider_message_id: call.sid,
      })
      Logger.info(`Voice call sent for job ${job.id}`, { sid: call.sid })
      return { jobId: job.id, status: 'sent' }
    }

    const errorMessage = call.error || 'Twilio call failed'
    await this.db.markFailedOrRetry(job, errorMessage)
    await this.db.writeLog({
      job_id: job.id,
      user_id: job.user_id,
      channel: 'voice',
      purpose: job.purpose,
      recipient: profile.phone,
      status: 'failed',
      provider: 'twilio_voice',
      error: errorMessage,
    })
    Logger.error(`Voice call failed for job ${job.id}`, errorMessage)
    return { jobId: job.id, status: 'failed', error: errorMessage }
  }

  private buildMessage(
    name: string,
    cheques: DispatchCheque[],
    language: string,
  ): string {
    const banks: Record<string, { count: number; total: number }> = {}
    cheques.forEach((cheque) => {
      const bankName = cheque.account?.bank?.name || 'Unknown Bank'
      if (!banks[bankName]) banks[bankName] = { count: 0, total: 0 }
      banks[bankName].count++
      banks[bankName].total += Number(cheque.amount)
    })

    if (language === 'hi') {
      const bankSummaries = Object.entries(banks)
        .map(
          ([bank, data]) =>
            `${bank} में ${data.total} रुपये के ${data.count} चेक`,
        )
        .join(', और ')

      return `नमस्ते ${name}, यह चेक चेक की तरफ से एक रिमाइंडर है। आज आपके ${bankSummaries} आ रहे हैं। कृपया सुनिश्चित करें कि आपके बैंक खाते में पर्याप्त बैलेंस है।`
    }

    const bankSummaries = Object.entries(banks)
      .map(
        ([bank, data]) =>
          `${data.count} cheque${data.count > 1 ? 's' : ''} hitting ${bank} for a total of ${data.total}`,
      )
      .join(', and ')

    return `Hello ${name}, this is a reminder from Cheque Check. You have ${bankSummaries} today. Please ensure your accounts are sufficiently funded.`
  }
}

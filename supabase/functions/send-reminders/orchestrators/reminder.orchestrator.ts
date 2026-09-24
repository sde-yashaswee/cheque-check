import { DatabaseService } from '../services/database.service.ts'
import { TwilioVoiceService } from '../services/twilio.service.ts'
import { ReminderCheque, ReminderResult } from '../types.ts'
import { Logger } from '../utils/logger.ts'

export class ReminderOrchestrator {
  constructor(
    private db: DatabaseService,
    private twilio: TwilioVoiceService,
  ) {}

  async run(): Promise<ReminderResult[]> {
    Logger.info('Starting reminder process...')

    const cheques = await this.db.fetchChequesDueToday()
    if (!cheques || cheques.length === 0) {
      Logger.info('No cheques due today.')
      return []
    }

    const userIds = [
      ...new Set(cheques.map((cheque) => cheque.business.user_id)),
    ]
    const profiles = await this.db.fetchProfiles(userIds)

    if (!profiles || profiles.length === 0) {
      Logger.info('No eligible profiles for voice reminders.')
      return []
    }

    const results: ReminderResult[] = []

    for (const profile of profiles) {
      const userCheques = cheques.filter(
        (cheque) => cheque.business.user_id === profile.user_id,
      )

      // Determine user language, fallback to english
      const lang = profile.language || 'en'
      const message = this.buildMessage(
        profile.name || 'User',
        userCheques,
        lang,
      )

      const twiml = this.twilio.generateTwiML(message, lang)
      Logger.info(
        `Initiating reminder call for user ${profile.user_id} in ${lang}`,
      )
      const callResult = await this.twilio.initiateCall(profile.phone, twiml)

      if (callResult.success) {
        await this.db.markCallSent(userCheques.map((cheque) => cheque.id))
        await this.db.incrementVoiceQuota(profile.user_id)
      }

      results.push({
        userId: profile.user_id,
        userName: profile.name || 'Unknown',
        status: callResult.success ? 'success' : 'failed',
        sid: callResult.sid,
        error: callResult.error,
      })
    }

    return results
  }

  private buildMessage(
    name: string,
    cheques: ReminderCheque[],
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
    } else {
      const bankSummaries = Object.entries(banks)
        .map(
          ([bank, data]) =>
            `${data.count} cheque${data.count > 1 ? 's' : ''} hitting ${bank} for a total of ${data.total}`,
        )
        .join(', and ')

      return `Hello ${name}, this is a reminder from Cheque Check. You have ${bankSummaries} today. Please ensure your accounts are sufficiently funded.`
    }
  }
}

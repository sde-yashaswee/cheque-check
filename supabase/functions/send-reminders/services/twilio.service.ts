import { TwilioConfig } from '../types.ts'

export class TwilioVoiceService {
  private config: TwilioConfig

  constructor(config: TwilioConfig) {
    this.config = config
  }

  async initiateCall(
    to: string,
    twiml: string,
  ): Promise<{ success: boolean; sid?: string; error?: string }> {
    const { accountSid, authToken, fromNumber } = this.config
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Twiml: twiml,
        }),
      })

      const data: unknown = await response.json()
      if (response.ok) {
        const sid =
          typeof data === 'object' && data && 'sid' in data
            ? String(data.sid)
            : undefined
        return { success: true, sid }
      } else {
        const message =
          typeof data === 'object' && data && 'message' in data
            ? String(data.message)
            : 'Twilio rejected the reminder call'
        return { success: false, error: message }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  generateTwiML(message: string, language: string = 'en'): string {
    // Map application languages to Twilio languages.
    // 'Polly.Aditi' is an Indian English/Hindi bilingual voice, perfect for both.
    const twilioLang = language === 'hi' ? 'hi-IN' : 'en-IN'
    const goodbye = language === 'hi' ? 'धन्यवाद।' : 'Goodbye.'

    const escapedMessage = this.escapeXml(message)
    const escapedGoodbye = this.escapeXml(goodbye)

    return `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Say voice="Polly.Aditi" language="${twilioLang}">${escapedMessage}</Say>
        <Pause length="1"/>
        <Say voice="Polly.Aditi" language="${twilioLang}">${escapedGoodbye}</Say>
    </Response>`
  }

  private escapeXml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;')
  }
}

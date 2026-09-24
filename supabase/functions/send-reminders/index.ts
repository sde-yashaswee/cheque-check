import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { TwilioVoiceService } from './services/twilio.service.ts'
import { DatabaseService } from './services/database.service.ts'
import { ReminderOrchestrator } from './orchestrators/reminder.orchestrator.ts'
import { Logger } from './utils/logger.ts'

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
  const SUPABASE_SERVICE_ROLE_KEY =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || ''
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || ''
  const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER') || ''

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
    })
  }

  if (
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY ||
    !TWILIO_ACCOUNT_SID ||
    !TWILIO_AUTH_TOKEN ||
    !TWILIO_FROM_NUMBER
  ) {
    return new Response(
      JSON.stringify({ error: 'Reminder service is not configured' }),
      { status: 500 },
    )
  }

  if (
    req.headers.get('authorization') !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
  ) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    })
  }

  const twilioService = new TwilioVoiceService({
    accountSid: TWILIO_ACCOUNT_SID,
    authToken: TWILIO_AUTH_TOKEN,
    fromNumber: TWILIO_FROM_NUMBER,
  })

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const dbService = new DatabaseService(supabase)
    const orchestrator = new ReminderOrchestrator(dbService, twilioService)

    const results = await orchestrator.run()
    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    Logger.error('Process failed', error)
    return new Response(JSON.stringify({ error: 'Reminder process failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

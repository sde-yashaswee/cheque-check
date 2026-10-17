import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { TwilioVoiceService } from '../_shared/twilio-voice.service.ts'
import { Logger } from '../_shared/logger.ts'
import { DispatcherDatabaseService } from './services/database.service.ts'
import { DispatcherOrchestrator } from './orchestrators/dispatcher.orchestrator.ts'

const BATCH_SIZE = 50

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
  const SUPABASE_SERVICE_ROLE_KEY =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || ''
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || ''
  const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER') || ''
  // Safety net while testing against real Twilio credit: redirect every
  // outbound call to one verified number regardless of whose job it is.
  const TEST_MODE_ENABLED = Deno.env.get('NOTIFICATIONS_TEST_MODE') === 'true'
  const TEST_MODE_PHONE = Deno.env.get('NOTIFICATIONS_TEST_PHONE') || ''

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
      JSON.stringify({ error: 'Dispatcher is not configured' }),
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

  if (TEST_MODE_ENABLED && !TEST_MODE_PHONE) {
    return new Response(
      JSON.stringify({
        error:
          'NOTIFICATIONS_TEST_MODE is on but NOTIFICATIONS_TEST_PHONE is unset',
      }),
      { status: 500 },
    )
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const twilio = new TwilioVoiceService({
      accountSid: TWILIO_ACCOUNT_SID,
      authToken: TWILIO_AUTH_TOKEN,
      fromNumber: TWILIO_FROM_NUMBER,
    })
    const orchestrator = new DispatcherOrchestrator(
      new DispatcherDatabaseService(supabase),
      twilio,
      { enabled: TEST_MODE_ENABLED, phone: TEST_MODE_PHONE },
    )

    const results = await orchestrator.run(BATCH_SIZE)
    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    Logger.error('Dispatcher failed', error)
    return new Response(JSON.stringify({ error: 'Dispatcher failed' }), {
      status: 500,
    })
  }
})

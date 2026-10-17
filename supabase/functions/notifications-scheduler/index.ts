import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { SchedulerDatabaseService } from './services/database.service.ts'
import { SchedulerOrchestrator } from './orchestrators/scheduler.orchestrator.ts'
import { Logger } from '../_shared/logger.ts'

serve(async (req) => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
  const SUPABASE_SERVICE_ROLE_KEY =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  // Manual-testing override: bypasses the slot-time window so a test run
  // doesn't need to wait for 09:00/13:00/18:00 local time.
  const FORCE_RUN = Deno.env.get('NOTIFICATIONS_FORCE_RUN') === 'true'

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
    })
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: 'Scheduler is not configured' }),
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

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const orchestrator = new SchedulerOrchestrator(
      new SchedulerDatabaseService(supabase),
    )

    const result = await orchestrator.run(new Date(), FORCE_RUN)
    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    Logger.error('Scheduler failed', error)
    return new Response(JSON.stringify({ error: 'Scheduler failed' }), {
      status: 500,
    })
  }
})

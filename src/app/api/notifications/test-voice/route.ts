import { randomUUID } from 'node:crypto'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { publicEnv } from '@/lib/env/client'
import { getSupabaseAdminEnv } from '@/lib/env/server'
import { logger } from '@/lib/logger'
import { TABLES } from '@/lib/supabase/tables'

const RATE_LIMIT_ENDPOINT = 'notifications-test-voice'
const RATE_LIMIT_REQUESTS = 1
const RATE_LIMIT_WINDOW_SECONDS = 300
const QUOTA_EXHAUSTED_ERROR = 'Voice reminder quota exhausted'

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { get: (name) => cookieStore.get(name)?.value } },
    )
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: rateAllowed, error: rateError } = await supabase.rpc(
      'consume_api_rate_limit',
      {
        requested_endpoint: RATE_LIMIT_ENDPOINT,
        request_limit: RATE_LIMIT_REQUESTS,
        window_seconds: RATE_LIMIT_WINDOW_SECONDS,
      },
    )
    if (rateError) throw rateError
    if (!rateAllowed) {
      return NextResponse.json(
        {
          error:
            'Please wait a few minutes before requesting another test call.',
        },
        {
          status: 429,
          headers: { 'Retry-After': String(RATE_LIMIT_WINDOW_SECONDS) },
        },
      )
    }

    const { data: profile, error: profileError } = await supabase
      .from(TABLES.PROFILES)
      .select('phone, voice_call_enabled')
      .eq('user_id', user.id)
      .single()

    if (profileError) throw profileError
    if (!profile?.voice_call_enabled || !profile.phone) {
      return NextResponse.json(
        { error: 'Enable Voice Reminders and set your phone number first.' },
        { status: 400 },
      )
    }

    const adminEnv = getSupabaseAdminEnv()
    const admin = createSupabaseAdmin(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      adminEnv.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    )

    const jobId = randomUUID()
    const { error: insertError } = await admin
      .from(TABLES.NOTIFICATION_JOBS)
      .insert({
        id: jobId,
        user_id: user.id,
        business_id: null,
        channel: 'voice',
        purpose: 'sample_voice_test',
        payload: {},
        scheduled_at: new Date().toISOString(),
        idempotency_key: `sample_voice_test:${user.id}:${jobId}`,
      })

    if (insertError) throw insertError

    const dispatchResponse = await fetch(
      `${publicEnv.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notifications-dispatcher`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminEnv.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: '{}',
      },
    )

    if (!dispatchResponse.ok) {
      throw new Error(`Dispatcher returned ${dispatchResponse.status}`)
    }

    const { data: job, error: jobError } = await admin
      .from(TABLES.NOTIFICATION_JOBS)
      .select('status, last_error')
      .eq('id', jobId)
      .single()

    if (jobError) throw jobError

    if (job.status === 'sent') {
      return NextResponse.json({ success: true })
    }

    if (job.last_error === QUOTA_EXHAUSTED_ERROR) {
      return NextResponse.json(
        {
          error: "You've used all your Voice Reminder calls for this period.",
        },
        { status: 403 },
      )
    }

    if (job.status === 'pending' || job.status === 'processing') {
      return NextResponse.json({
        success: true,
        queued: true,
      })
    }

    return NextResponse.json(
      { error: job.last_error || 'Could not place the test call.' },
      { status: 502 },
    )
  } catch (error) {
    logger.error('Failed to trigger test voice call', error)
    return NextResponse.json(
      { error: 'Unable to trigger test call' },
      { status: 500 },
    )
  }
}

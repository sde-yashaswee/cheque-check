import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Exotel Credentials
const EXOTEL_API_KEY = Deno.env.get('EXOTEL_API_KEY') || ''
const EXOTEL_API_TOKEN = Deno.env.get('EXOTEL_API_TOKEN') || ''
const EXOTEL_ACCOUNT_SID = Deno.env.get('EXOTEL_ACCOUNT_SID') || ''
const EXOTEL_FROM_NUMBER = Deno.env.get('EXOTEL_FROM_NUMBER') || '' // Your Exophone
const EXOTEL_SUBDOMAIN = Deno.env.get('EXOTEL_SUBDOMAIN') || 'api.exotel.com'

serve(async (req) => {
  const url = new URL(req.url)

  // --- PART 1: EXOTEL CALLBACK (GET) ---
  // Exotel hits this URL when the call connects to get the voice instructions
  if (req.method === 'GET') {
    const message = url.searchParams.get('Message') || "Hello from Cheque Check."
    
    // Exotel Passthru XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
        <Say voice="female" language="en-IN">${message}</Say>
    </Response>`

    return new Response(xml, {
      headers: { "Content-Type": "text/xml" },
    })
  }

  // --- PART 2: TRIGGER LOGIC (POST) ---
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch cheques clearing today
    const { data: cheques, error: chequesError } = await supabase
      .from('cheques')
      .select(`
        amount,
        account:accounts(bank:banks(name)),
        business:businesses(user_id)
      `)
      .eq('status', 'Issued')
      .or(`deposit_date.eq.${today},and(deposit_date.is.null,cheque_date.eq.${today})`)

    if (chequesError) throw chequesError
    
    if (!cheques || cheques.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No cheques due today" }))
    }

    // Group by User
    const userIds = [...new Set(cheques.map(c => c.business.user_id))]
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, phone, voice_call_enabled')
      .in('user_id', userIds)
      .eq('voice_call_enabled', true)
      .not('phone', 'is', null)

    const results = []
    for (const profile of profiles || []) {
      const userCheques = cheques.filter(c => c.business.user_id === profile.user_id)
      const banks: Record<string, any> = {}
      userCheques.forEach(c => {
        const name = c.account?.bank?.name || 'Unknown Bank'
        banks[name] = { count: (banks[name]?.count || 0) + 1, total: (banks[name]?.total || 0) + Number(c.amount) }
      })

      const bankSummaries = Object.entries(banks)
        .map(([bank, data]: [string, any]) => 
          `${data.count} cheque${data.count > 1 ? 's' : ''} hitting ${bank} for a total of ${data.total}`
        )
        .join(', and ')

      const message = `Hello ${profile.name}, this is your Cheque Check summary for today. You have ${bankSummaries}. Please ensure your accounts are funded.`
      
      console.log(`Triggering Exotel call to ${profile.phone}`)

      if (EXOTEL_API_KEY && EXOTEL_API_TOKEN && EXOTEL_ACCOUNT_SID) {
        // Callback URL pointing back to this function
        const callbackUrl = new URL(req.url)
        callbackUrl.searchParams.set('Message', message)

        const exotelUrl = `https://${EXOTEL_SUBDOMAIN}/v1/Accounts/${EXOTEL_ACCOUNT_SID}/Calls/connect.json`
        
        const response = await fetch(exotelUrl, {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${EXOTEL_API_KEY}:${EXOTEL_API_TOKEN}`),
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: profile.phone,
            To: EXOTEL_FROM_NUMBER,
            CallerId: EXOTEL_FROM_NUMBER,
            Url: callbackUrl.toString(),
            CallType: 'transcribe' // Connects user to the URL
          })
        })

        const res = await response.json()
        results.push({ user: profile.name, status: response.ok ? 'success' : 'failed', sid: res?.Call?.Sid })
      }
    }

    return new Response(JSON.stringify({ success: true, calls: results }))
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})

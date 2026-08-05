import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || ''
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || ''
const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER') || ''

serve(async (req) => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    const today = new Date().toISOString().split('T')[0]
    
    // Fetch aggregated cheque data for all eligible users
    // We use a join across businesses and profiles to get the phone numbers
    const { data: reportData, error } = await supabase
      .from('cheques')
      .select(`
        amount,
        bank:banks(bank_name),
        business:businesses(
          user_id,
          profile:profiles!inner(id, name, phone, voice_call_enabled)
        )
      `)
      .eq('status', 'Issued')
      .or(`deposit_date.eq.${today},and(deposit_date.is.null,cheque_date.eq.${today})`)
      .filter('business.profile.voice_call_enabled', 'eq', true)
      .not('business.profile.phone', 'is', null)

    if (error) throw error

    // Group the data by user (profile_id)
    const userGroups: Record<string, any> = {}
    
    for (const item of reportData || []) {
      const profile = item.business.profile
      const userId = profile.id
      const bankName = item.bank.bank_name
      
      if (!userGroups[userId]) {
        userGroups[userId] = {
          name: profile.name,
          phone: profile.phone,
          banks: {}
        }
      }
      
      if (!userGroups[userId].banks[bankName]) {
        userGroups[userId].banks[bankName] = { count: 0, total: 0 }
      }
      
      userGroups[userId].banks[bankName].count += 1
      userGroups[userId].banks[bankName].total += Number(item.amount)
    }

    const results = []

    // For each user, trigger the Twilio Voice Call
    for (const userId in userGroups) {
      const user = userGroups[userId]
      const bankSummaries = Object.entries(user.banks)
        .map(([bank, data]: [string, any]) => 
          `${data.count} cheque${data.count > 1 ? 's' : ''} hitting ${bank} for a total of ${data.total}`
        )
        .join(', and ')

      const message = `Hello ${user.name}, this is your Cheque Check summary for today. You have ${bankSummaries}. Please ensure your accounts are funded.`
      
      console.log(`Calling ${user.phone}: ${message}`)

      if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
        const twiml = `<Response><Say voice="Polly.Aditi">${message}</Say></Response>`
        
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
            },
            body: new URLSearchParams({
              To: user.phone,
              From: TWILIO_FROM_NUMBER,
              Twiml: twiml
            })
          }
        )

        const result = await response.json()
        results.push({ userId, status: response.ok ? 'success' : 'failed', sid: result.sid })
      } else {
        results.push({ userId, status: 'stub', message: 'Twilio credentials not configured' })
      }
    }

    return new Response(JSON.stringify({ success: true, calls: results }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})

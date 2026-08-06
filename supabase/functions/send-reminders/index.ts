import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

import { TwilioVoiceService } from './services/twilio.service.ts'
import { DatabaseService } from './services/database.service.ts'
import { ReminderOrchestrator } from './orchestrators/reminder.orchestrator.ts'
import { Logger } from './utils/logger.ts'

serve(async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID') || '';
  const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') || '';
  const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER') || '';

  const twilioService = new TwilioVoiceService({
    accountSid: TWILIO_ACCOUNT_SID,
    authToken: TWILIO_AUTH_TOKEN,
    fromNumber: TWILIO_FROM_NUMBER
  });

  // Handle TwiML callback
  if (action === 'twiml') {
    const message = url.searchParams.get('message') || "Hello from Cheque Check.";
    const lang = url.searchParams.get('lang') || 'en';
    
    const xml = twilioService.generateTwiML(message, lang);
    return new Response(xml, {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Handle Trigger (POST)
  if (req.method === 'POST') {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const dbService = new DatabaseService(supabase);
      const orchestrator = new ReminderOrchestrator(dbService, twilioService, req.url);

      const results = await orchestrator.run();
      return new Response(JSON.stringify({ success: true, results }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      Logger.error("Process failed", error);
      return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
});

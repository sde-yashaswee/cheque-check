import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const encoder = new TextEncoder();

async function verifySignature(body: string, signature: string, secret: string): Promise<boolean> {
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify", "sign"]
  );
  
  const signatureBytes = new Uint8Array(
    signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
  
  return await crypto.subtle.verify(
    "HMAC",
    hmacKey,
    signatureBytes,
    encoder.encode(body)
  );
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get('x-razorpay-signature');
  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  const secret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
  if (!secret) {
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const rawBody = await req.text();
  const isValid = await verifySignature(rawBody, signature, secret);

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const event = payload.event;

  if (event !== 'order.paid') {
    return new Response("Event ignored", { status: 200 });
  }

  const order = payload.payload.order.entity;
  const payment = payload.payload.payment.entity;
  
  // Metadata from notes
  const notes = order.notes || {};
  const userId = notes.user_id;
  const type = notes.type; // lifetime, subscription, top_up
  const featureId = notes.feature_id;

  if (!userId || !type || !featureId) {
    return new Response("Missing metadata in order notes", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  try {
    // 1. Record Transaction
    const { error: txError } = await supabase.from('transactions').upsert({
      user_id: userId,
      razorpay_order_id: order.id,
      razorpay_payment_id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      type: type,
      feature_id: featureId
    });

    if (txError) throw txError;

    // 2. Update Entitlements/Quotas
    if (type === 'lifetime') {
      await supabase.from('user_entitlements').upsert({
        user_id: userId,
        feature_id: featureId,
        status: 'active',
        valid_until: null
      });
    } 
    else if (type === 'subscription') {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      await supabase.from('user_entitlements').upsert({
        user_id: userId,
        feature_id: featureId,
        status: 'active',
        valid_until: validUntil.toISOString()
      });

      // Reset/Set Quota
      const baseLimit = featureId === 'ai_scanner_sub' ? 250 : 100;
      const quotaFeatureId = featureId === 'ai_scanner_sub' ? 'ai_scan' : 'voice_reminder';

      await supabase.from('user_quotas').upsert({
        user_id: userId,
        feature_id: quotaFeatureId,
        used: 0,
        limit: baseLimit,
        reset_at: validUntil.toISOString()
      });
    } 
    else if (type === 'top_up') {
      const topUpAmount = featureId === 'ai_scan' ? 250 : 100;
      
      // Increment limit
      const { data: currentQuota } = await supabase
        .from('user_quotas')
        .select('limit')
        .eq('user_id', userId)
        .eq('feature_id', featureId)
        .single();
      
      const newLimit = (currentQuota?.limit || 0) + topUpAmount;

      await supabase.from('user_quotas').upsert({
        user_id: userId,
        feature_id: featureId,
        limit: newLimit
      });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});

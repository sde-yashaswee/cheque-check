import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const encoder = new TextEncoder()

type RazorpayEntity = {
  id: string
  amount: number
  currency: string
  status: string
  order_id?: string
  notes?: Record<string, string>
}

type RazorpayWebhook = {
  event: string
  payload: {
    order: { entity: RazorpayEntity }
    payment: { entity: RazorpayEntity }
  }
}

function isWebhookPayload(value: unknown): value is RazorpayWebhook {
  if (!value || typeof value !== 'object') return false
  const payload = value as Partial<RazorpayWebhook>
  return Boolean(
    typeof payload.event === 'string' &&
    payload.payload?.order?.entity?.id &&
    payload.payload?.payment?.entity?.id,
  )
}

async function verifySignature(
  body: string,
  signature: string,
  secret: string,
) {
  if (!/^[a-f0-9]{64}$/iu.test(signature)) return false

  const hmacKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const signatureBytes = new Uint8Array(
    signature.match(/.{2}/gu)?.map((byte) => Number.parseInt(byte, 16)) ?? [],
  )

  return crypto.subtle.verify(
    'HMAC',
    hmacKey,
    signatureBytes,
    encoder.encode(body),
  )
}

serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const signature = request.headers.get('x-razorpay-signature')
  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!signature) return new Response('Missing signature', { status: 400 })
  if (!webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response('Webhook is not configured', { status: 500 })
  }

  const rawBody = await request.text()
  if (!(await verifySignature(rawBody, signature, webhookSecret))) {
    return new Response('Invalid signature', { status: 401 })
  }

  let body: unknown
  try {
    body = JSON.parse(rawBody)
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  if (!isWebhookPayload(body)) {
    return new Response('Invalid webhook payload', { status: 400 })
  }
  if (body.event !== 'order.paid') {
    return new Response('Event ignored', { status: 200 })
  }

  const order = body.payload.order.entity
  const payment = body.payload.payment.entity
  const userId = order.notes?.user_id
  const productId = order.notes?.product_id

  if (
    !userId ||
    !productId ||
    payment.order_id !== order.id ||
    payment.status !== 'captured' ||
    order.amount !== payment.amount ||
    order.currency !== payment.currency
  ) {
    return new Response('Payment payload does not match the order', {
      status: 400,
    })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { error } = await supabase.rpc('fulfill_payment_order', {
    razorpay_order: order.id,
    razorpay_payment: payment.id,
    order_user_id: userId,
    requested_product_id: productId,
    paid_amount: payment.amount,
    paid_currency: payment.currency,
  })

  if (error) {
    console.error('Payment fulfillment failed', {
      code: error.code,
      message: error.message,
      orderId: order.id,
    })
    return new Response('Payment fulfillment failed', { status: 500 })
  }

  return Response.json({ success: true })
})

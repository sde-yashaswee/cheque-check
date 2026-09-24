import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { publicEnv } from '@/lib/env/client'
import { getRazorpayEnv, getSupabaseAdminEnv } from '@/lib/env/server'
import { CreatePaymentOrderSchema } from '@/lib/payments'
import { logger } from '@/lib/logger'

type PaymentProduct = {
  id: string
  name: string
  transaction_type: 'lifetime' | 'subscription' | 'top_up'
  feature_id: string
  amount: number
  currency: 'INR'
  required_entitlement_id: string | null
}

function isEntitlementActive(validUntil: string | null) {
  return validUntil === null || new Date(validUntil).getTime() > Date.now()
}

export async function POST(request: Request) {
  try {
    let requestBody: unknown
    try {
      requestBody = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const requestResult = CreatePaymentOrderSchema.safeParse(requestBody)
    if (!requestResult.success) {
      return NextResponse.json(
        { error: 'Invalid payment product' },
        { status: 400 },
      )
    }

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
        requested_endpoint: 'payment-order',
        request_limit: 5,
        window_seconds: 60,
      },
    )
    if (rateError) throw rateError
    if (!rateAllowed) {
      return NextResponse.json(
        { error: 'Too many payment requests. Please try again shortly.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      )
    }

    const adminEnv = getSupabaseAdminEnv()
    const admin = createSupabaseAdmin(
      publicEnv.NEXT_PUBLIC_SUPABASE_URL,
      adminEnv.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    )
    const { data: productData, error: productError } = await admin
      .from('payment_products')
      .select(
        'id, name, transaction_type, feature_id, amount, currency, required_entitlement_id',
      )
      .eq('id', requestResult.data.productId)
      .eq('active', true)
      .single()

    if (productError || !productData) {
      return NextResponse.json(
        { error: 'Payment product is unavailable' },
        { status: 404 },
      )
    }
    const product = productData as PaymentProduct

    const { data: entitlements, error: entitlementError } = await admin
      .from('user_entitlements')
      .select('feature_id, status, valid_until')
      .eq('user_id', user.id)
      .eq('status', 'active')

    if (entitlementError) throw entitlementError

    const activeEntitlements = new Set(
      (entitlements ?? [])
        .filter((entitlement) => isEntitlementActive(entitlement.valid_until))
        .map((entitlement) => entitlement.feature_id),
    )

    if (
      (product.transaction_type === 'lifetime' ||
        product.transaction_type === 'subscription') &&
      activeEntitlements.has(product.feature_id)
    ) {
      return NextResponse.json(
        { error: 'This product is already active' },
        { status: 409 },
      )
    }

    if (
      product.required_entitlement_id &&
      !activeEntitlements.has(product.required_entitlement_id)
    ) {
      return NextResponse.json(
        { error: 'An active subscription is required for this top-up' },
        { status: 403 },
      )
    }

    const razorpayEnv = getRazorpayEnv()
    const razorpay = new Razorpay({
      key_id: razorpayEnv.RAZORPAY_KEY_ID,
      key_secret: razorpayEnv.RAZORPAY_KEY_SECRET,
    })
    const order = await razorpay.orders.create({
      amount: product.amount,
      currency: product.currency,
      receipt: `cc_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: { user_id: user.id, product_id: product.id },
    })

    const { error: recordError } = await admin.rpc('record_payment_order', {
      order_user_id: user.id,
      requested_product_id: product.id,
      razorpay_order: order.id,
    })

    if (recordError) {
      const status = recordError.code === '23505' ? 409 : 500
      return NextResponse.json({ error: recordError.message }, { status })
    }

    return NextResponse.json({
      id: order.id,
      amount: product.amount,
      currency: product.currency,
      productId: product.id,
      name: product.name,
    })
  } catch (error: unknown) {
    logger.error('Failed to create payment order', error)
    return NextResponse.json(
      { error: 'Unable to create payment order' },
      { status: 500 },
    )
  }
}

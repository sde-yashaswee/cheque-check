import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { publicEnv } from '@/lib/env/client'
import { getRazorpayEnv } from '@/lib/env/server'

export async function POST(req: Request) {
  try {
    const razorpayEnv = getRazorpayEnv()
    const razorpay = new Razorpay({
      key_id: razorpayEnv.RAZORPAY_KEY_ID,
      key_secret: razorpayEnv.RAZORPAY_KEY_SECRET,
    })

    const cookieStore = await cookies()
    const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: { get: (name) => cookieStore.get(name)?.value },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, currency = 'INR', planType = 'lifetime' } = await req.json()

    const options = {
      amount: amount * 100, // amount in smallest currency unit
      currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user.id,
        planType,
      },
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
  }
}

import { describe, expect, it } from 'vitest'
import {
  openAiEnvSchema,
  publicEnvSchema,
  razorpayEnvSchema,
  supabaseAdminEnvSchema,
} from './schema'

describe('publicEnvSchema', () => {
  it('accepts the required Supabase configuration', () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
    })

    expect(result.success).toBe(true)
  })

  it('rejects invalid URLs and log levels', () => {
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: 'not-a-url',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      NEXT_PUBLIC_LOG_LEVEL: 'verbose',
    })

    expect(result.success).toBe(false)
  })

  it('treats blank optional feature variables as unset', () => {
    const result = publicEnvSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
      NEXT_PUBLIC_RAZORPAY_KEY_ID: '',
    })

    expect(result.NEXT_PUBLIC_RAZORPAY_KEY_ID).toBeUndefined()
  })
})

describe('feature environment schemas', () => {
  it('requires an OpenAI key when OCR is used', () => {
    expect(openAiEnvSchema.safeParse({ OPENAI_API_KEY: '' }).success).toBe(
      false,
    )
  })

  it('requires both Razorpay server credentials', () => {
    expect(
      razorpayEnvSchema.safeParse({
        RAZORPAY_KEY_ID: 'key',
        RAZORPAY_KEY_SECRET: '',
      }).success,
    ).toBe(false)
  })

  it('requires the Supabase service-role key for admin operations', () => {
    expect(
      supabaseAdminEnvSchema.safeParse({ SUPABASE_SERVICE_ROLE_KEY: '' })
        .success,
    ).toBe(false)
  })
})

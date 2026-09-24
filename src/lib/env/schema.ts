import { z } from 'zod'

const optionalString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
)

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .optional(),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: optionalString,
  NEXT_PUBLIC_SENTRY_DSN: optionalString,
})

export const openAiEnvSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
})

export const razorpayEnvSchema = z.object({
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
})

export function envError(scope: string, error: z.ZodError) {
  return new Error(
    `Invalid ${scope} environment variables:\n${z.prettifyError(error)}`,
  )
}

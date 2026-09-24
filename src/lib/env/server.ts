import 'server-only'

import { envError, openAiEnvSchema, razorpayEnvSchema } from './schema'

export function getOpenAiEnv() {
  const result = openAiEnvSchema.safeParse({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  })
  if (!result.success) {
    throw envError('OpenAI', result.error)
  }
  return result.data
}

export function getRazorpayEnv() {
  const result = razorpayEnvSchema.safeParse({
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  })
  if (!result.success) {
    throw envError('Razorpay', result.error)
  }
  return result.data
}

import { z } from 'zod'

export const PaymentProductIdSchema = z.enum([
  'lifetime_premium',
  'ai_scanner_30d',
  'voice_reminder_30d',
  'ai_scan_250',
  'voice_reminder_100',
])

export type PaymentProductId = z.infer<typeof PaymentProductIdSchema>

export const CreatePaymentOrderSchema = z.object({
  productId: PaymentProductIdSchema,
})

export const PaymentOrderSchema = z.object({
  id: z.string().min(1),
  amount: z.number().int().positive(),
  currency: z.literal('INR'),
  productId: PaymentProductIdSchema,
  name: z.string().min(1),
})

export type PaymentOrder = z.infer<typeof PaymentOrderSchema>

import { z } from 'zod'
import { ProductIdSchema } from '@/features/monetization/constants'

export const PaymentProductIdSchema = ProductIdSchema

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

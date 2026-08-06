import { z } from 'zod'

export const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  color: z.string().optional(),
  icon: z.string().optional(),
  logo_url: z.string().nullable().optional(),
})

export const partySchema = z.object({
  name: z.string().min(1, 'Party name is required'),
  contact: z.string().min(10, 'Valid contact number is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  color: z.string().optional(),
  icon: z.string().optional(),
  avatar_url: z.string().nullable().optional(),
})

export const accountSchema = z.object({
  bank_id: z.string().min(1, 'Bank is required'),
  account_name: z.string().min(1, 'Account holder name is required'),
  account_number: z.string().min(1, 'Account number is required'),
  ifsc_code: z.string().optional().or(z.literal('')),
  color: z.string().optional(),
  icon: z.string().optional(),
  notes: z.string().optional().or(z.literal('')),
})

export const chequeSchema = z.object({
  cheque_number: z.string().min(1, 'Cheque number is required'),
  amount: z.number().positive('Amount must be positive'),
  cheque_date: z.string().min(1, 'Cheque date is required'),
  deposit_date: z.string().min(1, 'Expected deposit date is required'),
  party_id: z.string().min(1, 'Party is required'),
  account_id: z.string().min(1, 'Account is required'),
  type: z.enum(['Outward', 'Inward']),
  notes: z.string().optional().or(z.literal('')),
  image_url: z.string().nullable().optional(),
})

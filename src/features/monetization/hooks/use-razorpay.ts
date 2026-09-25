import { useState } from 'react'
import { getRazorpayPublicKey } from '@/lib/env/client'
import { type PaymentProductId } from '@/lib/payments'
import { paymentService } from '@/services/payment.service'

type RazorpaySuccess = {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

type RazorpayCheckout = new (options: {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpaySuccess) => void
  theme: { color: string }
}) => { open: () => void }

declare global {
  interface Window {
    Razorpay: RazorpayCheckout
  }
}

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false)

  const processPayment = async ({
    productId,
    onSuccess,
  }: {
    productId: PaymentProductId
    onSuccess?: () => void
  }) => {
    setIsProcessing(true)
    try {
      const order = await paymentService.createOrder(productId)
      const checkout = new window.Razorpay({
        key: getRazorpayPublicKey(),
        amount: order.amount,
        currency: order.currency,
        name: 'Cheque Check',
        description: order.name,
        order_id: order.id,
        handler: () => onSuccess?.(),
        theme: { color: '#000000' },
      })
      checkout.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to initiate payment',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return { processPayment, isProcessing }
}

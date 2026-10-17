import { useRef, useState } from 'react'
import { getRazorpayPublicKey } from '@/lib/env/client'
import { type PaymentProductId } from '@/lib/payments'
import { paymentService } from '@/features/monetization/services/payment.service'

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
  modal: { ondismiss: () => void }
  theme: { color: string }
}) => { open: () => void }

declare global {
  interface Window {
    Razorpay: RazorpayCheckout
  }
}

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false)
  const processing = useRef(false)

  const finish = () => {
    processing.current = false
    setIsProcessing(false)
  }

  const processPayment = async ({
    productId,
    onSuccess,
  }: {
    productId: PaymentProductId
    onSuccess?: () => void
  }) => {
    if (processing.current) return
    processing.current = true
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
        handler: () => {
          finish()
          onSuccess?.()
        },
        modal: { ondismiss: finish },
        theme: { color: '#000000' },
      })
      checkout.open()
    } catch (error) {
      finish()
      console.error('Payment error:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to initiate payment',
      )
    }
  }

  return { processPayment, isProcessing }
}

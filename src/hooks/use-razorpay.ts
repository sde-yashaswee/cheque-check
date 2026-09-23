import { useState } from 'react'
import { getRazorpayPublicKey } from '@/lib/env/client'

declare global {
  interface Window {
    Razorpay: any
  }
}

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false)

  const createOrder = async (type: string, featureId: string) => {
    const res = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, featureId }),
    })
    return res.json()
  }

  const processPayment = async ({
    type,
    featureId,
    onSuccess,
  }: {
    type: string
    featureId: string
    onSuccess?: () => void
  }) => {
    setIsProcessing(true)
    try {
      const order = await createOrder(type, featureId)

      if (order.error) {
        throw new Error(order.error)
      }

      const options = {
        key: getRazorpayPublicKey(),
        amount: order.amount,
        currency: order.currency,
        name: 'Cheque Check',
        description: `Purchase ${featureId}`,
        order_id: order.id,
        handler: function (response: any) {
          // Razorpay returns razorpay_payment_id, razorpay_order_id, razorpay_signature
          // Our webhook will handle the DB update, but we can refresh UI here
          if (onSuccess) onSuccess()
        },
        prefill: {
          name: '', // Can be filled from profile
          email: '', // Can be filled from profile
        },
        theme: {
          color: '#000000',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Failed to initiate payment. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    processPayment,
    isProcessing,
  }
}

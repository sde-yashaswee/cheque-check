import {
  AiImageIcon as AiIcon,
  CallIcon as PhoneIcon,
  Coins01Icon as CoinsIcon,
  StarIcon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import type { PaymentProductId } from '@/lib/payments'

export const paymentProductIcons: Record<PaymentProductId, typeof StarIcon> = {
  lifetime_premium: StarIcon,
  ai_scanner_30d: AiIcon,
  voice_reminder_30d: PhoneIcon,
  ai_scan_250: CoinsIcon,
  voice_reminder_100: ZapIcon,
}

export function getPaymentProductIcon(productId: PaymentProductId) {
  return paymentProductIcons[productId]
}

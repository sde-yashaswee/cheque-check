import {
  AiImageIcon as AiIcon,
  CallIcon as PhoneIcon,
  Coins01Icon as CoinsIcon,
  StarIcon,
  ZapIcon,
} from '@hugeicons/core-free-icons'
import { PRODUCT_IDS, type ProductId } from '@/features/monetization/constants'

export const paymentProductIcons: Record<ProductId, typeof StarIcon> = {
  [PRODUCT_IDS.LIFETIME_PREMIUM]: StarIcon,
  [PRODUCT_IDS.AI_SCANNER_30D]: AiIcon,
  [PRODUCT_IDS.VOICE_REMINDER_30D]: PhoneIcon,
  [PRODUCT_IDS.AI_SCAN_250]: CoinsIcon,
  [PRODUCT_IDS.VOICE_REMINDER_100]: ZapIcon,
}

export function getPaymentProductIcon(productId: ProductId) {
  return paymentProductIcons[productId]
}

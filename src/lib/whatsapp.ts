import { publicEnv } from '@/lib/env/client'

const DEFAULT_SUPPORT_NUMBER = '+919794457099'

export function getWhatsAppSupportNumber(): string {
  const configured = publicEnv.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER
  return (configured || DEFAULT_SUPPORT_NUMBER).replace(/[^\d]/g, '')
}

export function getWhatsAppSupportLink(message?: string): string {
  const number = getWhatsAppSupportNumber()
  const query = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${query}`
}

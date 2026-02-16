/**
 * Contatti e indirizzo predefiniti.
 * WhatsApp 3792675864 usato per prenotazione tavolo e ordinazioni.
 * Sovrascrivibili con variabili d'ambiente NEXT_PUBLIC_*.
 */
export const DEFAULT_ADDRESS = 'Via R. Ruffino, 9, 90049 Terrasini PA'
export const DEFAULT_PHONE = '+39 379 267 5864'
export const DEFAULT_PHONE_RAW = '393792675864'
export const DEFAULT_WHATSAPP_URL = 'https://wa.me/393792675864'
export const DEFAULT_MAPS_URL = 'https://maps.app.goo.gl/2ZQ74WrGo7Xe3bEBA?g_st=ic'

function env(key: string): string | undefined {
  if (typeof process === 'undefined' || !process.env) return undefined
  const v = process.env[key]
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

export function getAddress(): string {
  return env('NEXT_PUBLIC_ADDRESS') ?? DEFAULT_ADDRESS
}

export function getPhoneDisplay(): string {
  return env('NEXT_PUBLIC_PHONE') ?? DEFAULT_PHONE
}

export function getWhatsappNumber(): string {
  return env('NEXT_PUBLIC_WHATSAPP_NUMBER') ?? DEFAULT_PHONE
}

export function getWhatsappUrl(): string {
  const raw = env('NEXT_PUBLIC_WHATSAPP_URL')
  if (raw && raw.startsWith('https://wa.me/')) return raw
  const num = env('NEXT_PUBLIC_WHATSAPP_NUMBER')?.replace(/\D/g, '') ?? '393792675864'
  return `https://wa.me/${num}`
}

export function getMapsUrl(): string {
  return env('NEXT_PUBLIC_MAPS_URL') ?? DEFAULT_MAPS_URL
}

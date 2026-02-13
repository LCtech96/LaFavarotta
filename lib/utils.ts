import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(price)
}

/**
 * Valida e ottimizza un'immagine base64 per Android
 * Rimuove eventuali caratteri problematici e assicura il formato corretto
 */
export function optimizeBase64Image(base64: string): string {
  if (!base64) return base64
  
  // Rimuovi eventuali spazi o caratteri newline
  let cleaned = base64.trim().replace(/\s/g, '')
  
  // Assicurati che inizi con data:image
  if (!cleaned.startsWith('data:image')) {
    // Se è solo base64 senza prefix, aggiungi un prefix generico
    if (cleaned.startsWith('/9j/') || cleaned.startsWith('iVBORw0KGgo')) {
      // JPEG o PNG
      const isPng = cleaned.startsWith('iVBORw0KGgo')
      cleaned = `data:image/${isPng ? 'png' : 'jpeg'};base64,${cleaned}`
    }
  }
  
  return cleaned
}

/**
 * Converte base64 in blob URL per migliorare compatibilità Android
 */
export function base64ToBlobUrl(base64: string): string | null {
  if (typeof window === 'undefined') return null
  if (!base64 || !base64.startsWith('data:image')) return null

  try {
    // Estrai il tipo MIME e i dati base64
    const matches = base64.match(/^data:image\/([a-z]+);base64,(.+)$/i)
    if (!matches || matches.length !== 3) return null

    const mimeType = matches[1]
    const base64Data = matches[2]

    // Converti base64 in binary
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: `image/${mimeType}` })

    // Crea blob URL
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error converting base64 to blob URL:', error)
    return null
  }
}

/**
 * Rileva se il dispositivo è Android
 */
export function isAndroid(): boolean {
  if (typeof window === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

/**
 * Verifica se un'immagine base64 è valida
 */
export function isValidBase64Image(base64: string): boolean {
  if (!base64) return false
  
  // Deve iniziare con data:image
  if (!base64.startsWith('data:image')) return false
  
  // Deve contenere base64,
  if (!base64.includes('base64,')) return false
  
  // Estrai la parte base64
  const base64Part = base64.split('base64,')[1]
  if (!base64Part || base64Part.length < 100) return false
  
  return true
}


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


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

/** Limite payload consigliato per Vercel (4.5MB) - restiamo sotto per sicurezza */
const MAX_BASE64_CHARS = 3 * 1024 * 1024 // ~3MB base64

/**
 * Comprime un'immagine base64 per upload (es. post da iPhone).
 * Riduce dimensioni e qualità se supera il limite, per evitare 413 su Vercel.
 */
export function compressBase64ForUpload(base64: string): Promise<string> {
  if (typeof window === 'undefined') return Promise.resolve(optimizeBase64Image(base64))
  const cleaned = optimizeBase64Image(base64)
  if (cleaned.length <= MAX_BASE64_CHARS) return Promise.resolve(cleaned)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(cleaned)
        return
      }
      const maxSide = 1200
      let w = img.width
      let h = img.height
      if (w > maxSide || h > maxSide) {
        if (w > h) {
          h = Math.round((h * maxSide) / w)
          w = maxSide
        } else {
          w = Math.round((w * maxSide) / h)
          h = maxSide
        }
      }
      canvas.width = w
      canvas.height = h
      ctx.drawImage(img, 0, 0, w, h)
      let quality = 0.85
      let result = canvas.toDataURL('image/jpeg', quality)
      while (result.length > MAX_BASE64_CHARS && quality > 0.2) {
        quality -= 0.15
        result = canvas.toDataURL('image/jpeg', quality)
      }
      if (result.length > MAX_BASE64_CHARS) {
        canvas.width = Math.round(w * 0.7)
        canvas.height = Math.round(h * 0.7)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        result = canvas.toDataURL('image/jpeg', 0.6)
      }
      resolve(result)
    }
    img.onerror = () => resolve(cleaned)
    img.src = cleaned
  })
}


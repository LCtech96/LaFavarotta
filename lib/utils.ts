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
 * Riduce la qualità di un'immagine base64 per Android
 * Android può avere problemi con immagini base64 troppo grandi
 */
function compressBase64Image(base64: string, maxSizeKB: number = 500): Promise<string> {
  return new Promise((resolve) => {
    if (!base64 || !base64.startsWith('data:image')) {
      resolve(base64)
      return
    }

    // Estrai la parte base64
    const base64Part = base64.split('base64,')[1]
    if (!base64Part) {
      resolve(base64)
      return
    }

    // Calcola dimensione approssimativa in KB
    const sizeKB = (base64Part.length * 3) / 4 / 1024

    // Se l'immagine è già abbastanza piccola, non comprimere
    if (sizeKB <= maxSizeKB) {
      resolve(base64)
      return
    }

    // Crea un'immagine per ridimensionarla
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        resolve(base64)
        return
      }

      // Calcola nuove dimensioni mantenendo aspect ratio
      let width = img.width
      let height = img.height
      const maxDimension = 800 // Max 800px per lato

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else {
          width = (width * maxDimension) / height
          height = maxDimension
        }
      }

      canvas.width = width
      canvas.height = height

      // Disegna l'immagine ridimensionata
      ctx.drawImage(img, 0, 0, width, height)

      // Converti in base64 con qualità ridotta
      const quality = 0.8
      const mimeType = base64.match(/data:image\/([^;]+)/)?.[1] || 'jpeg'
      const compressed = canvas.toDataURL(`image/${mimeType}`, quality)
      
      resolve(compressed)
    }

    img.onerror = () => {
      // Se fallisce, ritorna l'originale
      resolve(base64)
    }

    img.src = base64
  })
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
 * Ottimizza e comprime un'immagine base64 per Android (async)
 */
export async function optimizeAndCompressBase64Image(base64: string): Promise<string> {
  const optimized = optimizeBase64Image(base64)
  // Comprimi solo se necessario (in background, non blocca)
  if (typeof window !== 'undefined') {
    return compressBase64Image(optimized)
  }
  return optimized
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


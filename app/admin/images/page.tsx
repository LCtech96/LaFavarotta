'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { menuItems, categories } from '@/data/menu-data'
import { ImageCropper } from '@/components/image-cropper'
import { optimizeBase64Image } from '@/lib/utils'

// Admin images page - manage menu item images

export default function AdminImages() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [croppingImage, setCroppingImage] = useState<string | null>(null)
  const [croppingItemId, setCroppingItemId] = useState<number | null>(null)
  const [itemImages, setItemImages] = useState<Record<number, string>>({})
  const router = useRouter()

  useEffect(() => {
    // Load all item images
    const images: Record<number, string> = {}
    menuItems.forEach(item => {
      const saved = localStorage.getItem(`item_image_${item.id}`)
      if (saved) {
        images[item.id] = saved
      }
    })
    setItemImages(images)
  }, [])

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleFileSelect = (itemId: number, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setCroppingImage(imageDataUrl)
      setCroppingItemId(itemId)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedImage: string) => {
    if (!croppingItemId) return

    try {
      // Ottimizza l'immagine base64 per Android
      const optimized = optimizeBase64Image(croppedImage)
      
      // Verifica che l'ottimizzazione sia andata a buon fine
      if (!optimized || optimized.length < 100) {
        console.error('Immagine ottimizzata troppo piccola o invalida')
        alert('Errore: immagine non valida. Riprova.')
        return
      }

      // Salva in localStorage
      localStorage.setItem(`item_image_${croppingItemId}`, optimized)
      
      // Verifica che sia stata salvata
      const saved = localStorage.getItem(`item_image_${croppingItemId}`)
      if (!saved || saved !== optimized) {
        console.error('Errore nel salvataggio in localStorage')
        alert('Errore nel salvataggio. Riprova.')
        return
      }
      
      console.log('Immagine salvata con successo per item', croppingItemId, 'Dimensione:', (optimized.length / 1024).toFixed(2), 'KB')
      
      // Update local state
      setItemImages(prev => ({
        ...prev,
        [croppingItemId]: optimized
      }))
      
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new CustomEvent('imageUpdated', { 
        detail: { itemId: croppingItemId, imageUrl: optimized } 
      }))

      // Reset
      setCroppingImage(null)
      setCroppingItemId(null)
      
      alert('Immagine caricata con successo! Le modifiche sono visibili immediatamente nel menu.')
    } catch (error) {
      console.error('Errore nel salvataggio immagine:', error)
      alert('Errore nel salvataggio dell\'immagine. Riprova.')
    }
  }

  const handleCancelCrop = () => {
    setCroppingImage(null)
    setCroppingItemId(null)
  }

  if (!isAuthenticated) {
    return null
  }

  const filteredItems = selectedCategory !== null
    ? menuItems.filter(item => item.categoryId === selectedCategory)
    : menuItems

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Torna al pannello
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Gestisci Immagini
        </h1>

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filtra per categoria
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              Tutti
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {item.name}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Immagine piatto
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleFileSelect(item.id, file)
                      }
                    }}
                    className="hidden"
                    id={`image-${item.id}`}
                  />
                  <label
                    htmlFor={`image-${item.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Upload size={16} />
                    Carica e ritaglia immagine
                  </label>
                  {itemImages[item.id] && (
                    <div className="mt-2">
                      <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                        ✓ Immagine caricata
                      </div>
                      <img
                        src={itemImages[item.id]}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-lg"
                        loading="lazy"
                        decoding="async"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.error('Error loading preview image for item', item.id)
                          e.currentTarget.style.display = 'none'
                        }}
                        style={{ 
                          display: 'block',
                          maxWidth: '100%',
                          height: 'auto'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {croppingImage && (
        <ImageCropper
          image={croppingImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
          aspectRatio={1}
        />
      )}
    </div>
  )
}


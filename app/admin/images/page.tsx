'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { menuItems, categories } from '@/data/menu-data'
import { ImageCropper } from '@/components/image-cropper'
import { optimizeBase64Image } from '@/lib/utils'

export default function AdminImages() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [croppingImage, setCroppingImage] = useState<string | null>(null)
  const [croppingItemId, setCroppingItemId] = useState<number | null>(null)
  const [itemImages, setItemImages] = useState<Record<number, string>>({})
  const [itemNameEdits, setItemNameEdits] = useState<Record<number, string>>({})
  const [itemPriceEdits, setItemPriceEdits] = useState<Record<number, string>>({})
  const router = useRouter()

  useEffect(() => {
    // Inizializza i campi testo con i valori di default del menu statico
    const initialNames: Record<number, string> = {}
    const initialPrices: Record<number, string> = {}
    menuItems.forEach((item) => {
      initialNames[item.id] = item.name
      initialPrices[item.id] = item.price.toString().replace('.', ',')
    })
    setItemNameEdits(initialNames)
    setItemPriceEdits(initialPrices)

    // Load all item images from database + override di nome/prezzo
    const loadData = async () => {
      const images: Record<number, string> = {}

      // Carica immagini da database
      for (const item of menuItems) {
        try {
          const response = await fetch(`/api/images/menu-items/${item.id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.imageUrl) {
              images[item.id] = data.imageUrl
              // Aggiorna anche localStorage come cache
              if (typeof window !== 'undefined') {
                localStorage.setItem(`item_image_${item.id}`, data.imageUrl)
              }
            }
          }
        } catch (error) {
          console.error(`Error loading image for item ${item.id}:`, error)
        }
      }

      // Fallback a localStorage se il database non ha immagini
      if (typeof window !== 'undefined' && Object.keys(images).length === 0) {
        menuItems.forEach((item) => {
          const saved = localStorage.getItem(`item_image_${item.id}`)
          if (saved) {
            images[item.id] = saved
          }
        })
      }

      setItemImages(images)

      // Carica override di nome e prezzo
      try {
        const response = await fetch('/api/menu-items/overrides')
        if (response.ok) {
          const data = await response.json()
          const overrides = data.overrides as Record<
            number,
            { name?: string; price?: number }
          >

          setItemNameEdits((prev) => {
            const updated = { ...prev }
            Object.entries(overrides).forEach(([idStr, value]) => {
              const id = Number(idStr)
              if (!Number.isNaN(id) && value.name) {
                updated[id] = value.name
              }
            })
            return updated
          })

          setItemPriceEdits((prev) => {
            const updated = { ...prev }
            Object.entries(overrides).forEach(([idStr, value]) => {
              const id = Number(idStr)
              if (!Number.isNaN(id) && value.price !== undefined) {
                // Mostra con virgola per l'admin
                updated[id] = value.price.toString().replace('.', ',')
              }
            })
            return updated
          })
        }
      } catch (error) {
        console.error('Error loading menu item overrides:', error)
      }
    }

    loadData()
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

      // Salva nel database tramite API
      const response = await fetch(`/api/images/menu-items/${croppingItemId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: optimized }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Errore nel salvataggio dell\'immagine')
      }

      // Salva anche in localStorage come fallback
      localStorage.setItem(`item_image_${croppingItemId}`, optimized)
      
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
      
      alert('Immagine caricata con successo! L\'immagine è ora visibile nel menu su tutti i dispositivi.')
    } catch (error) {
      console.error('Error saving image:', error)
      alert('Errore nel caricamento dell\'immagine. Riprova più tardi.')
    }
  }

  const handleCancelCrop = () => {
    setCroppingImage(null)
    setCroppingItemId(null)
  }

  const handleRemoveImage = async (itemId: number) => {
    const confirmDelete = window.confirm(
      'Sei sicuro di voler rimuovere l\'immagine di questo piatto?'
    )
    if (!confirmDelete) return

    try {
      const response = await fetch(`/api/images/menu-items/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || 'Errore nella rimozione dell\'immagine')
      }

      // Rimuovi da localStorage
      localStorage.removeItem(`item_image_${itemId}`)

      // Aggiorna stato locale
      setItemImages((prev) => {
        const updated = { ...prev }
        delete updated[itemId]
        return updated
      })

      // Notifica le altre parti dell'app
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(
        new CustomEvent('imageUpdated', {
          detail: { itemId, imageUrl: null },
        })
      )

      alert('Immagine rimossa con successo.')
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Errore nella rimozione dell\'immagine. Riprova più tardi.')
    }
  }

  const handleSaveDetails = async (itemId: number) => {
    const name = itemNameEdits[itemId]?.trim()
    const priceInput = itemPriceEdits[itemId]?.trim()

    if (!name) {
      alert('Il nome del piatto non può essere vuoto.')
      return
    }

    if (!priceInput) {
      alert('Il prezzo non può essere vuoto.')
      return
    }

    // Permetti la virgola come separatore decimale
    const normalized = priceInput.replace(',', '.')
    const price = Number(normalized)

    if (Number.isNaN(price) || price <= 0) {
      alert('Inserisci un prezzo valido (es. 12,50).')
      return
    }

    try {
      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, price }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || 'Errore nel salvataggio del piatto')
      }

      alert('Nome e prezzo aggiornati con successo.')
    } catch (error) {
      console.error('Error saving menu item details:', error)
      alert('Errore nel salvataggio del piatto. Riprova più tardi.')
    }
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
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-green-600 dark:text-green-400">
                          ✓ Immagine caricata
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(item.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          <X size={12} />
                          Rimuovi immagine
                        </button>
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

              {/* Nome e prezzo */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome e prezzo
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={itemNameEdits[item.id] ?? item.name}
                    onChange={(e) =>
                      setItemNameEdits((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome del piatto"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      €
                    </span>
                    <input
                      type="text"
                      value={
                        itemPriceEdits[item.id] ??
                        item.price.toString().replace('.', ',')
                      }
                      onChange={(e) =>
                        setItemPriceEdits((prev) => ({
                          ...prev,
                          [item.id]: e.target.value,
                        }))
                      }
                      className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Prezzo (es. 12,50)"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveDetails(item.id)}
                      className="px-3 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      Salva
                    </button>
                  </div>
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


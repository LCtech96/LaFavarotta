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
  const [hiddenItems, setHiddenItems] = useState<Record<number, boolean>>({})
  const [categoryOverrides, setCategoryOverrides] = useState<Record<number, number>>({})
  const [uploadQueue, setUploadQueue] = useState<Array<{ itemId: number; imageUrl: string }>>([])
  const [isUploading, setIsUploading] = useState(false)
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

    // Load all item images dal database con fallback per-item a localStorage,
    // così l'admin vede le stesse immagini che vede il cliente
    const loadData = async () => {
      const images: Record<number, string> = {}

      // Carica immagini da database, con fallback locale per ogni piatto
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
              continue
            }
          }

          // Se la risposta non è ok o non c'è immagine nel DB, prova localStorage
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`item_image_${item.id}`)
            if (saved) {
              images[item.id] = saved
            }
          }
        } catch (error) {
          console.error(`Error loading image for item ${item.id}:`, error)
          // In caso di errore di rete/500, prova comunque localStorage
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`item_image_${item.id}`)
            if (saved) {
              images[item.id] = saved
            }
          }
        }
      }

      setItemImages(images)

      // Carica override di nome, prezzo, visibilità e categoria
      try {
        const response = await fetch('/api/menu-items/overrides')
        if (response.ok) {
          const data = await response.json()
          const overrides = data.overrides as Record<
            number,
            { name?: string; price?: number; hidden?: boolean; categoryId?: number }
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

          setHiddenItems((prev) => {
            const updated = { ...prev }
            Object.entries(overrides).forEach(([idStr, value]) => {
              const id = Number(idStr)
              if (!Number.isNaN(id) && value.hidden !== undefined) {
                updated[id] = value.hidden
              }
            })
            return updated
          })

          setCategoryOverrides((prev) => {
            const updated = { ...prev }
            Object.entries(overrides).forEach(([idStr, value]) => {
              const id = Number(idStr)
              if (!Number.isNaN(id) && value.categoryId !== undefined) {
                updated[id] = value.categoryId
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

  // Funzione per processare la coda di upload con delay
  const processUploadQueue = async () => {
    if (isUploading || uploadQueue.length === 0) return
    
    setIsUploading(true)
    
    // Se ci sono più di 3 immagini in coda, usa batch upload
    if (uploadQueue.length >= 3) {
      try {
        const response = await fetch('/api/images/menu-items/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ images: uploadQueue }),
        })

        if (response.ok) {
          const result = await response.json()
          // Aggiorna lo stato locale per tutte le immagini caricate
          result.images?.forEach((img: { itemId: number; imageUrl: string }) => {
            setItemImages(prev => ({
              ...prev,
              [img.itemId]: img.imageUrl
            }))
            localStorage.setItem(`item_image_${img.itemId}`, img.imageUrl)
          })
          alert(`Caricate ${result.saved} immagini con successo!`)
          setUploadQueue([])
        } else {
          throw new Error('Errore nel batch upload')
        }
      } catch (error) {
        console.error('Error in batch upload:', error)
        // Fallback: carica una alla volta con delay
        for (const img of uploadQueue) {
          await uploadSingleImage(img.itemId, img.imageUrl)
          await new Promise(resolve => setTimeout(resolve, 1000)) // 1 secondo di delay tra upload
        }
        setUploadQueue([])
      }
    } else {
      // Carica una alla volta con delay
      for (const img of uploadQueue) {
        await uploadSingleImage(img.itemId, img.imageUrl)
        if (uploadQueue.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // 1 secondo di delay
        }
      }
      setUploadQueue([])
    }
    
    setIsUploading(false)
    window.dispatchEvent(new Event('storage'))
  }

  // Funzione helper per upload singolo
  const uploadSingleImage = async (itemId: number, imageUrl: string) => {
    const response = await fetch(`/api/images/menu-items/${itemId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    })

    if (!response.ok) {
      let errorMessage = 'Errore nel salvataggio dell\'immagine'
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.details || errorMessage
      } catch (parseError) {
        errorMessage = `Errore HTTP ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    const result = await response.json().catch(() => ({ success: true }))
    localStorage.setItem(`item_image_${itemId}`, imageUrl)
    setItemImages(prev => ({
      ...prev,
      [itemId]: imageUrl
    }))
    
    return result
  }

  // Processa la coda quando cambia
  useEffect(() => {
    if (uploadQueue.length > 0 && !isUploading) {
      processUploadQueue()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadQueue.length, isUploading])

  const handleCropComplete = async (croppedImage: string) => {
    if (!croppingItemId) return

    try {
      // Ottimizza l'immagine base64 per Android
      let optimized: string
      try {
        optimized = optimizeBase64Image(croppedImage)
      } catch (optimizeError) {
        console.error('Error optimizing image:', optimizeError)
        throw new Error('Errore nell\'ottimizzazione dell\'immagine. Assicurati che l\'immagine sia valida.')
      }

      // Verifica che l'immagine ottimizzata non sia troppo grande (max ~5MB in base64)
      if (optimized.length > 7 * 1024 * 1024) {
        throw new Error('Immagine troppo grande. Prova con un\'immagine più piccola o riduci la qualità.')
      }

      // Aggiungi alla coda invece di caricare immediatamente
      setUploadQueue(prev => [...prev, { itemId: croppingItemId, imageUrl: optimized }])

      // Reset immediato per permettere la selezione della prossima immagine
      setCroppingImage(null)
      setCroppingItemId(null)
      
      alert('Immagine aggiunta alla coda di caricamento. Verrà caricata automaticamente.')
    } catch (error) {
      console.error('Error preparing image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
      alert(`Errore nella preparazione dell'immagine: ${errorMessage}`)
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

  const handleSaveCategory = async (itemId: number, categoryId: number) => {
    try {
      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || 'Errore nell\'aggiornamento della categoria')
      }

      // Aggiorna lo stato locale per riflettere immediatamente il cambiamento
      setCategoryOverrides((prev) => ({
        ...prev,
        [itemId]: categoryId,
      }))

      alert('Categoria aggiornata con successo.')
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Errore nell\'aggiornamento della categoria. Riprova più tardi.')
    }
  }

  const handleToggleHidden = async (itemId: number) => {
    const currentHidden = hiddenItems[itemId] ?? false
    const newHidden = !currentHidden

    try {
      const response = await fetch(`/api/menu-items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hidden: newHidden }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.error || 'Errore nell\'aggiornamento del piatto')
      }

      setHiddenItems((prev) => ({
        ...prev,
        [itemId]: newHidden,
      }))

      alert(
        newHidden
          ? 'Piatto nascosto dal menù.'
          : 'Piatto nuovamente visibile nel menù.'
      )
    } catch (error) {
      console.error('Error toggling menu item visibility:', error)
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
      
      // Se l'errore indica che il database non è disponibile, mostra un messaggio più specifico
      if (errorMessage.includes('Database non disponibile') || errorMessage.includes('Database unavailable')) {
        alert('Errore: Database non disponibile. Verifica che la variabile DATABASE_URL sia configurata correttamente su Vercel. Consulta VERCEL_DATABASE_SETUP.md per le istruzioni.')
      } else {
        alert('Errore nel cambiare la visibilità del piatto. Riprova più tardi.')
      }
    }
  }

  if (!isAuthenticated) {
    return null
  }

  // Applica gli override di categoria ai menu items per il filtro
  const effectiveMenuItems = menuItems.map((item) => {
    const overrideCategoryId = categoryOverrides[item.id]
    return {
      ...item,
      categoryId: overrideCategoryId !== undefined ? overrideCategoryId : item.categoryId,
    }
  })

  const filteredItems = selectedCategory !== null
    ? effectiveMenuItems.filter(item => item.categoryId === selectedCategory)
    : effectiveMenuItems

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
          {filteredItems.map((item) => {
            const hasImage = !!itemImages[item.id]
            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${
                  hasImage ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  {hasImage && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-green-700 dark:text-green-300">
                        Immagine presente
                      </span>
                    </div>
                  )}
                </div>
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
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                        hasImage
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Upload size={16} />
                      {hasImage ? 'Sostituisci immagine' : 'Carica e ritaglia immagine'}
                    </label>
                    {hasImage && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-green-700 dark:text-green-400">
                              ✓ Immagine caricata con successo
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(item.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors touch-manipulation"
                          >
                            <X size={14} />
                            Rimuovi
                          </button>
                        </div>
                        <div className="relative rounded-lg overflow-hidden border-2 border-green-500 border-opacity-30">
                          <img
                            src={itemImages[item.id]}
                            alt={item.name}
                            className="w-full h-40 sm:h-48 object-cover"
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
                          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            Anteprima
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              {/* Nome, prezzo e categoria */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome, prezzo e categoria
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
                  <select
                    value={categoryOverrides[item.id] !== undefined ? categoryOverrides[item.id] : item.categoryId}
                    onChange={(e) => {
                      const newCategoryId = parseInt(e.target.value)
                      handleSaveCategory(item.id, newCategoryId)
                    }}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span
                      className={`font-medium ${
                        hiddenItems[item.id]
                          ? 'text-red-500'
                          : 'text-green-500'
                      }`}
                    >
                      {hiddenItems[item.id]
                        ? 'Piatto nascosto dal menù'
                        : 'Piatto visibile nel menù'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleHidden(item.id)}
                      className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {hiddenItems[item.id] ? 'Mostra piatto' : 'Nascondi piatto'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            )
          })}
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


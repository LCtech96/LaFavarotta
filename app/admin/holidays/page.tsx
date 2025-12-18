'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Trash2, Upload, Edit2 } from 'lucide-react'
import Link from 'next/link'
import { ImageCropper } from '@/components/image-cropper'
import { optimizeBase64Image } from '@/lib/utils'

interface HolidayMenuVariant {
  id: number
  title: string
  menuText: string | null
  menuPrice: number | null
  menuImages: string[]
  order: number
  items: HolidayMenuItemVariant[]
}

interface HolidayMenuItemVariant {
  id: number
  name: string
  ingredients: string[]
  price: number
  imageUrl: string | null
}

interface HolidayMenu {
  id: number
  name: string
  displayName: string
  previewImage: string | null
  menuText: string | null
  menuPrice: number | null
  menuImages: string[]
  items: HolidayMenuItem[]
  variants: HolidayMenuVariant[]
}

interface HolidayMenuItem {
  id: number
  name: string
  ingredients: string[]
  price: number
  imageUrl: string | null
}

const defaultHolidays = [
  { name: 'natale', displayName: 'Natale' },
  { name: 'capodanno', displayName: 'Capodanno' },
  { name: 'epifania', displayName: 'Epifania' },
  { name: 'pasqua', displayName: 'Pasqua' },
  { name: 'altre-festivita', displayName: 'Altre festività' },
]

const otherHolidays = [
  { name: 'anniversario-liberazione', displayName: 'Anniversario della Liberazione' },
  { name: 'festa-lavoratori', displayName: 'Festa dei Lavoratori' },
  { name: 'festa-repubblica', displayName: 'Festa della Repubblica' },
  { name: 'ferragosto', displayName: 'Ferragosto' },
  { name: 'ognissanti', displayName: 'Ognissanti' },
  { name: 'immacolata-concezione', displayName: 'Immacolata Concezione' },
  { name: 'carnevale', displayName: 'Carnevale' },
  { name: 'san-valentino', displayName: 'San Valentino' },
  { name: 'festa-donna', displayName: 'Festa della Donna' },
  { name: 'festa-mamma', displayName: 'Festa della Mamma' },
  { name: 'halloween', displayName: 'Halloween' },
  { name: 'san-giuseppe', displayName: 'San Giuseppe' },
]

export default function AdminHolidays() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [holidays, setHolidays] = useState<HolidayMenu[]>([])
  const [selectedHoliday, setSelectedHoliday] = useState<HolidayMenu | null>(null)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<HolidayMenuItem | null>(null)
  const [croppingImage, setCroppingImage] = useState<string | null>(null)
  const [croppingType, setCroppingType] = useState<'preview' | 'item' | 'menu' | null>(null)
  const [croppingItemId, setCroppingItemId] = useState<number | null>(null)
  const [newItemImageUrl, setNewItemImageUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    ingredients: '',
    price: '',
  })
  const [menuText, setMenuText] = useState<string>('')
  const [menuPrice, setMenuPrice] = useState<string>('')
  const [menuImages, setMenuImages] = useState<string[]>([])
  const [variants, setVariants] = useState<HolidayMenuVariant[]>([])
  const [selectedVariant, setSelectedVariant] = useState<HolidayMenuVariant | null>(null)
  const [showVariantForm, setShowVariantForm] = useState(false)
  const [editingVariant, setEditingVariant] = useState<HolidayMenuVariant | null>(null)
  const [variantTitle, setVariantTitle] = useState<string>('')
  const [variantMenuText, setVariantMenuText] = useState<string>('')
  const [variantMenuPrice, setVariantMenuPrice] = useState<string>('')
  const [variantMenuImages, setVariantMenuImages] = useState<string[]>([])
  const [croppingVariantId, setCroppingVariantId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      loadHolidays()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const loadHolidays = async () => {
    try {
      const response = await fetch('/api/holidays')
      if (response.ok) {
        const data = await response.json()
        if (data.holidays && data.holidays.length > 0) {
          setHolidays(data.holidays)
        } else {
          // Inizializza le festività se non esistono
          await initializeHolidays()
        }
      } else {
        // Se c'è un errore, potrebbe essere che le tabelle non esistono
        const errorData = await response.json().catch(() => ({}))
        if (errorData.error && errorData.error.includes('does not exist')) {
          // Le tabelle non esistono, inizializza il database
          await initializeDatabase()
        }
      }
    } catch (error) {
      console.error('Error loading holidays:', error)
      // Prova a inizializzare il database se c'è un errore
      await initializeDatabase()
    }
  }

  const initializeDatabase = async () => {
    try {
      const response = await fetch('/api/db/init', {
        method: 'POST',
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Database inizializzato:', data)
        // Dopo aver inizializzato il database, inizializza le festività
        await initializeHolidays()
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Errore inizializzazione database:', errorData)
        alert('Errore nell\'inizializzazione del database. Verifica che la migrazione sia stata eseguita.')
      }
    } catch (error) {
      console.error('Error initializing database:', error)
      alert('Errore nell\'inizializzazione del database. Verifica la connessione.')
    }
  }

  const initializeHolidays = async () => {
    try {
      // Inizializza le festività principali
      for (const holiday of defaultHolidays) {
        const response = await fetch('/api/holidays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: holiday.name,
            displayName: holiday.displayName,
          }),
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error(`Errore creazione festività ${holiday.name}:`, errorData)
        }
      }
      // Inizializza le altre festività
      for (const holiday of otherHolidays) {
        const response = await fetch('/api/holidays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: holiday.name,
            displayName: holiday.displayName,
          }),
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error(`Errore creazione festività ${holiday.name}:`, errorData)
        }
      }
      await loadHolidays()
    } catch (error) {
      console.error('Error initializing holidays:', error)
      alert('Errore nell\'inizializzazione delle festività. Riprova.')
    }
  }

  const handleFileSelect = (type: 'preview' | 'item' | 'menu', file: File, holidayId?: number, itemId?: number) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setCroppingImage(imageDataUrl)
      setCroppingType(type)
      if (type === 'preview' && holidayId) {
        setCroppingItemId(holidayId)
      } else if (type === 'item' && itemId) {
        setCroppingItemId(itemId)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedImage: string) => {
    if (!croppingType) return

    try {
      const optimized = optimizeBase64Image(croppedImage)

      if (croppingType === 'preview' && croppingItemId) {
        // Salva immagine di anteprima
        const holiday = holidays.find(h => h.id === croppingItemId)
        if (holiday) {
          const response = await fetch('/api/holidays', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: holiday.name,
              displayName: holiday.displayName,
              previewImage: optimized,
            }),
          })

          if (response.ok) {
            await loadHolidays()
            alert('Immagine di anteprima salvata con successo!')
          }
        }
      } else if (croppingType === 'item' && croppingItemId && selectedHoliday) {
        // Se è un nuovo piatto (croppingItemId è -1), salva solo localmente
        if (croppingItemId === -1) {
          setNewItemImageUrl(optimized)
          alert('Immagine caricata! Ora salva il piatto per completare.')
        } else {
          // Salva immagine del piatto esistente
          const response = await fetch(`/api/holidays/${selectedHoliday.id}/items/${croppingItemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: optimized }),
          })

          if (response.ok) {
            await loadHolidays()
            alert('Immagine del piatto salvata con successo!')
          }
        }
      } else if (croppingType === 'menu' && selectedHoliday) {
        // Aggiungi immagine al menu o alla variante
        if (croppingVariantId && croppingVariantId !== -1) {
          // Aggiungi alla variante in modifica
          setVariantMenuImages([...variantMenuImages, optimized])
          alert('Immagine aggiunta al menu! Ricorda di salvare il menu.')
        } else if (croppingVariantId === -1) {
          // Nuova variante
          setVariantMenuImages([...variantMenuImages, optimized])
          alert('Immagine aggiunta al menu! Ricorda di salvare il menu.')
        } else {
          // Menu principale
          setMenuImages([...menuImages, optimized])
          alert('Immagine aggiunta al menu! Ricorda di salvare il menu.')
        }
      }

      setCroppingImage(null)
      setCroppingType(null)
      setCroppingItemId(null)
      setCroppingVariantId(null)
    } catch (error) {
      console.error('Error saving image:', error)
      alert('Errore nel salvataggio dell\'immagine. Riprova più tardi.')
    }
  }

  const handleSaveItem = async () => {
    if (!selectedHoliday) return

    try {
      const ingredients = formData.ingredients
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0)

      if (editingItem) {
        // Aggiorna piatto esistente
        const response = await fetch(`/api/holidays/${selectedHoliday.id}/items/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            ingredients,
            price: parseFloat(formData.price),
            imageUrl: newItemImageUrl || editingItem.imageUrl || null,
          }),
        })

        if (!response.ok) throw new Error('Errore nell\'aggiornamento del piatto')
      } else {
        // Crea nuovo piatto
        const response = await fetch(`/api/holidays/${selectedHoliday.id}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            ingredients,
            price: parseFloat(formData.price),
            imageUrl: newItemImageUrl || null,
          }),
        })

        if (!response.ok) throw new Error('Errore nella creazione del piatto')
      }

      await loadHolidays()
      setShowItemForm(false)
      setEditingItem(null)
      setNewItemImageUrl(null)
      setFormData({ name: '', ingredients: '', price: '' })
      alert('Piatto salvato con successo!')
    } catch (error) {
      console.error('Error saving item:', error)
      alert('Errore nel salvataggio del piatto. Riprova più tardi.')
    }
  }

  const handleDeleteItem = async (itemId: number) => {
    if (!selectedHoliday) return
    if (!confirm('Sei sicuro di voler eliminare questo piatto?')) return

    try {
      const response = await fetch(`/api/holidays/${selectedHoliday.id}/items/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Errore nell\'eliminazione del piatto')

      await loadHolidays()
      alert('Piatto eliminato con successo!')
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Errore nell\'eliminazione del piatto. Riprova più tardi.')
    }
  }

  const handleEditItem = (item: HolidayMenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      ingredients: item.ingredients.join(', '),
      price: item.price.toString(),
    })
    setShowItemForm(true)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Torna al pannello
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Menu Festività
        </h1>

        {holidays.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Nessuna festività trovata. Potrebbe essere necessario inizializzare il database.
            </p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={initializeDatabase}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Inizializza Database
              </button>
              <button
                onClick={initializeHolidays}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Inizializza Festività
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/holidays/init', {
                      method: 'POST',
                    })
                    if (response.ok) {
                      const data = await response.json()
                      alert(`Inizializzazione completata!\n${data.message}`)
                      await loadHolidays()
                    } else {
                      const errorData = await response.json().catch(() => ({}))
                      throw new Error(errorData.error || 'Errore nell\'inizializzazione')
                    }
                  } catch (error) {
                    console.error('Error initializing other holidays:', error)
                    alert('Errore nell\'inizializzazione delle altre festività. Riprova.')
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Crea Altre Festività
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lista Festività */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Festività
                </h2>
                <div className="space-y-2">
                  {holidays.map((holiday) => (
                    <button
                      key={holiday.id}
                      onClick={() => {
                        setSelectedHoliday(holiday)
                        setShowItemForm(false)
                        setEditingItem(null)
                        setNewItemImageUrl(null)
                        setFormData({ name: '', ingredients: '', price: '' })
                        setMenuText(holiday.menuText || '')
                        setMenuPrice(holiday.menuPrice ? holiday.menuPrice.toString() : '')
                        setMenuImages(holiday.menuImages || [])
                        setVariants(holiday.variants || [])
                        setSelectedVariant(null)
                        setShowVariantForm(false)
                        setEditingVariant(null)
                      }}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedHoliday?.id === holiday.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{holiday.displayName}</span>
                        {holiday.previewImage && (
                          <span className="text-xs text-green-600 dark:text-green-400">✓ Immagine</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gestione Festività Selezionata */}
              {selectedHoliday && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  {selectedHoliday.name === 'altre-festivita' ? (
                    // Mostra le altre festività quando viene selezionata "Altre festività"
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {selectedHoliday.displayName}
                        </h2>
                        <button
                          onClick={() => {
                            setSelectedHoliday(null)
                            setShowItemForm(false)
                            setEditingItem(null)
                            setNewItemImageUrl(null)
                            setFormData({ name: '', ingredients: '', price: '' })
                            setMenuText('')
                            setMenuPrice('')
                            setMenuImages([])
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Seleziona una festività per gestire il suo menu:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {otherHolidays.map((otherHoliday) => {
                          const holidayData = holidays.find(h => h.name === otherHoliday.name)
                          return (
                            <button
                              key={otherHoliday.name}
                              onClick={async () => {
                                // Crea la festività se non esiste
                                if (!holidayData) {
                                  try {
                                    const response = await fetch('/api/holidays', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        name: otherHoliday.name,
                                        displayName: otherHoliday.displayName,
                                      }),
                                    })
                                    if (response.ok) {
                                      await loadHolidays()
                                    }
                                  } catch (error) {
                                    console.error('Error creating holiday:', error)
                                  }
                                }
                                // Seleziona la festività
                                const updatedHolidays = await fetch('/api/holidays').then(r => r.json()).then(d => d.holidays)
                                const holiday = updatedHolidays.find((h: HolidayMenu) => h.name === otherHoliday.name)
                                if (holiday) {
                                  setSelectedHoliday(holiday)
                                  setShowItemForm(false)
                                  setEditingItem(null)
                                  setNewItemImageUrl(null)
                                  setFormData({ name: '', ingredients: '', price: '' })
                                  setMenuText(holiday.menuText || '')
                                  setMenuPrice(holiday.menuPrice ? holiday.menuPrice.toString() : '')
                                  setMenuImages(holiday.menuImages || [])
                                  setVariants(holiday.variants || [])
                                  setSelectedVariant(null)
                                  setShowVariantForm(false)
                                  setEditingVariant(null)
                                }
                              }}
                              className={`text-left p-4 rounded-lg transition-colors border-2 ${
                                holidayData
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                  : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {otherHoliday.displayName}
                                </span>
                                {holidayData && (
                                  <div className="flex gap-2">
                                    {holidayData.previewImage && (
                                      <span className="text-xs text-green-600 dark:text-green-400">✓ Immagine</span>
                                    )}
                                    {(holidayData.menuText || holidayData.items.length > 0) && (
                                      <span className="text-xs text-blue-600 dark:text-blue-400">✓ Menu</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </>
                  ) : (
                    // Mostra il form di gestione per le altre festività
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {selectedHoliday.displayName}
                        </h2>
                        <button
                          onClick={() => {
                            setSelectedHoliday(null)
                            setShowItemForm(false)
                            setEditingItem(null)
                            setNewItemImageUrl(null)
                            setFormData({ name: '', ingredients: '', price: '' })
                            setMenuText('')
                            setMenuPrice('')
                            setMenuImages([])
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <X size={20} />
                        </button>
                      </div>

              {/* Immagine Anteprima */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Immagine Anteprima (per il cerchietto)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleFileSelect('preview', file, selectedHoliday.id)
                      }
                    }}
                    className="hidden"
                    id={`preview-${selectedHoliday.id}`}
                  />
                  <label
                    htmlFor={`preview-${selectedHoliday.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer"
                  >
                    <Upload size={16} />
                    {selectedHoliday.previewImage ? 'Cambia Anteprima' : 'Carica Anteprima'}
                  </label>
                  {selectedHoliday.previewImage && (
                    <button
                      onClick={async () => {
                        if (!confirm('Sei sicuro di voler rimuovere l\'immagine di anteprima?')) return
                        try {
                          const response = await fetch('/api/holidays', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              name: selectedHoliday.name,
                              displayName: selectedHoliday.displayName,
                              previewImage: null,
                            }),
                          })

                          if (response.ok) {
                            await loadHolidays()
                            alert('Immagine di anteprima rimossa con successo!')
                          } else {
                            throw new Error('Errore nella rimozione dell\'immagine')
                          }
                        } catch (error) {
                          console.error('Error removing preview image:', error)
                          alert('Errore nella rimozione dell\'immagine. Riprova più tardi.')
                        }
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                      Rimuovi
                    </button>
                  )}
                </div>
                {selectedHoliday.previewImage && (
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-600 flex-shrink-0">
                      <img
                        src={selectedHoliday.previewImage}
                        alt={selectedHoliday.displayName}
                        className="w-full h-full object-contain"
                        crossOrigin="anonymous"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Anteprima caricata. Questa immagine verrà mostrata nel cerchietto degli highlights.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu Testo Unico */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Menu Testo Unico (opzionale - alternativa ai piatti)
                </label>
                <textarea
                  value={menuText}
                  onChange={(e) => setMenuText(e.target.value)}
                  placeholder="Inserisci qui il menu completo per questa festività..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-y"
                />
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prezzo Menu (opzionale)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={menuPrice}
                    onChange={(e) => setMenuPrice(e.target.value)}
                    placeholder="Es: 50.00"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Immagini Menu (opzionale)
                  </label>
                  <div className="flex flex-wrap gap-4 mb-3">
                    {menuImages.map((image, index) => (
                      <div key={index} className="relative">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-600">
                          <img
                            src={image}
                            alt={`Menu ${index + 1}`}
                            className="w-full h-full object-contain"
                            crossOrigin="anonymous"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setMenuImages(menuImages.filter((_, i) => i !== index))
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        handleFileSelect('menu', file)
                      }
                    }}
                    className="hidden"
                    id={`menu-images-${selectedHoliday.id}`}
                  />
                  <label
                    htmlFor={`menu-images-${selectedHoliday.id}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <Upload size={16} />
                    Aggiungi Immagine Menu
                  </label>
                </div>
                <button
                  onClick={async () => {
                    if (!selectedHoliday) return
                    try {
                      const response = await fetch('/api/holidays', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: selectedHoliday.name,
                          displayName: selectedHoliday.displayName,
                          previewImage: selectedHoliday.previewImage,
                          menuText: menuText || null,
                          menuPrice: menuPrice ? parseFloat(menuPrice) : null,
                          menuImages: menuImages,
                        }),
                      })

                      if (response.ok) {
                        await loadHolidays()
                        alert('Menu salvato con successo!')
                      } else {
                        throw new Error('Errore nel salvataggio del menu')
                      }
                    } catch (error) {
                      console.error('Error saving menu:', error)
                      alert('Errore nel salvataggio del menu. Riprova più tardi.')
                    }
                  }}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Salva Menu
                </button>
              </div>

              {/* Menu Multipli */}
              <div className="mb-6 border-t border-gray-300 dark:border-gray-600 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Menu Multipli
                  </label>
                  <button
                    onClick={() => {
                      setShowVariantForm(true)
                      setEditingVariant(null)
                      setVariantTitle('')
                      setVariantMenuText('')
                      setVariantMenuPrice('')
                      setVariantMenuImages([])
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    Aggiungi Menu
                  </button>
                </div>

                {/* Lista Varianti */}
                {variants.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {variant.title}
                            </h3>
                            {variant.menuPrice && (
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                €{variant.menuPrice.toFixed(2)}
                              </p>
                            )}
                            {variant.menuImages.length > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {variant.menuImages.length} immagine{variant.menuImages.length !== 1 ? 'i' : ''}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                setEditingVariant(variant)
                                setVariantTitle(variant.title)
                                setVariantMenuText(variant.menuText || '')
                                setVariantMenuPrice(variant.menuPrice ? variant.menuPrice.toString() : '')
                                setVariantMenuImages(variant.menuImages || [])
                                setShowVariantForm(true)
                              }}
                              className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                              title="Modifica menu"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Sei sicuro di voler eliminare il menu "${variant.title}"?`)) return
                                if (!selectedHoliday) return
                                try {
                                  const response = await fetch(`/api/holidays/${selectedHoliday.id}/variants/${variant.id}`, {
                                    method: 'DELETE',
                                  })
                                  if (response.ok) {
                                    await loadHolidays()
                                    alert('Menu eliminato con successo!')
                                  } else {
                                    throw new Error('Errore nell\'eliminazione del menu')
                                  }
                                } catch (error) {
                                  console.error('Error deleting variant:', error)
                                  alert('Errore nell\'eliminazione del menu. Riprova più tardi.')
                                }
                              }}
                              className="p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
                              title="Elimina menu"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Form Aggiunta/Modifica Variante */}
                {showVariantForm && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-2 border-blue-300 dark:border-blue-600">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {editingVariant ? 'Modifica Menu' : 'Nuovo Menu'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowVariantForm(false)
                          setEditingVariant(null)
                          setVariantTitle('')
                          setVariantMenuText('')
                          setVariantMenuPrice('')
                          setVariantMenuImages([])
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Titolo Menu *
                        </label>
                        <input
                          type="text"
                          value={variantTitle}
                          onChange={(e) => setVariantTitle(e.target.value)}
                          placeholder="Es: Menu Completo, Menu Vegetariano, Menu per Bambini"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Testo Menu (opzionale)
                        </label>
                        <textarea
                          value={variantMenuText}
                          onChange={(e) => setVariantMenuText(e.target.value)}
                          placeholder="Inserisci qui il testo del menu..."
                          rows={6}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-y"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Prezzo Menu (opzionale)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variantMenuPrice}
                          onChange={(e) => setVariantMenuPrice(e.target.value)}
                          placeholder="Es: 50.00"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Immagini Menu (opzionale)
                        </label>
                        <div className="flex flex-wrap gap-4 mb-3">
                          {variantMenuImages.map((image, index) => (
                            <div key={index} className="relative">
                              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600 border-2 border-gray-300 dark:border-gray-600">
                                <img
                                  src={image}
                                  alt={`Menu ${index + 1}`}
                                  className="w-full h-full object-contain"
                                  crossOrigin="anonymous"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  setVariantMenuImages(variantMenuImages.filter((_, i) => i !== index))
                                }}
                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleFileSelect('menu', file, undefined, editingVariant?.id || -1)
                              setCroppingVariantId(editingVariant?.id || -1)
                            }
                          }}
                          className="hidden"
                          id={`variant-menu-images-${selectedHoliday?.id || 'new'}`}
                        />
                        <label
                          htmlFor={`variant-menu-images-${selectedHoliday?.id || 'new'}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          <Upload size={16} />
                          Aggiungi Immagine Menu
                        </label>
                      </div>

                      <button
                        onClick={async () => {
                          if (!selectedHoliday) return
                          if (!variantTitle.trim()) {
                            alert('Inserisci un titolo per il menu')
                            return
                          }
                          try {
                            if (editingVariant) {
                              // Aggiorna variante esistente
                              const response = await fetch(`/api/holidays/${selectedHoliday.id}/variants/${editingVariant.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  title: variantTitle,
                                  menuText: variantMenuText || null,
                                  menuPrice: variantMenuPrice ? parseFloat(variantMenuPrice) : null,
                                  menuImages: variantMenuImages,
                                }),
                              })
                              if (response.ok) {
                                await loadHolidays()
                                setShowVariantForm(false)
                                setEditingVariant(null)
                                setVariantTitle('')
                                setVariantMenuText('')
                                setVariantMenuPrice('')
                                setVariantMenuImages([])
                                alert('Menu aggiornato con successo!')
                              } else {
                                throw new Error('Errore nell\'aggiornamento del menu')
                              }
                            } else {
                              // Crea nuova variante
                              const response = await fetch(`/api/holidays/${selectedHoliday.id}/variants`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  title: variantTitle,
                                  menuText: variantMenuText || null,
                                  menuPrice: variantMenuPrice ? parseFloat(variantMenuPrice) : null,
                                  menuImages: variantMenuImages,
                                }),
                              })
                              if (response.ok) {
                                await loadHolidays()
                                setShowVariantForm(false)
                                setVariantTitle('')
                                setVariantMenuText('')
                                setVariantMenuPrice('')
                                setVariantMenuImages([])
                                alert('Menu creato con successo!')
                              } else {
                                throw new Error('Errore nella creazione del menu')
                              }
                            }
                          } catch (error) {
                            console.error('Error saving variant:', error)
                            alert('Errore nel salvataggio del menu. Riprova più tardi.')
                          }
                        }}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {editingVariant ? 'Aggiorna Menu' : 'Crea Menu'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista Piatti */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Piatti ({selectedHoliday.items.length})
                  </h3>
                  <button
                    onClick={() => {
                      setShowItemForm(true)
                      setEditingItem(null)
                      setNewItemImageUrl(null)
                      setFormData({ name: '', ingredients: '', price: '' })
                      setMenuText('')
                      setMenuPrice('')
                    }}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus size={16} />
                    Nuovo Piatto
                  </button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {selectedHoliday.items.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      Nessun piatto aggiunto. Clicca su &quot;Nuovo Piatto&quot; per aggiungerne uno.
                    </p>
                  ) : (
                    selectedHoliday.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex gap-4">
                          {/* Immagine del piatto */}
                          {item.imageUrl && (
                            <div className="flex-shrink-0">
                              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-600">
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  crossOrigin="anonymous"
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Dettagli del piatto */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-white mb-1">{item.name}</p>
                            {item.ingredients.length > 0 && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                                {item.ingredients.join(', ')}
                              </p>
                            )}
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              €{item.price.toFixed(2)}
                            </p>
                          </div>
                          
                          {/* Pulsanti azione */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                              title="Modifica piatto"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                              title="Elimina piatto"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Form Aggiunta/Modifica Piatto - Sempre visibile quando una festività è selezionata */}
            {selectedHoliday && selectedHoliday.name !== 'altre-festivita' && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                {!showItemForm ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Clicca su &quot;Nuovo Piatto&quot; per aggiungere un piatto a questa festività
                    </p>
                    <button
                      onClick={() => {
                        setShowItemForm(true)
                        setEditingItem(null)
                        setNewItemImageUrl(null)
                        setFormData({ name: '', ingredients: '', price: '' })
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                    >
                      <Plus size={20} />
                      Nuovo Piatto
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {editingItem ? 'Modifica Piatto' : 'Nuovo Piatto'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowItemForm(false)
                          setEditingItem(null)
                          setNewItemImageUrl(null)
                          setFormData({ name: '', ingredients: '', price: '' })
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Nome Piatto *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="es: Lasagne al forno"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ingredienti (separati da virgola) *
                        </label>
                        <input
                          type="text"
                          value={formData.ingredients}
                          onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                          placeholder="es: pomodoro, mozzarella, basilico"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Prezzo (€) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="es: 12.50"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Immagine Piatto
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const itemId = editingItem ? editingItem.id : -1 // -1 per nuovo piatto
                              handleFileSelect('item', file, selectedHoliday.id, itemId)
                            }
                          }}
                          className="hidden"
                          id={`item-image-${editingItem?.id || 'new'}`}
                        />
                        <label
                          htmlFor={`item-image-${editingItem?.id || 'new'}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          <Upload size={16} />
                          {(editingItem?.imageUrl || newItemImageUrl) ? 'Cambia Immagine' : 'Carica Immagine'}
                        </label>
                        {(editingItem?.imageUrl || newItemImageUrl) && (
                          <div className="mt-2">
                            <img
                              src={newItemImageUrl || editingItem?.imageUrl || ''}
                              alt={editingItem?.name || formData.name || 'Piatto'}
                              className="w-32 h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={handleSaveItem}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Salva
                        </button>
                        <button
                          onClick={() => {
                            setShowItemForm(false)
                            setEditingItem(null)
                            setNewItemImageUrl(null)
                            setFormData({ name: '', ingredients: '', price: '' })
                          }}
                          className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

      </div>

      {croppingImage && croppingType && (
        <ImageCropper
          image={croppingImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCroppingImage(null)
            setCroppingType(null)
            setCroppingItemId(null)
          }}
          aspectRatio={1}
        />
      )}
    </div>
  )
}


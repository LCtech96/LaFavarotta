'use client'

import { useState, useEffect } from 'react'
import { HolidayMenuItemCard } from './holiday-menu-item-card'

interface HolidayMenuItem {
  id: number
  name: string
  ingredients: string[]
  price: number
  imageUrl: string | null
}

interface HolidayMenuVariant {
  id: number
  title: string
  menuText: string | null
  menuPrice: number | null
  menuImages: string[]
  order: number
  items: HolidayMenuItem[]
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

interface HolidayMenuListProps {
  holidayName: string
}

export function HolidayMenuList({ holidayName }: HolidayMenuListProps) {
  const [items, setItems] = useState<HolidayMenuItem[]>([])
  const [menuText, setMenuText] = useState<string | null>(null)
  const [menuPrice, setMenuPrice] = useState<number | null>(null)
  const [menuImages, setMenuImages] = useState<string[]>([])
  const [variants, setVariants] = useState<HolidayMenuVariant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHolidayMenu = async () => {
      try {
        // Carica tutti i menu delle festività
        const response = await fetch('/api/holidays')
        if (response.ok) {
          const data = await response.json()
          const holiday = data.holidays.find((h: HolidayMenu) => h.name === holidayName)
          
          if (holiday) {
            // Assicurati che le variants siano un array
            if (holiday.variants && !Array.isArray(holiday.variants)) {
              holiday.variants = []
            }
            // Se ci sono varianti, usa quelle
            if (holiday.variants && holiday.variants.length > 0) {
              // Ordina le varianti per ordine
              const sortedVariants = [...holiday.variants].sort((a, b) => (a.order || 0) - (b.order || 0))
              setVariants(sortedVariants)
              setMenuText(null)
              setMenuPrice(null)
              setMenuImages([])
              setItems([])
            } else if (holiday.menuText) {
              // Se c'è un menu testo unico, usa quello
              setMenuText(holiday.menuText)
              setMenuPrice(holiday.menuPrice)
              setMenuImages(holiday.menuImages || [])
              setItems([])
              setVariants([])
            } else if (holiday.items) {
              // Altrimenti usa i piatti
              setItems(holiday.items)
              setMenuText(null)
              setMenuPrice(null)
              setMenuImages([])
              setVariants([])
            }
          }
        }
      } catch (error) {
        console.error('Error loading holiday menu:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHolidayMenu()
  }, [holidayName])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Caricamento menu...</p>
      </div>
    )
  }

  // Se ci sono varianti, mostra quelle
  if (variants.length > 0) {
    return (
      <div className="max-w-5xl mx-auto space-y-8">
        {variants
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((variant) => (
          <div key={variant.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              {variant.title}
            </h2>
            {variant.menuText && (
              <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                  {variant.menuText}
                </div>
              </div>
            )}
            {variant.menuImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {variant.menuImages.map((image, index) => (
                  <div key={index} className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {image.startsWith('data:') || image.startsWith('blob:') ? (
                      <img
                        src={image}
                        alt={`${variant.title} ${index + 1}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        decoding="async"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <img
                        src={image}
                        alt={`${variant.title} ${index + 1}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            {variant.items.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {variant.items.map((item) => (
                  <HolidayMenuItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
            {variant.menuPrice && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">
                  €{variant.menuPrice.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Se c'è un menu testo unico, mostra quello
  if (menuText) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 md:p-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
              {menuText}
            </div>
            {menuImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {menuImages.map((image, index) => (
                  <div key={index} className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                    {image.startsWith('data:') || image.startsWith('blob:') ? (
                      <img
                        src={image}
                        alt={`Menu ${index + 1}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        decoding="async"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <img
                        src={image}
                        alt={`Menu ${index + 1}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
            {menuPrice && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">
                  €{menuPrice.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Altrimenti mostra i piatti
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          Nessun piatto disponibile per questa festività. Torna presto!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <HolidayMenuItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}



'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X } from 'lucide-react'
import { cn, base64ToBlobUrl, isAndroid } from '@/lib/utils'
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

interface Holiday {
  id: number
  name: string
  displayName: string
  previewImage: string | null
  menuText?: string | null
  menuPrice?: number | null
  menuImages?: string[]
  items?: HolidayMenuItem[]
  variants?: HolidayMenuVariant[]
}

const defaultHolidays: Holiday[] = [
  { id: 1, name: 'natale', displayName: 'Natale', previewImage: null },
  { id: 2, name: 'capodanno', displayName: 'Capodanno', previewImage: null },
  { id: 3, name: 'epifania', displayName: 'Epifania', previewImage: null },
  { id: 4, name: 'pasqua', displayName: 'Pasqua', previewImage: null },
  { id: 5, name: 'altre-festivita', displayName: 'Altre festività', previewImage: null },
]

export function Highlights() {
  const [holidays, setHolidays] = useState<Holiday[]>(defaultHolidays)
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null)
  const [holidayMenuData, setHolidayMenuData] = useState<Holiday | null>(null)
  const [loadingMenu, setLoadingMenu] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const response = await fetch('/api/holidays')
        if (response.ok) {
          const data = await response.json()
          if (data.holidays && data.holidays.length > 0) {
            // Ordina per ID per mantenere l'ordine
            const sorted = data.holidays.sort((a: Holiday, b: Holiday) => a.id - b.id)
            setHolidays(sorted)
          }
        }
      } catch (error) {
        console.error('Error loading holidays:', error)
      }
    }

    loadHolidays()
  }, [])

  const handleHolidayClick = async (holiday: Holiday) => {
    if (holiday.name === 'altre-festivita') {
      router.push('/menu/altre-festivita')
      return
    }

    setSelectedHoliday(holiday)
    setLoadingMenu(true)

    try {
      const response = await fetch('/api/holidays')
      if (response.ok) {
        const data = await response.json()
        const holidayData = data.holidays.find((h: Holiday) => h.name === holiday.name)
        if (holidayData) {
          // Assicurati che le variants siano un array
          if (holidayData.variants && !Array.isArray(holidayData.variants)) {
            holidayData.variants = []
          }
          setHolidayMenuData(holidayData)
        }
      }
    } catch (error) {
      console.error('Error loading holiday menu:', error)
    } finally {
      setLoadingMenu(false)
    }
  }

  const closeModal = () => {
    setSelectedHoliday(null)
    setHolidayMenuData(null)
  }

  return (
    <>
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-start gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {holidays.map((holiday) => {
            const hasImage = holiday.previewImage && holiday.previewImage.length > 0

            return (
              <button
                key={holiday.id}
                onClick={() => handleHolidayClick(holiday)}
                className={cn(
                  'flex flex-col items-center gap-1.5 transition-all flex-shrink-0',
                  'hover:scale-105 active:scale-95',
                  'cursor-pointer'
                )}
              >
                <div
                  className={cn(
                    'rounded-full overflow-hidden transition-all',
                    'border-2 border-transparent',
                    'hover:ring-2 hover:ring-blue-500 dark:hover:ring-blue-400',
                    'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900'
                  )}
                  style={{
                    width: '70px',
                    height: '70px',
                  }}
                >
                  {hasImage ? (
                    <div className="relative w-full h-full">
                      {holiday.previewImage!.startsWith('data:') || holiday.previewImage!.startsWith('blob:') ? (
                        <img
                          src={holiday.previewImage!}
                          alt={holiday.displayName}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          decoding="async"
                          crossOrigin="anonymous"
                          style={{ 
                            display: 'block',
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            padding: '3px'
                          }}
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src={holiday.previewImage!}
                            alt={holiday.displayName}
                            fill
                            className="object-contain p-0.5"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                      <span className="text-white text-base font-bold">
                        {holiday.displayName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium text-center text-gray-700 dark:text-gray-300 leading-tight max-w-[70px]'
                  )}
                >
                  {holiday.displayName}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal Menu */}
      {selectedHoliday && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Menu {selectedHoliday.displayName}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {loadingMenu ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">Caricamento menu...</p>
                </div>
              ) : holidayMenuData ? (
                <>
                  {/* Mostra menu principale se presente (solo se non ci sono varianti) */}
                  {(!holidayMenuData.variants || holidayMenuData.variants.length === 0) && holidayMenuData.menuText && (
                    <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
                      <div className="prose prose-lg dark:prose-invert max-w-none">
                        <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                          {holidayMenuData.menuText}
                        </div>
                        {holidayMenuData.menuImages && holidayMenuData.menuImages.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {holidayMenuData.menuImages.map((image, index) => (
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
                        {holidayMenuData.menuPrice && (
                          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center">
                              €{holidayMenuData.menuPrice.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mostra tutte le varianti */}
                  {holidayMenuData.variants && holidayMenuData.variants.length > 0 && (
                    <div className="space-y-8">
                      {holidayMenuData.variants
                        .filter(v => v && v.title) // Filtra varianti valide
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
                        .map((variant) => (
                        <div key={variant.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            {variant.title}
                          </h3>
                          {variant.menuText && (
                            <div className="prose prose-lg dark:prose-invert max-w-none mb-4">
                              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                                {variant.menuText}
                              </div>
                            </div>
                          )}
                          {variant.menuImages.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                              {variant.items.map((item) => (
                                <HolidayMenuItemCard key={item.id} item={item} />
                              ))}
                            </div>
                          )}
                          {variant.menuPrice && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 text-center">
                                €{variant.menuPrice.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fallback: mostra piatti se non ci sono né variants né menuText */}
                  {(!holidayMenuData.variants || holidayMenuData.variants.length === 0) && !holidayMenuData.menuText && holidayMenuData.items && holidayMenuData.items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {holidayMenuData.items.map((item) => (
                        <HolidayMenuItemCard key={item.id} item={item} />
                      ))}
                    </div>
                  ) : (!holidayMenuData.variants || holidayMenuData.variants.length === 0) && !holidayMenuData.menuText && (!holidayMenuData.items || holidayMenuData.items.length === 0) ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-gray-400">
                        Nessun menu disponibile per questa festività. Torna presto!
                      </p>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">
                    Nessun menu disponibile per questa festività. Torna presto!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}


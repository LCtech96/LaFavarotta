'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import Image from 'next/image'

interface OtherHoliday {
  id: number
  name: string
  displayName: string
  previewImage: string | null
}

const otherHolidays: OtherHoliday[] = [
  { id: 1, name: 'anniversario-liberazione', displayName: 'Anniversario della Liberazione', previewImage: null },
  { id: 2, name: 'festa-lavoratori', displayName: 'Festa dei Lavoratori', previewImage: null },
  { id: 3, name: 'festa-repubblica', displayName: 'Festa della Repubblica', previewImage: null },
  { id: 4, name: 'ferragosto', displayName: 'Ferragosto', previewImage: null },
  { id: 5, name: 'ognissanti', displayName: 'Ognissanti', previewImage: null },
  { id: 6, name: 'immacolata-concezione', displayName: 'Immacolata Concezione', previewImage: null },
  { id: 7, name: 'carnevale', displayName: 'Carnevale', previewImage: null },
  { id: 8, name: 'san-valentino', displayName: 'San Valentino', previewImage: null },
  { id: 9, name: 'festa-donna', displayName: 'Festa della Donna', previewImage: null },
  { id: 10, name: 'festa-mamma', displayName: 'Festa della Mamma', previewImage: null },
  { id: 11, name: 'halloween', displayName: 'Halloween', previewImage: null },
  { id: 12, name: 'san-giuseppe', displayName: 'San Giuseppe', previewImage: null },
]

export default function AltreFestivitaPage() {
  const router = useRouter()
  const [holidays, setHolidays] = useState<OtherHoliday[]>(otherHolidays)

  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const response = await fetch('/api/holidays')
        if (response.ok) {
          const data = await response.json()
          if (data.holidays && data.holidays.length > 0) {
            // Filtra solo le altre festività
            const otherHolidaysData = data.holidays.filter((h: OtherHoliday & { name: string }) => 
              otherHolidays.some(oh => oh.name === h.name)
            )
            // Aggiorna con i dati dal database (immagini, ecc.)
            const updated = otherHolidays.map(oh => {
              const dbHoliday = otherHolidaysData.find((h: OtherHoliday & { name: string }) => h.name === oh.name)
              return dbHoliday ? { ...oh, ...dbHoliday } : oh
            })
            setHolidays(updated)
          }
        }
      } catch (error) {
        console.error('Error loading holidays:', error)
      }
    }

    loadHolidays()
  }, [])

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Indietro</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Altre Festività
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {holidays.map((holiday) => {
              const hasImage = holiday.previewImage && holiday.previewImage.length > 0
              return (
                <button
                  key={holiday.id}
                  onClick={() => router.push(`/menu/${holiday.name}`)}
                  className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <div
                    className="rounded-full overflow-hidden"
                    style={{
                      width: '100px',
                      height: '100px',
                    }}
                  >
                    {hasImage ? (
                      holiday.previewImage!.startsWith('data:') || holiday.previewImage!.startsWith('blob:') ? (
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
                            padding: '5px'
                          }}
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src={holiday.previewImage!}
                            alt={holiday.displayName}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {holiday.displayName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium text-center text-gray-700 dark:text-gray-300">
                    {holiday.displayName}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}


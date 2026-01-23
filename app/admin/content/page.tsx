'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { EditableText } from '@/components/editable-text'

export default function AdminContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Restaurant info
  const [restaurantName, setRestaurantName] = useState('Mancia e statti zitto da Sasà')
  const [restaurantSubtitle, setRestaurantSubtitle] = useState('Ristorante Pizzeria sala banchetti Mancia e statti zitto da Sasà di Leone Vincenzo & cS.S. 113 Terrasini (PA)')
  
  // Descriptions
  const [desc1, setDesc1] = useState('Benvenuti al Ristorante Mancia e statti zitto da Sasà, un gioiello culinario situato lungo la Strada Statale 113 a Terrasini, nel cuore della Sicilia. La nostra passione per la cucina di pesce freschissimo e la tradizione della pizza siciliana si uniscono per offrirvi un\'esperienza gastronomica indimenticabile.')
  const [desc2, setDesc2] = useState('Ogni piatto racconta una storia di sapori autentici, preparato con ingredienti selezionati e la maestria che solo l\'amore per la tradizione culinaria siciliana può offrire. Dalle specialità di mare ai nostri piatti di terra, ogni ricetta è un omaggio alla ricchezza del territorio siciliano.')
  const [desc3, setDesc3] = useState('La nostra sala banchetti è il luogo ideale per celebrare i vostri momenti più importanti, mentre il nostro ristorante accoglie ogni giorno chi desidera gustare l\'eccellenza della cucina siciliana in un ambiente elegante e accogliente.')

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
      // Load saved content
      const savedName = localStorage.getItem('content_restaurant_name')
      const savedSubtitle = localStorage.getItem('content_restaurant_subtitle')
      const savedDesc1 = localStorage.getItem('content_desc1')
      const savedDesc2 = localStorage.getItem('content_desc2')
      const savedDesc3 = localStorage.getItem('content_desc3')
      
      if (savedName) setRestaurantName(savedName)
      if (savedSubtitle) setRestaurantSubtitle(savedSubtitle)
      if (savedDesc1) setDesc1(savedDesc1)
      if (savedDesc2) setDesc2(savedDesc2)
      if (savedDesc3) setDesc3(savedDesc3)
    }
  }, [router])

  const handleSave = (key: string, value: string) => {
    localStorage.setItem(`content_${key}`, value)
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new Event('storage'))
    // TODO: Salvare nel database
    console.log('Saved content:', key, value)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Torna al pannello
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Modifica Contenuti
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-8">
          {/* Restaurant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome Ristorante
            </label>
            <EditableText
              value={restaurantName}
              onSave={(v) => {
                setRestaurantName(v)
                handleSave('restaurant_name', v)
              }}
              tag="h2"
              className="text-2xl font-bold text-gray-900 dark:text-white"
            />
          </div>

          {/* Restaurant Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sottotitolo Ristorante
            </label>
            <EditableText
              value={restaurantSubtitle}
              onSave={(v) => {
                setRestaurantSubtitle(v)
                handleSave('restaurant_subtitle', v)
              }}
              tag="p"
              className="text-base text-gray-600 dark:text-gray-400"
            />
          </div>

          {/* Description 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrizione 1
            </label>
            <EditableText
              value={desc1}
              onSave={(v) => {
                setDesc1(v)
                handleSave('desc1', v)
              }}
              tag="p"
              multiline
              className="text-base text-gray-700 dark:text-gray-300 leading-relaxed"
            />
          </div>

          {/* Description 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrizione 2
            </label>
            <EditableText
              value={desc2}
              onSave={(v) => {
                setDesc2(v)
                handleSave('desc2', v)
              }}
              tag="p"
              multiline
              className="text-base text-gray-700 dark:text-gray-300 leading-relaxed"
            />
          </div>

          {/* Description 3 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrizione 3
            </label>
            <EditableText
              value={desc3}
              onSave={(v) => {
                setDesc3(v)
                handleSave('desc3', v)
              }}
              tag="p"
              multiline
              className="text-base text-gray-700 dark:text-gray-300 leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Suggerimento:</strong> Fai doppio click su qualsiasi testo per modificarlo direttamente. 
              Le modifiche vengono salvate automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


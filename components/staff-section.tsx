'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { base64ToBlobUrl, isAndroid } from '@/lib/utils'

export function StaffSection() {
  const [ownerImage, setOwnerImage] = useState<string | null>(null)
  const [ownerName, setOwnerName] = useState<string>('Leone Vincenzo')
  const [ownerDescription, setOwnerDescription] = useState<string>(
    'Con una passione per la cucina che dura da oltre vent\'anni, Leone Vincenzo ha trasformato La Favarotta in un punto di riferimento per la gastronomia siciliana. La sua dedizione alla qualità e all\'autenticità si riflette in ogni piatto che esce dalla nostra cucina.'
  )

  useEffect(() => {
    const loadOwnerPhoto = async () => {
      try {
        // Prima prova a caricare dal database
        const response = await fetch('/api/staff/owner')
        if (response.ok) {
          const data = await response.json()
          if (data.imageUrl) {
            const imageUrl = data.imageUrl
            localStorage.setItem('owner_image', imageUrl)
            
            // Per Android, converti in blob URL
            if (isAndroid() && imageUrl.startsWith('data:image')) {
              const blobUrl = base64ToBlobUrl(imageUrl)
              if (blobUrl) {
                setOwnerImage(blobUrl)
              } else {
                setOwnerImage(imageUrl)
              }
            } else {
              setOwnerImage(imageUrl)
            }
            
            if (data.name) setOwnerName(data.name)
            if (data.description) setOwnerDescription(data.description)
            return
          }
        }
      } catch (error) {
        console.error('Error loading owner photo:', error)
      }

      // Fallback a localStorage
      const savedImage = localStorage.getItem('owner_image')
      if (savedImage) {
        if (isAndroid() && savedImage.startsWith('data:image')) {
          const blobUrl = base64ToBlobUrl(savedImage)
          if (blobUrl) {
            setOwnerImage(blobUrl)
          } else {
            setOwnerImage(savedImage)
          }
        } else {
          setOwnerImage(savedImage)
        }
      }
    }

    loadOwnerPhoto()

    // Listen for storage changes
    const handleStorageChange = () => {
      loadOwnerPhoto()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Restaurant Description */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          La Favarotta
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Il Ristorante La Favarotta nasce dalla passione per la cucina siciliana e il desiderio 
          di offrire ai nostri ospiti un&apos;esperienza culinaria autentica e indimenticabile. 
          Situato lungo la Strada Statale 113 a Terrasini, il nostro ristorante unisce la tradizione 
          della cucina di pesce siciliana con l&apos;arte della pizza, creando un menu che celebra 
          i sapori del territorio.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          La nostra sala banchetti è il luogo ideale per celebrare i momenti più importanti della vita, 
          mentre il ristorante accoglie ogni giorno chi desidera gustare l&apos;eccellenza della cucina 
          siciliana in un ambiente elegante e accogliente.
        </p>
      </section>

      {/* Owner */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Il Titolare
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 mx-auto md:mx-0 overflow-hidden relative">
            {ownerImage ? (
              ownerImage.startsWith('data:') || ownerImage.startsWith('blob:') ? (
                <img
                  src={ownerImage}
                  alt={ownerName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Error loading owner image')
                    e.currentTarget.style.display = 'none'
                  }}
                  style={{ 
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Image
                  src={ownerImage}
                  alt={ownerName}
                  fill
                  className="object-cover"
                />
              )
            ) : null}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {ownerName}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {ownerDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Chefs */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          I Nostri Chef
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Chef del Pesce
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              Il nostro chef specializzato in cucina di pesce seleziona quotidianamente il pesce 
              più fresco dai mercati locali, preparando piatti che esaltano i sapori del mare siciliano.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 text-center">
              Pizzaiolo
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-center">
              Il nostro pizzaiolo maestro porta avanti la tradizione della pizza siciliana, 
              utilizzando ingredienti di prima qualità e tecniche artigianali per creare pizze 
              uniche e deliziose.
            </p>
          </div>
        </div>
      </section>

      {/* Staff */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Il Nostro Staff
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Il nostro team è composto da professionisti appassionati che condividono l&apos;amore 
          per la cucina siciliana e l&apos;impegno nel garantire a ogni ospite un&apos;esperienza 
          indimenticabile. Dal servizio in sala alla preparazione in cucina, ogni membro del nostro 
          staff contribuisce a rendere La Favarotta un luogo speciale dove tradizione e qualità si 
          incontrano.
        </p>
      </section>
    </div>
  )
}




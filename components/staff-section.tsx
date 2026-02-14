'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { base64ToBlobUrl, isAndroid } from '@/lib/utils'

export function StaffSection() {
  const [ownerImage, setOwnerImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [ownerName, setOwnerName] = useState<string>('Massimiliano Andriolo')
  const [ownerDescription, setOwnerDescription] = useState<string>(
    'Massimiliano Andriolo, pizzaiolo e titolare, porta avanti con passione la tradizione dello street food palermitano e della pizza a Terrasini. Conduzione familiare nel cuore di Terrasini, vicino all\'aeroporto Falcone e Borsellino.'
  )

  useEffect(() => {
    const loadOwnerPhoto = async () => {
      setIsLoading(true)
      try {
        // Carica sempre dal database per avere l'immagine più aggiornata
        const response = await fetch('/api/staff/owner', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.imageUrl) {
            const imageUrl = data.imageUrl
            
            // Per Android, converti in blob URL
            let finalImageUrl = imageUrl
            if (isAndroid() && imageUrl.startsWith('data:image')) {
              const blobUrl = base64ToBlobUrl(imageUrl)
              if (blobUrl) {
                finalImageUrl = blobUrl
              }
            }
            
            // Aggiorna l'immagine solo dopo averla caricata dal database
            setOwnerImage(finalImageUrl)
            
            // Aggiorna localStorage solo dopo aver confermato l'immagine dal database
            localStorage.setItem('owner_image', imageUrl)
            
            if (data.name) setOwnerName(data.name)
            if (data.description) setOwnerDescription(data.description)
            setIsLoading(false)
            return
          }
        }
      } catch (error) {
        console.error('Error loading owner photo:', error)
      }

      // Fallback a localStorage solo se il database non ha un'immagine
      // e solo dopo aver tentato di caricare dal database
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
      setIsLoading(false)
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
          Mancia e statti zitto da Sasà
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Street food palermitano a conduzione familiare nel cuore di Terrasini, in provincia di Palermo. 
          A pochi minuti dall&apos;aeroporto Falcone e Borsellino, vi aspettiamo con il pane con la milza, 
          il pane con le panelle più buone e fresche, pizze tradizionali e le specialità dello street food siciliano.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          La nostra passione per la cucina di strada palermitana si unisce alla tradizione familiare: 
          ingredienti freschi, ricette autentiche e l&apos;accoglienza di chi fa del cibo un momento di condivisione.
        </p>
      </section>

      {/* Pizzaiolo e Titolare */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Il Pizzaiolo e Titolare
        </h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 mx-auto md:mx-0 overflow-hidden relative">
            {!isLoading && ownerImage ? (
              ownerImage.startsWith('data:') || ownerImage.startsWith('blob:') ? (
                <img
                  src={ownerImage}
                  alt={ownerName}
                  className="w-full h-full object-cover"
                  loading="eager"
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
                  priority
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

      {/* Staff */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Il Nostro Staff
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
          Il nostro team è composto da professionisti appassionati che condividono l&apos;amore 
          per la cucina siciliana e l&apos;impegno nel garantire a ogni ospite un&apos;esperienza 
          indimenticabile. Dal servizio in sala alla preparazione in cucina, ogni membro del nostro 
          staff contribuisce a rendere Mancia e statti zitto da Sasà un luogo speciale dove tradizione e qualità si 
          incontrano.
        </p>
      </section>
    </div>
  )
}




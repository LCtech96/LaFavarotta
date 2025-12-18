'use client'

import { useState, useEffect } from 'react'

export function RestaurantDescription() {
  const [desc1, setDesc1] = useState('Benvenuti al Ristorante La Favarotta, un gioiello culinario situato lungo la Strada Statale 113 a Terrasini, nel cuore della Sicilia. La nostra passione per la cucina di pesce freschissimo e la tradizione della pizza siciliana si uniscono per offrirvi un\'esperienza gastronomica indimenticabile.')
  const [desc2, setDesc2] = useState('Ogni piatto racconta una storia di sapori autentici, preparato con ingredienti selezionati e la maestria che solo l\'amore per la tradizione culinaria siciliana può offrire. Dalle specialità di mare ai nostri piatti di terra, ogni ricetta è un omaggio alla ricchezza del territorio siciliano.')
  const [desc3, setDesc3] = useState('La nostra sala banchetti è il luogo ideale per celebrare i vostri momenti più importanti, mentre il nostro ristorante accoglie ogni giorno chi desidera gustare l\'eccellenza della cucina siciliana in un ambiente elegante e accogliente.')

  useEffect(() => {
    const saved1 = localStorage.getItem('content_desc1')
    const saved2 = localStorage.getItem('content_desc2')
    const saved3 = localStorage.getItem('content_desc3')
    if (saved1) setDesc1(saved1)
    if (saved2) setDesc2(saved2)
    if (saved3) setDesc3(saved3)
  }, [])

  // Listen for storage changes to update in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const saved1 = localStorage.getItem('content_desc1')
      const saved2 = localStorage.getItem('content_desc2')
      const saved3 = localStorage.getItem('content_desc3')
      if (saved1) setDesc1(saved1)
      if (saved2) setDesc2(saved2)
      if (saved3) setDesc3(saved3)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleSave = (key: string, value: string) => {
    localStorage.setItem(`content_${key}`, value)
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new Event('storage'))
    // TODO: Salvare nel database
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center">
          {desc1}
        </p>
        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center mt-4">
          {desc2}
        </p>
        <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center mt-4">
          {desc3}
        </p>
      </div>
    </div>
  )
}


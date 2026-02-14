'use client'

import { useState, useEffect } from 'react'

export function RestaurantDescription() {
  const [desc1, setDesc1] = useState('Benvenuti nel nostro street food palermitano a conduzione familiare, nel cuore di Terrasini, in provincia di Palermo. A pochi minuti dall\'aeroporto Falcone e Borsellino, vi aspettiamo con il pane con la milza e il pane con le panelle più buone e fresche, pizze tradizionali e le specialità dello street food siciliano.')
  const [desc2, setDesc2] = useState('La nostra passione per la cucina di strada palermitana si unisce alla tradizione familiare: ingredienti freschi, ricette autentiche e l\'accoglienza di chi fa del cibo un momento di condivisione. Pane ca meusa, panelle e crocchè, pizze tradizionali cotte nel forno a legna e tante altre specialità per un pranzo o una cena vicino all\'aeroporto Falcone e Borsellino.')
  const [desc3, setDesc3] = useState('Terrasini e la provincia di Palermo hanno nel nostro locale un punto di riferimento per lo street food e la pizza. Venite a trovarci in Via R. Ruffino 9, 90049 Terrasini: siamo aperti per voi con il meglio della tradizione palermitana e siciliana.')

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


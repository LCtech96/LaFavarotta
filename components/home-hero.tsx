'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { EditableText } from './editable-text'

export function HomeHero() {
  const [restaurantName, setRestaurantName] = useState('La Favarotta')
  const [restaurantSubtitle, setRestaurantSubtitle] = useState('Ristorante Pizzeria sala banchetti La Favarotta di Leone Vincenzo & cS.S. 113 Terrasini (PA)')

  useEffect(() => {
    const savedName = localStorage.getItem('content_restaurant_name')
    const savedSubtitle = localStorage.getItem('content_restaurant_subtitle')
    if (savedName) setRestaurantName(savedName)
    if (savedSubtitle) setRestaurantSubtitle(savedSubtitle)
  }, [])

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedName = localStorage.getItem('content_restaurant_name')
      const savedSubtitle = localStorage.getItem('content_restaurant_subtitle')
      if (savedName) setRestaurantName(savedName)
      if (savedSubtitle) setRestaurantSubtitle(savedSubtitle)
    }

    window.addEventListener('storage', handleStorageChange)
    // Also check localStorage on focus (for same-tab updates)
    window.addEventListener('focus', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
    }
  }, [])

  return (
    <div className="w-full">
      {/* Cover Image */}
      <div className="relative w-full h-64 md:h-96 bg-gray-200 dark:bg-gray-800">
        <Image
          src="/cover-image.png"
          alt="La Favarotta - Copertina"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Profile Section */}
      <div className="container mx-auto px-4 -mt-16 md:-mt-24 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
          {/* Profile Image */}
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white dark:border-gray-900 bg-white dark:bg-gray-900 overflow-hidden shadow-lg">
            <Image
              src="/profile-image.png"
              alt="La Favarotta - Profilo"
              fill
              className="object-cover"
            />
          </div>

          {/* Restaurant Info */}
          <div className="flex-1 pb-4">
            <EditableText
              value={restaurantName}
              onSave={(v) => {
                setRestaurantName(v)
                localStorage.setItem('content_restaurant_name', v)
                // Trigger custom event for same-tab updates
                window.dispatchEvent(new Event('storage'))
              }}
              tag="h1"
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2"
            />
            <EditableText
              value={restaurantSubtitle}
              onSave={(v) => {
                setRestaurantSubtitle(v)
                localStorage.setItem('content_restaurant_subtitle', v)
                // Trigger custom event for same-tab updates
                window.dispatchEvent(new Event('storage'))
              }}
              tag="p"
              className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

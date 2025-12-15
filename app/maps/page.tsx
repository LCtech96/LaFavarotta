'use client'

import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useEffect } from 'react'

export default function MapsPage() {
  const mapsUrl = process.env.NEXT_PUBLIC_MAPS_URL || 'https://maps.app.goo.gl/jbR99NEc53czT4Hj6'

  useEffect(() => {
    // Redirect to Google Maps
    window.location.href = mapsUrl
  }, [mapsUrl])

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Reindirizzamento a Google Maps...
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}


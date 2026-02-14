'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useEffect } from 'react'

export default function MapsPage() {
  const mapsUrl = process.env.NEXT_PUBLIC_MAPS_URL || 'https://maps.app.goo.gl/2ZQ74WrGo7Xe3bEBA?g_st=ic'

  useEffect(() => {
    // Redirect to Google Maps
    window.location.href = mapsUrl
  }, [mapsUrl])

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex justify-start mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Indietro</span>
            </Link>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Reindirizzamento a Google Maps...
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}


'use client'

import Link from 'next/link'
import { ArrowLeft, MapPin, Navigation } from 'lucide-react'
import { Navigation as Nav } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { getAddress, getMapsUrl } from '@/lib/constants'

export default function MapsPage() {
  const address = getAddress()
  const mapsUrl = getMapsUrl()

  return (
    <main className="min-h-screen">
      <Nav />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="flex justify-start mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Indietro</span>
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <MapPin size={28} />
            Dove siamo
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            {address}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 w-full justify-center py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Navigation size={24} />
            Apri in Google Maps / Naviga
          </a>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            Clicca per aprire la mappa e avviare la navigazione
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}


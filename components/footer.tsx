'use client'

import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react'
import { getAddress, getMapsUrl, getWhatsappNumber, getWhatsappUrl } from '@/lib/constants'

export function Footer() {
  const whatsappNumber = getWhatsappNumber()
  const whatsappUrl = getWhatsappUrl()
  const address = getAddress()
  const mapsUrl = getMapsUrl()
  const email = process.env.NEXT_PUBLIC_EMAIL || 'Mancia e statti zitto da Sasà@gmail.com'
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || '#'
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || '#'

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20 md:mt-32 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <MapPin size={24} />
            <span className="hidden md:inline">{address}</span>
            <span className="md:hidden">Dove siamo</span>
          </a>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <Facebook size={24} />
            <span className="hidden md:inline">Facebook</span>
          </a>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Mail size={24} />
            <span className="hidden md:inline">{email}</span>
            <span className="md:hidden">Email</span>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
          >
            <Phone size={24} />
            <span className="hidden md:inline">{whatsappNumber}</span>
            <span className="md:hidden">WhatsApp</span>
          </a>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
          >
            <Instagram size={24} />
            <span className="hidden md:inline">Instagram</span>
          </a>
        </div>
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>{address}</p>
        </div>
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">
            Creato da{' '}
            <a
              href="https://facevoice.ai/ai-chat"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Facevoice.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}


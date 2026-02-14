'use client'

import { MessageCircle } from 'lucide-react'
import { getWhatsappNumber, getWhatsappUrl } from '@/lib/constants'

export function Footer() {
  const whatsappNumber = getWhatsappNumber()
  const whatsappUrl = getWhatsappUrl()

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20 md:mt-32 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-14 h-14 rounded-full text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            title="Apri WhatsApp"
            aria-label="Apri WhatsApp"
          >
            <MessageCircle size={32} />
          </a>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {whatsappNumber}
          </p>
        </div>
        <div className="mt-8 text-center text-sm text-gray-700 dark:text-gray-400">
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


'use client'

import { MessageCircle } from 'lucide-react'
import { getWhatsappNumber, getWhatsappUrl } from '@/lib/constants'

export function Footer() {
  const whatsappNumber = getWhatsappNumber()
  const whatsappUrl = getWhatsappUrl()

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20 md:mt-32 pb-20 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors font-medium"
          >
            <MessageCircle size={28} />
            <span>WhatsApp {whatsappNumber}</span>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
          >
            https://wa.me/393792675864
          </a>
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


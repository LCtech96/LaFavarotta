'use client'

import { useState } from 'react'
import { Calendar, Clock, Users, MessageCircle } from 'lucide-react'
import { getWhatsappUrl, getWhatsappNumber } from '@/lib/constants'

export function TableBooking() {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    people: '2',
    name: '',
    surname: '',
    phone: '',
    notes: '',
  })

  const whatsappUrl = getWhatsappUrl()
  const whatsappNumber = getWhatsappNumber()

  // Ottieni la data minima (oggi)
  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Ottieni la data massima (6 mesi da oggi)
  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 6)
    return maxDate.toISOString().split('T')[0]
  }

  const handleSubmit = () => {
    if (!formData.date || !formData.time || !formData.name || !formData.surname || !formData.phone) {
      alert('Per favore, compila tutti i campi obbligatori')
      return
    }

    const dateObj = new Date(formData.date)
    const formattedDate = dateObj.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    let message = `*Prenotazione Tavolo - Mancia e statti zitto da Sasà*\n\n`
    message += `*Dati Prenotazione:*\n`
    message += `📅 Data: ${formattedDate}\n`
    message += `🕐 Orario: ${formData.time}\n`
    message += `👥 Numero di persone: ${formData.people}\n\n`
    message += `*Dati Cliente:*\n`
    message += `Nome: ${formData.name} ${formData.surname}\n`
    message += `Telefono: ${formData.phone}\n`
    if (formData.notes) {
      message += `\n*Note:*\n${formData.notes}\n`
    }

    const urlWithMessage = `${whatsappUrl}?text=${encodeURIComponent(message)}`
    window.open(urlWithMessage, '_blank')
    
    // Reset form
    setFormData({
      date: '',
      time: '',
      people: '2',
      name: '',
      surname: '',
      phone: '',
      notes: '',
    })
    setIsOpen(false)
  }

  return (
    <>
      {/* Button to open booking */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
        >
          <Calendar size={24} />
          <span>Prenota un Tavolo</span>
        </button>
      </div>

      {/* Booking Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar size={24} />
                Prenota un Tavolo
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-500 dark:text-gray-400">&times;</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar size={18} />
                  Data *
                </label>
                <input
                  type="date"
                  required
                  min={getMinDate()}
                  max={getMaxDate()}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock size={18} />
                  Orario *
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Orario di apertura: 12:00 - 23:00
                </p>
              </div>

              {/* Number of People */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Users size={18} />
                  Numero di persone *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  value={formData.people}
                  onChange={(e) => setFormData({ ...formData, people: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Surname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cognome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Es: 3331234567"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                  <MessageCircle size={18} />
                  Note (opzionale)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Richiesta speciale, allergie, ecc."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!formData.date || !formData.time || !formData.name || !formData.surname || !formData.phone}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                Invia prenotazione via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}





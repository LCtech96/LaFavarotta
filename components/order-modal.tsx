'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OrderModal({ isOpen, onClose }: OrderModalProps) {
  const { items, getTotal, clearCart } = useCartStore()
  const [orderType, setOrderType] = useState<'table' | 'takeaway'>('table')
  const [formData, setFormData] = useState({
    deliveryTime: '',
    address: '',
    houseNumber: '',
    phone: '',
    name: '',
    surname: '',
  })

  if (!isOpen) return null

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+393276976442'

  const handleSubmit = () => {
    let message = `*Nuovo Ordine - ${orderType === 'table' ? 'Al Tavolo' : 'Da Asporto'}*\n\n`
    
    items.forEach((item) => {
      message += `*${item.name}* x${item.quantity}\n`
      if (item.addedIngredients.length > 0) {
        message += `  + ${item.addedIngredients.join(', ')}\n`
      }
      if (item.removedIngredients.length > 0) {
        message += `  - ${item.removedIngredients.join(', ')}\n`
      }
      message += `  ${formatPrice(item.price * item.quantity)}\n\n`
    })

    message += `*Totale: ${formatPrice(getTotal())}*\n\n`

    if (orderType === 'takeaway') {
      message += `*Dati Consegna:*\n`
      message += `Nome: ${formData.name} ${formData.surname}\n`
      message += `Indirizzo: ${formData.address}, ${formData.houseNumber}\n`
      message += `Telefono: ${formData.phone}\n`
      if (formData.deliveryTime) {
        message += `Orario preferito: ${formData.deliveryTime}\n`
      }
    }

    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    clearCart()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Completa l&apos;ordine
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Type Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Tipo di ordine
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => setOrderType('table')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  orderType === 'table'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Al Tavolo
              </button>
              <button
                onClick={() => setOrderType('takeaway')}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  orderType === 'takeaway'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Da Asporto
              </button>
            </div>
          </div>

          {/* Takeaway Form */}
          {orderType === 'takeaway' && (
            <div className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefono *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Indirizzo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numero civico *
                </label>
                <input
                  type="text"
                  required
                  value={formData.houseNumber}
                  onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Orario preferito di consegna
                </label>
                <input
                  type="time"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Riepilogo ordine
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Totale
              </span>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(getTotal())}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={orderType === 'takeaway' && (!formData.name || !formData.surname || !formData.phone || !formData.address || !formData.houseNumber)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Invia ordine via WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}


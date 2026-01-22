'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'
import { Plus, Minus, Trash2 } from 'lucide-react'
import { OrderModal } from '@/components/order-modal'

export default function CarrelloPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)

  if (items.length === 0) {
    return (
      <main className="min-h-screen">
        <Navigation />
        <div className="pt-16 md:pt-20 pb-20 md:pb-8">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              Il Tuo Carrello
            </h1>
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Il tuo carrello è vuoto
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Il Tuo Carrello
          </h1>

          <div className="space-y-4 mb-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    {item.addedIngredients.length > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        + {item.addedIngredients.join(', ')}
                      </p>
                    )}
                    {item.removedIngredients.length > 0 && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        - {item.removedIngredients.join(', ')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                Totale
              </span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(getTotal())}
              </span>
            </div>
            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Procedi con l&apos;ordine
            </button>
          </div>
        </div>
      </div>

      {isOrderModalOpen && (
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
        />
      )}

      <Footer />
    </main>
  )
}










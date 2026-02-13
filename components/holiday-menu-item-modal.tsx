'use client'

import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { cn } from '@/lib/utils'

interface HolidayMenuItem {
  id: number
  name: string
  ingredients: string[]
  price: number
  imageUrl: string | null
}

interface HolidayMenuItemModalProps {
  item: HolidayMenuItem
  isOpen: boolean
  onClose: () => void
}

// Common ingredients that can be added
const availableAdditions = [
  'pomodoro',
  'mozzarella',
  'basilico',
  'olio di oliva',
  'aglio',
  'pepe',
  'prezzemolo',
  'rucola',
  'grana',
  'pistacchio',
  'panna',
]

export function HolidayMenuItemModal({ item, isOpen, onClose }: HolidayMenuItemModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [removedIngredients, setRemovedIngredients] = useState<string[]>([])
  const [addedIngredients, setAddedIngredients] = useState<string[]>([])
  const { addItem } = useCartStore()

  if (!isOpen) return null

  const handleAddToCart = () => {
    // Usa un ID negativo per distinguere i piatti delle festività
    // Oppure potremmo usare un prefisso come 'holiday-'
    addItem({
      menuItemId: -item.id, // ID negativo per distinguere
      name: item.name,
      price: item.price,
      quantity,
      addedIngredients,
      removedIngredients,
    })
    onClose()
    // Reset state
    setQuantity(1)
    setRemovedIngredients([])
    setAddedIngredients([])
  }

  const toggleRemoveIngredient = (ingredient: string) => {
    if (removedIngredients.includes(ingredient)) {
      setRemovedIngredients(removedIngredients.filter(i => i !== ingredient))
    } else {
      setRemovedIngredients([...removedIngredients, ingredient])
    }
  }

  const toggleAddIngredient = (ingredient: string) => {
    if (addedIngredients.includes(ingredient)) {
      setAddedIngredients(addedIngredients.filter(i => i !== ingredient))
    } else {
      setAddedIngredients([...addedIngredients, ingredient])
    }
  }

  const canRemoveIngredients = item.ingredients.filter(
    ing => !removedIngredients.includes(ing)
  )

  const canAddIngredients = availableAdditions.filter(
    ing => !item.ingredients.includes(ing) && !addedIngredients.includes(ing)
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {item.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {item.ingredients.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ingredienti:
              </p>
              <div className="flex flex-wrap gap-2">
                {item.ingredients.map((ingredient) => (
                  <span
                    key={ingredient}
                    className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingredienti modificati in tempo reale */}
          {(removedIngredients.length > 0 || addedIngredients.length > 0) && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ingredienti modificati (clicca per annullare):
              </p>
              <div className="flex flex-wrap gap-2">
                {/* Ingredienti originali non rimossi */}
                {item.ingredients
                  .filter(ing => !removedIngredients.includes(ing))
                  .map((ingredient) => (
                    <span
                      key={ingredient}
                      className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {ingredient}
                    </span>
                  ))}
                {/* Ingredienti rimossi (rosso) - cliccabili per ripristinare */}
                {removedIngredients.map((ingredient) => (
                  <button
                    key={`removed-${ingredient}`}
                    onClick={() => toggleRemoveIngredient(ingredient)}
                    className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 line-through hover:bg-red-200 dark:hover:bg-red-800 transition-colors cursor-pointer"
                    title="Clicca per ripristinare"
                  >
                    {ingredient}
                  </button>
                ))}
                {/* Ingredienti aggiunti (verde) - cliccabili per rimuovere */}
                {addedIngredients.map((ingredient) => (
                  <button
                    key={`added-${ingredient}`}
                    onClick={() => toggleAddIngredient(ingredient)}
                    className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer"
                    title="Clicca per rimuovere"
                  >
                    + {ingredient}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Prezzo: {formatPrice(item.price)}
            </p>
          </div>

          {/* Remove Ingredients */}
          {canRemoveIngredients.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Rimuovi ingredienti
              </h3>
              <div className="flex flex-wrap gap-2">
                {canRemoveIngredients.map((ingredient) => (
                  <button
                    key={ingredient}
                    onClick={() => toggleRemoveIngredient(ingredient)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm transition-colors',
                      removedIngredients.includes(ingredient)
                        ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    - {ingredient}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Ingredients */}
          {canAddIngredients.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Aggiungi ingredienti
              </h3>
              <div className="flex flex-wrap gap-2">
                {canAddIngredients.map((ingredient) => (
                  <button
                    key={ingredient}
                    onClick={() => toggleAddIngredient(ingredient)}
                    className={cn(
                      'px-3 py-1 rounded-full text-sm transition-colors',
                      addedIngredients.includes(ingredient)
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    + {ingredient}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Quantità
            </h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Minus size={20} />
              </button>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              Totale: {formatPrice(item.price * quantity)}
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Aggiungi al carrello
          </button>
        </div>
      </div>
    </div>
  )
}






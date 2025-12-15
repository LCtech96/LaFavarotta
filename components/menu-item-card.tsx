'use client'

import { useState } from 'react'
import { type MenuItem } from '@/data/menu-data'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { MenuItemModal } from './menu-item-modal'
import { Star, Leaf, AlertCircle } from 'lucide-react'

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
            {item.name}
          </h3>
          <div className="flex gap-1 ml-2">
            {item.isBestSeller && (
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
            )}
            {item.isVegan && (
              <Leaf size={16} className="text-green-500" />
            )}
            {item.isGlutenFree && (
              <AlertCircle size={16} className="text-blue-500" />
            )}
          </div>
        </div>
        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {item.description}
          </p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatPrice(item.price)}
          </span>
        </div>
      </div>

      {isModalOpen && (
        <MenuItemModal
          item={item}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}


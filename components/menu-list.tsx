'use client'

import { useState } from 'react'
import { menuItems, categories, type MenuItem } from '@/data/menu-data'
import { MenuItemCard } from './menu-item-card'

export function MenuList() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)

  const filteredItems = selectedCategory !== null
    ? menuItems.filter(item => item.categoryId === selectedCategory)
    : menuItems

  const itemsByCategory = categories.map(category => ({
    category,
    items: menuItems.filter(item => item.categoryId === category.id),
  }))

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          Tutti
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items by Category */}
      {selectedCategory === null ? (
        itemsByCategory.map(({ category, items }) => (
          items.length > 0 && (
            <div key={category.id} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-blue-600 pb-2">
                {category.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )
        ))
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}








'use client'

import { useState } from 'react'
import { ChefHat, AlertCircle, Leaf, Star, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Highlight {
  id: string
  label: string
  icon: LucideIcon
}

const highlights: Highlight[] = [
  { id: 'ingredienti', label: 'Ingredienti', icon: ChefHat },
  { id: 'allergeni', label: 'Allergeni', icon: AlertCircle },
  { id: 'vegan', label: 'Vegan/Gluten Free', icon: Leaf },
  { id: 'bestseller', label: 'Best Seller', icon: Star },
]

export function Highlights() {
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null)

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex items-center justify-center gap-3 md:gap-4">
        {highlights.map((highlight) => {
          const Icon = highlight.icon
          const isActive = activeHighlight === highlight.id

          return (
            <button
              key={highlight.id}
              onClick={() => setActiveHighlight(isActive ? null : highlight.id)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-full transition-all',
                'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900',
                'border-2 border-transparent',
                isActive && 'ring-2 ring-blue-500 dark:ring-blue-400 scale-105',
                'hover:scale-105 active:scale-95'
              )}
              style={{
                width: '60px',
                height: '60px',
              }}
            >
              <Icon
                size={20}
                className={cn(
                  'text-gray-700 dark:text-gray-300',
                  isActive && 'text-blue-600 dark:text-blue-400'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium text-center text-gray-700 dark:text-gray-300 leading-tight',
                  isActive && 'text-blue-600 dark:text-blue-400'
                )}
              >
                {highlight.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}


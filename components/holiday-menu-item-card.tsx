'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { formatPrice, base64ToBlobUrl, isAndroid } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { HolidayMenuItemModal } from './holiday-menu-item-modal'

interface HolidayMenuItem {
  id: number
  name: string
  ingredients: string[]
  price: number
  imageUrl: string | null
}

interface HolidayMenuItemCardProps {
  item: HolidayMenuItem
}

export function HolidayMenuItemCard({ item }: HolidayMenuItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemImage, setItemImage] = useState<string | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (!item.imageUrl) {
      setItemImage(null)
      return
    }

    const loadImage = async () => {
      try {
        const imageUrl = item.imageUrl!
        localStorage.setItem(`holiday_item_image_${item.id}`, imageUrl)
        
        if (isAndroid() && imageUrl.startsWith('data:image')) {
          const blobUrl = base64ToBlobUrl(imageUrl)
          if (blobUrl) {
            if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current)
            }
            blobUrlRef.current = blobUrl
            setItemImage(blobUrl)
          } else {
            setItemImage(imageUrl)
          }
        } else {
          setItemImage(imageUrl)
        }
      } catch (error) {
        console.error(`Error loading image for holiday item ${item.id}:`, error)
      }
    }

    loadImage()

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
    }
  }, [item.id, item.imageUrl])

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {itemImage && (
          <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <img
              src={itemImage}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('Error loading image for holiday item', item.id)
                e.currentTarget.style.display = 'none'
              }}
              style={{ 
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        )}
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {item.name}
          </h3>
          {item.ingredients.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {item.ingredients.join(', ')}
            </p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(item.price)}
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <HolidayMenuItemModal
          item={item}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}






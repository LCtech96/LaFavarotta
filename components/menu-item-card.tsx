'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { type MenuItem } from '@/data/menu-data'
import { formatPrice, base64ToBlobUrl, isAndroid } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { MenuItemModal } from './menu-item-modal'
import { Star, Leaf, AlertCircle } from 'lucide-react'

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemImage, setItemImage] = useState<string | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    // Load image from localStorage
    const loadImage = () => {
      const savedImage = localStorage.getItem(`item_image_${item.id}`)
      if (savedImage) {
        // Per Android, prova a convertire in blob URL
        if (isAndroid() && savedImage.startsWith('data:image')) {
          const blobUrl = base64ToBlobUrl(savedImage)
          if (blobUrl) {
            // Pulisci il blob URL precedente se esiste
            if (blobUrlRef.current) {
              URL.revokeObjectURL(blobUrlRef.current)
            }
            blobUrlRef.current = blobUrl
            setItemImage(blobUrl)
          } else {
            // Fallback a base64 se la conversione fallisce
            setItemImage(savedImage)
          }
        } else {
          setItemImage(savedImage)
        }
      } else {
        setItemImage(null)
      }
    }

    loadImage()

    // Listen for storage changes
    const handleStorageChange = () => {
      loadImage()
    }

    // Listen for custom image update events
    const handleImageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent
      if (customEvent.detail?.itemId === item.id) {
        const imageUrl = customEvent.detail.imageUrl
        // Per Android, converti in blob URL
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
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    window.addEventListener('imageUpdated', handleImageUpdate as EventListener)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
      window.removeEventListener('imageUpdated', handleImageUpdate as EventListener)
      // Pulisci blob URL quando il componente viene smontato
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
    }
  }, [item.id])

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Item Image */}
        {itemImage && (
          <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <img
              src={itemImage}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                console.error('Error loading image for item', item.id)
                // Su Android, prova a ricaricare da localStorage come base64
                if (isAndroid()) {
                  const savedImage = localStorage.getItem(`item_image_${item.id}`)
                  if (savedImage && savedImage.startsWith('data:image')) {
                    // Prova direttamente con base64 come fallback
                    e.currentTarget.src = savedImage
                  } else {
                    e.currentTarget.style.display = 'none'
                  }
                } else {
                  e.currentTarget.style.display = 'none'
                }
              }}
              onLoad={() => {
                // Immagine caricata con successo
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
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
              {item.description}
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
        <MenuItemModal
          item={item}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}


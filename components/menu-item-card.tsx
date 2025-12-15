'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { type MenuItem } from '@/data/menu-data'
import { formatPrice, optimizeBase64Image } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { MenuItemModal } from './menu-item-modal'
import { Star, Leaf, AlertCircle } from 'lucide-react'

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemImage, setItemImage] = useState<string | null>(null)

  useEffect(() => {
    // Load image from localStorage
    const loadImage = () => {
      try {
        const savedImage = localStorage.getItem(`item_image_${item.id}`)
        if (savedImage && savedImage.length > 100) {
          // Ottimizza l'immagine per Android
          const optimized = optimizeBase64Image(savedImage)
          // Prova a caricare anche se la validazione fallisce (per compatibilità)
          if (optimized && optimized.length > 100) {
            setItemImage(optimized)
            console.log('Immagine caricata per item', item.id, 'Dimensione:', (optimized.length / 1024).toFixed(2), 'KB')
          } else {
            console.warn('Immagine troppo piccola per item', item.id)
            setItemImage(null)
          }
        } else {
          setItemImage(null)
        }
      } catch (error) {
        console.error('Errore nel caricamento immagine per item', item.id, error)
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
        setItemImage(customEvent.detail.imageUrl)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    window.addEventListener('imageUpdated', handleImageUpdate as EventListener)
    
    // Forza il refresh ogni 3 secondi per Android (workaround per problemi localStorage)
    const refreshInterval = setInterval(() => {
      loadImage()
    }, 3000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
      window.removeEventListener('imageUpdated', handleImageUpdate as EventListener)
      clearInterval(refreshInterval)
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
              crossOrigin="anonymous"
              onError={(e) => {
                console.error('Error loading image for item', item.id, 'on Android')
                // Rimuovi l'immagine corrotta e prova a ricaricarla
                const savedImage = localStorage.getItem(`item_image_${item.id}`)
                if (savedImage) {
                  const optimized = optimizeBase64Image(savedImage)
                  if (optimized !== itemImage) {
                    setItemImage(optimized)
                  } else {
                    e.currentTarget.style.display = 'none'
                  }
                } else {
                  e.currentTarget.style.display = 'none'
                }
              }}
              onLoad={() => {
                // Immagine caricata con successo
                console.log('Image loaded successfully for item', item.id)
              }}
              style={{ 
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                minHeight: '192px'
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


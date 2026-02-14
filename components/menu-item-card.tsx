'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { type MenuItem } from '@/data/menu-data'
import { formatPrice, base64ToBlobUrl, isAndroid } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { MenuItemModal } from './menu-item-modal'

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemImage, setItemImage] = useState<string | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  const staticImageMap: Record<string, string> = {
    '4 Formaggi': '/4Formaggi.png',
    'Anelli di cipolla (10 pezzi)': '/Anellidicipola(10pezzi).png',
    'Arancina al Burro': '/ArancinaalBurro.png',
    'Arancina Classica': '/Arancinaclassica.png',
    'Arancina Popey': '/ArancinaPopey.png',
    'Bruschetta Salmone': '/BruschettaSalmone.png',
    'Caprese': '/Caprese.png',
    'Capricciosa': '/Capricciosa.png',
    'Cesar Salad': '/Cesar salad.png',
    'Chicken nuggets (5 pezzi)': '/Chicken nuggets(5 pezzi).png',
    'Chicken wings (10 pezzi)': '/Chicken wings(10pezzi).png',
    'Diavola': '/Diavola.png',
    'Patatosa': '/Patatosa.png',
    'Crudo': '/Crudo.png',
    'Tonno': '/tonno.png',
    'Prosciutto': '/Prosciutto.png',
    'Rucola': '/Rucola.png',
    'Salame piccante': '/Salamepiccante.png',
    'Pomodoro': '/Pomodoro.png',
    'Patatine piccole': '/Patatinepiccole.png',
    'Panino con Milza': '/paninoconmilza.png',
    'Pane e Panelle': '/paneepanelle.png',
    'Pane e Panelle e Crocchè': '/paneepanelleecrocchè.png',
    'Mozzarella fritte stick (8 pezzi)': '/Mozzarellafrittestick(8pezzi).png',
    'Misto caldo': '/Mistocaldo.png',
    'Margherita': '/Margherita.png',
    'Waffel': '/Waffel.png',
    'Cartoccio': '/cartoccio.png',
    'Calzone': '/calzone.png',
    'Gorgonzola': '/gorgonzola.png',
    'Pippo': '/pippo.png',
    'Frutti di mare': '/Fruttidimare.png',
    'Hamburger Classic': '/hamburgerclassic.png',
    'Cheeseburger': '/cheeseburger.png',
    'Hamburger Sasà': '/hamburgerSasà.png',
    'Mangia e stai zitto': '/mangiaestaizitto.png',
    'Chicken burger': '/chickenburger.png',
    'Wurstel': '/wurstel.png',
    'Topolino': '/topolino.png',
    'Rucolino': '/rucolino.png',
    'Fagottino': '/fagottino.png',
    'Salvo': '/salvo.png',
    'Salsicciotto': '/salsicciotto.png',
    'Salsiccia': '/salsicciotto.png',
    'Porchetta': '/porchetta.png',
    'Tiramisù': '/Tiramisu\'.png',
  }

  useEffect(() => {
    // Load image from database with localStorage fallback
    const loadImage = async () => {
      try {
        // Prima prova a caricare dal database
        const response = await fetch(`/api/images/menu-items/${item.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.imageUrl) {
            const imageUrl = data.imageUrl
            // Salva in localStorage come cache
            localStorage.setItem(`item_image_${item.id}`, imageUrl)
            
            // Per Android, prova a convertire in blob URL
            if (isAndroid() && imageUrl.startsWith('data:image')) {
              const blobUrl = base64ToBlobUrl(imageUrl)
              if (blobUrl) {
                // Pulisci il blob URL precedente se esiste
                if (blobUrlRef.current) {
                  URL.revokeObjectURL(blobUrlRef.current)
                }
                blobUrlRef.current = blobUrl
                setItemImage(blobUrl)
                return
              }
            }
            setItemImage(imageUrl)
            return
          }
        }
      } catch (error) {
        console.error(`Error loading image for item ${item.id}:`, error)
      }

      // Fallback a localStorage
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
        // Se l'immagine è stata rimossa, pulisci stato e cache
        if (!imageUrl) {
          if (blobUrlRef.current) {
            URL.revokeObjectURL(blobUrlRef.current)
            blobUrlRef.current = null
          }
          localStorage.removeItem(`item_image_${item.id}`)
          setItemImage(null)
          return
        }
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
        {/* Item Image: prima da DB/localStorage, poi da statiche in /public */}
        {(itemImage || staticImageMap[item.name]) && (
          <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <img
              src={itemImage ?? staticImageMap[item.name]}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
              crossOrigin="anonymous"
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


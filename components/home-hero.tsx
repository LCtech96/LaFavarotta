'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { base64ToBlobUrl, isAndroid } from '@/lib/utils'

export function HomeHero() {
  const [restaurantName, setRestaurantName] = useState('Mancia e statti zitto da Sasà')
  const [restaurantSubtitle, setRestaurantSubtitle] = useState('Ristorante Pizzeria sala banchetti Mancia e statti zitto da Sasà di Leone Vincenzo & cS.S. 113 Terrasini (PA)')
  
  // MODIFICATO: Impostiamo il tuo file reale come immagine di copertina predefinita
  const [coverImage, setCoverImage] = useState('/copertina.png.jpg')
  
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true)
  const coverBlobUrlRef = useRef<string | null>(null)
  const profileBlobUrlRef = useRef<string | null>(null)

  const loadImages = async () => {
    try {
      const coverResponse = await fetch('/api/images/general?type=cover', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (coverResponse.ok) {
        const coverData = await coverResponse.json()
        if (coverData.imageUrl) {
          const savedCover = coverData.imageUrl
          localStorage.setItem('cover_image', savedCover)
         
          if (isAndroid() && savedCover.startsWith('data:image')) {
            const blobUrl = base64ToBlobUrl(savedCover)
            if (blobUrl) {
              if (coverBlobUrlRef.current) {
                URL.revokeObjectURL(coverBlobUrlRef.current)
              }
              coverBlobUrlRef.current = blobUrl
              setCoverImage(blobUrl)
            } else {
              setCoverImage(savedCover)
            }
          } else {
            setCoverImage(savedCover)
          }
        }
      }
    } catch (error) {
      console.error('Error loading cover image:', error)
      const savedCover = localStorage.getItem('cover_image')
      if (savedCover) {
        if (isAndroid() && savedCover.startsWith('data:image')) {
          const blobUrl = base64ToBlobUrl(savedCover)
          if (blobUrl) {
            if (coverBlobUrlRef.current) {
              URL.revokeObjectURL(coverBlobUrlRef.current)
            }
            coverBlobUrlRef.current = blobUrl
            setCoverImage(blobUrl)
          } else {
            setCoverImage(savedCover)
          }
        } else {
          setCoverImage(savedCover)
        }
      }
    }

    setIsProfileLoading(true)
    try {
      const profileResponse = await fetch('/api/images/general?type=profile', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.imageUrl) {
          const savedProfile = profileData.imageUrl
          let finalProfileUrl = savedProfile
          if (isAndroid() && savedProfile.startsWith('data:image')) {
            const blobUrl = base64ToBlobUrl(savedProfile)
            if (blobUrl) {
              if (profileBlobUrlRef.current) {
                URL.revokeObjectURL(profileBlobUrlRef.current)
              }
              profileBlobUrlRef.current = blobUrl
              finalProfileUrl = blobUrl
            }
          }
          setProfileImage(finalProfileUrl)
          localStorage.setItem('profile_image', savedProfile)
          setIsProfileLoading(false)
          return
        }
      }
    } catch (error) {
      console.error('Error loading profile image:', error)
    }

    const savedProfile = localStorage.getItem('profile_image')
    if (savedProfile) {
      if (isAndroid() && savedProfile.startsWith('data:image')) {
        const blobUrl = base64ToBlobUrl(savedProfile)
        if (blobUrl) {
          if (profileBlobUrlRef.current) {
            URL.revokeObjectURL(profileBlobUrlRef.current)
          }
          profileBlobUrlRef.current = blobUrl
          setProfileImage(blobUrl)
        } else {
          setProfileImage(savedProfile)
        }
      } else {
        setProfileImage(savedProfile)
      }
    } else {
      // MODIFICATO: Impostiamo il tuo file reale come profilo predefinito
      setProfileImage('/sasa.png.jpg')
    }
    setIsProfileLoading(false)
  }

  useEffect(() => {
    const savedName = localStorage.getItem('content_restaurant_name')
    const savedSubtitle = localStorage.getItem('content_restaurant_subtitle')
   
    if (savedName) setRestaurantName(savedName)
    if (savedSubtitle) setRestaurantSubtitle(savedSubtitle)
   
    loadImages().catch(console.error)
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const savedName = localStorage.getItem('content_restaurant_name')
      const savedSubtitle = localStorage.getItem('content_restaurant_subtitle')
     
      if (savedName) setRestaurantName(savedName)
      if (savedSubtitle) setRestaurantSubtitle(savedSubtitle)
     
      loadImages().catch(console.error)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleStorageChange)
      if (coverBlobUrlRef.current) {
        URL.revokeObjectURL(coverBlobUrlRef.current)
      }
    }
  }, [])

  return (
    <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
      {/* Immagine di Copertina */}
      <div className="absolute inset-0">
        <Image
          src={coverImage}
          alt="Ristorante Cover"
          fill
          className="object-cover transition-opacity duration-700"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center text-white">
        {/* Immagine Profilo Sasà */}
        <div className="relative w-32 h-32 md:w-48 md:h-48 mb-6 rounded-full border-4 border-white overflow-hidden shadow-xl bg-gray-200">
          {!isProfileLoading && profileImage && (
            <Image
              src={profileImage}
              alt="Sasà"
              fill
              className="object-cover"
              priority
            />
          )}
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
          {restaurantName}
        </h1>
        <p className="text-lg md:text-xl max-w-2xl drop-shadow-md">
          {restaurantSubtitle}
        </p>
      </div>
    </section>
  )
}


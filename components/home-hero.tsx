'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { base64ToBlobUrl, isAndroid } from '@/lib/utils'

export function HomeHero() {
  const [restaurantName, setRestaurantName] = useState('Mancia e statti zitto da Sasà')
  const [restaurantSubtitle, setRestaurantSubtitle] = useState('Street food palermitano a conduzione familiare nel cuore di Terrasini (PA). Via R. Ruffino, 9 — vicino all\'aeroporto Falcone e Borsellino.')
  
  const [coverImage, setCoverImage] = useState('/copertina.png.jpg')
  const [profileImage, setProfileImage] = useState<string>('/sasa.png.jpg')
  const [fullscreenImage, setFullscreenImage] = useState<'cover' | 'profile' | null>(null)
  const coverBlobUrlRef = useRef<string | null>(null)
  const profileBlobUrlRef = useRef<string | null>(null)

  const loadImages = async () => {
    const noCache = {
      cache: 'no-store' as RequestCache,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    }

    const loadCover = async () => {
      try {
        const res = await fetch('/api/images/general?type=cover', noCache)
        if (!res.ok) return
        const data = await res.json()
        if (data.imageUrl) {
          const saved = data.imageUrl
          localStorage.setItem('cover_image', saved)
          if (isAndroid() && saved.startsWith('data:image')) {
            const blob = base64ToBlobUrl(saved)
            if (blob) {
              if (coverBlobUrlRef.current) URL.revokeObjectURL(coverBlobUrlRef.current)
              coverBlobUrlRef.current = blob
              setCoverImage(blob)
            } else setCoverImage(saved)
          } else setCoverImage(saved)
        }
      } catch (e) {
        console.error('Error loading cover:', e)
        const saved = localStorage.getItem('cover_image')
        if (saved) setCoverImage(saved)
      }
    }

    const loadProfile = async () => {
      try {
        const res = await fetch('/api/images/general?type=profile', noCache)
        if (!res.ok) throw new Error('not ok')
        const data = await res.json()
        if (data.imageUrl) {
          const saved = data.imageUrl
          localStorage.setItem('profile_image', saved)
          let url = saved
          if (isAndroid() && saved.startsWith('data:image')) {
            const blob = base64ToBlobUrl(saved)
            if (blob) {
              if (profileBlobUrlRef.current) URL.revokeObjectURL(profileBlobUrlRef.current)
              profileBlobUrlRef.current = blob
              url = blob
            }
          }
          setProfileImage(url)
        }
      } catch (e) {
        console.error('Error loading profile:', e)
        const saved = localStorage.getItem('profile_image')
        if (saved) {
          if (isAndroid() && saved.startsWith('data:image')) {
            const blob = base64ToBlobUrl(saved)
            if (blob) {
              if (profileBlobUrlRef.current) URL.revokeObjectURL(profileBlobUrlRef.current)
              profileBlobUrlRef.current = blob
              setProfileImage(blob)
            } else setProfileImage(saved)
          } else setProfileImage(saved)
        }
      }
    }

    await Promise.all([loadCover(), loadProfile()])
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

  useEffect(() => {
    if (fullscreenImage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [fullscreenImage])

  useEffect(() => {
    if (!fullscreenImage) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreenImage(null)
    }
    window.addEventListener('keydown', onEscape)
    return () => window.removeEventListener('keydown', onEscape)
  }, [fullscreenImage])

  const fullscreenSrc = fullscreenImage === 'cover' ? coverImage : fullscreenImage === 'profile' ? profileImage : null

  return (
    <section className="relative w-full overflow-hidden">
      {/* Immagine di copertina: cliccabile per aprire a schermo intero */}
      <button
        type="button"
        onClick={() => setFullscreenImage('cover')}
        className="relative w-full aspect-[2/1] min-h-[280px] md:aspect-[21/9] md:min-h-[320px] block cursor-pointer border-0 p-0 text-left"
        aria-label="Apri copertina a schermo intero"
      >
        <Image
          src={coverImage}
          alt="Ristorante Cover"
          fill
          className="object-cover object-top transition-opacity duration-700"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </button>

      {/* Contenuto (logo, nome, sottotitolo): in light mode sfondo chiaro e testo nero per contrasto */}
      <div className="relative -mt-16 md:-mt-24 pb-8 max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center bg-white/95 dark:bg-transparent py-4 rounded-t-2xl">
        <button
          type="button"
          onClick={() => setFullscreenImage('profile')}
          className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-white overflow-hidden shadow-xl bg-gray-200 flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700 cursor-pointer border-0 p-0"
          aria-label="Apri immagine profilo a schermo intero"
        >
          <Image
            src={profileImage}
            alt="Sasà"
            fill
            className="object-cover"
            priority
            sizes="128px"
          />
        </button>
        <h1 className="text-3xl md:text-5xl font-bold mt-4 mb-2 text-gray-900 dark:text-white drop-shadow-none dark:drop-shadow-lg">
          {restaurantName}
        </h1>
        <p className="text-base md:text-lg max-w-2xl text-gray-800 dark:text-white drop-shadow-none dark:drop-shadow-md">
          {restaurantSubtitle}
        </p>
      </div>

      {/* Lightbox a schermo intero */}
      {fullscreenImage && fullscreenSrc && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Immagine a schermo intero"
        >
          <button
            type="button"
            onClick={() => setFullscreenImage(null)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Chiudi"
          >
            <X size={28} />
          </button>
          <button
            type="button"
            onClick={() => setFullscreenImage(null)}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
          >
            Torna indietro
          </button>
          <div
            className="absolute inset-0 flex items-center justify-center p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <img
              src={fullscreenSrc}
              alt={fullscreenImage === 'cover' ? 'Copertina' : 'Profilo'}
              className="max-w-full max-h-full w-auto h-auto object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </section>
  )
}


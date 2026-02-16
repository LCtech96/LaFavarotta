'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import { ImageCropper } from '@/components/image-cropper'
import { optimizeBase64Image } from '@/lib/utils'

export default function AdminGeneralImages() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [croppingImage, setCroppingImage] = useState<string | null>(null)
  const [croppingType, setCroppingType] = useState<'cover' | 'profile' | 'owner' | null>(null)
  const [currentImages, setCurrentImages] = useState<{ cover: string | null; profile: string | null; owner: string | null }>({
    cover: null,
    profile: null,
    owner: null
  })
  const [loadingImages, setLoadingImages] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  // Carica le immagini attualmente visibili (stesso stato del sito) per mostrarle e permettere sovrascrittura
  useEffect(() => {
    if (!isAuthenticated) return

    const loadCurrentImages = async () => {
      setLoadingImages(true)
      const images = { cover: null as string | null, profile: null as string | null, owner: null as string | null }

      try {
        const [coverRes, profileRes, ownerRes] = await Promise.all([
          fetch('/api/images/general?type=cover', { cache: 'no-store' }),
          fetch('/api/images/general?type=profile', { cache: 'no-store' }),
          fetch('/api/staff/owner', { cache: 'no-store' })
        ])

        const coverData = coverRes.ok ? await coverRes.json() : null
        const profileData = profileRes.ok ? await profileRes.json() : null
        const ownerData = ownerRes.ok ? await ownerRes.json() : null

        if (coverData?.imageUrl) images.cover = coverData.imageUrl
        if (profileData?.imageUrl) images.profile = profileData.imageUrl
        if (ownerData?.imageUrl) images.owner = ownerData.imageUrl

        // Fallback localStorage se il DB non ha ancora l'immagine
        if (!images.cover && typeof window !== 'undefined') images.cover = localStorage.getItem('cover_image')
        if (!images.profile && typeof window !== 'undefined') images.profile = localStorage.getItem('profile_image')
        if (!images.owner && typeof window !== 'undefined') images.owner = localStorage.getItem('owner_image')
      } catch (e) {
        console.error('Error loading current images:', e)
      }

      setCurrentImages(images)
      setLoadingImages(false)
    }

    loadCurrentImages()
  }, [isAuthenticated])

  const handleFileSelect = (type: 'cover' | 'profile' | 'owner', file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageDataUrl = e.target?.result as string
      setCroppingImage(imageDataUrl)
      setCroppingType(type)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = async (croppedImage: string) => {
    if (!croppingType) return

    try {
      // Ottimizza l'immagine base64 per Android
      const optimized = optimizeBase64Image(croppedImage)

      if (croppingType === 'owner') {
        // Salva la foto del titolare tramite API specifica
        const response = await fetch('/api/staff/owner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl: optimized }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Errore nel salvataggio della foto del titolare')
        }

        // Salva anche in localStorage come fallback
        localStorage.setItem('owner_image', optimized)
        
        // Trigger custom event for same-tab updates
        window.dispatchEvent(new Event('storage'))
      } else {
        // Salva nel database tramite API
        const response = await fetch('/api/images/general', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: croppingType, imageUrl: optimized }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Errore nel salvataggio dell\'immagine')
        }

        // Salva anche in localStorage come fallback
        localStorage.setItem(`${croppingType}_image`, optimized)
        
        // Trigger custom event for same-tab updates
        window.dispatchEvent(new Event('storage'))
        window.dispatchEvent(new CustomEvent('imageUpdated', { 
          detail: { type: croppingType, imageUrl: optimized } 
        }))
      }

      // Aggiorna l'anteprima nell'admin (sovrascrittura visibile subito)
      setCurrentImages((prev) => ({
        ...prev,
        ...(croppingType === 'owner' ? { owner: optimized } : { [croppingType]: optimized })
      }))

      // Reset
      setCroppingImage(null)
      setCroppingType(null)
      
      alert('Immagine caricata con successo! L\'immagine è ora visibile sulla homepage su tutti i dispositivi.')
    } catch (error) {
      console.error('Error saving image:', error)
      alert('Errore nel caricamento dell\'immagine. Riprova più tardi.')
    }
  }

  const handleCancelCrop = () => {
    setCroppingImage(null)
    setCroppingType(null)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          Torna al pannello
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Immagini Generali
        </h1>

        {loadingImages && (
          <p className="text-gray-600 dark:text-gray-400 mb-6">Caricamento immagini attuali...</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cover Image */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${currentImages.cover ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Immagine Copertina
            </h2>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect('cover', file)
                }}
                className="hidden"
                id="cover-image"
              />
              <label
                htmlFor="cover-image"
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${currentImages.cover ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                <Upload size={16} />
                {currentImages.cover ? 'Sostituisci copertina' : 'Carica e ritaglia copertina'}
              </label>
            </div>
            {currentImages.cover && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={currentImages.cover}
                  alt="Copertina attuale"
                  className="w-full h-28 object-cover"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Immagine attualmente visibile in homepage</p>
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Proporzione consigliata: 3:1 (larghezza:altezza)
            </p>
          </div>

          {/* Profile Image */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${currentImages.profile ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Immagine Profilo
            </h2>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect('profile', file)
                }}
                className="hidden"
                id="profile-image"
              />
              <label
                htmlFor="profile-image"
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${currentImages.profile ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                <Upload size={16} />
                {currentImages.profile ? 'Sostituisci profilo' : 'Carica e ritaglia profilo'}
              </label>
            </div>
            {currentImages.profile && (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-24 h-24">
                <img
                  src={currentImages.profile}
                  alt="Profilo attuale"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Immagine attualmente visibile</p>
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Proporzione consigliata: 1:1 (quadrata)
            </p>
          </div>

          {/* Owner Photo */}
          <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${currentImages.owner ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Foto del Titolare (Andriolo Salvatore)
            </h2>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect('owner', file)
                }}
                className="hidden"
                id="owner-image"
              />
              <label
                htmlFor="owner-image"
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${currentImages.owner ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                <Upload size={16} />
                {currentImages.owner ? 'Sostituisci foto titolare' : 'Carica e ritaglia foto'}
              </label>
            </div>
            {currentImages.owner && (
              <div className="mt-3">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  <img
                    src={currentImages.owner}
                    alt="Titolare attuale"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Foto attualmente visibile in Chi siamo</p>
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Proporzione consigliata: 1:1 (quadrata)
            </p>
          </div>
        </div>
      </div>

      {croppingImage && croppingType && (
        <ImageCropper
          image={croppingImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCancelCrop}
          aspectRatio={croppingType === 'cover' ? 3 : 1}
        />
      )}
    </div>
  )
}

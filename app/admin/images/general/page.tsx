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
  const [croppingType, setCroppingType] = useState<'cover' | 'profile' | null>(null)
  const router = useRouter()

  useEffect(() => {
    const auth = sessionStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleFileSelect = (type: 'cover' | 'profile', file: File) => {
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

    // Ottimizza l'immagine base64 per Android
    const optimized = optimizeBase64Image(croppedImage)
    
    // Salva in localStorage
    localStorage.setItem(`${croppingType}_image`, optimized)
    
    // Update local state
    if (croppingType === 'cover') {
      setCoverImageUrl(optimized)
    } else {
      setProfileImageUrl(optimized)
    }
    
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new Event('storage'))
    window.dispatchEvent(new CustomEvent('imageUpdated', { 
      detail: { type: croppingType, imageUrl: optimized } 
    }))

    // Reset
    setCroppingImage(null)
    setCroppingType(null)
    
    alert('Immagine caricata con successo! L\'immagine è ora visibile sulla homepage.')
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cover Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Immagine Copertina
            </h2>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileSelect('cover', file)
                  }
                }}
                className="hidden"
                id="cover-image"
              />
              <label
                htmlFor="cover-image"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Upload size={16} />
                Carica e ritaglia copertina
              </label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Proporzione consigliata: 3:1 (larghezza:altezza)
            </p>
          </div>

          {/* Profile Image */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Immagine Profilo
            </h2>
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileSelect('profile', file)
                  }
                }}
                className="hidden"
                id="profile-image"
              />
              <label
                htmlFor="profile-image"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Upload size={16} />
                Carica e ritaglia profilo
              </label>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
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


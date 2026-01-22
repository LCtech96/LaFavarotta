'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, Check, RotateCw } from 'lucide-react'
import { Area } from 'react-easy-crop'

interface ImageCropperProps {
  image: string
  onCropComplete: (croppedImage: string) => void
  onCancel: () => void
  aspectRatio?: number
}

export function ImageCropper({ image, onCropComplete, onCancel, aspectRatio = 1 }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const onCropChange = useCallback((crop: { x: number; y: number }) => {
    setCrop(crop)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onRotationChange = useCallback((rotation: number) => {
    setRotation(rotation)
  }, [])

  const onCropCompleteCallback = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.addEventListener('load', () => resolve(image))
      image.addEventListener('error', (error) => reject(error))
      image.src = url
    })

  const getRadianAngle = (degreeValue: number) => {
    return (degreeValue * Math.PI) / 180
  }

  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = getRadianAngle(rotation)
    return {
      width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
  }

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0,
    flip = { horizontal: false, vertical: false }
  ): Promise<string> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const rotRad = getRadianAngle(rotation)

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation)

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)

    // draw rotated image
    ctx.drawImage(image, 0, 0)

    const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height)

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height

    // paste generated rotate image at the top left corner
    ctx.putImageData(data, 0, 0)

    // As Base64 string
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  const handleCrop = async () => {
    if (!croppedAreaPixels) {
      console.warn('Nessuna area di ritaglio selezionata')
      alert('Seleziona un\'area da ritagliare prima di confermare')
      return
    }

    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels, rotation)
      if (croppedImage) {
        onCropComplete(croppedImage)
      } else {
        throw new Error('Errore nella generazione dell\'immagine ritagliata')
      }
    } catch (e) {
      console.error('Error cropping image:', e)
      alert('Errore durante il ritaglio dell\'immagine. Riprova.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Ritaglia Immagine
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation"
            aria-label="Chiudi"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Cropper Container - Responsive height */}
        <div className="relative flex-1 bg-gray-900 min-h-[250px] sm:min-h-[400px] max-h-[50vh] sm:max-h-[60vh]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropCompleteCallback}
            cropShape="rect"
            showGrid={true}
            restrictPosition={true}
          />
        </div>

        {/* Controls - Responsive padding and spacing */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-4 flex-shrink-0 overflow-y-auto max-h-[40vh]">
          {/* Zoom Control */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Zoom: {Math.round(zoom * 100)}%
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 touch-manipulation"
              style={{
                WebkitAppearance: 'none',
                appearance: 'none',
              }}
            />
          </div>

          {/* Rotation Control */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
              Rotazione: {rotation}°
            </label>
            <div className="flex items-center gap-2 sm:gap-4">
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-1 h-2 sm:h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 touch-manipulation"
                style={{
                  WebkitAppearance: 'none',
                  appearance: 'none',
                }}
              />
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-2 sm:p-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                title="Ruota di 90°"
                aria-label="Ruota di 90 gradi"
              >
                <RotateCw size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Action Buttons - Touch-friendly size */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 sm:py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 active:bg-gray-400 dark:active:bg-gray-500 transition-colors font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              Annulla
            </button>
            <button
              onClick={handleCrop}
              disabled={!croppedAreaPixels}
              className="flex-1 px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base touch-manipulation min-h-[44px]"
            >
              <Check size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Conferma Ritaglio</span>
              <span className="sm:hidden">Conferma</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}





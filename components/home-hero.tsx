'use client'

export function HomeHero() {
  return (
    <div className="w-full">
      {/* Cover Image */}
      <div className="relative w-full h-64 md:h-96 bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-800 dark:to-blue-900">
        {/* Placeholder - sostituire con immagine reale */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
          Immagine Copertina
        </div>
        {/* Uncomment when image is added:
        <Image
          src="/cover-image.jpg"
          alt="La Favarotta - Copertina"
          fill
          className="object-cover"
          priority
        />
        */}
      </div>

      {/* Profile Section */}
      <div className="container mx-auto px-4 -mt-16 md:-mt-24 relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6">
          {/* Profile Image */}
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white dark:border-gray-900 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 overflow-hidden shadow-lg flex items-center justify-center">
            {/* Placeholder - sostituire con immagine reale */}
            <span className="text-white text-xs md:text-sm font-bold text-center px-2">
              Profilo
            </span>
            {/* Uncomment when image is added:
            <Image
              src="/profile-image.jpg"
              alt="La Favarotta - Profilo"
              fill
              className="object-cover"
            />
            */}
          </div>

          {/* Restaurant Info */}
          <div className="flex-1 pb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              La Favarotta
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
              Ristorante Pizzeria sala banchetti La Favarotta di Leone Vincenzo & cS.S. 113 Terrasini (PA)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

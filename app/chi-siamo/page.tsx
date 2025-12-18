import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { StaffSection } from '@/components/staff-section'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lafavarotta.site'

export const metadata: Metadata = {
  title: "Chi Siamo - La Favarotta Ristorante Pizzeria Terrasini",
  description: "Conosci la storia del Ristorante La Favarotta a Terrasini. Scopri il titolare Leone Vincenzo, i nostri chef specializzati in cucina di pesce e pizza siciliana, e il nostro team appassionato di cucina siciliana tradizionale.",
  keywords: [
    "La Favarotta storia",
    "ristorante Terrasini storia",
    "Leone Vincenzo",
    "chef Terrasini",
    "cucina siciliana tradizionale",
    "ristorante famiglia Terrasini",
    "staff La Favarotta"
  ],
  openGraph: {
    title: "Chi Siamo - La Favarotta Ristorante Pizzeria Terrasini",
    description: "Conosci la storia del Ristorante La Favarotta, il titolare Leone Vincenzo e il nostro team appassionato di cucina siciliana.",
    url: `${siteUrl}/chi-siamo`,
    images: [`${siteUrl}/cover-image.png`],
  },
  alternates: {
    canonical: `${siteUrl}/chi-siamo`,
  },
}

export default function ChiSiamoPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <div className="pt-16 md:pt-20 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Indietro</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Chi Siamo
          </h1>
          <StaffSection />
        </div>
      </div>
      <Footer />
    </main>
  )
}


import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { StaffSection } from '@/components/staff-section'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mancia-e-statti-zitto-da-sasa.site'

export const metadata: Metadata = {
  title: "Chi Siamo - Street food palermitano Terrasini | Mancia e statti zitto da Sasà",
  description: "Street food palermitano a conduzione familiare nel cuore di Terrasini. Il pizzaiolo e titolare Massimiliano Andriolo e il nostro staff. Vicino aeroporto Falcone e Borsellino.",
  keywords: [
    "chi siamo",
    "street food Terrasini",
    "conduzione familiare",
    "Massimiliano Andriolo",
    "pizzaiolo Terrasini",
    "staff Terrasini",
    "Mancia e statti zitto da Sasà",
  ],
  openGraph: {
    title: "Chi Siamo - Mancia e statti zitto da Sasà",
    description: "Street food palermitano a conduzione familiare a Terrasini. Il nostro staff.",
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


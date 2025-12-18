import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { MenuList } from '@/components/menu-list'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lafavarotta.site'

export const metadata: Metadata = {
  title: "Menu - La Favarotta Ristorante Pizzeria Terrasini",
  description: "Scopri il menu completo del Ristorante La Favarotta a Terrasini. Pizza artigianale, specialità di pesce siciliano, antipasti, primi piatti, secondi e dolci. Piatti tradizionali siciliani preparati con ingredienti freschi e di qualità.",
  keywords: [
    "menu La Favarotta",
    "menu ristorante Terrasini",
    "pizza Terrasini",
    "menu pesce Terrasini",
    "piatti siciliani",
    "menu ristorante Palermo",
    "pizza artigianale",
    "specialità siciliane",
    "menu completo Terrasini"
  ],
  openGraph: {
    title: "Menu - La Favarotta Ristorante Pizzeria Terrasini",
    description: "Scopri il menu completo del Ristorante La Favarotta. Pizza artigianale, specialità di pesce siciliano e piatti tradizionali.",
    url: `${siteUrl}/menu`,
    images: [`${siteUrl}/cover-image.png`],
  },
  alternates: {
    canonical: `${siteUrl}/menu`,
  },
}

export default function MenuPage() {
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
            Il Nostro Menù
          </h1>
          <MenuList />
        </div>
      </div>
      <Footer />
    </main>
  )
}


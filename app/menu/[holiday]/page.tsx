import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { HolidayMenuList } from '@/components/holiday-menu-list'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '----------'

interface PageProps {
  params: {
    holiday: string
  }
}

const holidayNames: Record<string, string> = {
  'natale': 'Natale',
  'capodanno': 'Capodanno',
  'epifania': 'Epifania',
  'pasqua': 'Pasqua',
  'altre-festivita': 'Altre Festività',
  'anniversario-liberazione': 'Anniversario della Liberazione',
  'festa-lavoratori': 'Festa dei Lavoratori',
  'festa-repubblica': 'Festa della Repubblica',
  'ferragosto': 'Ferragosto',
  'ognissanti': 'Ognissanti',
  'immacolata-concezione': 'Immacolata Concezione',
  'carnevale': 'Carnevale',
  'san-valentino': 'San Valentino',
  'festa-donna': 'Festa della Donna',
  'festa-mamma': 'Festa della Mamma',
  'halloween': 'Halloween',
  'san-giuseppe': 'San Giuseppe',
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const holidayName = holidayNames[params.holiday] || params.holiday
  return {
    title: `Menu ${holidayName}`,
    description: `Scopri il menu speciale di ${holidayName} del Ristorante La Favarotta a Terrasini. Piatti tradizionali siciliani per celebrare le festività.`,
    openGraph: {
      title: `Menu ${holidayName}`,
      description: `Menu speciale di ${holidayName} con piatti tradizionali siciliani`,
      url: `${siteUrl}/menu/${params.holiday}`,
    },
    alternates: {
      canonical: `${siteUrl}/menu/${params.holiday}`,
    },
  }
}

export default function HolidayMenuPage({ params }: PageProps) {
  const holidayName = holidayNames[params.holiday] || params.holiday

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
            Menu {holidayName}
          </h1>
          <HolidayMenuList holidayName={params.holiday} />
        </div>
      </div>
      <Footer />
    </main>
  )
}



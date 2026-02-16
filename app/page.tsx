import { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { HomeHero } from '@/components/home-hero'
import { TableBooking } from '@/components/table-booking'
import { PostDelGiorno } from '@/components/post-del-giorno'
import { RestaurantDescription } from '@/components/restaurant-description'
import { PostsFeed } from '@/components/posts-feed'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '---'

export const metadata: Metadata = {
  title: "Street food palermitano Terrasini | Pane e panelle, pizza | Vicino aeroporto Falcone Borsellino",
  description: "Street food palermitano a conduzione familiare nel cuore di Terrasini. Pane con la milza, pane con le panelle più buone e fresche, pizze tradizionali. Vicino all'aeroporto Falcone e Borsellino, provincia di Palermo. Via R. Ruffino 9.",
  keywords: [
    "street food Terrasini",
    "streetfood Terrasini",
    "street food palermitano",
    "pane con la milza Terrasini",
    "pane con le panelle Terrasini",
    "panelle Terrasini",
    "pizze tradizionali Terrasini",
    "aeroporto Falcone e Borsellino",
    "vicino aeroporto Palermo",
    "provincia di Palermo",
    "Terrasini street food",
    "conduzione familiare Terrasini",
    "ristorante Terrasini",
    "pizzeria Terrasini",
    "cucina siciliana",
    "pizza Terrasini",
    "cena Terrasini",
    "pranzo Terrasini",
    "Mancia e statti zitto da Sasà",
  ],
  openGraph: {
    title: "Street food palermitano Terrasini | Pane e panelle, pizza",
    description: "Street food a conduzione familiare nel cuore di Terrasini. Pane con la milza, panelle, pizze tradizionali. Vicino aeroporto Falcone e Borsellino.",
    url: siteUrl,
    images: [`${siteUrl}/copertina.png.jpg`],
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "La Favarotta",
    // AGGIORNATO: Immagine per i risultati Google
    "image": `${siteUrl}/copertina.png.jpg`,
    "description": "Street food palermitano a conduzione familiare a Terrasini. Pane con la milza, panelle, pizze tradizionali. Vicino aeroporto Falcone e Borsellino.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Via R. Ruffino, 9, 90049 Terrasini PA",
      "addressLocality": "Terrasini",
      "addressRegion": "PA",
      "postalCode": "90049",
      "addressCountry": "IT"
    },
    "url": siteUrl,
    "telephone": "+39 379 267 5864",
    "servesCuisine": ["Italian", "Sicilian", "Pizza", "Seafood"],
    "priceRange": "€€",
    "hasMenu": `${siteUrl}/menu`,
    "acceptsReservations": "True",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen">
        <Navigation />
        <div className="pt-16 md:pt-20">
          {/* NOTA: L'immagine del profilo "sasa.png.jpg" e la copertina 
              sono gestite dentro il componente <HomeHero />.
          */}
          <HomeHero />
          <TableBooking />
          {/* Post del giorno: visibile subito sotto "Prenota un tavolo", sopra "Benvenuti..." */}
          <PostDelGiorno />
          <RestaurantDescription />
          <PostsFeed />
        </div>
        <Footer />
      </main>
    </>
  )
}

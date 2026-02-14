import { Metadata } from 'next'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { HomeHero } from '@/components/home-hero'
import { Highlights } from '@/components/highlights'
import { TableBooking } from '@/components/table-booking'
import { RestaurantDescription } from '@/components/restaurant-description'
import { PostsFeed } from '@/components/posts-feed'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '---'

export const metadata: Metadata = {
  title: "- Ristorante Pizzeria Terrasini | Cucina Siciliana e Pizza",
  description: "Cucina siciliana tradizionale e pizza artigianale. Piatti tipici siciliani. Prenota il tuo tavolo o ordina da asporto. Strada Statale 113, Terrasini.",
  keywords: [
    "ristorante Terrasini", "pizzeria Terrasini", "ristorante Palermo", "cucina siciliana",
    "pizza Terrasini", "Street food Terrasini", "cena Terrasini", "pranzo Terrasini",
    "ristorante Sicilia", "pizza artigianale Terrasini", "cucina tradizionale siciliana"
  ],
  openGraph: {
    title: "Cucina Siciliana",
    description: "Cucina siciliana tradizionale e pizza artigianale. Piatti tipici siciliani.",
    url: siteUrl,
    // AGGIORNATO: Ora punta alla tua nuova copertina
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
    "description": "Cucina siciliana tradizionale e pizza artigianale.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Via R. Ruffino, 9, 90049 Terrasini PA",
      "addressLocality": "Terrasini",
      "addressRegion": "PA",
      "postalCode": "90049",
      "addressCountry": "IT"
    },
    "url": siteUrl,
    "telephone": "+393792675864",
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
          <Highlights />
          <TableBooking />
          <RestaurantDescription />
          <PostsFeed />
        </div>
        <Footer />
      </main>
    </>
  )
}

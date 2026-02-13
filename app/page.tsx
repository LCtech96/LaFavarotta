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
  description: "Ristorante. Cucina siciliana tradizionale, pizza artigianale e sala banchetti. Specialità di pesce, piatti tipici siciliani e pizza napoletana. Prenota il tuo tavolo o ordina da asporto. Strada Statale 113, Terrasini.",
  keywords: [
    "ristorante Terrasini",
    "pizzeria Terrasini",
    "ristorante Palermo",
    "cucina siciliana",
    "pizza Terrasini",
    "sala banchetti Terrasini",
    "ristorante pesce Terrasini",
    "cena Terrasini",
    "pranzo Terrasini",
    "ristorante SS113",
    "--",
    "ristorante Sicilia",
    "pizza artigianale Terrasini",
    "cucina tradizionale siciliana",
    "ristorante famiglia Terrasini",
    "eventi Terrasini",
    "banchetti Terrasini"
  ],
  openGraph: {
    title: "Cucina Siciliana",
    description: "Cucina siciliana tradizionale, pizza artigianale e sala banchetti. Specialità di pesce e piatti tipici siciliani.",
    url: siteUrl,
    images: [`${siteUrl}/cover-image.png`],
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "---",
    "image": `${siteUrl}/cover-image.png`,
    "description": "Cucina siciliana tradizionale, pizza artigianale e sala banchetti.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Strada Statale 113",
      "addressLocality": "Terrasini",
      "addressRegion": "PA",
      "postalCode": "90049",
      "addressCountry": "IT"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "---",
      "longitude": "---"
    },
    "url": siteUrl,
    "telephone": process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+393276976442",
    "servesCuisine": ["Italian", "Sicilian", "Pizza", "Seafood"],
    "priceRange": "€€",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "12:00",
        "closes": "23:00"
      }
    ],
    "hasMenu": `${siteUrl}/menu`,
    "acceptsReservations": "True",
    "paymentAccepted": "Cash, Credit Card",
    "currenciesAccepted": "EUR"
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

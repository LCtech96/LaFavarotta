import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lafavarotta.site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cucina Siciliana e Pizza",
    template: "%s"
  },
  description: "Ristorante Pizzeria. Cucina siciliana tradizionale, pizza artigianale. Specialità di pesce, piatti tipici siciliani e pizza napoletana. Prenota il tuo tavolo o ordina da asporto.",
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
    "ristorante",
    "----------",
    "ristorante Sicilia",
    "pizza artigianale Terrasini",
    "cucina tradizionale siciliana",
    "ristorante famiglia Terrasini",
    "eventi Terrasini",
    "banchetti Terrasini"
  ],
  authors: [{ name: "Nome" }],
  creator: "Nome",
  publisher: "Nome",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: siteUrl,
    siteName: "nome",
    title: "nome via | Cucina Siciliana",
    description: "Ristorante Pizzeria. Cucina siciliana tradizionale, pizza artigianale e sala banchetti. Specialità di pesce e piatti tipici siciliani.",
    images: [
      {
        url: `${siteUrl}/cover-image.png`,
        width: 1200,
        height: 630,
        alt: "La Favarotta Ristorante Pizzeria Terrasini",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terrasini",
    description: "Cucina siciliana tradizionale, pizza artigianale e sala banchetti a Terrasini",
    images: [`${siteUrl}/cover-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: '/favicon-image.png',
    apple: '/favicon-image.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}


import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mancia-e-statti-zitto-da-sasa.site';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Cucina Siciliana e Pizza",
    template: "%s"
  },
  description: "Street food palermitano a conduzione familiare a Terrasini. Pane con la milza, pane con le panelle, pizze tradizionali. Vicino aeroporto Falcone e Borsellino, provincia di Palermo.",
  keywords: [
    "street food Terrasini",
    "streetfood Terrasini",
    "street food palermitano",
    "pane con la milza",
    "pane con le panelle",
    "panelle Terrasini",
    "pizze tradizionali Terrasini",
    "aeroporto Falcone e Borsellino",
    "provincia di Palermo",
    "Terrasini",
    "conduzione familiare",
    "ristorante Terrasini",
    "pizzeria Terrasini",
    "cucina siciliana",
    "pizza Terrasini",
    "cena Terrasini",
    "pranzo Terrasini",
  ],
  authors: [{ name: "Andriolo Salvatore" }],
  creator: "Andriolo Salvatore",
  publisher: "Andriolo Salvatore",
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
    description: "Street food palermitano a conduzione familiare a Terrasini. Pane e panelle, pizze tradizionali. Vicino aeroporto Falcone e Borsellino.",
    images: [
      {
        url: `${siteUrl}/cover-image.png`,
        width: 1200,
        height: 630,
        alt: "Mancia e statti zitto da Sasà Ristorante Pizzeria Terrasini",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terrasini",
    description: "Street food palermitano e pizza a Terrasini. Vicino aeroporto Falcone e Borsellino.",
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
    icon: '/sasa.png%20-%20Copia.jpg',
    apple: '/sasa.png%20-%20Copia.jpg',
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


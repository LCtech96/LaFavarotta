import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "La Favarotta - Ristorante Pizzeria Terrasini",
  description: "Ristorante Pizzeria sala banchetti La Favarotta di Leone Vincenzo & cS.S. 113 Terrasini (PA)",
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


import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/ui/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

const baseUrl = process.env.NEXTAUTH_URL || "https://immelio.fr";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Immelio Transaction — Agence Immobilière",
    template: "%s | Immelio Transaction",
  },
  description: "Immelio Transaction, votre agence immobilière de confiance. Trouvez votre bien idéal parmi notre sélection d'appartements, maisons et locaux professionnels.",
  openGraph: {
    siteName: "Immelio Transaction",
    locale: "fr_FR",
    type: "website",
    url: baseUrl,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/components/providers/auth-provider"
import { NotificationContainer } from "@/components/ui/notification"
import "@/lib/utils/env" // Validate environment variables on startup

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://regentsconsultancy.com"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Regent's Consultancy | Elite Medical Admissions Strategy",
    template: "%s | The Regent's Consultancy",
  },
  description:
    "Bespoke guidance for Medicine, Dentistry, and Veterinary Medicine. Led by practising NHS Doctors, Dentists and Qualified Veterinary Surgeons.",
  keywords: [
    "medical school admissions UK",
    "UCAT preparation",
    "UCAS medicine application",
    "dentistry admissions UK",
    "veterinary medicine admissions",
    "medical admissions consultant",
    "NHS doctor mentor",
    "UK university admissions strategy",
    "private admissions consultancy",
    "medical school interview preparation",
  ],
  authors: [{ name: "The Regent's Consultancy" }],
  creator: "The Regent's Consultancy",
  publisher: "The Regent's Consultancy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteUrl,
    siteName: "The Regent's Consultancy",
    title: "The Regent's Consultancy | Elite Medical Admissions Strategy",
    description:
      "Bespoke guidance for Medicine, Dentistry, and Veterinary Medicine. Led by practising NHS Doctors, Dentists and Qualified Veterinary Surgeons.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Regent's Consultancy — Elite Medical Admissions Strategy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Regent's Consultancy | Elite Medical Admissions Strategy",
    description:
      "Bespoke guidance for Medicine, Dentistry, and Veterinary Medicine. Led by practising NHS Doctors, Dentists and Qualified Veterinary Surgeons.",
    images: ["/og-image.jpg"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} overflow-x-hidden`}>
      <body className={`font-sans antialiased overflow-x-hidden`} suppressHydrationWarning>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#D4AF37] focus:text-slate-950 focus:rounded-lg focus:font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37]"
        >
          Skip to main content
        </a>
        <AuthProvider>
          {children}
        </AuthProvider>
        <NotificationContainer />
        <Analytics />
      </body>
    </html>
  )
}

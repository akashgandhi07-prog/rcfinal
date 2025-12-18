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

export const metadata: Metadata = {
  title: "The Regent's Consultancy | Elite Admissions Strategy for UK Universities",
  description:
    "Bespoke guidance for Medicine, Dentistry, and Veterinary Medicine. Led by practising NHS Doctors and Dentists and Qualified Veterinary Surgeons.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png?v=2",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png?v=2",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg?v=2",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png?v=2",
    shortcut: "/icon-light-32x32.png?v=2",
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

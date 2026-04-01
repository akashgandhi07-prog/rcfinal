import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
  title: "Client Portal | The Regent's Consultancy",
  robots: {
    index: false,
    follow: false,
  },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

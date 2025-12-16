"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const navLinks = [
    { label: "The Roadmap", id: "roadmap" },
    { label: "The Board", id: "board" },
    { label: "Placements", id: "placement" },
  ]

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0B1120]/95 backdrop-blur-md border-b border-white/5">
      <nav className="container mx-auto px-4 sm:px-6 py-6 sm:py-6 flex items-center justify-between max-w-full gap-2">
        <div className="font-serif font-bold text-sm sm:text-lg md:text-xl lg:text-2xl tracking-widest text-white">
          <span className="hidden sm:inline">REGENT&apos;S CONSULTANCY</span>
          <span className="sm:hidden">REGENT&apos;S CONSULTANCY</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-sm text-white hover:text-amber-400 transition-colors duration-300 font-light"
            >
              {link.label}
            </button>
          ))}
        </div>

        <Link href="/portal">
          <Button
            className="hidden md:flex bg-transparent text-[#D4AF37] hover:bg-transparent hover:text-amber-300 border-0 px-6 h-10 font-light"
          >
            Client Portal
          </Button>
        </Link>

        {/* Mobile Menu - Only render after mount to prevent hydration mismatch */}
        {isMounted ? (
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-lg">
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-slate-950 border-white/10 pt-10 pb-14 px-8"
            >
              <div className="flex flex-col gap-8">
                <div className="pb-2 border-b border-white/10">
                  <div className="text-xs font-light tracking-[0.25em] text-slate-400 uppercase">
                    Regent&apos;s Consultancy
                  </div>
                </div>
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="text-base text-slate-100 hover:text-amber-300 transition-colors text-left font-light tracking-wide"
                  >
                    {link.label}
                  </button>
                ))}
                <Link href="/portal" className="w-full">
                  <Button
                    className="bg-transparent text-[#D4AF37] hover:bg-transparent hover:text-amber-300 border border-[#D4AF37] px-6 h-12 font-light w-full mt-4"
                  >
                    Client Portal
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Button variant="ghost" size="icon" className="text-white md:hidden" disabled>
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        )}
      </nav>
    </header>
  )
}

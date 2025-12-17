"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("")

  useEffect(() => {
    setIsMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      // Determine active section based on scroll position
      const sections = ["roadmap", "board", "placement"]
      const scrollPosition = window.scrollY + 100 // Offset for header
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i])
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }
    
    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check on mount
    
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setActiveSection(id)
    }
  }

  const navLinks = [
    { label: "The Roadmap", id: "roadmap" },
    { label: "The Board", id: "board" },
    { label: "Placements", id: "placement" },
  ]

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0B1120]/95 backdrop-blur-md border-b border-white/5">
      <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between max-w-full gap-2" aria-label="Main navigation">
        <Link href="/" className="font-serif font-bold text-xs sm:text-base md:text-xl lg:text-2xl tracking-widest text-white hover:text-amber-400 transition-colors min-h-[44px] flex items-center" aria-label="Regent's Consultancy Home">
          <span className="hidden sm:inline">REGENT&apos;S CONSULTANCY</span>
          <span className="sm:hidden">REGENT&apos;S</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8" role="list">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id
            return (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="relative text-sm text-white font-light focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#0B1120] rounded transition-all duration-300 group"
                aria-label={`Navigate to ${link.label} section`}
                aria-current={isActive ? "page" : undefined}
                role="listitem"
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-[#D4AF37]">
                  {link.label}
                </span>
                {/* Active underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37] transition-all duration-300" />
                )}
                {/* Hover underline */}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/50 transition-all duration-300" />
              </button>
            )
          })}
        </div>

        <Link href="/portal" aria-label="Access client portal">
          <Button
            className="hidden md:flex bg-transparent text-[#D4AF37] hover:bg-transparent hover:text-amber-300 border-0 px-6 h-10 min-h-[44px] font-light focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#0B1120] rounded touch-manipulation"
          >
            Client Portal
          </Button>
        </Link>

        {/* Mobile Menu - Only render after mount to prevent hydration mismatch */}
        {isMounted ? (
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-lg min-w-[44px] min-h-[44px]" aria-label="Open mobile menu">
                <Menu className="h-6 w-6" strokeWidth={1.5} />
                <span className="sr-only">Open navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-slate-950 border-white/10 pt-10 pb-14 px-6 sm:px-8 w-[85vw] sm:w-[75vw] sm:max-w-sm"
            >
              <div className="flex flex-col gap-6 sm:gap-8">
                <div className="pb-3 border-b border-white/10">
                  <div className="text-xs sm:text-sm font-light tracking-[0.25em] text-slate-400 uppercase">
                    Regent&apos;s Consultancy
                  </div>
                </div>
                {navLinks.map((link) => {
                  const isActive = activeSection === link.id
                  return (
                    <SheetClose key={link.id} asChild>
                      <button
                        onClick={() => scrollToSection(link.id)}
                        className="relative text-base sm:text-lg text-slate-100 font-light tracking-wide focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950 rounded px-3 py-3 min-h-[44px] touch-manipulation w-full text-left transition-all duration-300 group"
                        aria-label={`Navigate to ${link.label} section`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <span className="relative z-10 transition-colors duration-300 group-hover:text-[#D4AF37]">
                          {link.label}
                        </span>
                        {/* Active underline */}
                        {isActive && (
                          <span className="absolute bottom-2 left-3 right-3 h-0.5 bg-[#D4AF37] transition-all duration-300" />
                        )}
                        {/* Hover underline */}
                        <span className="absolute bottom-2 left-3 right-3 h-0.5 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/50 transition-all duration-300" />
                      </button>
                    </SheetClose>
                  )
                })}
                <Link href="/portal" className="w-full mt-2">
                  <Button
                    className="bg-transparent text-[#D4AF37] hover:bg-transparent hover:text-amber-300 border border-[#D4AF37] px-6 h-12 sm:h-14 font-light w-full min-h-[44px] touch-manipulation"
                  >
                    Client Portal
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Button variant="ghost" size="icon" className="text-white md:hidden min-w-[44px] min-h-[44px]" disabled>
            <Menu className="h-6 w-6" strokeWidth={1.5} />
          </Button>
        )}
      </nav>
    </header>
  )
}

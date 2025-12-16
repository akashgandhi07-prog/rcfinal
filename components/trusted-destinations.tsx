"use client"

import { motion } from "framer-motion"
import { GraduationCap } from "lucide-react"

export function TrustedDestinations() {
  // Degree hat SVG icon
  const DegreeHatIcon = () => (
    <GraduationCap size={48} className="text-[#D4AF37]/80" strokeWidth={1.5} />
  )

  // Oxford Logo - Shield with crown
  const OxfordLogo = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main shield shape */}
      <path
        d="M100 20 L160 60 L160 110 Q160 140 100 160 Q40 140 40 110 L40 60 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        opacity="0.75"
      />
      {/* Crown at top */}
      <path
        d="M85 35 L90 25 L95 30 L100 20 L105 30 L110 25 L115 35"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.7"
      />
      {/* Three horizontal lines */}
      <line x1="70" y1="85" x2="130" y2="85" stroke="currentColor" strokeWidth="2.5" opacity="0.65" />
      <line x1="75" y1="100" x2="125" y2="100" stroke="currentColor" strokeWidth="2.5" opacity="0.65" />
      <line x1="80" y1="115" x2="120" y2="115" stroke="currentColor" strokeWidth="2.5" opacity="0.65" />
    </svg>
  )

  // Cambridge Logo - Square with cross
  const CambridgeLogo = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main square */}
      <rect x="60" y="50" width="80" height="80" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.75" />
      {/* Central cross - vertical line */}
      <line x1="100" y1="50" x2="100" y2="130" stroke="currentColor" strokeWidth="3.5" opacity="0.7" />
      {/* Central cross - horizontal line */}
      <line x1="60" y1="90" x2="140" y2="90" stroke="currentColor" strokeWidth="3.5" opacity="0.7" />
      {/* Base supports */}
      <path
        d="M70 130 L70 150 L60 155 L80 155 Z M130 130 L130 150 L120 155 L140 155 Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  )

  // Imperial Logo - Shield with crown
  const ImperialLogo = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield shape */}
      <path
        d="M70 40 L130 40 L135 90 Q135 120 100 135 Q65 120 65 90 Z"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
        opacity="0.75"
      />
      {/* Crown at top */}
      <path
        d="M85 40 L90 30 L95 35 L100 25 L105 35 L110 30 L115 40"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        opacity="0.7"
      />
      {/* Three horizontal lines */}
      <line x1="85" y1="65" x2="115" y2="65" stroke="currentColor" strokeWidth="2.5" opacity="0.65" />
      <line x1="85" y1="78" x2="115" y2="78" stroke="currentColor" strokeWidth="2.5" opacity="0.65" />
      <line x1="85" y1="91" x2="115" y2="91" stroke="currentColor" strokeWidth="2.5" opacity="0.65" />
    </svg>
  )

  // UCL Logo - Circular with torch/flame
  const UCLLogo = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circle */}
      <circle cx="100" cy="100" r="55" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.75" />
      {/* Inner circle accent */}
      <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* Torch handle */}
      <path
        d="M100 65 L100 100 M100 100 L85 115 M100 100 L115 115"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Flame/torch top */}
      <circle cx="100" cy="70" r="4" fill="currentColor" opacity="0.7" />
      <path
        d="M100 65 Q98 60 100 58 Q102 60 100 65"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  )

  const universities = [
    {
      name: "OXFORD",
      hasCustomLogo: false,
      logo: DegreeHatIcon,
    },
    {
      name: "CAMBRIDGE",
      hasCustomLogo: false,
      logo: DegreeHatIcon,
    },
    {
      name: "IMPERIAL COLLEGE LONDON",
      hasCustomLogo: false,
      logo: DegreeHatIcon,
    },
    {
      name: "UCL",
      hasCustomLogo: false,
      logo: DegreeHatIcon,
    },
    {
      name: "KING'S COLLEGE LONDON",
      hasCustomLogo: false,
    },
    {
      name: "QMUL",
      hasCustomLogo: false,
    },
    {
      name: "UNIVERSITY OF BRISTOL",
      hasCustomLogo: false,
    },
    {
      name: "UNIVERSITY OF EDINBURGH",
      hasCustomLogo: false,
    },
  ]

  return (
    <section id="placement" className="py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center font-serif text-5xl md:text-6xl lg:text-7xl text-[#D4AF37] uppercase tracking-[0.15em] mb-24 md:mb-32 font-light"
        >
          UK Universities
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {universities.map((uni, index) => {
            const LogoComponent = DegreeHatIcon
            return (
              <motion.div
                key={uni.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center"
              >
                <div className="w-full aspect-[3/2] flex flex-col items-center justify-center border border-[#D4AF37]/20 rounded-none px-4 py-6 bg-gradient-to-br from-white/5 to-transparent">
                  <div className="text-[#D4AF37]/85 mb-3">
                    <LogoComponent />
                  </div>
                  <span className="text-[#D4AF37] text-xs md:text-sm font-serif text-center uppercase tracking-widest leading-tight">
                    {uni.name}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

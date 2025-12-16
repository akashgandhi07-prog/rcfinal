"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { motion } from "framer-motion"
import { SuitabilityAssessmentForm } from "@/components/suitability-assessment-form"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/dark-abstract-architectural-luxury-building-interi.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/70 to-black/50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-32 text-center max-w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-block text-amber-400 text-xs uppercase px-3 sm:px-4 py-2 mb-8 tracking-wider font-light"
        >
          Acceptance subject to Eligibility Interview
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="font-serif font-semibold text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white mb-6 max-w-4xl mx-auto leading-tight px-2"
        >
          Elite Admissions Strategy for UK Medical Schools
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl text-slate-200 mb-12 max-w-2xl mx-auto leading-relaxed font-light px-2"
        >
          Bespoke candidacy management for Medicine, Dentistry, and Veterinary Medicine. Led by practising NHS Doctors and Dentists and Qualified Veterinary Surgeons.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        >
          <SuitabilityAssessmentForm
            trigger={
              <Button className="bg-[#D4AF37] text-black hover:bg-[#C5A028] rounded-lg px-6 sm:px-10 h-12 text-sm sm:text-base font-medium shadow-lg shadow-[#D4AF37]/20 hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 transition-all duration-300 active:translate-y-0 max-w-[90vw]">
                Apply for Suitability Assessment
              </Button>
            }
          />
        </motion.div>
      </div>
    </section>
  )
}

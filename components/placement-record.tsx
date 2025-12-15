"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { GraduationCap } from "lucide-react"

export function PlacementRecord() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const universities = [
    "Oxford",
    "Cambridge",
    "Imperial",
    "UCL",
    "King's College London",
    "LSE",
    "Bristol",
    "Edinburgh",
    "Manchester",
  ]

  return (
    <section id="placement" ref={ref} className="py-24 md:py-32 bg-[#020617] border-t border-white/10">
      <div className="container mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center text-slate-400 text-xs uppercase tracking-[0.3em] mb-4"
        >
          Placement Record
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center text-2xl md:text-3xl font-serif text-white mb-10"
        >
          Recent university destinations
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 md:gap-8">
          {universities.map((uni, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.04 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-5 md:px-5 md:py-6 shadow-sm shadow-black/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 border border-white/15">
                <GraduationCap className="h-5 w-5 text-[#D4AF37]" />
              </div>
              <span className="text-sm md:text-base text-slate-100 font-light text-center tracking-wide">
                {uni}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { Stethoscope, Activity, HeartHandshake } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

const expertiseAreas = [
  {
    icon: Stethoscope,
    title: "Medicine",
    description: "Strategy for G5 Medical Schools.",
  },
  {
    icon: Activity,
    title: "Dentistry",
    description: "Manual Dexterity & Clinical Interview Prep.",
  },
  {
    icon: HeartHandshake,
    title: "Veterinary",
    description: "Scientific Preparation & Work Placement Strategy.",
  },
]

export function ExpertiseSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="expertise" ref={ref} className="py-24 md:py-32 border-t border-white/10 bg-slate-950">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl md:text-4xl text-white text-center mb-16 tracking-wide"
        >
          THE EXPERTISE
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {expertiseAreas.map((area, index) => {
            const Icon = area.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="h-full text-center py-12 px-8 border-r border-white/10 last:border-r-0 md:border-b-0 border-b"
              >
                <Icon className="w-12 h-12 text-amber-400 mb-6 stroke-[1.5] mx-auto" />
                <h3 className="font-serif text-2xl text-white mb-4">{area.title}</h3>
                <p className="text-slate-300 leading-relaxed font-light">{area.description}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-[#D4AF37] text-lg font-light">83% Success Rate for G5 Universities (2026 Cycle)</p>
        </motion.div>
      </div>
    </section>
  )
}

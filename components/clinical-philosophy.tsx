"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function ClinicalPhilosophy() {
  return (
    <section className="py-32 bg-slate-950">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Abstract Dark Image on Left */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5] bg-gradient-to-br from-slate-900 to-[#0B1120] overflow-hidden"
          >
            <div className="absolute inset-0 opacity-30">
              <Image
                src="/dark-abstract-architectural-luxury-building-interi.jpg"
                alt="Professional Authority"
                fill
                className="object-cover"
              />
            </div>
            {/* Overlay gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
          </motion.div>

          {/* Text Content on Right */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-[#D4AF37] text-sm uppercase tracking-widest font-light">PROFESSIONAL AUTHORITY</h3>
            <h2 className="font-serif text-4xl md:text-5xl text-white font-light leading-tight">Not Just Tuition.</h2>
            <p className="text-slate-300 text-lg leading-relaxed font-light">
              The Regent's Consultancy bridges the gap between school and professional practice. While others focus
              solely on grades, we focus on the <strong className="text-white font-normal">Professional Persona</strong>. We
              do not just train students; we induct future colleagues.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

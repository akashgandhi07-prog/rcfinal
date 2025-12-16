"use client"

import { motion } from "framer-motion"
import { Shield } from "lucide-react"

export function PostOfferGuarantee() {
  return (
    <section className="py-24 md:py-32 bg-slate-950 border-t border-white/10">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Distinct guarantee box with border and subtle background */}
          <div className="relative border-2 border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-[#D4AF37]/5 rounded-2xl p-8 md:p-12 backdrop-blur-sm shadow-2xl shadow-black/40">
            {/* Decorative corner accent */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#D4AF37]/20 rounded-tl-2xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#D4AF37]/20 rounded-br-2xl" />
            
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 border border-[#D4AF37]/30 rounded-full bg-[#D4AF37]/10">
                <Shield className="w-8 h-8 text-[#D4AF37]" strokeWidth={1.5} />
              </div>
            </div>

            {/* Heading - Serif font matching Private Office */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-3xl md:text-4xl text-white text-center mb-3 font-light"
            >
              Beyond the Offer
            </motion.h2>

            {/* Sub-heading */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[#D4AF37] text-sm uppercase tracking-[0.2em] text-center mb-8 font-light"
            >
              The Post-Offer Guarantee
            </motion.p>

            {/* Main text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-slate-200 text-lg md:text-xl leading-relaxed text-center font-light max-w-3xl mx-auto"
            >
              Our duty of care does not end at the offer letter. The Regent&apos;s Consultancy remains at your disposal until the day of enrolment. We manage all firm and insurance choices, provide guidance on university transition, and offer ongoing support throughout your journey. We ensure the outcome is not just secured, but delivered.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


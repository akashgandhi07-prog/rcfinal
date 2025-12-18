"use client"

import { motion } from "framer-motion"

export function AdvantageSection() {
  return (
    <section className="py-16 md:py-20 bg-[#0B1120]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6 font-light">Data-Driven Strategy</h2>
            <p className="text-slate-300 text-lg leading-relaxed font-light mb-4">
              Directed by the founders of the UK&apos;s largest medical admissions service. We apply the data from
              3,000+ successful applicants to deliver exceptional results for our private clients.
            </p>
            <p className="text-slate-300 text-lg leading-relaxed font-light">
              We partner with leading international schools, admissions counsellors, and education agents worldwide, serving as the expert authority on UK medical school admissions. Our team provides strategic consultation and training to counsellors and agents, ensuring they can offer their students the most current and effective guidance for securing placements at top tier UK medical, dental, and veterinary schools.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="aspect-square bg-gradient-to-br from-slate-900 to-slate-950 border border-[#D4AF37]/20 rounded-3xl shadow-2xl shadow-black/40 flex items-center justify-center"
          >
            <div className="text-center p-12">
              <div className="text-6xl font-serif text-[#D4AF37] mb-4 font-light">3,000+</div>
              <div className="text-white text-sm uppercase tracking-wider font-light">Data Points</div>
              <div className="w-24 h-px bg-[#D4AF37]/30 mx-auto my-6" />
              <div className="text-6xl font-serif text-[#D4AF37] mb-4 font-light">100%</div>
              <div className="text-white text-sm uppercase tracking-wider font-light">Satisfaction</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

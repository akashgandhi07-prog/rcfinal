"use client"

import { motion } from "framer-motion"

export function DirectorsStatement() {
  return (
    <section className="py-32 bg-[#0B1120]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-white font-light">
              A Note from the Clinical Director
            </h2>
            <div className="pl-4 md:pl-8 border-l-2 border-[#D4AF37]/30">
              <p className="font-serif text-lg md:text-xl text-slate-200 leading-relaxed font-light">
                Medicine is not a degree; it is a vocation. In the private sector, we see many
                agencies selling &apos;tuition&apos;. We founded Regent&apos;s to offer something
                different: mentorship. We do not simply help your child pass an exam; we shape the
                character and resilience required to survive on the wards. This is a partnership for
                their future.
              </p>
            </div>
            <p className="text-[#D4AF37] text-sm uppercase tracking-wider font-light">
              Dr Sonal Tanna
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


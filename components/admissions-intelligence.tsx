"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function AdmissionsIntelligence() {
  const articles = [
    {
      title: "The Impact of the MLA on 2026 Admissions",
      description: "Analysing how the Medical Licensing Assessment will reshape entry requirements.",
    },
    {
      title: "Oxford vs Cambridge: A Strategic Analysis for Internationals",
      description: "Comparing admissions strategies, interview styles, and placement outcomes.",
    },
    {
      title: "The Future of the NHS: What Interview Panels are Asking",
      description: "Contemporary topics shaping medical school interview questions in 2026.",
    },
  ]

  return (
    <section className="py-16 md:py-20 bg-[#0B1120]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 font-light">
            Admissions Intelligence
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {articles.map((article, index) => (
            <motion.div
              key={article.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="border border-white/10 bg-slate-950 p-8 space-y-4 hover:border-[#D4AF37]/30 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:-translate-y-1"
            >
              <h3 className="font-serif text-xl text-white font-light leading-tight">
                {article.title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-light">
                {article.description}
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-[#D4AF37] text-sm uppercase tracking-wider font-light hover:gap-3 transition-all group"
              >
                Read Analysis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


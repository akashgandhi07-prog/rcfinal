"use client"

import { motion } from "framer-motion"

export function ClinicalInterventions() {
  const cases = [
    {
      title: "The Reticent Scholar",
      before: "Candidate A had 4 A*s but failed 3 interviews.",
      diagnosis: "Lack of empathy in communication.",
      intervention: "Bespoke Interview Strategy. Intensive 1 to 1 MMI simulation with expert NHS doctors.",
      outcome: "Offer secured.",
    },
    {
      title: "The International Transfer",
      before: "Candidate B (IB Curriculum) struggled to translate qualifications to UK standards.",
      diagnosis: "Translation gap between IB qualifications and UK medical school requirements.",
      intervention: "Enrolment in the Full Programme. Comprehensive strategic alignment of academic profile with college-specific selection criteria.",
      outcome: "Offer secured.",
    },
  ]

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-3 sm:mb-4 font-light">
            Professional Interventions
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm uppercase tracking-wider font-light">
            Before & After
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {cases.map((caseStudy, index) => (
            <motion.div
              key={caseStudy.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="border border-white/10 bg-[#0B1120] p-6 sm:p-8 md:p-12 space-y-4 sm:space-y-6"
            >
              <h3 className="font-serif text-xl sm:text-2xl text-white font-light">{caseStudy.title}</h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-2 font-light">
                    Initial Presentation
                  </p>
                  <p className="text-slate-300 font-light">{caseStudy.before}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-2 font-light">
                    Diagnosis
                  </p>
                  <p className="text-slate-300 font-light">{caseStudy.diagnosis}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-2 font-light">
                    Intervention
                  </p>
                  <p className="text-slate-300 font-light">{caseStudy.intervention}</p>
                </div>
                <div className="pt-4 border-t border-[#D4AF37]/20">
                  <p className="text-slate-400 text-sm uppercase tracking-wider mb-2 font-light">
                    Outcome
                  </p>
                  <p className="text-[#D4AF37] font-serif text-lg font-light">
                    {caseStudy.outcome}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}


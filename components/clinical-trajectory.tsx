"use client"

import { motion } from "framer-motion"

export function ClinicalTrajectory() {
  const phases = [
    {
      title: "The Foundation Fellowship",
      years: "Years 7 to 9",
      subtitle: "Intellectual Vitality & Oral Confidence",
      body: "We move beyond the school curriculum to cultivate the maturity required for a clinical vocation. Through structured mentorship in medical literacy, ethics, and early scientific inquiry, we transform high potential students into articulate, intellectually curious scholars who possess the foundational character and communication skills essential for medical practice.",
      focus: "Medical Literacy, Public Speaking, Academic Extension.",
    },
    {
      title: "The Pre Clinical Scholar",
      years: "Years 10 to 11",
      subtitle: "Strategic Profile Construction",
      body: "Differentiation begins here. We oversee the critical strategic decisions from GCSE and A Level selection to high impact volunteering placements. We ensure the candidate builds a distinctive 'Super Curricular' portfolio that separates them from their peers, establishing a compelling professional narrative long before the application deadline arrives.",
      focus: "Subject Strategy, Profile Differentiation, Clinical Awareness.",
    },
    {
      title: "The Elite Candidacy",
      years: "Years 12 to 13",
      subtitle: "Precision Execution",
      body: "The culmination of strategic preparation. This comprehensive programme orchestrates every element of the application with surgical precision. From UCAT excellence to personal statement refinement, from university selection to interview mastery, we provide end to end mentorship working exclusively with practising NHS Consultants, GDC Dentists, and RCVS Vets. We deliver the insider knowledge and strategic acumen that secures offers at the most competitive institutions.",
      focus: "UCAT, Personal Statement, Interview Strategy.",
    },
  ]

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-[#0B1120] relative">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-3 sm:mb-4 font-light">
            THE CLINICAL TRAJECTORY
          </h2>
          <p className="text-[#D4AF37] text-sm sm:text-base uppercase tracking-wider font-light mb-6">
            Long-Term Candidacy Development
          </p>
          <p className="text-slate-300 text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed font-light">
            Admissions success is not achieved in a single season. It is the culmination of character, intellect, and strategic foresight. For families planning ahead, we manage the professional trajectory from Year 7, ensuring the candidate arrives at the application year with an unassailable profile.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-[90rem] mx-auto">
          {phases.map((phase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className="flex flex-col h-full group"
            >
              <div className="relative bg-slate-950/50 border border-white/10 rounded-lg p-10 md:p-12 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-[#D4AF37]/30 transition-all duration-300 hover:-translate-y-1 flex-1 flex flex-col">
                {/* Subtle top accent */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent"></div>
                
                <div className="flex-1 space-y-6">
                  {/* Years, Title, Subtitle */}
                  <div>
                    <p className="text-[#D4AF37] text-sm uppercase tracking-[0.15em] font-light mb-3">
                      {phase.years}
                    </p>
                    <h3 className="font-serif text-2xl md:text-3xl text-white mb-3 font-light leading-tight">
                      {phase.title}
                    </h3>
                    <p className="text-[#D4AF37] text-sm uppercase tracking-[0.15em] font-light mb-6">
                      {phase.subtitle}
                    </p>
                  </div>
                  
                  {/* Body */}
                  <p className="text-slate-300 text-base leading-relaxed font-light">
                    {phase.body}
                  </p>
                </div>
                
                {/* Focus footer */}
                <div className="pt-8 mt-8 border-t border-white/5">
                  <p className="text-slate-500 text-sm uppercase tracking-wider font-light">
                    Focus: <span className="text-slate-400">{phase.focus}</span>
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


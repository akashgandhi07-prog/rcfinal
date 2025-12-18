"use client"

import { motion } from "framer-motion"

export function StrategicRoadmap() {
  const stages = [
    {
      phase: 1,
      title: "Bespoke Onboarding & Professional Strategy",
      description: "A Personal Professional Consultation with your Lead Mentor to define the Professional Persona and establish all candidacy milestones. Includes immediate identification of profile strengths and weaknesses.",
      position: "left",
    },
    {
      phase: 2,
      title: "Professional Portfolio Development & Supracurricular Excellence",
      description: "Curated placement of high-impact professional work experience, structured volunteering programmes, and research opportunities. Our network of NHS Consultants, research institutions, and professional settings ensures each candidate builds a distinguished portfolio that demonstrates genuine commitment to professional practice. We orchestrate placements that showcase leadership, empathy, and intellectual curiosity—the hallmarks of exceptional medical candidates.",
      position: "right",
    },
    {
      phase: 3,
      title: "High-Performance Admissions Testing (UCAT)",
      description: "Intensive, customised coaching for the UCAT. Delivered by Mentors with a proven track record of high-performance scoring to secure competitive results.",
      position: "left",
    },
    {
      phase: 4,
      title: "Crafting the 'Professional Persona' (Personal Statement)",
      description: "Personal Statement Construction: Narrative creation and line-by-line editing by practicing NHS Consultants. We ensure the crafting of a compelling Professional Persona that resonates with admissions committees.",
      position: "right",
    },
    {
      phase: 5,
      title: "Data-Driven Strategic Selection",
      description: "Strategic University Selection: Data-driven analysis of G5 options and medical/dental/veterinary schools based on the candidate's professional profile. Ongoing Counselling: Monthly check-ins to align all academic and non-academic milestones.",
      position: "left",
    },
    {
      phase: 6,
      title: "MMI and Panel Interview Mastery",
      description: "Professional Interview Strategy: Intensive MMI simulation and panel preparation focusing on advanced medical ethics and NHS hot topics. All simulations are conducted exclusively by GMC Doctors, GDC Dentists, and RCVS Vets.",
      position: "right",
    },
  ]

  return (
    <section id="roadmap" className="py-16 sm:py-24 md:py-32 bg-[#0B1120] relative">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-3 sm:mb-4 font-light">The Candidacy Roadmap (Year 12-13)</h2>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          {/* Vertical gold line */}
          <div className="absolute left-4 sm:left-6 md:left-1/2 top-0 bottom-0 w-px bg-[#D4AF37] transform md:-translate-x-1/2" />

          <div className="space-y-12 sm:space-y-16">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.phase}
                initial={{ opacity: 0, x: stage.position === "left" ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative grid md:grid-cols-2 gap-6 sm:gap-8 items-center ${
                  stage.position === "left" ? "" : "md:grid-flow-dense"
                }`}
              >
                {/* Gold circle node on center line */}
                <div className="absolute left-4 sm:left-6 md:left-1/2 transform -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#D4AF37] z-10" />

                {/* Content - on mobile always on right side of line */}
                <div
                  className={`ml-10 sm:ml-12 md:ml-0 ${
                    stage.position === "left"
                      ? "md:col-start-1 md:text-right md:pr-8 sm:md:pr-12"
                      : "md:col-start-2 md:text-left md:pl-8 sm:md:pl-12"
                  }`}
                >
                  <div className="text-xs text-[#D4AF37] uppercase tracking-wider mb-2 font-light">
                    Phase {stage.phase}
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl text-white mb-2 sm:mb-3 font-light">{stage.title}</h3>
                  <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">{stage.description}</p>
                </div>

                {/* Empty space for alternating layout on desktop */}
                <div className="hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

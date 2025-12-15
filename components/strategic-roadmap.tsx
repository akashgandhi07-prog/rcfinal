"use client"

import { motion } from "framer-motion"

export function StrategicRoadmap() {
  const stages = [
    {
      title: "University Selection",
      description: "Data-driven analysis of clinical strengths to select the strategic G5 options.",
      position: "left",
    },
    {
      title: "Admissions Testing Strategy",
      description: "High-performance coaching for UCAT & university-specific entrance assessments.",
      position: "right",
    },
    {
      title: "Personal Statement",
      description:
        "Narrative construction and line-by-line editing by NHS Doctors to craft the 'Clinical Persona'needed to exceed.",
      position: "left",
    },
    {
      title: "Interview Strategy",
      description: "MMI & Panel interview preparation focusing on medical ethics and NHS hot topics.",
      position: "right",
    },
  ]

  return (
    <section id="roadmap" className="py-32 bg-[#0B1120] relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 font-light">The Strategic Roadmap</h2>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          {/* Vertical gold line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-[#D4AF37] transform md:-translate-x-1/2" />

          <div className="space-y-16">
            {stages.map((stage, index) => (
              <motion.div
                key={stage.title}
                initial={{ opacity: 0, x: stage.position === "left" ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className={`relative grid md:grid-cols-2 gap-8 items-center ${
                  stage.position === "left" ? "" : "md:grid-flow-dense"
                }`}
              >
                {/* Gold circle node on center line */}
                <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-[#D4AF37] z-10" />

                {/* Content - on mobile always on right side of line */}
                <div
                  className={`ml-12 md:ml-0 ${
                    stage.position === "left"
                      ? "md:col-start-1 md:text-right md:pr-12"
                      : "md:col-start-2 md:text-left md:pl-12"
                  }`}
                >
                  <h3 className="font-serif text-2xl text-white mb-3 font-light">{stage.title}</h3>
                  <p className="text-slate-400 font-light leading-relaxed">{stage.description}</p>
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

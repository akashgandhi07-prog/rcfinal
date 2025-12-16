"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState } from "react"

export function ClinicalBoard() {
  const consultants = [
    {
      name: "Dr Sonal Tanna",
      credentials: "BDS",
      title: "Dentistry",
      credential: "GDC Registered Dentist",
      graduation: "King's College London with Honours",
      profile: "Graduated from King's College London with Honours. NHS Dentist with over 12 years of clinical practice and admissions expertise. Specialises in guiding international candidates through the unique requirements of UK dental schools. Expert in interview preparation, having conducted hundreds of mock MMI sessions and panel interviews. Renowned for translating complex clinical experiences into compelling personal statements that resonate with admissions committees.",
    },
    {
      name: "Dr. Akash Gandhi",
      credentials: "MBBS MA (Cantab) DGM DRCOG MBA MRCGP",
      title: "Medicine",
      credential: "GMC Registered Specialist",
      graduation: "Cambridge & UCL - 1st Class and Distinction",
      profile: "Graduated from Cambridge & UCL with 1st Class and Distinction. NHS Family Medicine Consultant with 12+ years of clinical excellence and admissions mentorship. Extensive experience supporting international candidates from IB, American, and global curricula. Master interviewer with deep expertise in MMI design and medical ethics. Has successfully guided hundreds of candidates to G5 medical schools, with particular strength in strategic university selection and personal statement refinement.",
    },
    {
      name: "Dr. Rebecca Massie",
      credentials: "MRCVS",
      title: "Veterinary Medicine",
      credential: "RCVS Registered Veterinary Surgeon",
      graduation: "Royal Veterinary College",
      profile: "Graduated from the Royal Veterinary College. RCVS Registered Veterinary Surgeon with over 12 years of clinical practice and admissions coaching. Expert in veterinary school admissions strategy, having mentored candidates across all UK veterinary programmes. Specialises in helping international students navigate the competitive veterinary admissions landscape. Known for exceptional interview preparation, combining clinical insight with strategic candidacy development to secure placements at top-tier institutions.",
    },
  ]

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section id="board" className="py-32 bg-slate-950">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 font-light">The Board</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {consultants.map((consultant, index) => (
            <motion.div
              key={consultant.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Portrait image with hover effect */}
              <div className="aspect-[3/4] bg-gradient-to-b from-slate-800 to-slate-900 mb-6 relative overflow-hidden rounded-lg shadow-lg shadow-black/40 group-hover:shadow-xl group-hover:shadow-black/60 transition-all duration-500">
                <Image
                  src={`/professional-headshot.png?height=600&width=450&query=professional+medical+consultant+portrait`}
                  alt={consultant.name}
                  fill
                  className={`object-cover transition-all duration-700 ${
                    hoveredIndex === index
                      ? "grayscale-0 scale-110 brightness-110"
                      : "grayscale group-hover:grayscale-0"
                  }`}
                />
                {/* Overlay for profile text */}
                <div
                  className={`absolute inset-0 bg-black/95 backdrop-blur-md p-3 md:p-4 flex flex-col justify-center overflow-y-auto transition-all duration-500 ${
                    hoveredIndex === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="bg-black/80 backdrop-blur-lg rounded-lg p-4 md:p-5 border-2 border-[#D4AF37]/30 shadow-2xl">
                    <div className="mb-2 pb-2 border-b border-[#D4AF37]/20">
                      <p className="text-[#D4AF37] text-sm md:text-base font-serif font-light leading-tight">
                        {consultant.graduation}
                      </p>
                    </div>
                    <p className="text-white text-xs md:text-sm leading-relaxed font-light">
                      {consultant.profile}
                    </p>
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="text-center">
                <h3 className="font-serif text-xl text-white mb-1 font-light">{consultant.name}</h3>
                <p className="text-[#D4AF37] text-xs mb-1 font-light tracking-wider">{consultant.credentials}</p>
                <p className="text-slate-300 text-sm mb-2 font-light italic">{consultant.title}</p>
                <p className="text-amber-400 text-xs uppercase tracking-wider font-light">{consultant.credential}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

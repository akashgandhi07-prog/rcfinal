"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function ClinicalBoard() {
  const consultants = [
    {
      name: "Dr Sonal Tanna",
      credentials: "BDS",
      title: "Dentistry",
      credential: "GDC Registered Dentist",
      graduation: "King's College London with Honours",
      image: "/board-dentistry-regents-consultancy.png",
      profile: "Graduated from King's College London with Honours. NHS Dentist with over 12 years of professional practice and admissions expertise. Specialises in guiding international candidates through the unique requirements of UK dental schools. Expert in interview preparation, having conducted hundreds of mock MMI sessions and panel interviews. Renowned for translating complex professional experiences into compelling personal statements that resonate with admissions committees.",
    },
    {
      name: "Dr. Akash Gandhi",
      credentials: "MBBS MA (Cantab) DGM DRCOG MBA MRCGP",
      title: "Medicine",
      credential: "GMC Registered Specialist",
      graduation: "Cambridge & UCL - 1st Class and Distinction",
      image: "/board-regents-consultancy-medical.png",
      profile: "Graduated from Cambridge & UCL with 1st Class and Distinction. NHS Family Medicine Consultant with 12+ years of professional excellence and admissions mentorship. Extensive experience supporting international candidates from IB, American, and global curricula. Master interviewer with deep expertise in MMI design and medical ethics. Has successfully guided hundreds of candidates to G5 medical schools, with particular strength in strategic university selection and personal statement refinement.",
    },
    {
      name: "Dr. Rebecca Massie",
      credentials: "MRCVS",
      title: "Veterinary Medicine",
      credential: "RCVS Registered Veterinary Surgeon",
      graduation: "Royal Veterinary College",
      image: "/regents-consultancy-board-veterinary.png",
      profile: "Graduated from the Royal Veterinary College. RCVS Registered Veterinary Surgeon with over 12 years of professional practice and admissions coaching. Expert in veterinary school admissions strategy, having mentored candidates across all UK veterinary programmes. Specialises in helping international students navigate the competitive veterinary admissions landscape. Known for exceptional interview preparation, combining professional insight with strategic candidacy development to secure placements at top tier institutions.",
    },
  ]

  return (
    <section id="board" className="py-20 md:py-24 bg-slate-950 overflow-x-hidden">
      <div className="container mx-auto px-4 sm:px-6 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-3 font-light">
            The Board
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/40"></div>
            <div className="w-1 h-1 rounded-full bg-[#D4AF37]"></div>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/40"></div>
          </div>
        </motion.div>

        <div className="space-y-12 max-w-6xl mx-auto">
          {consultants.map((consultant, index) => {
            const imageOnLeft = index % 2 === 0

            return (
              <motion.div
                key={consultant.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className={`flex flex-col md:flex-row items-start md:items-stretch gap-6 md:gap-8 ${
                  imageOnLeft ? "" : "md:flex-row-reverse"
                }`}
              >
                {/* Portrait image - now stretches to match text height */}
                <div className="w-full max-w-[240px] mx-auto md:mx-0 md:w-[300px] flex-shrink-0 md:flex md:flex-col">
                  <div className="group relative flex-1 flex flex-col">
                    <div className="relative flex-1 min-h-[280px] w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden shadow-lg shadow-black/50 border border-[#D4AF37]/25 group-hover:border-[#D4AF37]/40 transition-all duration-300">
                      <Image
                        src={consultant.image}
                        alt={consultant.name}
                        fill
                        sizes="(max-width: 768px) 200px, 240px"
                        className="object-cover grayscale group-hover:grayscale-[0.9] group-hover:scale-[1.02] transition-all duration-500"
                        priority={index < 2}
                      />
                    </div>
                  </div>
                </div>

                {/* Text content */}
                <div className="flex-1 flex flex-col w-full">
                  {/* Name and credentials - clean and compact */}
                  <div className="text-center mb-3">
                    <div className="flex flex-wrap items-baseline gap-3 mb-1.5">
                      <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-white font-light leading-tight">
                        {consultant.name}
                      </h3>
                      <div className="inline-flex items-center px-2.5 sm:px-3 py-0.5 sm:py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-full">
                        <p className="text-[#D4AF37] text-[10px] sm:text-xs uppercase tracking-wider font-light">
                          {consultant.credential}
                        </p>
                      </div>
                    </div>
                    <div className="h-px w-16 bg-gradient-to-r from-[#D4AF37] to-transparent mb-2"></div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <p className="text-[#D4AF37] text-xs sm:text-sm md:text-base font-light tracking-wider uppercase">
                        {consultant.credentials}
                      </p>
                      <span className="text-slate-400">•</span>
                      <p className="text-slate-200 text-sm sm:text-base md:text-lg font-light italic">
                        {consultant.title}
                      </p>
                    </div>
                  </div>

                  {/* Profile card */}
                  <div className="relative bg-black/50 border border-[#D4AF37]/20 rounded-lg p-5 md:p-6 shadow-lg shadow-black/40 flex-1 min-h-0">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent"></div>
                    
                    <div className="space-y-4 pt-1 h-full flex flex-col">
                      <div className="pb-3 border-b border-[#D4AF37]/15">
                        <p className="text-[#D4AF37] text-sm md:text-base font-serif font-light leading-snug">
                          {consultant.graduation}
                        </p>
                      </div>
                      <p className="text-slate-100 text-sm md:text-base leading-relaxed font-light flex-1">
                        {consultant.profile}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
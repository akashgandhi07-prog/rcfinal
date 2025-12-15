"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function ClinicalBoard() {
  const consultants = [
    {
      name: "Dr Sonal Tanna",
      title: "Medicine",
      credential: "GMC Registered Consultant",
    },
    {
      name: "Dr. James Thornton",
      title: "Dentistry",
      credential: "GDC Registered Specialist",
    },
    {
      name: "Dr. Sophie Ashford",
      title: "Veterinary",
      credential: "RCVS Registered Specialist",
    },
  ]

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
              className="group"
            >
              {/* Portrait image placeholder with grayscale effect */}
              <div className="aspect-[3/4] bg-gradient-to-b from-slate-800 to-slate-900 mb-6 relative overflow-hidden">
                <Image
                  src={`/professional-headshot.png?height=600&width=450&query=professional+medical+consultant+portrait`}
                  alt={consultant.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>

              {/* Text content */}
              <div className="text-center">
                <h3 className="font-serif text-xl text-white mb-1 font-light">{consultant.name}</h3>
                <p className="text-slate-400 text-sm mb-2 font-light italic">{consultant.title}</p>
                <p className="text-amber-400 text-xs uppercase tracking-wider font-light">{consultant.credential}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

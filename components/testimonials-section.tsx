"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

const testimonials = [
  {
    quote: "The level of professional insight was extraordinary. My son didn't just pass the interview; he enjoyed it. The team's deep understanding of what medical schools are truly looking for transformed his entire approach. From the initial strategy sessions to the final interview preparation, every interaction demonstrated their expertise and genuine commitment to his success.",
    attribution: "Parent of Medical Student, Oxford",
  },
  {
    quote: "Discreet, precise, and highly effective. They managed the entire strategy from Year 11 to Offer Day with remarkable attention to detail. What impressed us most was their ability to navigate the complexities of international applications while maintaining absolute confidentiality. The results speak for themselves—multiple offers from top-tier institutions.",
    attribution: "Private Family Office, Dubai",
  },
  {
    quote: "Only Regent's offered actual surgeons. The interview prep gave her the confidence of a doctor. Working with practicing clinicians who understand both the academic requirements and the real-world demands of medical practice was invaluable. Her interview performance was transformed, and she secured her first-choice placement.",
    attribution: "Parent of Dental Student, KCL",
  },
]

export function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section id="testimonials" ref={ref} className="py-24 md:py-32 bg-[#0B1120] border-t border-white/10">
      <div className="container mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="font-serif text-3xl md:text-4xl text-white text-center mb-16 tracking-wide"
        >
          PRIVATE CLIENT REFLECTIONS
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="text-center"
            >
              <div className="text-[#D4AF37] font-serif text-7xl leading-none mb-6">&ldquo;</div>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-6 italic font-light">{testimonial.quote}</p>
              <p className="text-slate-500 text-sm font-light">— {testimonial.attribution}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

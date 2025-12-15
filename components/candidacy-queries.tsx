"use client"

import { motion } from "framer-motion"

export function CandidacyQueries() {
  const faqs = [
    {
      question: "What happens if a candidate is not successful?",
      answer:
        "We offer comprehensive gap year strategy and re-application support. Our programme includes targeted skill development, additional clinical exposure, and refined interview preparation to strengthen candidacy for the following cycle.",
    },
    {
      question: "Do you work with students outside of the UK?",
      answer:
        "Yes. We have extensive experience with IB, American, and other international curricula. Our team specialises in translating international qualifications to UK standards and guiding candidates through the unique requirements of British medical schools.",
    },
    {
      question: "When should we commence the strategy?",
      answer:
        "Year 11 is optimal for profiling and early strategy development. Year 12 is the standard execution phase for most candidates. Early engagement allows for more comprehensive clinical exposure and stronger personal statement development.",
    },
  ]

  return (
    <section className="py-32 bg-slate-950">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 font-light">
            Candidacy Queries
          </h2>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <motion.details
              key={faq.question}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border border-white/10 bg-[#0B1120] group"
            >
              <summary className="px-6 py-5 cursor-pointer list-none font-serif text-lg text-white font-light hover:text-[#D4AF37] transition-colors flex items-center justify-between">
                <span>{faq.question}</span>
                <span className="text-[#D4AF37] text-2xl ml-4 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="px-6 pb-5 pt-0">
                <p className="text-slate-300 leading-relaxed font-light">{faq.answer}</p>
              </div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  )
}


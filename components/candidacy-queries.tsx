"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState } from "react"

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

  const [openValue, setOpenValue] = useState<string>("item-0")

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

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Accordion 
              type="single" 
              value={openValue}
              onValueChange={(value) => {
                // Ensure at least one is always open - if value is empty, keep current open
                setOpenValue(value || openValue)
              }}
              className="space-y-4"
            >
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={faq.question}
                  value={`item-${index}`}
                  className="border border-white/10 bg-[#0B1120] rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-shadow duration-300"
                >
                  <AccordionTrigger className="px-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-slate-200 leading-relaxed font-light">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


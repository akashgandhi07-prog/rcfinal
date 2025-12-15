"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SuitabilityAssessmentForm } from "@/components/suitability-assessment-form"

export function CTASection() {
  return (
    <section className="py-32 bg-[#0B1120]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto space-y-8"
        >
          <p className="text-white text-lg md:text-xl font-light leading-relaxed">
            The 2026/27 Private List is currently open for application.
          </p>
          <SuitabilityAssessmentForm
            trigger={
              <Button className="bg-[#D4AF37] text-black hover:bg-[#C9A530] font-light px-10 h-12 text-base rounded-lg">
                Request Clinical Consultation
              </Button>
            }
          />
        </motion.div>
      </div>
    </section>
  )
}


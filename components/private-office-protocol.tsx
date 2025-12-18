"use client"

import { motion } from "framer-motion"
import { Globe, Clock, Lock, Users } from "lucide-react"

export function PrivateOfficeProtocol() {
  const services = [
    {
      icon: Globe,
      title: "Global Access",
      description: "Consultations conducted via secure Zoom for international flexibility.",
    },
    {
      icon: Clock,
      title: "24/7 Direct Line",
      description: "Unrestricted WhatsApp access to your Lead Mentor.",
    },
    {
      icon: Lock,
      title: "Absolute Discretion",
      description: "Strict NDAs and confidentiality for high profile families.",
    },
    {
      icon: Users,
      title: "Expert Counselling",
      description: "Regular strategy sessions to align academic and professional milestones.",
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
            The Private Office Protocol
          </h2>
          <p className="text-slate-300 text-sm uppercase tracking-wider font-light">
            Scope of Service
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-left space-y-3"
              >
                <div className="p-3 border border-[#D4AF37]/20 rounded-lg bg-[#D4AF37]/5 w-fit">
                  <Icon className="w-5 h-5 text-[#D4AF37]" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg text-white font-light">{service.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed font-light">
                  {service.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


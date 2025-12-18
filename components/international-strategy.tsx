"use client"

import { motion } from "framer-motion"

export function InternationalStrategy() {
  return (
    <section className="py-32 bg-[#020617]">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-4xl md:text-5xl text-slate-300 mb-4 font-light">
            Global Access, Local Expertise
          </h2>
          <p className="text-slate-400 text-sm uppercase tracking-wider font-light">
            Bridging the gap between International Curriculums and UK Medical Schools
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* World Map Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full aspect-[16/9] rounded-lg overflow-hidden bg-[#0B1120] shadow-2xl"
          >
            {/* World Map Background - Using Wikimedia Commons world map */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage: `url("https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                filter: "invert(90%) hue-rotate(180deg) brightness(80%) contrast(120%)",
              }}
            />
            
            {/* SVG Overlay with Flight Paths */}
            <svg
              viewBox="0 0 1000 562"
              className="absolute inset-0 w-full h-full"
              style={{ filter: "invert(90%) hue-rotate(180deg) brightness(125%) contrast(83%)" }}
            >
              {/* Flight Paths - Gold Dotted Lines */}
              <path
                className="flight-path"
                d="M 490 170 Q 350 80 280 220"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                className="flight-path"
                d="M 490 170 Q 650 80 820 250"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                className="flight-path"
                d="M 490 170 Q 580 200 600 280"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                className="flight-path"
                d="M 490 170 Q 600 220 660 310"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                className="flight-path"
                d="M 490 170 Q 680 250 740 350"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                className="flight-path"
                d="M 490 170 Q 650 240 745 330"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                className="flight-path"
                d="M 490 170 Q 800 300 870 480"
                fill="none"
                stroke="#D4AF37"
                strokeWidth="2"
                strokeDasharray="6 6"
                strokeLinecap="round"
                opacity="0.6"
              />

              {/* London Hub with Pulsing Glow */}
              <circle
                cx="490"
                cy="170"
                r="12"
                fill="#D4AF37"
                opacity="0.3"
                className="animate-pulse"
              />
              <circle cx="490" cy="170" r="6" fill="#D4AF37" />
              <text
                x="490"
                y="150"
                textAnchor="middle"
                className="text-sm fill-slate-300 font-medium"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                London
              </text>

              {/* City Dots */}
              <circle cx="280" cy="220" r="4" fill="#D4AF37" />
              <text
                x="270"
                y="220"
                textAnchor="end"
                className="text-xs fill-slate-300 font-medium"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                Toronto / NYC
              </text>

              <circle cx="600" cy="280" r="4" fill="#D4AF37" />
              <text
                x="580"
                y="280"
                textAnchor="end"
                className="text-xs fill-slate-300 font-medium"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                Dubai / Riyadh
              </text>

              <circle cx="660" cy="310" r="4" fill="#D4AF37" />
              <text
                x="640"
                y="310"
                textAnchor="end"
                className="text-xs fill-slate-300 font-medium"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                Mumbai
              </text>

              <circle cx="745" cy="330" r="4" fill="#D4AF37" />
              <text
                x="725"
                y="330"
                textAnchor="end"
                className="text-xs fill-slate-300 font-medium"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                Singapore / HK
              </text>

              <circle cx="740" cy="350" r="4" fill="#D4AF37" />
              <text
                x="750"
                y="350"
                textAnchor="start"
                className="text-xs fill-slate-300 font-medium"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                Kuala Lumpur
              </text>

              <circle cx="820" cy="250" r="4" fill="#D4AF37" />
              <text
                x="830"
                y="250"
                textAnchor="start"
                className="text-xs fill-slate-300 font-medium"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                Shanghai
              </text>

              <circle cx="870" cy="480" r="4" fill="#D4AF37" />
              <text
                x="860"
                y="480"
                textAnchor="end"
                className="text-xs fill-slate-300 font-medium"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                Sydney
              </text>
            </svg>
          </motion.div>

          {/* Service Pillars */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="border-l-2 border-[#D4AF37] pl-6">
                <h3 className="text-xl font-serif text-slate-300 mb-2 font-light">Curriculum Translation</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  Expert guidance on translating IB, A-Levels, AP, and other international qualifications to meet UK
                  medical school requirements. We ensure your academic profile is presented optimally.
                </p>
              </div>

              <div className="border-l-2 border-[#D4AF37] pl-6">
                <h3 className="text-xl font-serif text-slate-300 mb-2 font-light">The Time-Zone Protocol</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  Flexible consultation scheduling across time zones. Our team accommodates international clients with
                  sessions tailored to your local time, ensuring seamless communication regardless of geography.
                </p>
              </div>

              <div className="border-l-2 border-[#D4AF37] pl-6">
                <h3 className="text-xl font-serif text-slate-300 mb-2 font-light">Partnership with Schools, Counsellors & Agents</h3>
                <p className="text-slate-400 text-sm leading-relaxed font-light">
                  We serve as the expert authority on UK medical school admissions for leading international schools, independent admissions counsellors, and education agents worldwide. Our team provides strategic consultation, training, and ongoing support to counsellors and agents, ensuring they can offer their students the most current and effective guidance. We work collaboratively with educational institutions and recruitment partners across the globe, complementing existing counselling services with our deep expertise in UK medical, dental, and veterinary admissions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

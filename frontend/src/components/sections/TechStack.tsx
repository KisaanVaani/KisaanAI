'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface TechItemProps {
  name: string
  description: string
}

function TechItem({ name, description }: TechItemProps) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="mt-1 w-2 h-2 rounded-full bg-forest flex-shrink-0 group-hover:bg-gold transition-colors" />
      <div>
        <h4 className="font-semibold text-forest text-base">{name}</h4>
        <p className="text-charcoal/60 text-sm">{description}</p>
      </div>
    </div>
  )
}

interface TechColumnProps {
  icon: string
  title: string
  items: TechItemProps[]
  delay: number
}

function TechColumn({ icon, title, items, delay }: TechColumnProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="bg-white rounded-2xl p-8 shadow-sm border border-forest/10 hover:shadow-xl hover:border-forest/20 transition-all duration-300"
    >
      <div className="mb-6">
        <div className="text-5xl mb-3">{icon}</div>
        <h3 className="font-display text-2xl font-bold text-forest">{title}</h3>
      </div>
      <div className="space-y-6">
        {items.map((item, idx) => (
          <TechItem key={idx} {...item} />
        ))}
      </div>
    </motion.div>
  )
}

export default function TechStack() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-50px' })

  const techColumns = [
    {
      icon: '🎙️',
      title: 'Voice AI Layer',
      items: [
        {
          name: 'Sarvam STT',
          description: 'Speech-to-text for 22 Indic languages',
        },
        {
          name: 'Sarvam TTS',
          description: 'Natural voice synthesis with regional accents',
        },
        {
          name: 'Indic Phoneme Engine',
          description: 'Accurate Devanagari/regional pronunciation',
        },
      ],
      delay: 0,
    },
    {
      icon: '⚙️',
      title: 'Orchestration Layer',
      items: [
        {
          name: 'Node.js',
          description: 'Real-time conversation state management',
        },
        {
          name: 'Python FastAPI',
          description: 'High-performance API routing',
        },
        {
          name: 'API Fan-out',
          description: 'Parallel data source querying',
        },
      ],
      delay: 0.1,
    },
    {
      icon: '🧠',
      title: 'AI Reasoning Layer',
      items: [
        {
          name: 'Mistral Large',
          description: 'Multi-step crop advisory reasoning',
        },
        {
          name: 'Custom Models',
          description: 'Crop profitability scoring & risk analysis',
        },
        {
          name: 'Context Engine',
          description: 'Historical farmer data & seasonal patterns',
        },
      ],
      delay: 0.2,
    },
  ]

  return (
    <section id="technology" className="bg-mist py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-black text-forest mb-4">
            Technology Stack
          </h2>
          <p className="text-charcoal/70 text-lg sm:text-xl max-w-3xl mx-auto">
            Enterprise-grade AI infrastructure designed for India&apos;s linguistic
            and agricultural diversity
          </p>
        </motion.div>

        {/* Tech Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {techColumns.map((column) => (
            <TechColumn key={column.title} {...column} />
          ))}
        </div>

        {/* Bottom Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest/5 border border-forest/10">
            <span className="text-forest font-semibold text-sm">
              ⚡ Sub-2-second latency
            </span>
            <span className="text-charcoal/40">•</span>
            <span className="text-forest font-semibold text-sm">
              🌐 22+ languages
            </span>
            <span className="text-charcoal/40">•</span>
            <span className="text-forest font-semibold text-sm">
              🔒 Secure & scalable
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

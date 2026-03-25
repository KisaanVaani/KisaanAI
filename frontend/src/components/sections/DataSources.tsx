'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface DataCardProps {
  icon: string
  name: string
  color: string
  borderColor: string
  items: string[]
  delay: number
}

function DataCard({ icon, name, color, borderColor, items, delay }: DataCardProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-white/5 border ${borderColor} border-l-4 rounded-2xl p-8 backdrop-blur-sm hover:border-opacity-100 transition-all duration-300`}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className={`font-display text-2xl font-bold ${color} mb-4`}>{name}</h3>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="text-cream/70 text-sm flex items-start">
            <span className={`${color} mr-2 mt-1`}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

export default function DataSources() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-50px' })

  const dataSources = [
    {
      icon: '🌱',
      name: 'AgriStack',
      color: 'text-green-400',
      borderColor: 'border-green-500',
      items: [
        'Farmer identity verification',
        'PM-KISAN beneficiary status',
        'Land records & ownership data',
      ],
      delay: 0,
    },
    {
      icon: '🌦️',
      name: 'IMD / OpenWeather',
      color: 'text-blue-400',
      borderColor: 'border-blue-500',
      items: [
        '7-day hyper-local weather forecast',
        'Rainfall predictions & patterns',
        'Temperature ranges & humidity',
      ],
      delay: 0.1,
    },
    {
      icon: '🧪',
      name: 'ICAR / FASAL',
      color: 'text-amber-400',
      borderColor: 'border-amber-500',
      items: [
        'Soil health card data',
        'Crop advisory calendar',
        'Pest & disease alerts',
      ],
      delay: 0.2,
    },
    {
      icon: '📊',
      name: 'Agmarknet',
      color: 'text-red-400',
      borderColor: 'border-red-500',
      items: [
        'Live mandi prices (daily)',
        'MSP notifications',
        'Market trends & commodity insights',
      ],
      delay: 0.3,
    },
  ]

  return (
    <section id="data-sources" className="bg-charcoal py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-black text-cream mb-4">
            Real-Time Data Sources
          </h2>
          <p className="text-cream/70 text-lg sm:text-xl max-w-3xl mx-auto">
            Powered by India&apos;s leading agricultural and meteorological databases —
            delivering accurate, localized insights
          </p>
        </motion.div>

        {/* Data Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataSources.map((source) => (
            <DataCard key={source.name} {...source} />
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-cream/50 text-sm">
            All data is fetched in real-time and synthesized by our AI reasoning engine
          </p>
        </motion.div>
      </div>
    </section>
  )
}

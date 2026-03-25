'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

interface MetricProps {
  value: string
  label: string
  delay: number
}

function AnimatedCounter({ value, inView, delay }: { value: string; inView: boolean; delay: number }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)
  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    if (inView) {
      const numericValue = parseInt(value.replace(/\D/g, ''), 10) || 0
      const controls = animate(count, numericValue, {
        duration: 2,
        delay,
        ease: 'easeOut',
      })

      const unsubscribe = rounded.on('change', (latest) => {
        if (value.includes('+')) {
          setDisplayValue(`${latest}+`)
        } else if (value.startsWith('<')) {
          setDisplayValue(`<${latest}s`)
        } else {
          setDisplayValue(String(latest))
        }
      })

      return () => {
        controls.stop()
        unsubscribe()
      }
    }
  }, [inView, value, delay, count, rounded])

  return displayValue
}

function Metric({ value, label, delay }: MetricProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  const hasNumber = /\d/.test(value)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="text-center"
    >
      <div className="font-display text-6xl sm:text-7xl font-black text-forest mb-2">
        {hasNumber ? (
          <AnimatedCounter value={value} inView={inView} delay={delay} />
        ) : (
          value
        )}
      </div>
      <div className="text-forest/80 font-medium text-sm uppercase tracking-widest">
        {label}
      </div>
    </motion.div>
  )
}

export default function ImpactMetrics() {
  const metrics = [
    { value: '22+', label: 'Regional Languages', delay: 0 },
    { value: '<2', label: 'Voice Response Latency (seconds)', delay: 0.1 },
    { value: '4', label: 'Live Government Data Sources', delay: 0.2 },
    { value: '0', label: 'Smartphones Required', delay: 0.3 },
  ]

  return (
    <section className="bg-gold py-16 relative overflow-hidden">
      {/* Decorative wheat stalks */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 text-6xl opacity-20">
        🌾
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 text-6xl opacity-20">
        🌾
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {metrics.map((metric) => (
            <Metric key={metric.label} {...metric} />
          ))}
        </div>
      </div>
    </section>
  )
}

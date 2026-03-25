'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Github, Calendar } from 'lucide-react'

export default function CallToAction() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="bg-charcoal py-32 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-gradient-radial from-forest/40 via-transparent to-transparent opacity-50" />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-gold/60 tracking-widest text-sm mb-6 font-medium"
        >
          — BUILT FOR BHARAT 🇮🇳 —
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-cream mb-6 leading-tight"
        >
          Ready to bring AI to{' '}
          <span className="text-gold">every farm?</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-cream/60 text-lg sm:text-xl mb-12 max-w-2xl mx-auto"
        >
          Partner with us to scale this solution or try the live demo.
          Together, we can empower millions of farmers with AI-powered insights.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="#demo"
            className="bg-gold text-forest font-bold rounded-full px-10 py-4 hover:bg-gold/90 hover:scale-105 transition-all duration-200 flex items-center gap-2 text-lg shadow-xl"
          >
            <Calendar size={20} />
            Schedule a Demo
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="border-2 border-cream/30 text-cream rounded-full px-10 py-4 hover:bg-cream/10 transition-all duration-200 flex items-center gap-2 text-lg"
          >
            <Github size={20} />
            View on GitHub
          </a>
        </motion.div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-cream/40 text-sm mt-12"
        >
          Open for partnerships · Scalable nationwide · Built with ❤️ for Indian farmers
        </motion.p>
      </motion.div>
    </section>
  )
}

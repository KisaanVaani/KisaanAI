'use client'

import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

export default function Hero() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  }

  return (
    <section className="relative min-h-screen bg-forest overflow-hidden flex items-center">
      {/* Grain Texture Overlay */}
      <div className="grain-overlay absolute inset-0 pointer-events-none" />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          {/* LEFT COLUMN - 55% */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="md:col-span-7 space-y-8"
          >
            {/* Floating Badge */}
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/10 text-gold text-xs font-medium">
                ⚡ Powered by Mistral AI + Sarvam STT/TTS
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={item}
              className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-cream leading-[1.1]"
            >
              Your Farm&apos;s AI Advisor —{' '}
              <span className="text-gold">Available on Any Phone</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={item} className="text-cream/70 text-xl sm:text-2xl leading-relaxed max-w-2xl">
              Call <span className="text-gold font-bold">896</span> from any basic phone.
              Get expert crop advice in your language. No app. No smartphone. Just AI-powered wisdom.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
              <a
                href="#demo"
                className="bg-gold text-forest font-bold rounded-full px-8 py-4 hover:scale-105 transition-transform duration-200 text-center text-lg shadow-xl inline-flex items-center justify-center gap-2"
              >
                Try Phone Simulator
              </a>
              <a
                href="#demo"
                className="border-2 border-cream/30 text-cream rounded-full px-8 py-4 hover:bg-cream/10 transition-colors duration-200 text-center text-lg inline-flex items-center justify-center gap-2"
              >
                <Play size={20} />
                Watch Demo
              </a>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN - 45% */}
          <div className="md:col-span-5 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="relative"
            >
              {/* Pulsing Call Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-64 h-64 rounded-full border-2 border-gold/40"
                    animate={{
                      scale: [1, 1.8],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.6,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>

              {/* Feature Phone SVG */}
              <div className="relative z-10">
                <svg
                  width="200"
                  height="380"
                  viewBox="0 0 200 380"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-2xl"
                >
                  {/* Phone Body */}
                  <rect
                    x="10"
                    y="10"
                    width="180"
                    height="360"
                    rx="25"
                    fill="#1C1C1E"
                    stroke="#E8960C"
                    strokeWidth="3"
                  />
                  {/* Screen */}
                  <rect
                    x="25"
                    y="60"
                    width="150"
                    height="180"
                    rx="8"
                    fill="#0a1a0f"
                  />
                  {/* Screen Content */}
                  <text
                    x="100"
                    y="140"
                    textAnchor="middle"
                    fill="#E8960C"
                    fontSize="18"
                    fontWeight="bold"
                  >
                    📞 Calling...
                  </text>
                  <text
                    x="100"
                    y="165"
                    textAnchor="middle"
                    fill="#10b981"
                    fontSize="24"
                    fontWeight="bold"
                  >
                    896
                  </text>
                  {/* Speaker */}
                  <rect x="70" y="30" width="60" height="8" rx="4" fill="#444" />
                  {/* Keypad */}
                  <g transform="translate(40, 260)">
                    {[0, 1, 2].map((row) =>
                      [0, 1, 2].map((col) => (
                        <rect
                          key={`${row}-${col}`}
                          x={col * 40}
                          y={row * 30}
                          width="35"
                          height="25"
                          rx="4"
                          fill="#2a2a2c"
                        />
                      ))
                    )}
                  </g>
                </svg>

                {/* Animated Audio Waveform Below Phone */}
                <div className="flex items-end justify-center gap-1 mt-8 h-16">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 bg-gold rounded-full"
                      animate={{
                        scaleY: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.06,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      style={{ height: '100%', transformOrigin: 'bottom' }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

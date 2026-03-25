'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { RotateCcw } from 'lucide-react'

interface Message {
  speaker: 'farmer' | 'ai'
  text: string
}

export default function PhoneSimulator() {
  const [phase, setPhase] = useState<'idle' | 'dialing' | 'connected' | 'conversation'>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-50px' })

  const conversation: Message[] = [
    { speaker: 'farmer', text: 'Bhaiya, is saal kya ugaao?' },
    { speaker: 'ai', text: 'Namaskar! Aapke kshetra mein arhar daal sahi rahegi.' },
    { speaker: 'ai', text: 'MSP ₹7000/qtl hai aur mausam bhi anukool hai.' },
    { speaker: 'ai', text: 'Beej ke liye ICAR-certified variety chunein.' },
  ]

  const startSimulation = () => {
    setIsPlaying(true)
    setPhase('dialing')
    setMessages([])
    setCurrentMessageIndex(0)
    setCurrentCharIndex(0)
  }

  useEffect(() => {
    if (!isPlaying) return

    if (phase === 'dialing') {
      const timer = setTimeout(() => setPhase('connected'), 1500)
      return () => clearTimeout(timer)
    }

    if (phase === 'connected') {
      const timer = setTimeout(() => setPhase('conversation'), 800)
      return () => clearTimeout(timer)
    }

    if (phase === 'conversation') {
      if (currentMessageIndex >= conversation.length) {
        setIsPlaying(false)
        return
      }

      const currentMessage = conversation[currentMessageIndex]

      if (currentCharIndex === 0) {
        // Start new message
        setMessages(prev => [...prev, { speaker: currentMessage.speaker, text: '' }])
      }

      if (currentCharIndex < currentMessage.text.length) {
        const timer = setTimeout(() => {
          setMessages(prev => {
            const newMessages = [...prev]
            newMessages[newMessages.length - 1].text = currentMessage.text.slice(0, currentCharIndex + 1)
            return newMessages
          })
          setCurrentCharIndex(prev => prev + 1)
        }, 30)
        return () => clearTimeout(timer)
      } else {
        // Move to next message after a pause
        const timer = setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1)
          setCurrentCharIndex(0)
        }, 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [phase, currentMessageIndex, currentCharIndex, isPlaying])

  // Auto-start on first view
  useEffect(() => {
    if (headerInView && !isPlaying && phase === 'idle') {
      const timer = setTimeout(() => startSimulation(), 500)
      return () => clearTimeout(timer)
    }
  }, [headerInView])

  return (
    <section id="demo" className="bg-forest py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-black text-cream mb-4">
            Hear It For Yourself
          </h2>
          <p className="text-cream/70 text-lg sm:text-xl">
            Watch a live simulation of a farmer calling 896
          </p>
        </motion.div>

        {/* Phone Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={headerInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          {/* Phone Frame */}
          <div className="relative w-80 rounded-[2rem] border-4 border-gold/60 bg-charcoal p-4 shadow-2xl">
            {/* Speaker Notch */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-2 bg-charcoal/50 rounded-full" />

            {/* Screen */}
            <div className="bg-[#0a1a0f] rounded-[1.5rem] p-6 min-h-[400px] flex flex-col">
              {/* Screen Content */}
              <div className="flex-1 overflow-y-auto space-y-4">
                {phase === 'dialing' && (
                  <div className="flex flex-col items-center justify-center h-full">
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-center"
                    >
                      <div className="text-4xl mb-3">📞</div>
                      <p className="text-gold text-lg font-semibold">Dialing 896...</p>
                    </motion.div>
                  </div>
                )}

                {phase === 'connected' && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full"
                  >
                    <div className="text-5xl mb-3">✅</div>
                    <p className="text-emerald-400 text-xl font-bold">Connected</p>
                  </motion.div>
                )}

                {phase === 'conversation' && messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.speaker === 'farmer' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        msg.speaker === 'farmer'
                          ? 'bg-gold/20 text-gold rounded-tl-sm'
                          : 'bg-emerald-500/20 text-emerald-400 rounded-tr-sm'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1 opacity-70">
                        {msg.speaker === 'farmer' ? '👨‍🌾 Farmer' : '🤖 KisanVaani'}
                      </p>
                      <p className="text-base leading-relaxed">
                        {msg.text}
                        {idx === messages.length - 1 && currentCharIndex < conversation[currentMessageIndex]?.text.length && (
                          <span className="inline-block w-0.5 h-4 bg-current ml-1 animate-pulse" />
                        )}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Phone Bottom Button */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-charcoal/30 border border-gold/30" />
          </div>

          {/* Play Again Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={startSimulation}
            disabled={isPlaying}
            className="mt-8 flex items-center gap-2 border-2 border-gold text-gold rounded-full px-6 py-3 hover:bg-gold hover:text-forest transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <RotateCcw size={18} />
            Play Again
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

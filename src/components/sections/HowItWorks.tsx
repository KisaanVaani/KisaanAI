'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

interface FlowNodeProps {
  title: string
  description: string | string[]
  color: string
  bgColor: string
  delay: number
  icon?: string
}

function FlowNode({ title, description, color, bgColor, delay, icon }: FlowNodeProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  const descArray = Array.isArray(description) ? description : [description]

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={`relative rounded-2xl p-6 border-l-4 ${color} ${bgColor} backdrop-blur-sm`}
    >
      {icon && <div className="text-3xl mb-2">{icon}</div>}
      <h3 className="font-display text-xl font-bold text-charcoal mb-2">{title}</h3>
      <div className="space-y-1">
        {descArray.map((desc, idx) => (
          <p key={idx} className="text-charcoal/70 text-sm">
            • {desc}
          </p>
        ))}
      </div>
    </motion.div>
  )
}

interface DataSourceCardProps {
  name: string
  color: string
  items: string[]
  icon: string
}

function DataSourceCard({ name, color, items, icon }: DataSourceCardProps) {
  return (
    <div className={`rounded-xl p-4 border-l-4 ${color} bg-white/80 backdrop-blur-sm`}>
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-bold text-sm text-charcoal mb-2">{name}</h4>
      <div className="space-y-0.5">
        {items.map((item, idx) => (
          <p key={idx} className="text-xs text-charcoal/60">
            • {item}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="how-it-works" className="bg-cream py-24 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-black text-forest mb-4">
            How It Works
          </h2>
          <p className="text-charcoal/70 text-lg sm:text-xl max-w-2xl mx-auto">
            From a basic phone call to expert AI advice — in under 2 seconds
          </p>
        </motion.div>

        <div className="space-y-6">
          <FlowNode
            title="1. FARMER CALLS"
            description={['Calls 896 from any basic phone', 'No smartphone needed', 'Any language']}
            color="border-teal-500"
            bgColor="bg-teal-50"
            delay={0}
            icon="👨‍🌾"
          />

          <div className="flex justify-center">
            <ArrowDown className="text-charcoal/30" size={32} />
          </div>

          <FlowNode
            title="2. SARVAM AI VOICE AGENT"
            description={['STT to LLM Reasoning to TTS', 'Hindi slash Regional languages', 'Low-latency streaming']}
            color="border-purple-500"
            bgColor="bg-purple-50"
            delay={0.1}
            icon="🎙️"
          />

          <div className="flex justify-center">
            <ArrowDown className="text-charcoal/30" size={32} />
          </div>

          <FlowNode
            title="3. ORCHESTRATION ENGINE"
            description={['Node.js slash Python FastAPI', 'Conversation state management', 'Intent extraction', 'API fan-out to data sources']}
            color="border-blue-600"
            bgColor="bg-blue-50"
            delay={0.2}
            icon="⚙️"
          />

          <div className="flex justify-center">
            <ArrowDown className="text-charcoal/30" size={32} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <DataSourceCard
              name="AgriStack"
              color="border-green-500"
              items={['Farmer identity', 'Land records', 'PM-KISAN']}
              icon="🌱"
            />
            <DataSourceCard
              name="IMD slash OpenWx"
              color="border-blue-500"
              items={['7-day forecast', 'Rainfall data', 'Temperature']}
              icon="🌦️"
            />
            <DataSourceCard
              name="ICAR slash FASAL"
              color="border-amber-500"
              items={['Soil health', 'Crop calendar', 'Disease alerts']}
              icon="🧪"
            />
            <DataSourceCard
              name="Agmarknet"
              color="border-red-500"
              items={['Mandi prices', 'MSP updates', 'Market trends']}
              icon="📊"
            />
          </motion.div>

          <div className="flex justify-center">
            <ArrowDown className="text-charcoal/30" size={32} />
          </div>

          <FlowNode
            title="5. AI REASONING ENGINE (Mistral AI)"
            description={['Mistral Large for crop reasoning', 'Profitability scoring', 'Risk analysis', 'Seasonal timing optimization']}
            color="border-violet-600"
            bgColor="bg-violet-50"
            delay={0.4}
            icon="🧠"
          />

          <div className="flex justify-center">
            <ArrowDown className="text-charcoal/30" size={32} />
          </div>

          <FlowNode
            title="6. VOICE RESPONSE SYNTHESIS"
            description={['Sarvam TTS', 'Natural Hindi slash Marathi slash Telugu', 'Context-aware intonation']}
            color="border-emerald-500"
            bgColor="bg-emerald-50"
            delay={0.5}
            icon="🔊"
          />

          <div className="flex justify-center">
            <ArrowDown className="text-charcoal/30" size={32} />
          </div>

          <FlowNode
            title="7. FARMER RECEIVES ADVICE"
            description="Bhaiya, is season mein arhar daal lagao — MSP ₹7000/qtl hai aur mausam bhi anukool hai."
            color="border-forest"
            bgColor="bg-forest text-cream"
            delay={0.6}
            icon="✅"
          />

          <div className="flex justify-center">
            <div className="border-l-2 border-dashed border-charcoal/20 h-8" />
          </div>

          <FlowNode
            title="8. WEB DASHBOARD (Optional)"
            description={['Admin panel', 'Call logs and analytics', 'Dial-896 Simulator', 'Farmer profiles']}
            color="border-gray-400"
            bgColor="bg-gray-50"
            delay={0.7}
            icon="💻"
          />
        </div>
      </div>
    </section>
  )
}

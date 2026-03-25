'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react'

interface Message {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  timestamp: Date
}

export default function LiveAgent() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-50px' })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const startCall = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/conversations/start-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '896',
          language: 'hindi'
        })
      })

      const data = await response.json()
      setConversationId(data.conversation.id)
      setIsCallActive(true)

      setMessages([{
        id: '1',
        role: 'ASSISTANT',
        content: data.greeting,
        timestamp: new Date()
      }])
    } catch (error) {
      console.error('Failed to start call:', error)
      alert('Failed to connect. Make sure backend is running on port 8000')
    } finally {
      setIsLoading(false)
    }
  }

  const endCall = async () => {
    if (conversationId) {
      try {
        await fetch(`${API_URL}/api/conversations/end-call`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId })
        })
      } catch (error) {
        console.error('Failed to end call:', error)
      }
    }
    setIsCallActive(false)
    setConversationId(null)
    setMessages([])
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'USER',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/conversations/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          message: inputMessage,
          role: 'USER'
        })
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: data.assistantMessage.id,
        role: 'ASSISTANT',
        content: data.aiResponse,
        timestamp: new Date(data.assistantMessage.timestamp)
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        id: 'error',
        role: 'ASSISTANT',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="bg-charcoal py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-black text-cream mb-4">
            Try Live AI Agent
          </h2>
          <p className="text-cream/70 text-lg sm:text-xl max-w-2xl mx-auto">
            Experience real-time conversation with our Mistral AI-powered voice agent
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={headerInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-forest/20 backdrop-blur-lg rounded-3xl border border-gold/20 p-8 max-w-3xl mx-auto"
        >
          <div className="flex justify-center gap-4 mb-8">
            {!isCallActive ? (
              <button
                onClick={startCall}
                disabled={isLoading}
                className="flex items-center gap-3 bg-gold text-forest font-bold px-8 py-4 rounded-full hover:bg-gold/90 hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                <Phone size={24} />
                {isLoading ? 'Connecting...' : 'Start Call'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex items-center gap-2 bg-cream/10 text-cream border border-cream/30 font-semibold px-6 py-3 rounded-full hover:bg-cream/20 transition-all"
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                <button
                  onClick={endCall}
                  className="flex items-center gap-2 bg-red-500 text-white font-semibold px-6 py-3 rounded-full hover:bg-red-600 transition-all"
                >
                  <PhoneOff size={20} />
                  End Call
                </button>
              </>
            )}
          </div>

          {isCallActive && (
            <div className="space-y-6">
              <div className="bg-charcoal/50 rounded-2xl p-6 min-h-[400px] max-h-[500px] overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                        msg.role === 'USER'
                          ? 'bg-gold text-forest rounded-tr-sm'
                          : 'bg-emerald-500/20 text-emerald-300 rounded-tl-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1 opacity-70">
                        {msg.role === 'ASSISTANT' && <Volume2 size={14} />}
                        <span className="text-xs font-semibold">
                          {msg.role === 'USER' ? 'You' : 'KisanVaani AI'}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-emerald-500/20 text-emerald-300 rounded-2xl rounded-tl-sm px-5 py-3">
                      <div className="flex gap-2">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce delay-100">●</span>
                        <span className="animate-bounce delay-200">●</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message... (or speak)"
                  disabled={isLoading}
                  className="flex-1 bg-charcoal/50 text-cream border border-cream/20 rounded-full px-6 py-3 focus:outline-none focus:border-gold transition-colors placeholder-cream/40"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gold text-forest font-bold px-8 py-3 rounded-full hover:bg-gold/90 transition-all disabled:opacity-50"
                >
                  Send
                </button>
              </div>

              <p className="text-cream/40 text-xs text-center">
                Powered by Mistral AI • Real-time responses
              </p>
            </div>
          )}

          {!isCallActive && (
            <div className="text-center py-12">
              <p className="text-cream/60 mb-4">
                Click &quot;Start Call&quot; to begin a conversation with our AI agent
              </p>
              <p className="text-cream/40 text-sm">
                Backend server: {API_URL}
              </p>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          {[
            { icon: '🤖', title: 'Real AI', desc: 'Powered by Mistral Large' },
            { icon: '🎙️', title: 'Voice Ready', desc: 'STT/TTS simulation' },
            { icon: '⚡', title: 'Instant', desc: 'Sub-2s response time' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
              className="bg-cream/5 backdrop-blur-sm rounded-xl p-6 border border-cream/10 text-center"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-cream font-bold mb-1">{item.title}</h3>
              <p className="text-cream/60 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

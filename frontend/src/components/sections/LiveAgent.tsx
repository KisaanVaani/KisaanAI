'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Mic, MicOff, Phone, PhoneOff, Volume2, Loader2, Delete } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  timestamp: Date
}

// THE FIX: One explicit state machine. No boolean soup.
// ONLY this ref controls whether recognition should run.
type CallPhase = 'idle' | 'listening' | 'processing' | 'speaking'

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function LiveAgent() {
  // ─── UI State (drives rendering only) ─────────────────────────────────────
  const [isCallActive, setIsCallActive]     = useState(false)
  const [isMuted, setIsMuted]               = useState(false)
  const [messages, setMessages]             = useState<Message[]>([])
  const [dialNumber, setDialNumber]         = useState('')
  const [callDuration, setCallDuration]     = useState(0)
  const [language, setLanguage]             = useState('hi-IN')
  const [partialTranscript, setPartialTranscript] = useState('')
  const [currentTime, setCurrentTime]       = useState('')
  const [phase, setPhase]                   = useState<CallPhase>('idle') // drives UI badges

  // ─── Refs (synchronous — truth source for callbacks) ──────────────────────
  const phaseRef          = useRef<CallPhase>('idle') // THE ONE TRUE STATE
  const conversationIdRef = useRef<string | null>(null)
  const messagesRef       = useRef<Message[]>([])     // keeps messages in sync for callbacks
  const isMutedRef        = useRef(false)
  const languageRef       = useRef('hi-IN')
  const recognitionRef    = useRef<any>(null)
  const audioRef          = useRef<HTMLAudioElement | null>(null)
  const callTimerRef      = useRef<NodeJS.Timeout | null>(null)
  const submitTimeoutRef  = useRef<NodeJS.Timeout | null>(null)
  const transcriptBufRef  = useRef('')
  const messagesEndRef    = useRef<HTMLDivElement>(null)

  // Keep refs in sync with state
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])
  useEffect(() => { languageRef.current = language }, [language])

  // ─── Phase setter — always sets BOTH ref (sync) and state (async UI) ──────
  const setCallPhase = useCallback((p: CallPhase) => {
    console.log(`[Phase] ${phaseRef.current} → ${p}`)
    phaseRef.current = p
    setPhase(p)
  }, [])

  // ─── Start mic ────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    if (phaseRef.current !== 'listening') return // guard: only start if we INTEND to listen
    try {
      recognitionRef.current.lang = languageRef.current
      recognitionRef.current.start()
    } catch (e) {
      // already running — fine
    }
  }, [])

  // ─── Stop mic ──────────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    try { recognitionRef.current.abort() } catch (e) {}
  }, [])

  // ─── Clock ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    tick()
    const t = setInterval(tick, 60000)
    return () => clearInterval(t)
  }, [])

  // ─── Call timer ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isCallActive) {
      callTimerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000)
    } else {
      setCallDuration(0)
      if (callTimerRef.current) clearInterval(callTimerRef.current)
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current) }
  }, [isCallActive])

  // ─── Audio element (DOM-attached for autoplay policy) ──────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const el = document.createElement('audio')
    el.style.display = 'none'
    document.body.appendChild(el)
    audioRef.current = el
    return () => { try { document.body.removeChild(el) } catch (e) {} }
  }, [])

  // ─── Speech Recognition setup ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    const rec = new SR()
    rec.continuous     = true   // CONTINUOUS: keeps listening through natural pauses
    rec.interimResults = true
    rec.lang           = language
    recognitionRef.current = rec

    rec.onstart = () => {
      console.log('[Mic] started')
    }

    rec.onresult = (event: any) => {
      // Hard guard: if we're not supposed to be listening, discard entirely
      if (phaseRef.current !== 'listening') {
        console.log('[Mic] onresult ignored — phase is', phaseRef.current)
        return
      }
      if (isMutedRef.current) return

      let interimText = ''
      let finalChunk = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalChunk += t
        } else {
          interimText += t
        }
      }

      // Always show live transcript (interim + accumulated finals)
      setPartialTranscript((transcriptBufRef.current + ' ' + finalChunk + ' ' + interimText).trim())

      if (finalChunk.trim()) {
        transcriptBufRef.current = (transcriptBufRef.current + ' ' + finalChunk.trim()).trim()

        // Reset silence timer — wait 1.8s after the LAST final word before submitting
        // This lets the user pause and continue naturally
        if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current)
        submitTimeoutRef.current = setTimeout(() => {
          const toSubmit = transcriptBufRef.current.trim()
          transcriptBufRef.current = ''
          setPartialTranscript('')
          if (toSubmit.length > 2) {
            // Lock phase IMMEDIATELY before any async
            phaseRef.current = 'processing'
            setPhase('processing')
            stopListening()
            handleUserSubmit(toSubmit)
          }
          // if too short (noise), stay listening
        }, 1800) // 1.8s silence = natural end of utterance
      } else {
        // Interim — reset the silence timer while user is mid-sentence
        if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current)
      }
    }

    rec.onerror = (event: any) => {
      const err = event.error
      console.log('[Mic] error:', err)
      if (err === 'aborted' || err === 'no-speech') {
        // Expected — will be handled by onend
        return
      }
      // Real error — stay in processing/speaking, don't self-restart
    }

    rec.onend = () => {
      console.log('[Mic] ended — phase is', phaseRef.current)
      // With continuous=true, onend usually means a network/timeout disconnect
      // ONLY restart if we're still supposed to be listening
      if (phaseRef.current === 'listening' && !isMutedRef.current) {
        try { rec.start() } catch (e) { console.log('[Mic] restart failed:', e) }
      }
      // Any other phase: do nothing.
    }

    return () => {
      try { rec.abort() } catch (e) {}
    }
  }, [language]) // eslint-disable-line

  // ─── Play audio & transition phases ────────────────────────────────────────
  const playAudio = useCallback((base64Audio: string, shouldEndCallAfter: boolean) => {
    const audio = audioRef.current
    if (!audio || !base64Audio) {
      // No audio — go straight to listening
      setCallPhase('listening')
      startListening()
      return
    }

    setCallPhase('speaking')
    stopListening() // ensure mic is off while we speak

    try {
      const bin = atob(base64Audio)
      const bytes = new Uint8Array(bin.length)
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
      const blob = new Blob([bytes.buffer], { type: 'audio/wav' })
      audio.src = URL.createObjectURL(blob)
      audio.volume = 1.0
      audio.muted = false

      const onAudioDone = () => {
        console.log('[Audio] done')
        if (shouldEndCallAfter) {
          triggerEndCall()
          return
        }
        // Transition: speaking → listening
        setCallPhase('listening')
        startListening()
      }

      audio.onended = onAudioDone
      audio.onerror = () => {
        console.error('[Audio] error')
        setCallPhase('listening')
        startListening()
      }

      audio.play().catch(err => {
        console.error('[Audio] play() failed:', err.message)
        setCallPhase('listening')
        startListening()
      })
    } catch (err) {
      console.error('[Audio] exception:', err)
      setCallPhase('listening')
      startListening()
    }
  }, [startListening, stopListening]) // eslint-disable-line

  // ─── End call ──────────────────────────────────────────────────────────────
  const triggerEndCall = useCallback(() => {
    setCallPhase('idle')
    stopListening()
    if (audioRef.current) audioRef.current.pause()
    if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current)
    transcriptBufRef.current = ''
    conversationIdRef.current = null
    setIsCallActive(false)
    setIsMuted(false)
    setMessages([])
    setPartialTranscript('')
    setDialNumber('')
  }, [setCallPhase, stopListening])

  // ─── API call ──────────────────────────────────────────────────────────────
  const handleUserSubmit = useCallback(async (transcript: string) => {
    const userId = conversationIdRef.current
    if (!transcript.trim() || !userId) { setCallPhase('listening'); startListening(); return }

    // Phase is already 'processing' — confirmed by caller
    console.log('[Submit] →', transcript.substring(0, 60))

    const userMsg: Message = { id: Date.now().toString(), role: 'USER', content: transcript, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setPartialTranscript('')

    const historyForApi = [...messagesRef.current, userMsg].map(m => ({
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content
    }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          language: languageRef.current,
          userId,
          farmerId: 'farmer-001',
          history: historyForApi
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'ASSISTANT', content: data.reply, timestamp: new Date() }
      setMessages(prev => [...prev, aiMsg])

      // Transition: processing → speaking (or listening if no audio)
      playAudio(data.audio, !!data.endCall)

    } catch (err: any) {
      console.error('[Submit] error:', err.message)
      setMessages(prev => [...prev, {
        id: 'err', role: 'ASSISTANT',
        content: 'कुछ गड़बड़ हो गई। फिर बोलें।',
        timestamp: new Date()
      }])
      // On error, go back to listening
      setCallPhase('listening')
      startListening()
    }
  }, [playAudio, setCallPhase, startListening])

  // ─── Start call ────────────────────────────────────────────────────────────
  const startCall = async () => {
    if (dialNumber !== '896') { alert('Please dial 896 to connect to KisaanVaani.'); return }

    // Unlock audio context on first user gesture
    if (audioRef.current) {
      audioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
      audioRef.current.volume = 0.001
      audioRef.current.play().catch(() => {})
    }

    const convId = Date.now().toString()
    conversationIdRef.current = convId
    setIsCallActive(true)
    setCallPhase('processing') // block mic while greeting loads

    const placeholder = language === 'hi-IN'
      ? 'नमस्ते। किसान वाणी में आपका स्वागत है...'
      : language === 'kn-IN'
        ? 'ನಮಸ್ಕಾರ. ಕಿಸಾನ್ ವಾಣಿಗೆ ಸ್ವಾಗತ...'
        : 'Hello. Welcome to KisaanVaani...'

    setMessages([{ id: '0', role: 'ASSISTANT', content: placeholder, timestamp: new Date() }])

    try {
      const welcomePrompt = language === 'kn-IN' ? 'ನಮಸ್ಕಾರ' : language === 'hi-IN' ? 'नमस्ते' : 'Hello'
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: welcomePrompt, language, userId: convId, farmerId: 'farmer-001', history: [] })
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `HTTP ${res.status}`) }
      const data = await res.json()

      if (data.reply) setMessages([{ id: '1', role: 'ASSISTANT', content: data.reply, timestamp: new Date() }])
      playAudio(data.audio, !!data.endCall)

    } catch (err: any) {
      console.error('[startCall]', err.message)
      triggerEndCall()
      alert(`Failed to connect: ${err.message}`)
    }
  }

  // ─── Mute toggle ───────────────────────────────────────────────────────────
  const toggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    isMutedRef.current = next
    if (next) {
      stopListening()
    } else if (phaseRef.current === 'listening') {
      startListening()
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const formatDuration = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  // ─── Derived UI flags ──────────────────────────────────────────────────────
  const isListening  = phase === 'listening'
  const isLoading    = phase === 'processing'
  const isSpeaking   = phase === 'speaking'

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <section className="py-24 bg-forest relative overflow-hidden" id="demo">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-cream mb-4">Try Live AI Agent</h2>
          <p className="text-cream/80 text-lg">Experience real-time voice conversation with our agriculture assistant</p>
        </div>

        <motion.div className="max-w-[320px] mx-auto bg-charcoal rounded-[2.5rem] border-8 border-gray-900 shadow-2xl overflow-hidden h-[600px] relative flex flex-col">

          {/* Status bar */}
          <div className="bg-charcoal px-6 py-2 flex justify-between items-center text-cream/70 text-xs font-semibold z-20">
            <span suppressHydrationWarning>{currentTime}</span>
            <div className="flex gap-2"><SignalIcon /><BatteryIcon /></div>
          </div>

          {!isCallActive ? (
            /* ─── DIALER ─────────────────────────────────────────────────────── */
            <div className="flex-1 flex flex-col items-center justify-between p-6 bg-charcoal">
              <div className="w-full text-center mt-6 mb-4">
                <h2 className="text-3xl text-cream font-mono tracking-wider h-10 flex items-center justify-center">
                  {dialNumber || ''}
                </h2>
                <p className="text-gold mt-2">Dial 896 to reach KisaanVaani</p>
                <div className="flex justify-center gap-4 mt-6">
                  {(['hi-IN', 'kn-IN', 'en-IN'] as const).map(lang => (
                    <button key={lang} onClick={() => setLanguage(lang)}
                      className={`px-4 py-1 rounded-full text-sm border ${language === lang ? 'border-gold text-gold bg-gold/10' : 'border-cream/20 text-cream/60'}`}>
                      {lang === 'hi-IN' ? 'हिन्दी' : lang === 'kn-IN' ? 'ಕನ್ನಡ' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mt-2 mb-2">
                {[1,2,3,4,5,6,7,8,9,'*',0,'#'].map(num => (
                  <button key={num} onClick={() => dialNumber.length < 10 && setDialNumber(p => p + num.toString())}
                    className="bg-cream/5 hover:bg-cream/10 text-xl font-light text-cream rounded-full aspect-square flex items-center justify-center transition-colors h-14 w-14 mx-auto">
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center w-full max-w-[240px] mt-2 mb-4 px-4">
                <div className="w-16" />
                <button onClick={startCall}
                  className="bg-green-500 hover:bg-green-400 text-white rounded-full aspect-square w-16 flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-green-500/20">
                  <Phone size={24} />
                </button>
                <button onClick={() => setDialNumber(p => p.slice(0, -1))} disabled={!dialNumber}
                  className="w-16 flex items-center justify-center text-cream/50 hover:text-cream disabled:opacity-0">
                  <Delete size={24} />
                </button>
              </div>
            </div>

          ) : (
            /* ─── IN-CALL ────────────────────────────────────────────────────── */
            <div className="flex-1 flex flex-col bg-gradient-to-b from-charcoal to-forest/30">

              {/* Avatar & status */}
              <div className="pt-12 pb-6 px-6 flex flex-col items-center">
                <div className={`relative w-24 h-24 rounded-full flex items-center justify-center mb-4 border transition-all duration-300 ${
                  isSpeaking ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)] scale-105' : 'border-gold/30 bg-gold/20'
                }`}>
                  {isSpeaking && (
                    <>
                      <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-75" />
                      <div className="absolute -bottom-2 flex gap-1 items-end h-5 z-10 bg-charcoal/80 px-2 py-1 rounded-full border border-green-500/30">
                        {[100,200,300,400,500].map(d => (
                          <div key={d} className="w-1 bg-green-400 rounded-full" style={{ height: d % 300 === 0 ? 16 : d % 200 === 0 ? 12 : 8, animation: `bounce 0.8s infinite ${d}ms` }} />
                        ))}
                      </div>
                    </>
                  )}
                  <img
                    src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&w=400&q=80"
                    alt="KisaanVaani"
                    className={`w-full h-full object-cover rounded-full transition-transform duration-300 ${isSpeaking ? 'scale-110' : 'scale-100'}`}
                  />
                </div>
                <h2 className="text-2xl font-semibold text-cream">Kisaan Vaani</h2>
                <p className="text-cream/60 mt-1 font-mono">{formatDuration(callDuration)}</p>
                <div className="flex items-center gap-2 mt-2">
                  {isLoading ? (
                    <span className="text-gold text-sm flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Thinking...</span>
                  ) : isSpeaking ? (
                    <span className="text-green-400 text-sm flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Speaking...</span>
                  ) : isListening ? (
                    <span className="text-green-400 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Listening...
                    </span>
                  ) : (
                    <span className="text-cream/40 text-sm">Waiting...</span>
                  )}
                </div>
              </div>

              {/* Chat transcript */}
              <div
                className="flex-1 px-4 overflow-y-auto w-full flex flex-col mt-2 pb-32"
                ref={el => { if (el) el.scrollTop = el.scrollHeight }}
              >
                {messages.slice(-6).map(msg => (
                  <div key={msg.id} className={`mb-2 w-full flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[88%] rounded-2xl px-3 py-2 ${
                      msg.role === 'USER'
                        ? 'bg-emerald-500/20 text-white rounded-tr-sm border border-emerald-500/20'
                        : 'bg-gold/15 text-gold rounded-tl-sm border border-gold/15'
                    }`}>
                      <p className="text-[11px] font-medium mb-0.5 opacity-50">{msg.role === 'USER' ? 'You' : 'KisaanVaani'}</p>
                      <p className="text-xs leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Live user speech — always visible when speaking */}
              {(partialTranscript || phase === 'listening') && (
                <div className="absolute left-4 right-4 bottom-28 z-40">
                  <div className={`rounded-2xl px-4 py-2.5 transition-all border ${
                    partialTranscript
                      ? 'bg-emerald-950/90 border-emerald-500/40 shadow-lg shadow-emerald-900/30'
                      : 'bg-charcoal/60 border-cream/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                      <p className="text-xs text-emerald-300 leading-relaxed flex-1">
                        {partialTranscript || <span className="opacity-40 italic">Listening…</span>}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 px-8 flex justify-center gap-8 w-full bg-charcoal/95 rounded-t-3xl border-t border-cream/10 backdrop-blur-md z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
                <button onClick={toggleMute}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-cream/20 text-white' : 'bg-cream/5 text-white/70 hover:bg-cream/10'}`}
                  title={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                <button className="w-14 h-14 rounded-full bg-cream/5 text-white/70 flex items-center justify-center hover:bg-cream/10 transition-colors" title="Speaker">
                  <Volume2 size={22} />
                </button>
                <button onClick={triggerEndCall}
                  className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 active:scale-95 shadow-lg shadow-red-500/30 transition-all hover:scale-105"
                  title="End Call">
                  <PhoneOff size={22} />
                </button>
              </div>

            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

const SignalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/>
  </svg>
)

const BatteryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/>
  </svg>
)

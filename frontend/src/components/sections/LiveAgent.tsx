'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mic, MicOff, Phone, PhoneOff, Volume2, Loader2, Send } from 'lucide-react'

// Types
interface Message {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  timestamp: Date
}

// Add typing for window.SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function LiveAgent() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const conversationIdRef = useRef<string | null>(null)
  const isCallActiveRef = useRef(false)
  const isMutedRef = useRef(false)
  const isLoadingRef = useRef(false)


  
  // Voice & Chat interaction
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState('hi-IN') // Default to Hindi, can be kn-IN for Kannada
  const [partialTranscript, setPartialTranscript] = useState('')
  const [textInput, setTextInput] = useState('') // Fallback text input

  

    useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId])

  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive])

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted])

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading])

  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-50px' })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Audio & Speech specific refs
  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<HTMLAudioElement | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, partialTranscript])

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false; // Stop after a pause
        recognitionRef.current.interimResults = true; // Show results while talking
        recognitionRef.current.lang = language;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          let isFinal = false;
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
             currentTranscript += event.results[i][0].transcript;
             if (event.results[i].isFinal) isFinal = true;
          }
          
          if (isFinal) {
             setPartialTranscript('');
             const finalTranscript = currentTranscript.trim();
             if (finalTranscript.length > 0) {
                 // Call with ref to prevent closure bug
                 handleUserSubmit(finalTranscript, conversationIdRef.current);
             }
          } else {
             setPartialTranscript(currentTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
              setIsListening(false);
          }
        };

        recognitionRef.current.onend = () => {
          // AUTO RESTART if call is active, not muted, and not loading/speaking
          if (isCallActiveRef.current && !isMutedRef.current && !isLoadingRef.current) {
            try { 
                recognitionRef.current.start(); 
                setIsListening(true);
            } catch(e) {
                setIsListening(false);
            }
          } else {
            setIsListening(false);
          }
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch(e) {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.pause();
      }
    }
  }, [language]); // Re-init if language changes

  const toggleListening = () => {
    if (isMutedRef.current) return; // Don't listen if muted
    
    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
         try {
            recognitionRef.current.lang = language;
            recognitionRef.current.start();
         } catch(e) {
            console.error("Microphone start error:", e);
         }
      } else {
         alert("Speech recognition is not supported in this browser. Please use Chrome or Edge, or type your message.");
      }
    }
  }

  const startCall = async () => {
    try {
      if (audioContextRef.current) {
        audioContextRef.current.pause();
      }
      setIsLoading(true)
      const conversationId = Date.now().toString()
      setConversationId(conversationId)
      setIsCallActive(true)

      const startMessagePlaceholder = language === 'hi-IN' 
        ? "नमस्ते। किसान वाणी में आपका स्वागत है। मैं आपकी कैसी मदद कर सकता हूँ?" 
        : language === 'kn-IN'
          ? "ನಮಸ್ಕಾರ. ಕಿಸಾನ್ ವಾಣಿಗೆ ಸ್ವಾಗತ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
          : "Hello. Welcome to KisanVaani. How can I help you today?";

      setMessages([{
        id: '1',
        role: 'ASSISTANT',
        content: startMessagePlaceholder,
        timestamp: new Date()
      }])
      
      const welcomePrompt = language === 'kn-IN' ? "ನಮಸ್ಕಾರ" : language === 'hi-IN' ? "नमस्ते" : "Hello, how can you help me today?";

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transcript: welcomePrompt,
            language: language,
            userId: conversationId,
            farmerId: 'farmer-001'
          })
        })
        const data = await response.json()
        
        // Update placeholder with actual generated LLM intro message
        if (data.reply) {
          setMessages([{
            id: '1',
            role: 'ASSISTANT',
            content: data.reply,
            timestamp: new Date()
          }])
        }

        if (data.audio) {
           playAudio(data.audio);
        } else {
           setTimeout(() => {
             if (!isMutedRef.current && recognitionRef.current) toggleListening();
           }, 2000);
        }
      } catch(e) {
          console.error("API error", e);
          setTimeout(() => {
             if (!isMutedRef.current && recognitionRef.current) toggleListening();
          }, 2000);
      }
      
    } catch (error) {
      console.error('Failed to start call:', error)
      alert('Failed to start conversation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const endCall = async () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    if (audioContextRef.current) {
      audioContextRef.current.pause();
    }
    setIsCallActive(false)
    setIsListening(false)
    setConversationId(null)
    setMessages([])
    setPartialTranscript('')
    setIsLoading(false)
  }
  
  const playAudio = (base64Audio: string) => {
    if (!base64Audio) return;
    
    const src = `data:audio/mp3;base64,${base64Audio}`;
    const audio = new Audio(src);
    audioContextRef.current = audio;
    
    audio.onended = () => {
      // Auto resume listening when AI finishes speaking
      if (isCallActiveRef.current && !isMutedRef.current) {
         if (recognitionRef.current) {
            try {
               recognitionRef.current.start();
            } catch(e) {
               console.error("Auto-resume mic error", e);
            }
         }
      }
    };
    
    audio.play().catch(e => console.error("Audio playback failed", e));
  }

  const handleUserSubmit = async (transcript: string, activeId?: string | null) => {
    const idToUse = activeId || conversationIdRef.current;
    if (!transcript.trim() || !idToUse) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'USER',
      content: transcript,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setIsListening(false) // Stop listening while fetching
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcript,
          language: language,
          userId: idToUse,
          farmerId: 'farmer-001'
        })
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'ASSISTANT',
        content: data.reply,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      
      // If we got audio back, play it
      if (data.audio) {
          playAudio(data.audio);
      } else {
          // If no audio, just resume listening after a short delay
          setTimeout(() => {
              if (isCallActiveRef.current && !isMutedRef.current) toggleListening();
          }, 1000);
      }
      
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

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      handleUserSubmit(textInput);
      setTextInput('');
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
            Experience real-time voice conversation with our agriculture assistant
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={headerInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-forest/20 backdrop-blur-lg rounded-3xl border border-gold/20 p-8 max-w-3xl mx-auto relative"
        >
          {/* Language Selector */}
          <div className="absolute top-4 right-6 z-10">
            <select 
               value={language}
               onChange={(e) => setLanguage(e.target.value)}
               disabled={isCallActive}
               className="bg-charcoal/80 text-cream border border-gold/50 rounded-lg px-3 py-1 text-sm outline-none cursor-pointer"
             >
               <option value="hi-IN">Hindi (हिन्दी)</option>
               <option value="kn-IN">Kannada (ಕನ್ನಡ)</option>
               <option value="en-IN">English (India)</option>
             </select>
          </div>

          <div className="flex justify-center gap-4 mb-8 pt-6">
            {!isCallActive ? (
              <button
                onClick={startCall}
                disabled={isLoading}
                className="flex items-center gap-3 bg-gold text-forest font-bold px-8 py-4 rounded-full hover:bg-gold/90 hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                <Phone size={24} />
                {isLoading ? 'Connecting...' : 'Start Voice Call'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setIsMuted(!isMuted)
                    if (!isMuted && isListening && recognitionRef.current) {
                        try { recognitionRef.current.stop(); } catch(e) {}
                        setIsListening(false)
                    }
                  }}
                  className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-cream/10 text-cream border border-cream/30 hover:bg-cream/20'}`}
                >
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  {isMuted ? 'Muted' : 'Mute'}
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
          
          {/* Status Indicator for listening / processing */}
          {isCallActive && (
              <div className="flex justify-center mb-4 min-h-[30px]">
                 {isLoading ? (
                     <div className="flex items-center gap-2 text-gold animate-pulse">
                         <Loader2 size={16} className="animate-spin" />
                         <span className="text-sm font-medium">Processing & Speaking...</span>
                     </div>
                 ) : isListening ? (
                     <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                         <Mic size={16} />
                         <span className="text-sm font-medium">Listening... Speak now</span>
                     </div>
                 ) : !isMuted ? (
                     <button onClick={toggleListening} className="flex items-center gap-2 text-cream/60 hover:text-white transition-colors bg-cream/5 px-4 py-1.5 rounded-full">
                         <Mic size={16} />
                         <span className="text-sm">Tap to speak manually</span>
                     </button>
                 ) : (
                     <div className="flex items-center gap-2 text-red-400">
                         <MicOff size={16} />
                         <span className="text-sm">Microphone is muted</span>
                     </div>
                 )}
              </div>
          )}

          {isCallActive && (
            <div className="space-y-6">
              <div className="bg-charcoal/50 rounded-2xl p-6 min-h-[350px] max-h-[450px] overflow-y-auto">
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
                
                {/* Temporary partial transcript being spoken right now */}
                {partialTranscript && (
                  <div className="flex justify-end mb-4 opacity-70">
                    <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-gold/50 text-forest rounded-tr-sm">
                       <p className="text-sm italic">{partialTranscript}</p>
                       <div className="flex gap-1 mt-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-forest animate-bounce"></span>
                           <span className="w-1.5 h-1.5 rounded-full bg-forest animate-bounce" style={{animationDelay: '0.1s'}}></span>
                           <span className="w-1.5 h-1.5 rounded-full bg-forest animate-bounce" style={{animationDelay: '0.2s'}}></span>
                       </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Fallback Text Input */}
              <div className="flex gap-2 items-center bg-charcoal/30 p-2 rounded-full border border-cream/10">
                 <input 
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                    disabled={isLoading}
                    placeholder="Prefer to type? Enter message here..."
                    className="flex-1 bg-transparent text-cream px-4 py-2 outline-none text-sm placeholder-cream/40"
                 />
                 <button 
                    onClick={handleTextSubmit}
                    disabled={isLoading || !textInput.trim()}
                    className="bg-gold text-forest p-2 rounded-full hover:bg-gold/80 disabled:opacity-50 transition-colors"
                 >
                    <Send size={18} />
                 </button>
              </div>

              <p className="text-cream/40 text-xs text-center">
                Powered by Mistral AI • Speak naturally or type below
              </p>
            </div>
          )}

          {!isCallActive && (
            <div className="text-center py-12">
              <p className="text-cream/60 mb-4">
                Click "Start Voice Call" and simply start talking naturally
              </p>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          {[
            { icon: '🤖', title: 'Real AI', desc: 'Powered by Mistral Large' },
            { icon: '🎙️', title: 'Voice Native', desc: 'Auto Speech-to-Text & Speech' },
            { icon: '🌍', title: 'Multi-lingual', desc: 'Hindi, Kannada, English' }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
              className="bg-cream/5 backdrop-blur-sm rounded-xl p-6 border border-cream/10 text-center"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-cream font-bold mb-1">{item.title}</h3>
              <p className="text-cream/60 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

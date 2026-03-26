'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useInView } from 'framer-motion'
import { Mic, MicOff, Phone, PhoneOff, Volume2, Loader2, Send, Delete } from 'lucide-react'

// Types
interface Message {
  id: string
  role: 'USER' | 'ASSISTANT'
  content: string
  timestamp: Date
}

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
  
  // Numpad variables
  const [dialNumber, setDialNumber] = useState('')
  const [callDuration, setCallDuration] = useState(0)
  
  const conversationIdRef = useRef<string | null>(null)
  const isCallActiveRef = useRef(false)
  const isMutedRef = useRef(false)
  const isLoadingRef = useRef(false)
  const isSpeakingRef = useRef(false) // PREVENTS LISTENING TO OWN VOICE

  // Voice & Chat interaction
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false) // ACTUAL STATE FOR UI
  const [language, setLanguage] = useState('hi-IN')
  const [partialTranscript, setPartialTranscript] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  
  // Smart listening window
  const finalTranscriptBufferRef = useRef('')
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const audioContextRef = useRef<HTMLAudioElement | null>(null)
  const callTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize audio element on mount - MUST be in DOM to produce sound
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      const audio = document.createElement('audio');
      audio.style.display = 'none';
      document.body.appendChild(audio);
      audioContextRef.current = audio;
      console.log('✅ Audio element created and added to DOM');
    }
    return () => {
      if (audioContextRef.current && audioContextRef.current.parentNode) {
        try {
          audioContextRef.current.parentNode.removeChild(audioContextRef.current);
        } catch(e) {}
      }
    };
  }, []);

  useEffect(() => { conversationIdRef.current = conversationId; }, [conversationId])
  useEffect(() => { isCallActiveRef.current = isCallActive; }, [isCallActive])
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted])
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Comment out auto-scroll - don't auto-scroll on new messages
  // useEffect(() => {
  //   scrollToBottom()
  // }, [messages, partialTranscript])

  // Update clock time on client only (fixes hydration mismatch)
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  // Call Duration Timer
  useEffect(() => {
    if (isCallActive) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      setCallDuration(0)
      if (callTimerRef.current) clearInterval(callTimerRef.current)
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current)
    }
  }, [isCallActive])

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true; // Use continuous to avoid stopping too early
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          if (isSpeakingRef.current) return; // IGNORE OWN VOICE

          let currentTranscript = '';
          let isFinal = false;
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
             currentTranscript += event.results[i][0].transcript;
             if (event.results[i].isFinal) isFinal = true;
          }
          
          if (isFinal) {
             setPartialTranscript('');
             finalTranscriptBufferRef.current += ' ' + currentTranscript.trim();
             
             // Smart context delay - wait 2.5s to see if they continue speaking
             if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
             
             submitTimeoutRef.current = setTimeout(() => {
                 const finalToSubmit = finalTranscriptBufferRef.current.trim();
                 if (finalToSubmit.length > 0) {
                     handleUserSubmit(finalToSubmit, conversationIdRef.current);
                 }
                 finalTranscriptBufferRef.current = ''; // Reset buffer
             }, 2500); // 2.5 second natural pause window
             
          } else {
             setPartialTranscript(finalTranscriptBufferRef.current + ' ' + currentTranscript);
             
             // Reset the timeout if they explicitly keep talking BEFORE the timeout hits
             if (submitTimeoutRef.current) {
                 clearTimeout(submitTimeoutRef.current);
             }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
              setIsListening(false);
          }
        };

        recognitionRef.current.onend = () => {
          if (isCallActiveRef.current && !isMutedRef.current && !isLoadingRef.current && !isSpeakingRef.current) {
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
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    }
  }, [language]); 

  const handleDial = (num: string) => {
    if (dialNumber.length < 10) setDialNumber(prev => prev + num)
  }
  
  const handleBackspace = () => {
    setDialNumber(prev => prev.slice(0, -1))
  }

  const toggleListening = useCallback(() => {
    if (isMutedRef.current || isSpeakingRef.current) return;
    
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
      }
    }
  }, [isListening, language]);

  const startCall = async () => {
    if (dialNumber !== '896') {
      alert('Please dial 896 to connect to KisaanVaani.');
      return;
    }

    try {
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
      
      if (data.reply) {
        setMessages([{
          id: '1',
          role: 'ASSISTANT',
          content: data.reply,
          timestamp: new Date()
        }])
      }

      if (data.audio) {
         playAudio(data.audio, data.endCall);
      } else {
         setTimeout(() => {
             if (data.endCall) {
                 endCall();
             } else if (!isMutedRef.current && recognitionRef.current) {
                 toggleListening();
             }
         }, 2000);
      }
      
    } catch (error) {
      alert('Failed to start conversation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const endCall = useCallback(async () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
    if (audioContextRef.current) {
      audioContextRef.current.pause();
    }
    if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    
    setIsCallActive(false)
    setIsListening(false)
    setConversationId(null)
    setPartialTranscript('')
    setIsLoading(false)
    finalTranscriptBufferRef.current = ''
    setDialNumber('') // Reset dialer as well
  }, [])
  
  const playAudio = useCallback((base64Audio: string, shouldEndCall: boolean = false) => {
    if (!base64Audio) {
      console.error('❌ No audio data');
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      return;
    }
    
    console.log('🔊 playAudio called, size:', Math.round(base64Audio.length / 1024), 'KB');
    isSpeakingRef.current = true;
    setIsSpeaking(true);
    
    if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
    }

    try {
      // Decode base64 properly
      const binaryStr = atob(base64Audio);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      
      // Create blob and URL
      const blob = new Blob([bytes.buffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      console.log('🔊 Blob URL created:', audioUrl.substring(0, 50));
      
      // Get or create audio element
      let audio = audioContextRef.current;
      if (!audio) {
        console.log('🔊 Creating new audio element');
        audio = new Audio();
      }
      
      // Reset and configure
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1.0;
      audio.muted = false;
      
      console.log(`🔊 Audio config: volume=${audio.volume}, muted=${audio.muted}`);
      
      // Set up event handlers
      const onEnded = () => {
        console.log('🔊 Audio ended');
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        if (shouldEndCall) {
           endCall();
        } else if (isCallActiveRef.current && !isMutedRef.current && recognitionRef.current) {
           try {
             recognitionRef.current.start();
             console.log('🔊 Listening resumed');
           } catch(e) {console.error('Resume listen error:', e);}
        }
      };
      
      const onError = (e: any) => {
        console.error('❌ Audio error:', e?.message || e);
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        if (isCallActiveRef.current && !isMutedRef.current && recognitionRef.current) {
           try { recognitionRef.current.start(); } catch(e) {}
        }
      };
      
      audio.onended = onEnded;
      audio.onerror = onError;
      
      // Set source and play - CRITICAL: use attribute to ensure it persists
      audio.src = audioUrl;
      
      console.log('🔊 Calling play()...');
      const playPromise = audio.play();
      
      if (playPromise) {
        playPromise
          .then(() => {
            console.log('✅✅✅ AUDIO PLAYING NOW ✅✅✅');
          })
          .catch((error: any) => {
            console.error('❌ Play failed:', error.name, '-', error.message);
            isSpeakingRef.current = false;
            setIsSpeaking(false);
          });
      }
    } catch (error) {
      console.error('❌ Error in playAudio:', error);
      isSpeakingRef.current = false;
      setIsSpeaking(false);
    }
  }, [endCall]);

  const handleUserSubmit = useCallback(async (transcript: string, activeId?: string | null) => {
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
    setIsListening(false) 
    
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
          farmerId: 'farmer-001',
          history: [...messages, userMessage].map((m) => ({
            role: m.role.toLowerCase(),
            content: m.content
          }))
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ API Error:', data.error);
        throw new Error(data.error || 'API request failed');
      }

      console.log('✅ API Response:', { hasAudio: !!data.audio, audioLength: data.audio?.length, endCall: data.endCall });

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'ASSISTANT',
        content: data.reply,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      
      if (data.audio) {
          console.log('🔊 Audio received, calling playAudio');
          playAudio(data.audio, data.endCall);
      } else {
          console.log('⚠️ No audio in response, waiting before resuming listen');
          setTimeout(() => {
              if (data.endCall) {
                  endCall();
              } else if (isCallActiveRef.current && !isMutedRef.current) {
                  toggleListening();
              }
          }, 1000);
      }
      
    } catch (error) {
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
  }, [language, playAudio, endCall, toggleListening])

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <section className="py-24 bg-forest relative overflow-hidden" id="demo">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif text-cream mb-4">Try Live AI Agent</h2>
          <p className="text-cream/80 text-lg">Experience real-time voice conversation with our agriculture assistant</p>
        </div>

        <motion.div className="max-w-[320px] mx-auto bg-charcoal rounded-[2.5rem] border-8 border-gray-900 shadow-2xl overflow-hidden h-[600px] relative flex flex-col">
          
          {/* Top Status Bar (Phone Look) */}
          <div className="bg-charcoal px-6 py-2 flex justify-between items-center text-cream/70 text-xs font-semibold z-20">
            <span suppressHydrationWarning>{currentTime}</span>
            <div className="flex gap-2">
              <SignalIcon />
              <BatteryIcon />
            </div>
          </div>

          {!isCallActive ? (
            /* =========================================================
                                DIALER SCREEN
               ========================================================= */
            <div className="flex-1 flex flex-col items-center justify-between p-6 bg-charcoal">
              <div className="w-full text-center mt-6 mb-4">
                 <h2 className="text-3xl text-cream font-mono tracking-wider h-10 flex items-center justify-center">
                    {dialNumber || ''}
                 </h2>
                 <p className="text-gold mt-2">Dial 896 to reach KisaanVaani</p>
                 
                 <div className="flex justify-center gap-4 mt-6">
                    <button 
                      onClick={() => setLanguage('hi-IN')}
                      className={`px-4 py-1 rounded-full text-sm border ${language === 'hi-IN' ? 'border-gold text-gold bg-gold/10' : 'border-cream/20 text-cream/60'}`}
                    >हिन्दी</button>
                    <button 
                      onClick={() => setLanguage('kn-IN')}
                      className={`px-4 py-1 rounded-full text-sm border ${language === 'kn-IN' ? 'border-gold text-gold bg-gold/10' : 'border-cream/20 text-cream/60'}`}
                    >ಕನ್ನಡ</button>
                    <button 
                      onClick={() => setLanguage('en-IN')}
                      className={`px-4 py-1 rounded-full text-sm border ${language === 'en-IN' ? 'border-gold text-gold bg-gold/10' : 'border-cream/20 text-cream/60'}`}
                    >English</button>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mt-2 mb-2">
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map((num) => (
                    <button 
                      key={num} 
                      onClick={() => handleDial(num.toString())}
                      className="bg-cream/5 hover:bg-cream/10 text-xl font-light text-cream rounded-full aspect-square flex items-center justify-center transition-colors h-14 w-14 mx-auto"
                    >
                      {num}
                    </button>
                 ))}
              </div>
              
              <div className="flex justify-between items-center w-full max-w-[240px] mt-2 mb-4 px-4">
                 <div className="w-16"></div> {/* Spacer */}
                 <button 
                    onClick={startCall}
                    className="bg-green-500 hover:bg-green-400 text-white rounded-full aspect-square w-16 flex items-center justify-center transition-transform hover:scale-105 shadow-lg shadow-green-500/20"
                 >
                    <Phone size={24} />
                 </button>
                 <button 
                    onClick={handleBackspace}
                    disabled={!dialNumber}
                    className="w-16 flex items-center justify-center text-cream/50 hover:text-cream disabled:opacity-0"
                 >
                    <Delete size={24} />
                 </button>
              </div>
            </div>
          ) : (
            /* =========================================================
                                IN-CALL SCREEN
               ========================================================= */
            <div className="flex-1 flex flex-col bg-gradient-to-b from-charcoal to-forest/30">
              
              {/* Call Header */}
              <div className="pt-12 pb-6 px-6 flex flex-col items-center">
                 <div className={`relative w-24 h-24 rounded-full flex items-center justify-center mb-4 border transition-all duration-300 ${
                     isSpeaking ? 'border-green-400 shadow-[0_0_20px_rgba(74,222,128,0.5)] scale-105' : 'border-gold/30 shadow-gold/10 bg-gold/20'
                 }`}>
                    {isSpeaking && (
                        <>
                            <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-75"></div>
                            {/* Sound waves visualization representing "mouth moving" */}
                            <div className="absolute -bottom-2 flex gap-1 items-end h-5 z-10 bg-charcoal/80 px-2 py-1 rounded-full border border-green-500/30">
                                <div className="w-1 bg-green-400 rounded-full animate-[bounce_0.8s_infinite_100ms] h-2"></div>
                                <div className="w-1 bg-green-400 rounded-full animate-[bounce_0.8s_infinite_200ms] h-4"></div>
                                <div className="w-1 bg-green-400 rounded-full animate-[bounce_0.8s_infinite_300ms] h-3"></div>
                                <div className="w-1 bg-green-400 rounded-full animate-[bounce_0.8s_infinite_400ms] h-4"></div>
                                <div className="w-1 bg-green-400 rounded-full animate-[bounce_0.8s_infinite_500ms] h-2"></div>
                            </div>
                        </>
                    )}
                    <img 
                        src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&w=400&q=80" 
                        alt="Farmer" 
                        className={`w-full h-full object-cover rounded-full transition-transform duration-300 ${isSpeaking ? 'scale-110' : 'scale-100'}`}
                    />
                 </div>
                 <h2 className="text-2xl font-semibold text-cream">Kisaan Vaani</h2>
                 <p className="text-cream/60 mt-1 font-mono">{formatDuration(callDuration)}</p>
                 
                 <div className="flex items-center gap-2 mt-2">
                    {isLoading || isSpeaking ? (
                       <span className="text-gold text-sm flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin" /> 
                          {isSpeaking ? "Speaking..." : "Thinking..."}
                       </span>
                    ) : isListening ? (
                       <span className="text-green-400 text-sm flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 flex items-center justify-center animate-pulse"></span>
                          Listening...
                       </span>
                    ) : (
                       <span className="text-cream/40 text-sm">Waiting...</span>
                    )}
                 </div>
              </div>

              {/* Live Transcripts (Small Chat Box) — pb-28 leaves room for pinned controls */}
              <div className="flex-1 px-6 overflow-y-auto w-full custom-scrollbar flex flex-col opacity-80 mt-4 pb-28">
                 {[...messages].reverse().slice(0, 3).reverse().map((msg, idx) => (
                    <div key={msg.id} className={`mb-3 w-full flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                          msg.role === 'USER' 
                          ? 'bg-cream/10 text-white rounded-tr-sm border border-cream/5' 
                          : 'bg-gold/10 text-gold rounded-tl-sm border border-gold/10'
                       }`}>
                          <p className="text-xs leading-relaxed">{msg.content}</p>
                       </div>
                    </div>
                 ))}
                 
                 {partialTranscript && (
                    <div className="flex justify-end mb-3">
                       <div className="max-w-[85%] bg-cream/10 text-white border border-cream/5 rounded-2xl rounded-tr-sm px-4 py-2">
                          <p className="text-xs italic">{partialTranscript}</p>
                       </div>
                    </div>
                 )}
                 <div ref={messagesEndRef} />
              </div>

              {/* Phone Controls — ALWAYS PINNED TO BOTTOM with z-50, never hidden */}
              <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 px-8 flex justify-center gap-8 w-full bg-charcoal/95 rounded-t-3xl border-t border-cream/10 backdrop-blur-md z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.4)]">
                 <button 
                    onClick={() => {
                       setIsMuted(!isMuted);
                       if (!isMuted && isListening && recognitionRef.current) recognitionRef.current.stop();
                       if (isMuted && !isListening && recognitionRef.current) {
                           try { recognitionRef.current.start(); } catch(e){}
                       }
                    }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                       isMuted ? 'bg-cream/20 text-white' : 'bg-cream/5 text-white/70 hover:bg-cream/10'
                    }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                 >
                    {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                 </button>
                 
                 <button 
                    onClick={() => {}}
                     className="w-14 h-14 rounded-full bg-cream/5 text-white/70 flex items-center justify-center hover:bg-cream/10 transition-colors"
                     title="Speaker"
                 >
                    <Volume2 size={22} />
                 </button>

                  {/* RED END CALL — always clickable, always on top */}
                 <button 
                    onClick={endCall}
                    className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 active:scale-95 shadow-lg shadow-red-500/30 transition-all hover:scale-105"
                    title="End Call"
                 >
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

// Minimal UI Icons
const SignalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/></svg>
)

const BatteryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="10" x="2" y="7" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/></svg>
)

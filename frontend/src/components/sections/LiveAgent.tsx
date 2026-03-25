"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Loader2, Phone, PhoneOff } from "lucide-react";
import { motion } from "framer-motion";

type Language = "en-IN" | "hi-IN" | "kn-IN";

export default function LiveAgent() {
  const [isCalling, setIsCalling] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("Hi! I am Kisaan AI. How can I assist you with your farming today?");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en-IN");

  // Use refs for speech APIs to avoid re-renders
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isRecognitionActiveRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Initialize Speech Synthesis
    if (typeof window !== "undefined") {
      synthesisRef.current = window.speechSynthesis;
      
      console.log("[Init] Speech Synthesis initialized");
      
      // Force load voices
      const loadVoices = () => {
        if (synthesisRef.current) {
          const voices = synthesisRef.current.getVoices();
          console.log(`[Init] Voices loaded: ${voices.length}`);
          
          if (voices.length === 0) {
            console.warn("[Init] No voices yet, scheduling retry...");
            setTimeout(loadVoices, 100);
          }
        }
      };
      
      // Load voices immediately
      loadVoices();
      
      // Also listen for voiceschanged event
      if (synthesisRef.current?.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = () => {
          console.log("[Init] onvoiceschanged event fired, voices now available");
        };
      }
      
      // Initialize Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = selectedLanguage;

        recognitionRef.current.onstart = () => {
          isRecognitionActiveRef.current = true;
          setIsListening(true);
        };

        recognitionRef.current.onresult = async (event: any) => {
          const currentText = event.results[0][0].transcript;
          setTranscript(currentText);
          isRecognitionActiveRef.current = false;
          setIsListening(false);
          await handleAudioSubmit(currentText);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          isRecognitionActiveRef.current = false;
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          isRecognitionActiveRef.current = false;
          setIsListening(false);
        };
      } else {
        console.warn("Speech Recognition API not supported in this browser.");
      }
    }
  }, [selectedLanguage]);

  const handleStartCall = () => {
    setIsCalling(true);
    isRecognitionActiveRef.current = false;
    
    // Prime the speech synthesis engine on user click
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      const dummy = new SpeechSynthesisUtterance('');
      dummy.volume = 0;
      window.speechSynthesis.speak(dummy);
    }
    
    playAudio(aiResponse, null); // Intro greeting using fallback
  };

  const handleEndCall = () => {
    setIsCalling(false);
    setIsListening(false);
    setIsSpeaking(false);
    isRecognitionActiveRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      }
    }
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const startListening = () => {
    if (recognitionRef.current && isCalling && !isRecognitionActiveRef.current) {
      if(synthesisRef.current?.speaking){
        synthesisRef.current.cancel();
        setIsSpeaking(false);
      }
      
      // Prime the speech synthesis engine on user click to bypass autoplay restrictions
      if ('speechSynthesis' in window) {
         const dummy = new SpeechSynthesisUtterance('');
         dummy.volume = 0;
         window.speechSynthesis.speak(dummy);
      }

      try {
        isRecognitionActiveRef.current = true;
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        isRecognitionActiveRef.current = false;
      }
    }
  };

  const handleAudioSubmit = async (text: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transcript: text,
          language: selectedLanguage 
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setAiResponse(data.reply);
        // Play audio with small delay
        setTimeout(() => {
          playAudio(data.reply, data.audio);
        }, 100);
      } else {
         setAiResponse("Sorry, I could not understand that.");
         setTimeout(() => {
           playAudio("Sorry, I could not understand that.", null);
         }, 100);
      }
    } catch (error) {
       console.error("Backend error", error);
       setAiResponse("There was an error connecting to Kisaan AI.");
       setTimeout(() => {
         playAudio("There was an error connecting to Kisaan AI.", null);
       }, 100);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = async (text: string, audioBase64: string | null) => {
    console.log("[Audio] playAudio called, hasAudio:", !!audioBase64);
    
    // If we have Sarvam audio, play it
    if (audioBase64) {
      try {
        setIsSpeaking(true);
        const audioUrl = `data:audio/wav;base64,${audioBase64}`;
        
        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        
        audioRef.current.onplay = () => {
          console.log("[Audio] ✓ Audio playing through Sarvam");
          setIsSpeaking(true);
        };
        
        audioRef.current.onended = () => {
          console.log("[Audio] ✓ Audio finished");
          setIsSpeaking(false);
        };
        
        audioRef.current.onerror = (e) => {
          console.error("[Audio] Error playing audio:", e);
          setIsSpeaking(false);
          // Fallback to browser speech
          fallbackToWebSpeech(text);
        };
        
        audioRef.current.src = audioUrl;
        await audioRef.current.play();
        console.log("[Audio] ✓ Sarvam audio started playing");
        
      } catch (error) {
        console.error("[Audio] Error with Sarvam audio:", error);
        setIsSpeaking(false);
        // Fallback to browser speech
        fallbackToWebSpeech(text);
      }
    } else {
      // Fallback to browser Web Speech API
      fallbackToWebSpeech(text);
    }
  };

  const fallbackToWebSpeech = (text: string) => {
    console.log("[Speech Fallback] Using browser Web Speech API");
    speak(text);
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.error("[Speech] Synthesis API not available");
      return;
    }

    const synth = window.speechSynthesis;
    console.log(`[Speech] Starting speech synthesis. Language: ${selectedLanguage}, Text length: ${text.length}`);

    try {
      // Immediately set speaking state
      setIsSpeaking(true);

      // Clear any pending speech (crucial for some browsers)
      console.log("[Speech] Canceling any current speech");
      synth.cancel();

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Store in global window object to prevent Chrome garbage collection bug
      (window as any)._currentUtterance = utterance;
      
      // Get available voices
      const voices = synth.getVoices();
      console.log(`[Speech] Total available voices: ${voices.length}`);
      
      if (voices.length === 0) {
        console.warn("[Speech] No voices available yet, checking again in 500ms...");
        setTimeout(() => speak(text), 500);
        return;
      }
      
      // Find best voice for language
      let selectedVoice = null;
      const langPrefix = selectedLanguage.split('-')[0]; // 'en', 'hi', 'kn'
      
      // Try exact match, then rough language match, then name match
      selectedVoice = voices.find(v => v.lang === selectedLanguage) || 
                      voices.find(v => v.lang.startsWith(langPrefix)) ||
                      voices.find(v => v.name.toLowerCase().includes(langPrefix));
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang || selectedLanguage;
        console.log(`[Speech] ✓ Using voice: ${selectedVoice.name} (${utterance.lang})`);
      } else {
        utterance.lang = selectedLanguage;
        console.warn(`[Speech] ⚠ No matching voice found for ${selectedLanguage}, relying on OS default.`);
      }
      
      // Apply sensible settings
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Set event handlers
      utterance.onstart = () => {
        console.log("[Speech] ✓ onstart - Audio is now playing through speakers");
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        console.log("[Speech] ✓ onend - Audio finished playing");
        setIsSpeaking(false);
      };

      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        console.error(`[Speech] ✗ Error event during playback:`, event);
        setIsSpeaking(false);
      };

      // Slight delay after synth.cancel() ensures the new utterance is queued cleanly
      setTimeout(() => {
        console.log("[Speech] Triggering synth.speak()");
        synth.speak(utterance);
        
        // Secondary fallback for Chrome bug: resume periodically
        const resumeInterval = setInterval(() => {
          if (!synth.speaking) {
             clearInterval(resumeInterval);
          } else {
             synth.resume();
          }
        }, 5000);
        
        utterance.addEventListener('end', () => clearInterval(resumeInterval));
        utterance.addEventListener('error', () => clearInterval(resumeInterval));
      }, 50);

    } catch (error) {
      console.error("[Speech] ✗ Exception in speak function:", error);
      setIsSpeaking(false);
    }
  };

  return (
    <section className="py-20 bg-gray-50 flex items-center justify-center min-h-[500px]" id="live-agent">
      <div className="max-w-2xl w-full mx-auto px-4 sm:px-6">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          <div className="bg-green-600 p-6 text-white text-center flex flex-col items-center gap-3">
             <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Volume2 className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold">Kisaan AI Voice Agent</h2>
             <p className="text-green-100 text-sm">Real-time agricultural assistant</p>
          </div>

          <div className="p-8 pb-10 flex flex-col items-center gap-6">
            
            {/* Language Selection */}
            <div className="w-full flex gap-2 justify-center flex-wrap">
              <button
                onClick={() => setSelectedLanguage("en-IN")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedLanguage === "en-IN"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setSelectedLanguage("hi-IN")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedLanguage === "hi-IN"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                onClick={() => setSelectedLanguage("kn-IN")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedLanguage === "kn-IN"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                ಕನ್ನಡ (Kannada)
              </button>
            </div>

            {/* Response Display */}
            <div className="h-40 w-full flex items-center justify-center p-4 bg-gray-50 rounded-xl overflow-hidden relative border text-center">
               {isProcessing ? (
                   <div className="flex flex-col items-center gap-2 text-green-600">
                     <Loader2 className="w-8 h-8 animate-spin" />
                     <span className="text-sm font-medium">Processing your request...</span>
                   </div>
               ) : isSpeaking ? (
                   <div className="flex flex-col items-center gap-3">
                     <div className="flex gap-1">
                       {[...Array(4)].map((_, i) => (
                         <div
                           key={i}
                           className="w-1 bg-green-600 rounded-full animate-pulse"
                           style={{
                             height: `${20 + i * 8}px`,
                             animationDelay: `${i * 100}ms`
                           }}
                         />
                       ))}
                     </div>
                     <span className="text-xs text-green-600 font-semibold">Speaking...</span>
                   </div>
               ) : (
                   <p className="text-gray-700 text-lg font-medium italic">"{aiResponse}"</p>
               )}
            </div>

            {/* Transcript Display */}
            <div className="text-sm text-gray-500 mb-2 font-medium bg-gray-100 px-4 py-1 rounded-full text-center max-w-full">
               {transcript ? `You said: "${transcript}"` : "Press microphone to speak"}
            </div>

            <div className="flex items-center gap-6">
              {!isCalling ? (
                <button 
                  onClick={handleStartCall}
                  className="bg-green-600 hover:bg-green-700 text-white rounded-full p-5 shadow-lg shadow-green-200 transition-all flex items-center gap-3 pr-8 w-48 justify-center"
                >
                  <Phone className="w-6 h-6" />
                  <span className="font-semibold text-lg">Start Call</span>
                </button>
              ) : (
                <>
                   <button 
                     onClick={handleEndCall}
                     className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg shadow-red-200 transition-all flex items-center gap-2 pr-6"
                   >
                     <PhoneOff className="w-6 h-6" />
                     <span className="font-semibold">End Call</span>
                   </button>

                   <button 
                     onMouseDown={startListening}
                     className={`${isListening ? 'bg-orange-500 shadow-orange-200 scale-110' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'} text-white rounded-full p-6 shadow-xl transition-all relative`}
                   >
                     {isListening ? (
                         <>
                         <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-60"></div>
                         <Mic className="w-8 h-8 relative z-10" />
                         </>
                     ) : (
                         <MicOff className="w-8 h-8" />
                     )}
                   </button>
                </>
              )}
            </div>

            {/* Instructions */}
            <p className="text-xs text-gray-400 mt-4 max-w-sm text-center">
                {isCalling ? "🎤 Press & hold the microphone button to speak. Release to send. Select your preferred language above." : "🎯 Start a call to enable voice interaction."}
            </p>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

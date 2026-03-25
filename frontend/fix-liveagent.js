const fs = require('fs');
const filePath = 'src/components/sections/LiveAgent.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// Add refs for state variables to fix closures
if (!code.includes('const conversationIdRef = useRef')) {
    code = code.replace(
      "const [conversationId, setConversationId] = useState<string | null>(null)",
      `const [conversationId, setConversationId] = useState<string | null>(null)
  const conversationIdRef = useRef<string | null>(null)
  const isCallActiveRef = useRef(false)
  const isMutedRef = useRef(false)
  const isLoadingRef = useRef(false)

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
  }, [isLoading])`
    );
}

// Fix onresult and onend
if (!code.includes('isCallActiveRef.current && !isMutedRef.current && !isLoadingRef')) {
    code = code.replace(
      /recognitionRef\.current\.onresult = \(event.*?recognitionRef\.current\.onend = \(\) => \{\s*setIsListening\(false\);\s*\};/s,
      `recognitionRef.current.onresult = (event: any) => {
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
        };`
    );
}

if (!code.includes('activeId?: string | null')) {
    // Fix handleUserSubmit signature
    code = code.replace(
      "const handleUserSubmit = async (transcript: string) => {\n    if (!transcript.trim() || !conversationId) return",
      `const handleUserSubmit = async (transcript: string, activeId?: string | null) => {\n    const idToUse = activeId || conversationIdRef.current;\n    if (!transcript.trim() || !idToUse) return`
    );
    
    // Replace userId
    code = code.replace(
      "userId: conversationId,",
      "userId: idToUse,"
    );
}

fs.writeFileSync(filePath, code);
console.log('Fixed LiveAgent.tsx refs and closures');

const fs = require('fs');
const filePath = 'src/components/sections/LiveAgent.tsx';
let code = fs.readFileSync(filePath, 'utf8');

const blockToRemove = `  useEffect(() => {
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
  }, [isLoading])`;

code = code.replace(blockToRemove, '');

code = code.replace('const headerRef = useRef(null)', blockToRemove + '\n\n  const headerRef = useRef(null)');

fs.writeFileSync(filePath, code);

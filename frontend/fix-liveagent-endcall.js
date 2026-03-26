const fs = require('fs');
const filePath = 'src/components/sections/LiveAgent.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// Replace playAudio definition
if (!code.includes('shouldEndCall: boolean = false')) {
    code = code.replace(
      'const playAudio = (base64Audio: string) => {',
      'const playAudio = (base64Audio: string, shouldEndCall: boolean = false) => {'
    );

    code = code.replace(
      `// Auto resume listening when AI finishes speaking
      if (isCallActiveRef.current && !isMutedRef.current) {`,
      `// Check if we need to end the call
      if (shouldEndCall) {
         endCall();
         return;
      }
      // Auto resume listening when AI finishes speaking
      if (isCallActiveRef.current && !isMutedRef.current) {`
    );

    // Replace playAudio calls
    code = code.replaceAll(
      'playAudio(data.audio);',
      'playAudio(data.audio, data.endCall);'
    );

    // Update logic when there's no audio
    code = code.replace(
      /if \(!isMutedRef\.current && recognitionRef\.current\) toggleListening\(\);/g,
      `if (data.endCall) {
                 endCall();
             } else if (!isMutedRef.current && recognitionRef.current) {
                 toggleListening();
             }`
    );

    // Second occurrence inside handleUserSubmit is slightly different
    code = code.replace(
      `if (isCallActiveRef.current && !isMutedRef.current) toggleListening();`,
      `if (data.endCall) {
                  endCall();
              } else if (isCallActiveRef.current && !isMutedRef.current) {
                  toggleListening();
              }`
    );

    fs.writeFileSync(filePath, code);
    console.log("Fixed LiveAgent.tsx end call logic");
} else {
    console.log("Already applied or not found");
}
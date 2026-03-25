const fs = require('fs');
const filePath = 'src/components/sections/LiveAgent.tsx';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  /if \(isCallActive && !isMuted\)/g,
  `if (isCallActiveRef.current && !isMutedRef.current)`
);

// Also check toggleListening
code = code.replace(
  /const toggleListening = \(\) => \{\n    if \(isMuted\) return;/,
  `const toggleListening = () => {\n    if (isMutedRef.current) return;`
);

code = code.replace(
  /if \(!isMuted && recognitionRef\.current\) toggleListening\(\);/g,
  `if (!isMutedRef.current && recognitionRef.current) toggleListening();`
);

fs.writeFileSync(filePath, code);

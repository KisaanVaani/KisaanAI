const fs = require('fs');
const filePath = 'src/components/sections/LiveAgent.tsx';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  `// Auto resume listening when AI finishes speaking
      if (isCallActive && !isMuted) {`,
  `// Auto resume listening when AI finishes speaking
      if (isCallActiveRef.current && !isMutedRef.current) {`
);

fs.writeFileSync(filePath, code);

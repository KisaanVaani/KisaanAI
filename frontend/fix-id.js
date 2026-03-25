const fs = require('fs');
const filePath = 'src/components/sections/LiveAgent.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// Undo the blind replace in startCall
code = code.replace(
  `transcript: welcomePrompt,\n            language: language,\n            userId: idToUse,`,
  `transcript: welcomePrompt,\n            language: language,\n            userId: conversationId,`
);

// Fix the missed one in handleUserSubmit
code = code.replace(
  /body: JSON\.stringify\(\{\s+transcript: transcript,\s+language: language,\s+userId: conversationId,/s,
  `body: JSON.stringify({
          transcript: transcript,
          language: language,
          userId: idToUse,`
);

fs.writeFileSync(filePath, code);

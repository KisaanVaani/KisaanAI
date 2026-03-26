const fs = require('fs');
const filePath = 'src/lib/orchestrator.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  '6. SMOOTH GOODBYES: If the farmer is satisfied or says goodbye, end the call respectfully without asking follow-up questions.',
  `6. SMOOTH GOODBYES: If the farmer is satisfied, says "Dhanyavad", "Thank you", "Bye", or indicates they have no more questions, sweetly thank them for calling and end the call. IMPORTANT: You MUST append the exact text "[END_CALL]" at the very back of your reply.
7. SCHEMES & LOCATIONS: If asked where to apply for agricultural schemes or subsidies, naturally suggest they visit their nearest Common Service Centre (CSC), e-Seva Kendra, or Taluka Panchayat office. Also, ask for their name early on if you don't know it, and remember it throughout.`
);

fs.writeFileSync(filePath, code);

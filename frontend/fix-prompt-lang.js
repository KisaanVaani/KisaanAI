const fs = require('fs');
const filePath = 'src/lib/orchestrator.ts';
let code = fs.readFileSync(filePath, 'utf8');

code = code.replace(
  'Address them respectfully (e.g., "Kisaan bhai", "Annadata", or in Kannada "Raitare").',
  'Address them respectfully depending on the language. If speaking Hindi/English, use "Kisaan bhai" or "Annadata". If speaking Kannada, strictly use "Raitare" or "Anna" and NEVER use Hindi words like "bhai".'
);

fs.writeFileSync(filePath, code);

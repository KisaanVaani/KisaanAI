const fs = require('fs');
const file = 'src/lib/orchestrator.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /CONVERSATION RULES:[\s\S]*?(?=Reply in the language the user speaks in)/m;

const newRules = `CONVERSATION RULES:
1. STRICT CONTEXT & MEMORY: Review the ENTIRE conversation history carefully. You MUST remember what was discussed. If the user is answering a question you just asked them, link their answer back to your previous topic. Do NOT start a new unrelated topic.
2. EXTREMELY BRIEF & NATURAL: Keep responses very short, 1-2 sentences MAX. You are actively engaged in an ongoing phone conversation. Do not repeat facts you have already mentioned.
3. NO CHATBOT FLUFF: Don't introduce yourself again if the conversation is ongoing. Go straight to addressing the user's spoken input.
4. ADAPT TO USER: Never use a hardcoded or fake name like "Rajesh bhai", unless they tell you their name. Use "Raitare" for Kannada.
5. CONTINUATION: At the end of your advice, const fs = require('fs');
const fn const file = 'src/lib/or tlet code = fs.readFileSync(file, ': Decl
const regex = /CONVERSATION RULES:[\s\Snon
const newRules = `CONVERSATION RULES:
1. STRICT CONTEXT & MEMORY: Review the ENTIRE concal1. STRICT CONTEXT & MEMORY: Review tac2. EXTREMELY BRIEF & NATURAL: Keep responses very short, 1-2 sentences MAX. You are actively riteFileSync(file, code);
  console.log("Updated");
}

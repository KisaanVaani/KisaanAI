const fs = require('fs');
const filePath = 'src/app/api/chat/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

const oldCode = `    const reply = chatResponse.choices[0].message.content as string;

    // Get audio from Sarvam TTS
    let audioBase64 = null;
    try {
      audioBase64 = await textToSpeech(reply, language);`;

const newCode = `    let rawReply = chatResponse.choices[0].message.content as string;
    let endCall = false;

    // Check if the model decided to end the call
    if (rawReply.includes('[END_CALL]')) {
      endCall = true;
      rawReply = rawReply.replace(/\\[END_CALL\\]/g, '').replace('[END_CALL]', '').trim();
    }
    
    const reply = rawReply;

    // Get audio from Sarvam TTS
    let audioBase64 = null;
    try {
      audioBase64 = await textToSpeech(reply, language);`;

if (code.includes('const reply = chatResponse.choices[0].message.content as string;')) {
    code = code.replace(oldCode, newCode);
    
    // Also replace the return statement to include endCall
    const oldReturn = `    return NextResponse.json({ 
      reply,
      language,
      audio: audioBase64,
      success: true
    });`;

    const newReturn = `    return NextResponse.json({ 
      reply,
      language,
      audio: audioBase64,
      endCall,
      success: true
    });`;

    code = code.replace(oldReturn, newReturn);
    fs.writeFileSync(filePath, code);
    console.log('Fixed route.ts with endCall');
} else {
    console.log('Already fixed or not found');
}

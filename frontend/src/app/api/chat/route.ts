import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { PrismaClient } from '@prisma/client';
import { getContextualPrompt } from '../../../lib/orchestrator';
import { textToSpeech } from '../../../lib/sarvam';

// Lazy init to avoid crashing at module load if DB not ready
let prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

const apiKey = process.env.MISTRAL_API_KEY || '';
const client = new Mistral({ apiKey });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transcript, userId = 'default_user', farmerId = 'farmer-001', language = 'en-IN', history = [] } = body;

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Get contextual prompt — passes full history so orchestrator mines context from entire conversation
    const systemPrompt = await getContextualPrompt(farmerId, transcript, language, history);

    // Format previous messages (role mapping: USER→user, ASSISTANT→assistant)
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'assistant' || msg.role === 'ASSISTANT' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Build final message array — history already contains previous turns, add current user msg once
    const finalMessages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: transcript }
    ];

    // Use mistral-small for speed (voice needs <3s response time)
    const chatResponse = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: finalMessages as any,
      maxTokens: 300,      // Cap tokens — voice responses must be short
      temperature: 0.65,   // Slightly creative but factual
    });

    let rawReply = chatResponse.choices[0].message.content as string;
    let endCall = false;

    if (rawReply.includes('[END_CALL]')) {
      endCall = true;
      rawReply = rawReply.replace(/\[END_CALL\]/g, '').trim();
    }

    const reply = rawReply.trim();

    // Run TTS and DB save in parallel to save time
    const [audioBase64] = await Promise.allSettled([
      textToSpeech(reply, language).catch(e => { console.error('[TTS]', e); return null; }),
      getPrisma().conversation.create({
        data: { userId, userMessage: transcript, aiMessage: reply }
      }).catch(e => console.error('[DB]', e))
    ]).then(results => [
      results[0].status === 'fulfilled' ? results[0].value : null
    ]);

    console.log(`[API] ✅ Reply: "${reply.substring(0, 60)}..." | Audio: ${audioBase64 ? 'YES' : 'NO'} | EndCall: ${endCall}`);

    return NextResponse.json({ reply, language, audio: audioBase64, endCall, success: true });

  } catch (error: any) {
    console.error('[API] ❌ Error:', error?.message || error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error', success: false }, { status: 500 });
  }
}

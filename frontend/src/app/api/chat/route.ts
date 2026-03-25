import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { PrismaClient } from '@prisma/client';
import { getContextualPrompt } from '../../../lib/orchestrator';
import { textToSpeech } from '../../../lib/sarvam';

const prisma = new PrismaClient();
const apiKey = process.env.MISTRAL_API_KEY || '';
const client = new Mistral({ apiKey: apiKey });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transcript, userId = 'default_user', farmerId = 'farmer-001', language = 'en-IN' } = body;

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Get contextual prompt with data from all sources
    const systemPrompt = await getContextualPrompt(farmerId, transcript);

    // Call Mistral AI to get the agent's response
    const chatResponse = await client.chat.complete({
      model: 'mistral-large-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript }
      ],
    });

    const reply = chatResponse.choices[0].message.content as string;

    // Get audio from Sarvam TTS
    let audioBase64 = null;
    try {
      audioBase64 = await textToSpeech(reply, language);
      console.log('[API] Audio generated:', audioBase64 ? 'YES' : 'NO');
    } catch (audioError) {
      console.error('[API] Failed to generate audio:', audioError);
      // Continue without audio
    }

    // Save conversation to database
    await prisma.conversation.create({
      data: {
        userId,
        userMessage: transcript,
        aiMessage: reply,
      },
    });

    return NextResponse.json({ 
      reply,
      language,
      audio: audioBase64,
      success: true
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', success: false }, { status: 500 });
  }
}


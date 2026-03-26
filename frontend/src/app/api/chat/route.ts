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
    const { transcript, userId = 'default_user', farmerId = 'farmer-001', language = 'en-IN', history = [] } = body;

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Get contextual prompt with data from all sources
    const systemPrompt = await getContextualPrompt(farmerId, transcript, language, history);

    // Format previous messages
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Build the final message array with system prompt, history, and current user message
    const finalMessages = [
      { role: 'system', content: systemPrompt },
      ...formattedHistory,
      { role: 'user', content: transcript }  // Always add current user message
    ];

    // Call Mistral AI to get the agent's response
    const chatResponse = await client.chat.complete({
      model: 'mistral-small-latest',
      messages: finalMessages as any,
      maxTokens: 100,
    });

    let rawReply = chatResponse.choices[0].message.content as string;
    let endCall = false;

    // Check if the model decided to end the call
    if (rawReply.includes('[END_CALL]')) {
      endCall = true;
      rawReply = rawReply.replace(/\[END_CALL\]/g, '').replace('[END_CALL]', '').trim();
    }
    
    const reply = rawReply;

    // Get audio from Sarvam TTS
    let audioBase64 = null;
    try {
      audioBase64 = await textToSpeech(reply, language);
      console.log('[TTS] Audio generated:', audioBase64 ? `YES (${audioBase64.length} chars)` : 'NO - EMPTY');
      
      if (!audioBase64) {
        console.warn('[TTS] Warning: Audio generation returned null/empty');
      }
    } catch (audioError) {
      console.error('[TTS] Failed to generate audio:', audioError);
      // Continue without audio - don't block the response
    }

    // Save conversation to database
    try {
      await prisma.conversation.create({
        data: {
          userId,
          userMessage: transcript,
          aiMessage: reply,
        },
      });
    } catch (dbError) {
      console.error('[DB] Failed to save:', dbError);
      // Don't block response even if DB fails
    }

    console.log('[API] Returning response with audio:', audioBase64 ? 'YES' : 'NO');

    return NextResponse.json({ 
      reply,
      language,
      audio: audioBase64,
      endCall,
      success: true
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', success: false }, { status: 500 });
  }
}


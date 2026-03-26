import axios from 'axios';

const SARVAM_API_URL = 'https://api.sarvam.ai';
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';
const MAX_CHARS = 490; // Sarvam limit is 500; stay safely under

const LANGUAGE_SPEAKER_MAP: Record<string, string> = {
  'en-IN': 'amelia',
  'hi-IN': 'shreya',
  'kn-IN': 'shruti',
  'ta-IN': 'shruti',
  'te-IN': 'shreya',
  'ml-IN': 'shreya',
  'bn-IN': 'shreya',
};

export async function speechToText(audioData: Blob | string) {
  return 'Dummy transcribed text';
}

// ──────────────────────────────────────────────
// Split text into chunks that respect sentence
// boundaries and stay under MAX_CHARS each.
// ──────────────────────────────────────────────
function splitIntoChunks(text: string): string[] {
  // Sentence delimiters: . ! ? | ।  (Hindi/Kannada full-stop)
  const sentenceRegex = /[^.!?।\n]+[.!?।\n]*/g;
  const sentences: string[] = text.match(sentenceRegex) || [text];

  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    // If a single sentence exceeds the limit, hard-split it
    if (trimmed.length > MAX_CHARS) {
      if (current) { chunks.push(current.trim()); current = ''; }
      // Hard-split on word boundaries
      let remaining = trimmed;
      while (remaining.length > MAX_CHARS) {
        const slice = remaining.substring(0, MAX_CHARS);
        const lastSpace = slice.lastIndexOf(' ');
        const splitAt = lastSpace > 0 ? lastSpace : MAX_CHARS;
        chunks.push(remaining.substring(0, splitAt).trim());
        remaining = remaining.substring(splitAt).trim();
      }
      if (remaining) current = remaining;
    } else if ((current + ' ' + trimmed).trim().length > MAX_CHARS) {
      if (current) chunks.push(current.trim());
      current = trimmed;
    } else {
      current = (current + ' ' + trimmed).trim();
    }
  }
  if (current) chunks.push(current.trim());

  return chunks.filter(c => c.length > 0);
}

// ──────────────────────────────────────────────
// TTS a single chunk → base64 WAV string
// ──────────────────────────────────────────────
async function ttsChunk(text: string, language: string, speaker: string): Promise<string | null> {
  try {
    const response = await axios.post(
      `${SARVAM_API_URL}/text-to-speech`,
      {
        inputs: [text],
        target_language_code: language,
        speaker,
        pace: 1.0,
        speech_sample_rate: 16000,
        enable_preprocessing: true,
        model: 'bulbul:v3',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': SARVAM_API_KEY,
        },
        timeout: 30000,
        responseType: 'json',
      }
    );

    const data = response.data;
    if (data?.audios?.[0]) return data.audios[0] as string;
    if (data?.audio) return data.audio as string;
    if (typeof data === 'string' && data.length > 100) return data;
    return null;
  } catch (error: any) {
    console.error('[Sarvam] ❌ Chunk TTS error:', {
      status: error.response?.status,
      message: error.message,
      chunk: text.substring(0, 80),
    });
    return null;
  }
}

// ──────────────────────────────────────────────
// Concatenate multiple WAV base64 strings.
// WAV = 44-byte header + PCM data. We keep the
// first header and strip headers from the rest,
// then rebuild a valid WAV at the end.
// ──────────────────────────────────────────────
function concatenateWav(base64Chunks: string[]): string {
  if (base64Chunks.length === 1) return base64Chunks[0];

  const WAV_HEADER_SIZE = 44;
  const buffers = base64Chunks.map(b64 => Buffer.from(b64, 'base64'));

  // Collect all PCM data (skip header on every chunk)
  const pcmParts: Buffer[] = buffers.map(buf => buf.slice(WAV_HEADER_SIZE));
  const totalPcmLength = pcmParts.reduce((acc, p) => acc + p.length, 0);

  // Copy the header from the first chunk and fix the sizes
  const header = Buffer.from(buffers[0].slice(0, WAV_HEADER_SIZE));
  const totalFileSize = WAV_HEADER_SIZE + totalPcmLength;

  // ChunkSize field (bytes 4-7) = totalFileSize - 8
  header.writeUInt32LE(totalFileSize - 8, 4);
  // Subchunk2Size field (bytes 40-43) = totalPcmLength
  header.writeUInt32LE(totalPcmLength, 40);

  const combined = Buffer.concat([header, ...pcmParts]);
  return combined.toString('base64');
}

// ──────────────────────────────────────────────
// Public entry point — handles any length text
// ──────────────────────────────────────────────
export async function textToSpeech(text: string, language: string = 'en-IN'): Promise<string | null> {
  if (!SARVAM_API_KEY) {
    console.error('[Sarvam] ❌ API key missing!');
    return null;
  }

  const speaker = LANGUAGE_SPEAKER_MAP[language] || 'aditya';
  const chunks = splitIntoChunks(text);

  console.log(`[Sarvam] 🎤 TTS Request — ${chunks.length} chunk(s) | "${text.substring(0, 60)}..."`);

  const audioChunks: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`[Sarvam]   Chunk ${i + 1}/${chunks.length} (${chunk.length} chars): "${chunk.substring(0, 50)}..."`);
    const audio = await ttsChunk(chunk, language, speaker);
    if (audio) {
      audioChunks.push(audio);
    } else {
      console.warn(`[Sarvam] ⚠️ Chunk ${i + 1} failed, skipping`);
    }
  }

  if (audioChunks.length === 0) {
    console.error('[Sarvam] ❌ All chunks failed — no audio produced');
    return null;
  }

  const combined = concatenateWav(audioChunks);
  console.log(`[Sarvam] ✅ TTS Complete — ${audioChunks.length}/${chunks.length} chunks, ${combined.length} chars`);
  return combined;
}

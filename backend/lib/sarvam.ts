import axios from 'axios';

const SARVAM_API_URL = 'https://api.sarvam.ai';
const SARVAM_API_KEY = process.env.SARVAM_API_KEY || '';

// Language to speaker mapping for Sarvam Bulbul V3 - using clear, high-quality speakers
const LANGUAGE_SPEAKER_MAP: Record<string, string> = {
  'en-IN': 'amelia',      // English - crisp, clear female voice
  'hi-IN': 'shreya',      // Hindi - warm, natural female voice for engagement
  'kn-IN': 'shruti',      // Kannada - clear, expressive female voice
  'ta-IN': 'shruti',      // Tamil - use shruti for clarity
  'te-IN': 'shreya',      // Telugu - use shreya for warmth
  'ml-IN': 'shreya',      // Malayalam - use shreya
  'bn-IN': 'shreya',      // Bengali - use shreya
};

// Speech to text (placeholder)
export async function speechToText(audioData: Blob | string) {
    return "Dummy transcribed text";
}

// Text to Speech - Returns audio as base64 string
export async function textToSpeech(text: string, language: string = 'en-IN'): Promise<string | null> {
    if (!SARVAM_API_KEY) {
        console.error('[Sarvam] ❌ API key missing!');
        return null;
    }

    try {
        const speaker = LANGUAGE_SPEAKER_MAP[language] || 'aditya';
        const targetLanguageCode = language || 'en-IN';

        console.log(`[Sarvam] 🎤 TTS Request START`);
        console.log(`  Text: "${text.substring(0, 60)}..."`);
        console.log(`  Language: ${targetLanguageCode}`);
        console.log(`  Speaker: ${speaker}`);

        const response = await axios.post(
            `${SARVAM_API_URL}/text-to-speech`,
            {
                inputs: [text],
                target_language_code: targetLanguageCode,
                speaker: speaker,
                pace: 1.0,
                speech_sample_rate: 16000,
                enable_preprocessing: true,
                model: 'bulbul:v3'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': SARVAM_API_KEY
                },
                timeout: 30000,
                responseType: 'json'
            }
        );

        console.log(`[Sarvam] ✅ Response received (Status: ${response.status})`);
        
        // Check the response structure
        if (!response.data) {
            console.error('[Sarvam] ❌ Empty response data');
            return null;
        }

        console.log(`[Sarvam] Response keys:`, Object.keys(response.data));
        
        // Handle different response formats
        let audioBase64 = null;
        
        if (response.data.audios && Array.isArray(response.data.audios) && response.data.audios[0]) {
            audioBase64 = response.data.audios[0];
            console.log(`[Sarvam] ✅ Audio from audios array (${(audioBase64 as string).length} chars)`);
        } else if (response.data.audio) {
            audioBase64 = response.data.audio;
            console.log(`[Sarvam] ✅ Audio from audio field (${(audioBase64 as string).length} chars)`);
        } else if (typeof response.data === 'string' && response.data.length > 100) {
            // Entire response might be the audio base64
            audioBase64 = response.data;
            console.log(`[Sarvam] ✅ Audio is entire response (${(audioBase64 as string).length} chars)`);
        }

        if (!audioBase64 || (typeof audioBase64 === 'string' && audioBase64.length < 100)) {
            console.error('[Sarvam] ❌ Invalid audio data', {
                audioLength: audioBase64?.length || 0,
                isString: typeof audioBase64 === 'string'
            });
            console.error('[Sarvam] Full response (first 500 chars):', JSON.stringify(response.data).substring(0, 500));
            return null;
        }

        console.log(`[Sarvam] ✅✅ TTS Complete - Ready to play (${(audioBase64 as string).length} chars)`);
        return audioBase64 as string;

    } catch (error: any) {
        console.error('[Sarvam] ❌ TTS Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.message,
            data: error.response?.data ? JSON.stringify(error.response.data).substring(0, 200) : 'no data'
        });
        return null;
    }
}

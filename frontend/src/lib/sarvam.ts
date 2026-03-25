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
        console.error('[Sarvam] API key missing');
        return null;
    }

    try {
        const speaker = LANGUAGE_SPEAKER_MAP[language] || 'aditya';
        const targetLanguage = language.split('-')[0]; // 'en', 'hi', 'kn'
        const languageCodeMap: Record<string, string> = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'kn': 'kn-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'ml': 'ml-IN',
            'bn': 'bn-IN',
        };
        const targetLanguageCode = languageCodeMap[targetLanguage] || 'en-IN';

        console.log(`[Sarvam] TTS Request: text=${text.substring(0, 50)}..., language=${targetLanguageCode}, speaker=${speaker}`);

        const response = await axios.post(
            `${SARVAM_API_URL}/text-to-speech`,
            {
                inputs: [text],
                target_language_code: targetLanguageCode,
                speaker: speaker,
                pace: 1.2,  // Faster, more natural pace
                speech_sample_rate: 16000,
                enable_preprocessing: true,
                model: 'bulbul:v3'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-subscription-key': SARVAM_API_KEY
                },
                timeout: 30000
            }
        );

        if (response.data && response.data.audios && response.data.audios[0]) {
            console.log('[Sarvam] TTS Success - audio returned');
            // Sarvam returns base64 encoded audio
            return response.data.audios[0];
        } else {
            console.error('[Sarvam] No audio in response:', response.data);
            return null;
        }
    } catch (error: any) {
        console.error('[Sarvam] TTS Error:', error.response?.data || error.message);
        return null;
    }
}

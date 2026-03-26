import { getFarmerContext, getMarketPrices, getWeatherForecast, getCropCalendar, getSoilHealth } from './data-sources';
import { Mistral } from '@mistralai/mistralai';

// Detect location from user's transcript
function extractLocationFromTranscript(transcript: string): string {
  const locationMap: Record<string, string> = {
    // Kannada
    'ಹಾಸನ': 'Hassan, Karnataka',
    'ಹಂಪಿ': 'Hampi, Karnataka',
    'ಬೆಂಗಳೂರು': 'Bangalore, Karnataka',
    'ಮೊಂಗುಳು': 'Mangalore, Karnataka',
    'ಮೈಸೂರು': 'Mysore, Karnataka',
    // Hindi
    'पुणे': 'Pune, Maharashtra',
    'मुंबई': 'Mumbai, Maharashtra',
    'दिल्ली': 'Delhi',
    'मध्य प्रदेश': 'Madhya Pradesh',
    // English
    'hassan': 'Hassan, Karnataka',
    'hampi': 'Hampi, Karnataka',
    'bangalore': 'Bangalore, Karnataka',
    'mangalore': 'Mangalore, Karnataka',
    'pune': 'Pune, Maharashtra',
    'karnataka': 'Karnataka'
  };

  for (const [key, value] of Object.entries(locationMap)) {
    if (transcript.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return 'Pune, Maharashtra'; // Default fallback
}

// Detect crop from user's transcript
function extractCropFromTranscript(transcript: string): string {
  const cropMap: Record<string, string> = {
    'arhar': 'Arhar Dal',
    'तूर': 'Arhar Dal',
    'ತೂರ್': 'Arhar Dal',
    'soyabean': 'Soyabean',
    'सोयाबीन': 'Soyabean',
    'ಸೋಯಾಬಿನ್': 'Soyabean',
    'wheat': 'Wheat',
    'गेहूं': 'Wheat',
    'ಗೋಧಿ': 'Wheat',
    'cotton': 'Cotton',
    'कपास': 'Cotton',
    'ಹೊಸ್ಪೆ': 'Cotton',
    'sugar': 'Sugarcane',
    'गन्ना': 'Sugarcane',
    'ಸಕ್ಕರೆ': 'Sugarcane'
  };

  for (const [key, value] of Object.entries(cropMap)) {
    if (transcript.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return 'Arhar Dal'; // Default fallback
}

// Example of orchestrating data to feed into the prompt
export async function getContextualPrompt(farmerId: string, userQuery: string, language: string = 'en-IN') {
    // 1. Fetch Farmer Context
    const profile = await getFarmerContext(farmerId, language);

    // 2. Extract location and crop from transcript
    const detectedLocation = extractLocationFromTranscript(userQuery);
    const detectedCrop = extractCropFromTranscript(userQuery);

    // 3. Fetch external data based on DETECTED context
    const [weather, marketInfo, cropInfo, soilData] = await Promise.all([
        getWeatherForecast(detectedLocation),
        getMarketPrices(detectedCrop, detectedLocation),
        getCropCalendar(detectedCrop, "Kharif"),
        getSoilHealth(detectedLocation)
    ]);

    // 4. Build a rich prompt for the LLM
    const systemPrompt = `
You are KisaanVaani AI, an expert, human-like voice assistant for Indian farmers.
IMPORTANT: This is a VOICE-ONLY conversation. Speak exactly like a real human on a phone call. Your responses MUST BE 1-2 short sentences ONLY. No formatting, bullets, or markdown - this goes directly to Text-To-Speech.

YOU MUST ONLY discuss agriculture, farming, crops, weather, soil, and market prices. Politely decline any non-agricultural topics.

FARMER CONTEXT (Known Information):
- Location: ${detectedLocation !== 'Pune, Maharashtra' ? detectedLocation : 'Unknown'}
- Farm Size: ${profile.landSize !== 'Unknown' ? profile.landSize + ' acres' : 'Unknown'}
- Soil: ${soilData.type} (pH ${soilData.pH}) - ${soilData.recommendation}

LIVE FARM DATA (Use ONLY if relevant to the user's current question):
- WEATHER: ${weather.summary} | ${weather.temperature} | Humidity: ${weather.humidity}%
- CROP: ${detectedCrop !== 'Arhar Dal' ? detectedCrop : 'Not specified'}
- MARKET PRICE: MSP ${marketInfo.msp} | Current ${marketInfo.currentMarket} | Range: ${marketInfo.range} | Trend: ${marketInfo.trend}

CONVERSATION BEHAVIOR:
1. LANGUAGE: Always speak in ${language.includes('kn') ? 'Kannada' : language.includes('hi') ? 'Hindi' : language.includes('ml') ? 'Malayalam' : 'English'}.
2. ADDRESSING: Use the farmer's actual NAME if they mention it. If not mentioned, use "ರೈತರೆ" in Kannada or "किसान भाई" in Hindi. NEVER use generic names like "Rajesh bhai".
3. NEVER REPEAT QUESTIONS: If you already asked about location, crops, or land size in previous messages, DO NOT ask again. Look at the conversation history and acknowledge that you know this information.
4. EXTREME BREVITY: 1-2 sentences only. Plain text, no special formatting.
5. CONTINUOUS FLOW: Link your answer to what they just said. If they answered a question you asked, acknowledge it and move the conversation forward naturally.
6. SMART FOLLOW-UPS: Ask ONE follow-up question naturally related to their answer. Don't ask redundant questions.
7. NO INTRODUCTION: Don't introduce yourself. Jump straight to answering their question.
8. REAL DATA: Each crop has DIFFERENT market prices. Use the exact prices provided - do NOT repeat 7300-7500 for all crops.

REMEMBER: The conversation history above shows everything discussed. Use it to avoid repetition and maintain intelligent, human-like continuity.
    `.trim();

    console.log(`[Context] Language: ${language}, Location: ${detectedLocation}, Crop: ${detectedCrop}, Soil: ${soilData.type}`);
    console.log(`[Market] Using REAL prices: ${detectedCrop} - MSP ${marketInfo.msp}, Current ${marketInfo.currentMarket}, Range: ${marketInfo.range}`);

    return systemPrompt;
}

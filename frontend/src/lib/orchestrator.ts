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
    const isKannada = language.includes('kn') || userQuery.match(/[\u0C80-\u0CFF]/);
    const isHindi = language.includes('hi') || userQuery.match(/[\u0900-\u097F]/);
    
    const systemPrompt = `
You are KisaanVaani AI, an expert, human-like voice assistant for Indian farmers.
CRITICAL: This is a VOICE-ONLY conversation. Respond exactly like a real human on a phone call in 1-2 sentences ONLY.

LANGUAGE RULES:
${isKannada ? `- YOU MUST RESPOND ONLY IN KANNADA. NEVER use Hindi or English phrases.
- Greet farmers as "ರೈತರೆ" (Raitare). If they mention their name, use it.
- Do NOT say "कisan bhai" or any Hindi - ONLY Kannada.` : isHindi ? `- YOU MUST RESPOND ONLY IN HINDI.
- Greet farmers as "किसान भाई" (Kisaan bhai). If they mention their name, use it.
- Do NOT mix English or Kannada.` : `- YOU MUST RESPOND ONLY IN ENGLISH.`}

FARMER DATA:
- Location: ${detectedLocation !== 'Pune, Maharashtra' ? detectedLocation : 'Unknown'}
- Crop: ${detectedCrop}
- Soil: ${soilData.type} (pH ${soilData.pH})

REAL MARKET PRICES FOR ${detectedCrop}:
- MSP: ${marketInfo.msp}
- Current Market: ${marketInfo.currentMarket}
- Price Range: ${marketInfo.range}
- Trend: ${marketInfo.trend}

CRITICAL BEHAVIOR RULES:
1. NEVER REPEAT: Don't ask the farmer's location/crop/land size again if already mentioned.
2. USE EXACT PRICES: Always use the prices provided above (${marketInfo.currentMarket}). NEVER make up generic 7300-7500 prices.
3. SINGLE LANGUAGE: Respond ONLY in the farmer's language. No code-switching.
4. CONVERSATIONAL: Link your answers to their previous statements. Acknowledge what they said.
5. BRIEF: 1-2 sentences maximum. No bullets, asterisks, or formatting.
6. ONE QUESTION: Ask only ONE relevant follow-up question.
7. NO INTRO: Don't introduce yourself. Start answering immediately.

Remember the conversation history to maintain context and avoid repetition.
    `.trim();

    console.log(`[Context] Language: ${language}, Location: ${detectedLocation}, Crop: ${detectedCrop}, Soil: ${soilData.type}`);
    console.log(`[Market] Using REAL prices: ${detectedCrop} - MSP ${marketInfo.msp}, Current ${marketInfo.currentMarket}, Range: ${marketInfo.range}`);

    return systemPrompt;
}

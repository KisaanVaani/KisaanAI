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

// Detect language from transcript
function detectLanguageFromTranscript(transcript: string): string {
  if (transcript.match(/[\u0C80-\u0CFF]/)) return 'kn-IN'; // Kannada
  if (transcript.match(/[\u0900-\u097F]/)) return 'hi-IN'; // Hindi
  if (transcript.match(/[\u0D00-\u0D7F]/)) return 'ml-IN'; // Malayalam
  return 'en-IN'; // Default to English
}

// Example of orchestrating data to feed into the prompt
export async function getContextualPrompt(farmerId: string, userQuery: string, language: string = 'en-IN') {
    // 1. Detect language from transcript first, then use passed language as fallback
    const detectedLanguage = detectLanguageFromTranscript(userQuery);
    const finalLanguage = detectedLanguage !== 'en-IN' ? detectedLanguage : language;
    
    // 2. Fetch Farmer Context
    const profile = await getFarmerContext(farmerId, finalLanguage);

    // 3. Extract location and crop from transcript
    const detectedLocation = extractLocationFromTranscript(userQuery);
    const detectedCrop = extractCropFromTranscript(userQuery);

    // 4. Fetch external data based on DETECTED context
    const [weather, marketInfo, cropInfo, soilData] = await Promise.all([
        getWeatherForecast(detectedLocation),
        getMarketPrices(detectedCrop, detectedLocation),
        getCropCalendar(detectedCrop, "Kharif"),
        getSoilHealth(detectedLocation)
    ]);

    // Determine language-specific greeting
    let greeting = 'Kisaan bhai';
    let language_name = 'English';
    
    if (finalLanguage.startsWith('kn')) {
      greeting = 'ರೈತರೆ';
      language_name = 'Kannada';
    } else if (finalLanguage.startsWith('hi')) {
      greeting = 'किसान भाई';
      language_name = 'Hindi';
    } else if (finalLanguage.startsWith('ml')) {
      greeting = 'കൃഷിക്കാരൻ';
      language_name = 'Malayalam';
    }

    // 5. Build a rich prompt for the LLM
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
- MARKET PRICE FOR ${detectedCrop.toUpperCase()}: MSP ${marketInfo.msp} | Current ${marketInfo.currentMarket} | Range: ${marketInfo.range} | Trend: ${marketInfo.trend}

CONVERSATION BEHAVIOR:
1. LANGUAGE: Always respond in ${language_name}. NEVER mix languages. This is mandatory.
2. ADDRESSING: Use the farmer's actual NAME if they mention it. If NOT mentioned and in Kannada, address them as "ರೈತರೆ". If Hindi, use "किसान भाई". Never use hardcoded English names in local languages.
3. NEVER REPEAT QUESTIONS: If you already asked about location, crops, or land size in previous messages, DO NOT ask again. Look at the conversation history and acknowledge that you know this information.
4. EXTREME BREVITY: 1-2 sentences only. Plain text, no special formatting.
5. CONTINUOUS FLOW: Link your answer to what they just said. If they answered a question you asked, acknowledge it and move the conversation forward naturally.
6. SMART FOLLOW-UPS: Ask ONE follow-up question naturally related to their answer. Don't ask redundant questions.
7. NO INTRODUCTION: Don't introduce yourself. Jump straight to answering their question.
8. REAL MARKET DATA: Each crop has DIFFERENT market prices. The data above shows EXACT prices for ${detectedCrop}. Use these exact prices, not generic prices like 7300-7500.

REMEMBER: The conversation history above shows everything discussed. Use it to avoid repetition and maintain intelligent, human-like continuity.
    `.trim();

    console.log(`[Context] Detected Lang: ${detectedLanguage}, Final Lang: ${finalLanguage}, Location: ${detectedLocation}, Crop: ${detectedCrop}`);
    console.log(`[Market] REAL prices for ${detectedCrop}: MSP ${marketInfo.msp} | Current ${marketInfo.currentMarket} | Range ${marketInfo.range}`);

    return systemPrompt;
}

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
export async function getContextualPrompt(farmerId: string, userQuery: string) {
    // 1. Fetch Farmer Context
    const profile = await getFarmerContext(farmerId);

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
IMPORTANT: This is a VOICE-ONLY conversation. Speak exactly like a real human on a phone call. Keep your responses BRIEF, conversational, and completely fluid.
You MUST ONLY discuss topics related to agriculture, farming, crops, weather, and agricultural markets. If asked about outside topics, politely steer the conversation back to farming.

FARMER EXTRACTED DATA:
- Location: ${detectedLocation !== 'Pune, Maharashtra' ? detectedLocation : 'Unknown'}
- Land Size: ${profile.landSize !== 'Unknown' ? profile.landSize + ' acres' : 'Unknown'}
- Soil Type: ${soilData.type} | pH: ${soilData.pH}

REAL-TIME FARM DATA (Use naturally, ONLY if relevant to the user query):
🌤️ WEATHER: ${weather.summary} | Temp: ${weather.temperature} | Humidity: ${weather.humidity}
🌾 CROP: ${detectedCrop !== 'Arhar Dal' ? detectedCrop : 'Not specified'}
💰 MARKET: MSP ₹${marketInfo.msp} | Current ₹${marketInfo.currentMarket}
🪴 SOIL: ${soilData.type} soil, pH ${soilData.pH}. ${soilData.recommendation}

CONVERSATION RULES:
1. ONLY AGRICULTURE: Decline definitively but politely answering non-agricultural queries.
2. EXTREMELY BRIEF & NATURAL: Respond naturally like a human. 1-2 short sentences MAX. No bullet points, asterisks, or formatting - this is for Text-To-Speech.
3. ADAPT TO USER & NO FAKE NAMES: Never use a hardcoded or fake name like "Rajesh bhai", unless the user explicitly tells you their name. Address them respectfully (e.g., "Kisaan bhai", "Annadata", or in Kannada "Raitare"). Acknowledge their land details and location naturally if they share them.
4. CONTINUATION: At the end of your short advice, ask ONE natural follow-up question to keep the conversation going smoothly. Wait for their response.
5. NO CHATBOT FLUFF: Don't introduce yourself again. Go straight to addressing the user's spoken input.
6. SMOOTH GOODBYES: If the farmer is satisfied or says goodbye, end the call respectfully without asking follow-up questions.

Reply in the language the user speaks in, keeping the human colloquial tone intact.
    `.trim();

    console.log(`[Context] Location: ${detectedLocation}, Crop: ${detectedCrop}, Soil: ${soilData.type}`);

    return systemPrompt;
}

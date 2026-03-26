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
  return ''; // DON'T default to Pune - force the user to provide location
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
    'ಸಕ್ಕರೆ': 'Sugarcane',
    'rice': 'Rice',
    'चावल': 'Rice',
    'ಅಕ್ಕಿ': 'Rice',
    'ಭತ್ತ': 'Rice',
    'ragi': 'Ragi',
    'रागी': 'Ragi',
    'ರಾಗಿ': 'Ragi'
  };

  for (const [key, value] of Object.entries(cropMap)) {
    if (transcript.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return ''; // DON'T default - let the AI ask which crop
}

// Example of orchestrating data to feed into the prompt
export async function getContextualPrompt(farmerId: string, userQuery: string, language: string = 'en-IN', history: any[] = []) {
    // 1. Fetch Farmer Context
    const profile = await getFarmerContext(farmerId, language);

    // Combine previous user messages to detect location and crop across the conversation history
    const allUserText = history
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)
      .join(' ') + ' ' + userQuery;

    // 2. Extract location and crop from transcript
    const detectedLocation = extractLocationFromTranscript(allUserText);
    const detectedCrop = extractCropFromTranscript(allUserText);

    // 3. Fetch external data dynamically based on available context
    const hasLocation = detectedLocation && detectedLocation.length > 0;
    const hasCrop = detectedCrop && detectedCrop.length > 0;
    
    let weather = { summary: 'Waiting for location...', temperature: '--', humidity: '--', condition: 'Unknown' };
    let marketInfo = { msp: 'Unknown', currentMarket: 'Unknown', range: 'Unknown', trend: 'Will provide once you tell me the crop' };
    let cropInfo = { crop: detectedCrop || 'Not specified', season: 'Kharif', recommendation: 'Ask me about any specific crop!' };
    let soilData = { type: 'Unknown', pH: '--', recommendation: 'Once you provide your location, I can give soil analysis.' };
    
    const promises = [];
    
    if (hasLocation) {
        promises.push(
            getWeatherForecast(detectedLocation).then(res => weather = res).catch(e => console.error("Weather error", e)),
            getSoilHealth(detectedLocation).then(res => soilData = res).catch(e => console.error("Soil error", e))
        );
    }
    
    if (hasCrop) {
        promises.push(
            getCropCalendar(detectedCrop, "Kharif").then(res => cropInfo = res).catch(e => console.error("Crop calendar error", e))
        );
    }
    
    if (hasLocation && hasCrop) {
        promises.push(
            getMarketPrices(detectedCrop, detectedLocation).then(res => marketInfo = res).catch(e => console.error("Market error", e))
        );
    }
    
    await Promise.all(promises);

    // 4. Build a rich prompt for the LLM
    
    const systemPrompt = `
You are KisaanVaani AI, an expert, human-like voice assistant for Indian farmers.
IMPORTANT: This is a VOICE-ONLY conversation. Speak exactly like a real human on a phone call. Your responses MUST BE 1-2 short sentences ONLY. No formatting, bullets, or markdown - this goes directly to Text-To-Speech.

YOU MUST ONLY discuss agriculture, farming, crops, weather, soil, and market prices. Politely decline any non-agricultural topics.

CRITICAL PRIORITY:
${!hasLocation ? '⚠️ LOCATION NOT SET - You MUST ask the farmer "आप कहाँ से हैं?" (Hindi) or "ನೀವು ಎಲ್ಲಿಂದ?" (Kannada) or "Where are you from?" (English) FIRST. Do NOT provide any weather, market, or location-specific data until you know their location.' : ''}
${hasLocation && !hasCrop ? '⚠️ CROP NOT IDENTIFIED - If relevant, ask which crop they grow/want information about.' : ''}

FARMER CONTEXT (Known Information):
- Location: ${hasLocation ? detectedLocation : 'NOT YET PROVIDED - ASK IMMEDIATELY'}
- Farm Size: ${profile.landSize !== 'Unknown' ? profile.landSize + ' acres' : 'Unknown'}
- Crop: ${hasCrop ? detectedCrop : 'Not yet identified'}
- Soil: ${hasLocation ? soilData.type + ' (pH ' + soilData.pH + ') - ' + soilData.recommendation : 'Cannot determine without location'}

LIVE FARM DATA (Use ONLY if location and crop are known):
${hasLocation ? `- WEATHER: ${weather.summary} | ${weather.temperature} | Humidity: ${weather.humidity}%` : '- WEATHER: Not available (location unknown)'}
${hasCrop ? `- MARKET PRICE: MSP ${marketInfo.msp} | Current ${marketInfo.currentMarket} | Range: ${marketInfo.range} | Trend: ${marketInfo.trend}` : '- MARKET: Cannot show until crop is identified'}

CONVERSATION BEHAVIOR:
1. LANGUAGE: Always speak in ${language.includes('kn') ? 'Kannada' : language.includes('hi') ? 'Hindi' : 'English'}.
2. ADDRESSING: Use the farmer's actual NAME if they mention it. If not, use "ರೈತರೆ" (Kannada), "किसान भाई" (Hindi), or polite terms in English.
3. NEVER REPEAT QUESTIONS: Don't ask again about info already provided in conversation history.
4. EXTREME BREVITY: 1-2 sentences only. Plain text, no special formatting.
5. NATURAL FLOW: Link your answer to what they just said. Acknowledge their input.
6. SMART FOLLOW-UPS: Ask ONE related follow-up naturally. Avoid redundant questions.
7. NO INTRODUCTION: Don't introduce yourself. Jump straight into helping.
8. REAL DATA: Use the exact market prices provided - never improvise.

REMEMBER: Check conversation history to avoid asking the same question twice.
    `.trim();

    console.log(`[Context] Language: ${language}, Location: ${detectedLocation || 'UNKNOWN'}, Crop: ${detectedCrop}, HasLocation: ${hasLocation}`);
    if (hasLocation && hasCrop) {
      console.log(`[Market] Using REAL prices: ${detectedCrop} - MSP ${marketInfo.msp}, Current ${marketInfo.currentMarket}, Range: ${marketInfo.range}`);
    } else {
      console.log(`[Context] LOCATION OR CROP MISSING - Asking farmer to provide this info first`);
    }

    return systemPrompt;
}

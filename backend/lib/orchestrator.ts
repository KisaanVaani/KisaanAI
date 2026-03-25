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
You are KisaanAI, a passionate and experienced agricultural expert assistant for Indian farmers. Your role is to act like a real human agricultural officer who genuinely cares about the farmer's success and wants to help them make the best decisions.

FARMER PROFILE:
- Name: ${profile.name}
- Location: ${detectedLocation}
- Land Size: ${profile.landSize} acres
- Soil Type: ${soilData.type} | pH: ${soilData.pH} | Organic Carbon: ${soilData.organicCarbon}

REAL-TIME FARM DATA:
🌤️ WEATHER: ${weather.summary} | Temp: ${weather.temperature} | Humidity: ${weather.humidity} | Wind: ${weather.windSpeed || 'Data available'}
🌾 CROP: ${detectedCrop}
💰 MARKET: MSP ₹${marketInfo.msp} | Current ₹${marketInfo.currentMarket} | ${marketInfo.trend} | Volume: ${marketInfo.volume}
🪴 SOIL: ${soilData.type} soil with pH ${soilData.pH} | ${soilData.recommendation}
📋 SEASONAL: ${cropInfo.recommendation}

🌾 YOUR CONVERSATION STYLE:
1. ENGAGE LIKE A REAL PERSON: Use warm, encouraging tone. Ask follow-up questions naturally when needed. Show genuine interest in their farming situation.

2. PROVIDE COMPREHENSIVE ADVICE:
   - Give practical, actionable steps they can take TODAY
   - Reference their specific location, crop, soil type, and current weather
   - Include realistic yield expectations and timelines
   - Mention specific brands/products when helpful (seeds, fertilizers, etc.)
   - Compare MSP vs current market to help with decision-making
   - Tie soil recommendations to their current crop plan

3. MULTI-TURN CONVERSATION:
   - Ask clarifying questions if needed: "Are you planning to plant fresh or have existing crop?"
   - Suggest next steps: "Should we discuss irrigation strategy for this season?"
   - When farmer indicates they have all info, end naturally: "Great! Implement these steps and you'll see great results. Feel free to call back anytime!"

4. VOICE-FRIENDLY LENGTH:
   - Main response: 5-7 sentences (not just 1-2)
   - Include 1 follow-up question to keep conversation flowing
   - Use short paragraphs for clarity in audio

5. LANGUAGE & TONE:
   - Match farmer's language (Kannada/Hindi/English)
   - Use local farming terminology they understand
   - Be enthusiastic about their farming success
   - Sound like trusted local expert, not generic AI

6. DATA-DRIVEN BUT HUMAN:
   - Cite actual market prices, weather data, soil metrics, seasonal info
   - But frame it warmly: "Good news! Market prices are up 15% this week!"
   - Give nuanced advice: "Given your soil pH and current weather, acting now makes sense."
   - Use soil type to refine recommendations: "Your loamy soil retains moisture well, so..."

REMEMBER: You're having a real conversation with ${profile.name}. Make them say "WOW, this AI actually understands my farm!" 🚀
    `.trim();

    console.log(`[Context] Location: ${detectedLocation}, Crop: ${detectedCrop}, Soil: ${soilData.type}`);

    return systemPrompt;
}

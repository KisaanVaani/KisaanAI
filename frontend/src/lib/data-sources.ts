import { getWeatherForecast as getRealtimeWeather } from './weather-providers';

export interface FarmerProfile {
  id: string;
  name: string;
  location: string;
  soilHealth: string;
  landSize: string;
  farmingLanguage: string;
}

// Cache to reduce redundant API calls
const responseCache: Record<string, any> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isCacheValid(key: string): boolean {
  const cached = responseCache[key];
  if (!cached) return false;
  return Date.now() - cached.timestamp < CACHE_TTL;
}

// 1. Mocking AgriStack (Farmer Identity & Land records)
export async function getFarmerContext(farmerId: string): Promise<FarmerProfile> {
  await new Promise(resolve => setTimeout(resolve, 50)); // Faster - minimal delay
  return {
    id: farmerId,
    name: "Kisaan bhaisaab", // A generic, polite term instead of a specific name
    location: "Unknown", // Default to unknown so we rely on user input
    soilHealth: "Unknown",
    landSize: "Unknown",
    farmingLanguage: "hi-IN"
  };
}

// 2. Real Weather Data (using WeatherAPI.com, Open-Meteo, or Tomorrow.io)
export async function getWeatherForecast(location: string) {
  const cacheKey = `weather_${location}`;
  if (isCacheValid(cacheKey)) {
    console.log(`[Cache Hit] Weather for ${location}`);
    return responseCache[cacheKey].data;
  }

  try {
    console.log(`[Weather] Fetching real weather for ${location}`);
    const weatherData = await getRealtimeWeather(location);
    
    const result = {
      summary: weatherData.summary,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      condition: weatherData.condition,
      source: 'Real API'
    };
    
    responseCache[cacheKey] = { data: result, timestamp: Date.now() };
    return result;
  } catch (error) {
    console.error('[Weather] Error fetching weather:', error);
    // Fallback
    const fallback = {
      summary: "Light to moderate rainfall expected in the next 48 hours.",
      temperature: "26°C",
      humidity: "82%",
      condition: "Cloudy",
      source: 'Fallback'
    };
    responseCache[cacheKey] = { data: fallback, timestamp: Date.now() };
    return fallback;
  }
}

// 3. Agmarket Data (currently mocked, ready for Agmarknet web scraping)
export async function getMarketPrices(crop: string, location: string) {
  const cacheKey = `prices_${crop}_${location}`;
  if (isCacheValid(cacheKey)) {
    console.log(`[Cache Hit] Prices for ${crop} in ${location}`);
    return responseCache[cacheKey].data;
  }

  // TODO: Replace with real Agmarknet web scraping from https://agmarknet.gov.in/
  await new Promise(resolve => setTimeout(resolve, 50));
  const prices: Record<string, any> = {
    "Arhar Dal": { msp: "₹7,000/qtl", currentMarket: "₹7,300/qtl", trend: "↑ Rising", volume: "High" },
    "Soyabean": { msp: "₹4,600/qtl", currentMarket: "₹4,550/qtl", trend: "→ Stable", volume: "Medium" },
    "Wheat": { msp: "₹2,125/qtl", currentMarket: "₹2,200/qtl", trend: "↑ Rising", volume: "High" },
    "Cotton": { msp: "₹5,730/qtl", currentMarket: "₹5,900/qtl", trend: "↑ Up 3%", volume: "High" }
  };
  
  const result = prices[crop] || { msp: "₹5,000/qtl", currentMarket: "₹5,200/qtl", trend: "→ Stable", volume: "Medium" };
  responseCache[cacheKey] = { data: result, timestamp: Date.now() };
  return result;
}

// 4. Mocking ICAR / FASAL (Crop Calendar)
export async function getCropCalendar(crop: string, season: string) {
  const cacheKey = `calendar_${crop}_${season}`;
  if (isCacheValid(cacheKey)) {
    console.log(`[Cache Hit] Calendar for ${crop} in ${season}`);
    return responseCache[cacheKey].data;
  }

  await new Promise(resolve => setTimeout(resolve, 50)); // Faster
  
  const calendars: Record<string, any> = {
    "Arhar Dal": {
      crop,
      season,
      recommendation: "Plant in June using certified Arhar seeds (LRG-41 or TJT-501 recommended). Maintain 40cm row spacing. Add 15-20 tons organic matter. This season looks excellent - good rainfall predicted and MSP prices are strong!"
    },
    "Soyabean": {
      crop,
      season,
      recommendation: "Sow in June-July with 40-45cm spacing. Use certified Soyabean seeds. Inoculate with Rhizobium bacteria. Current market prices are stable - good opportunity to plant."
    },
    "Wheat": {
      crop,
      season,
      recommendation: "Plant in November-December. Use quality seed at 100kg/hectare. Ensure good moisture before sowing. Market prices trending up - excellent time for planning winter wheat."
    },
    "Cotton": {
      crop,
      season,
      recommendation: "Sow in May-June with proper spacing and irrigation. This crop needs 180+ days. Cotton prices are rising - strong demand in market right now!"
    }
  };

  const result = calendars[crop] || {
    crop,
    season,
    recommendation: "Plant during recommended season. Ensure certified seeds and proper spacing. Current market conditions are favorable."
  };
  
  responseCache[cacheKey] = { data: result, timestamp: Date.now() };
  return result;
}

// 5. Soil Data (currently mocked, ready for SoilGrids integration)
export async function getSoilHealth(location: string) {
  const cacheKey = `soil_${location}`;
  if (isCacheValid(cacheKey)) {
    console.log(`[Cache Hit] Soil data for ${location}`);
    return responseCache[cacheKey].data;
  }

  // TODO: Replace with real SoilGrids API from https://rest.isric.org/soilgrids/v2.0/
  await new Promise(resolve => setTimeout(resolve, 50));
  const result = {
    type: 'Loamy',
    texture: 'Sand: 40%, Clay: 25%',
    pH: '6.8',
    organicCarbon: '0.8%',
    nitrogen: '150 kg/ha',
    phosphorus: '25 kg/ha',
    potassium: '250 kg/ha',
    recommendation: 'Nitrogen deficient - Add 50kg/ha urea. Increase organic matter with compost.',
    source: 'Fallback Data'
  };
  
  responseCache[cacheKey] = { data: result, timestamp: Date.now() };
  return result;
}

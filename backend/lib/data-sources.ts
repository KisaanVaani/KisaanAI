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
    name: "Rajesh",
    location: "Pune, Maharashtra",
    soilHealth: "Nitrogen deficient, pH 6.8",
    landSize: "2 Hectares",
    farmingLanguage: "hi-IN"
  };
}

// 2. Mocking IMD (Weather Forecast)
export async function getWeatherForecast(location: string) {
  const cacheKey = `weather_${location}`;
  if (isCacheValid(cacheKey)) {
    console.log(`[Cache Hit] Weather for ${location}`);
    return responseCache[cacheKey].data;
  }

  await new Promise(resolve => setTimeout(resolve, 50)); // Faster
  const weatherResult = {
    summary: "Light to moderate rainfall expected in the next 48 hours.",
    temperature: "26°C",
    humidity: "82%"
  };
  responseCache[cacheKey] = { data: weatherResult, timestamp: Date.now() };
  return weatherResult;
}

// 3. Mocking Agmarknet (Mandi prices & MSP)
export async function getMarketPrices(crop: string, location: string) {
  const cacheKey = `prices_${crop}_${location}`;
  if (isCacheValid(cacheKey)) {
    console.log(`[Cache Hit] Prices for ${crop} in ${location}`);
    return responseCache[cacheKey].data;
  }

  await new Promise(resolve => setTimeout(resolve, 50)); // Faster
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

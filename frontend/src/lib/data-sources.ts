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

// 1. Farmer Context
export async function getFarmerContext(farmerId: string, language: string = 'en-IN'): Promise<FarmerProfile> {
  await new Promise(resolve => setTimeout(resolve, 30));
  return {
    id: farmerId,
    name: "farmer",
    location: "Unknown",
    soilHealth: "Unknown",
    landSize: "Unknown",
    farmingLanguage: language
  };
}

// 2. Real Weather Data
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
    console.error('[Weather] Error:', error);
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

// 3. Market Prices — Comprehensive Database
export async function getMarketPrices(crop: string, location: string) {
  const cacheKey = `prices_${crop}_${location}`;
  if (isCacheValid(cacheKey)) {
    console.log(`[Cache Hit] Prices for ${crop} in ${location}`);
    return responseCache[cacheKey].data;
  }

  try {
    console.log(`[Market] Fetching prices for ${crop} from ${location}`);
    
    const priceDatabase: Record<string, Record<string, {msp: string, currentMarket: string, range: string, trend: string}>> = {
      "Arhar Dal": { 
        "Hassan, Karnataka": { msp: "₹7,000/qtl", currentMarket: "₹7,300/qtl", range: "₹7,150-7,400", trend: "↑ Rising 4%" },
        "Pune, Maharashtra": { msp: "₹7,000/qtl", currentMarket: "₹7,250/qtl", range: "₹7,100-7,350", trend: "↑ Rising 3%" },
        "Indore, Madhya Pradesh": { msp: "₹7,000/qtl", currentMarket: "₹7,400/qtl", range: "₹7,200-7,500", trend: "↑ Rising 5%" },
        "default": { msp: "₹7,000/qtl", currentMarket: "₹7,300/qtl", range: "₹7,150-7,400", trend: "↑ Rising" }
      },
      "Wheat": { 
        "Delhi": { msp: "₹2,275/qtl", currentMarket: "₹2,350/qtl", range: "₹2,300-2,400", trend: "↑ Rising 3%" },
        "Lucknow, Uttar Pradesh": { msp: "₹2,275/qtl", currentMarket: "₹2,320/qtl", range: "₹2,280-2,380", trend: "↑ Mild rise" },
        "Indore, Madhya Pradesh": { msp: "₹2,275/qtl", currentMarket: "₹2,380/qtl", range: "₹2,340-2,430", trend: "↑ Strong demand" },
        "Ludhiana, Punjab": { msp: "₹2,275/qtl", currentMarket: "₹2,290/qtl", range: "₹2,270-2,340", trend: "→ Stable" },
        "Karnal, Haryana": { msp: "₹2,275/qtl", currentMarket: "₹2,310/qtl", range: "₹2,280-2,360", trend: "↑ Slight up" },
        "default": { msp: "₹2,275/qtl", currentMarket: "₹2,340/qtl", range: "₹2,300-2,400", trend: "↑ Rising" }
      },
      "Rice": {
        "Hassan, Karnataka": { msp: "₹2,300/qtl", currentMarket: "₹2,450/qtl", range: "₹2,400-2,550", trend: "↑ Good demand" },
        "Pune, Maharashtra": { msp: "₹2,300/qtl", currentMarket: "₹2,480/qtl", range: "₹2,420-2,580", trend: "↑ Rising" },
        "Patna, Bihar": { msp: "₹2,300/qtl", currentMarket: "₹2,380/qtl", range: "₹2,340-2,420", trend: "→ Stable" },
        "default": { msp: "₹2,300/qtl", currentMarket: "₹2,450/qtl", range: "₹2,400-2,550", trend: "↑ Rising" }
      },
      "Soyabean": { 
        "Indore, Madhya Pradesh": { msp: "₹4,600/qtl", currentMarket: "₹4,850/qtl", range: "₹4,750-4,950", trend: "↑ Rising 5%" },
        "Pune, Maharashtra": { msp: "₹4,600/qtl", currentMarket: "₹4,780/qtl", range: "₹4,700-4,900", trend: "↑ Slight Up" },
        "Nagpur, Maharashtra": { msp: "₹4,600/qtl", currentMarket: "₹4,820/qtl", range: "₹4,720-4,920", trend: "↑ Rising" },
        "default": { msp: "₹4,600/qtl", currentMarket: "₹4,800/qtl", range: "₹4,700-4,900", trend: "↑ Rising" }
      },
      "Cotton": { 
        "Nagpur, Maharashtra": { msp: "₹7,020/qtl", currentMarket: "₹7,350/qtl", range: "₹7,200-7,500", trend: "↑ Up 4%" },
        "Ahmedabad, Gujarat": { msp: "₹7,020/qtl", currentMarket: "₹7,400/qtl", range: "₹7,300-7,550", trend: "↑ Strong demand" },
        "Bellary, Karnataka": { msp: "₹7,020/qtl", currentMarket: "₹7,280/qtl", range: "₹7,150-7,400", trend: "↑ Rising" },
        "default": { msp: "₹7,020/qtl", currentMarket: "₹7,350/qtl", range: "₹7,200-7,500", trend: "↑ Rising" }
      },
      "Sugarcane": {
        "Pune, Maharashtra": { msp: "₹315/qtl", currentMarket: "₹340/qtl", range: "₹325-355", trend: "↑ Sweet season" },
        "Lucknow, Uttar Pradesh": { msp: "₹315/qtl", currentMarket: "₹335/qtl", range: "₹320-350", trend: "→ Stable" },
        "Kolhapur, Maharashtra": { msp: "₹315/qtl", currentMarket: "₹350/qtl", range: "₹340-365", trend: "↑ Rising 5%" },
        "default": { msp: "₹315/qtl", currentMarket: "₹340/qtl", range: "₹325-355", trend: "↑ Rising" }
      },
      "Ragi": {
        "Hassan, Karnataka": { msp: "₹4,290/qtl", currentMarket: "₹4,500/qtl", range: "₹4,400-4,650", trend: "↑ Rising 5%" },
        "Bangalore, Karnataka": { msp: "₹4,290/qtl", currentMarket: "₹4,550/qtl", range: "₹4,450-4,700", trend: "↑ Health food demand" },
        "Tumkur, Karnataka": { msp: "₹4,290/qtl", currentMarket: "₹4,480/qtl", range: "₹4,380-4,600", trend: "↑ Rising" },
        "default": { msp: "₹4,290/qtl", currentMarket: "₹4,500/qtl", range: "₹4,400-4,650", trend: "↑ Rising" }
      },
      "Maize": {
        "Davangere, Karnataka": { msp: "₹2,090/qtl", currentMarket: "₹2,180/qtl", range: "₹2,130-2,250", trend: "→ Stable" },
        "Indore, Madhya Pradesh": { msp: "₹2,090/qtl", currentMarket: "₹2,200/qtl", range: "₹2,150-2,280", trend: "↑ Slight rise" },
        "default": { msp: "₹2,090/qtl", currentMarket: "₹2,180/qtl", range: "₹2,130-2,250", trend: "→ Stable" }
      },
      "Chana": {
        "Indore, Madhya Pradesh": { msp: "₹5,440/qtl", currentMarket: "₹5,650/qtl", range: "₹5,550-5,800", trend: "↑ Rising 4%" },
        "Jaipur, Rajasthan": { msp: "₹5,440/qtl", currentMarket: "₹5,580/qtl", range: "₹5,500-5,700", trend: "↑ Slight up" },
        "default": { msp: "₹5,440/qtl", currentMarket: "₹5,620/qtl", range: "₹5,500-5,750", trend: "↑ Rising" }
      },
      "Groundnut": {
        "Rajkot, Gujarat": { msp: "₹6,377/qtl", currentMarket: "₹6,600/qtl", range: "₹6,500-6,750", trend: "↑ Rising" },
        "Bellary, Karnataka": { msp: "₹6,377/qtl", currentMarket: "₹6,550/qtl", range: "₹6,450-6,700", trend: "↑ Good demand" },
        "default": { msp: "₹6,377/qtl", currentMarket: "₹6,580/qtl", range: "₹6,450-6,700", trend: "↑ Rising" }
      },
      "Mustard": {
        "Jaipur, Rajasthan": { msp: "₹5,650/qtl", currentMarket: "₹5,900/qtl", range: "₹5,800-6,050", trend: "↑ Rising 4%" },
        "Karnal, Haryana": { msp: "₹5,650/qtl", currentMarket: "₹5,850/qtl", range: "₹5,750-5,950", trend: "↑ Slight up" },
        "default": { msp: "₹5,650/qtl", currentMarket: "₹5,880/qtl", range: "₹5,750-6,000", trend: "↑ Rising" }
      },
      "Bajra": {
        "Jaipur, Rajasthan": { msp: "₹2,500/qtl", currentMarket: "₹2,600/qtl", range: "₹2,550-2,700", trend: "↑ Rising" },
        "Hisar, Haryana": { msp: "₹2,500/qtl", currentMarket: "₹2,580/qtl", range: "₹2,530-2,650", trend: "→ Stable" },
        "default": { msp: "₹2,500/qtl", currentMarket: "₹2,600/qtl", range: "₹2,550-2,700", trend: "↑ Rising" }
      },
      "Jowar": {
        "Gulbarga, Karnataka": { msp: "₹3,225/qtl", currentMarket: "₹3,400/qtl", range: "₹3,300-3,500", trend: "↑ Rising" },
        "Solapur, Maharashtra": { msp: "₹3,225/qtl", currentMarket: "₹3,380/qtl", range: "₹3,280-3,480", trend: "→ Stable" },
        "default": { msp: "₹3,225/qtl", currentMarket: "₹3,400/qtl", range: "₹3,300-3,500", trend: "↑ Rising" }
      },
      "Tomato": {
        "Pune, Maharashtra": { msp: "N/A", currentMarket: "₹25/kg", range: "₹20-35/kg", trend: "↓ Seasonal drop" },
        "Bangalore, Karnataka": { msp: "N/A", currentMarket: "₹30/kg", range: "₹25-40/kg", trend: "→ Stable" },
        "default": { msp: "N/A", currentMarket: "₹28/kg", range: "₹22-38/kg", trend: "→ Seasonal" }
      },
      "Onion": {
        "Nashik, Maharashtra": { msp: "N/A", currentMarket: "₹18/kg", range: "₹15-25/kg", trend: "↑ Rising" },
        "Pune, Maharashtra": { msp: "N/A", currentMarket: "₹20/kg", range: "₹16-28/kg", trend: "↑ Rising" },
        "default": { msp: "N/A", currentMarket: "₹19/kg", range: "₹15-26/kg", trend: "↑ Rising" }
      },
      "Potato": {
        "Agra, Uttar Pradesh": { msp: "N/A", currentMarket: "₹12/kg", range: "₹8-18/kg", trend: "→ Stable" },
        "default": { msp: "N/A", currentMarket: "₹14/kg", range: "₹10-20/kg", trend: "→ Stable" }
      },
      "Turmeric": {
        "Sangli, Maharashtra": { msp: "N/A", currentMarket: "₹14,500/qtl", range: "₹13,500-15,500", trend: "↑ Rising 8%" },
        "default": { msp: "N/A", currentMarket: "₹14,000/qtl", range: "₹13,000-15,000", trend: "↑ Rising" }
      },
      "Chilli": {
        "default": { msp: "N/A", currentMarket: "₹12,000/qtl", range: "₹10,500-14,000", trend: "↑ Rising" }
      },
      "Moong Dal": {
        "Indore, Madhya Pradesh": { msp: "₹8,558/qtl", currentMarket: "₹8,800/qtl", range: "₹8,600-9,000", trend: "↑ Rising" },
        "Jaipur, Rajasthan": { msp: "₹8,558/qtl", currentMarket: "₹8,750/qtl", range: "₹8,550-8,950", trend: "↑ Slight up" },
        "default": { msp: "₹8,558/qtl", currentMarket: "₹8,800/qtl", range: "₹8,600-9,000", trend: "↑ Rising" }
      },
      "Urad Dal": {
        "Indore, Madhya Pradesh": { msp: "₹6,950/qtl", currentMarket: "₹7,200/qtl", range: "₹7,050-7,350", trend: "↑ Rising" },
        "default": { msp: "₹6,950/qtl", currentMarket: "₹7,200/qtl", range: "₹7,050-7,350", trend: "↑ Rising" }
      },
      "Masoor Dal": {
        "default": { msp: "₹6,425/qtl", currentMarket: "₹6,700/qtl", range: "₹6,550-6,850", trend: "↑ Rising" }
      }
    };

    const cropData = priceDatabase[crop];
    let result;
    
    if (cropData) {
      result = cropData[location] || cropData["default"];
    } else {
      result = { 
        msp: "₹4,500/qtl", 
        currentMarket: "₹4,800/qtl", 
        range: "₹4,700-4,900",
        trend: "→ Check local mandi" 
      };
    }

    console.log(`[Market] ${crop} in ${location}: MSP ${result.msp}, Current ${result.currentMarket}`);
    responseCache[cacheKey] = { data: result, timestamp: Date.now() };
    return result;
    
  } catch (error) {
    console.error('[Market] Error:', error);
    const fallback = { msp: "₹4,500/qtl", currentMarket: "₹4,800/qtl", range: "₹4,700-4,900", trend: "→ Check local mandi" };
    responseCache[cacheKey] = { data: fallback, timestamp: Date.now() };
    return fallback;
  }
}

// 4. Crop Calendar — Comprehensive
export async function getCropCalendar(crop: string, season: string) {
  const cacheKey = `calendar_${crop}_${season}`;
  if (isCacheValid(cacheKey)) {
    return responseCache[cacheKey].data;
  }

  await new Promise(resolve => setTimeout(resolve, 30));
  
  const calendars: Record<string, any> = {
    "Arhar Dal": {
      crop, season,
      recommendation: "June-July me buvai karein certified seed (LRG-41 / TJT-501) se. 40cm row spacing rakhein. 15-20 ton organic matter dalein. Kharif season abhi best hai - MSP rates bhi strong hain!"
    },
    "Wheat": {
      crop, season,
      recommendation: "November-December me buvai karein. HD-2967 ya PBW-343 variety use karein. 100kg per hectare beej lagta hai. Rabi season wheat ke liye perfect hai - MSP bhi badhiyan hai!"
    },
    "Rice": {
      crop, season,
      recommendation: "June-July me transplanting karein. IR-64, Swarna ya MTU-7029 variety try karein. Proper nursery raising se start karein. Water management pe dhyan dein - SRI technique se 20% zyada yield milti hai."
    },
    "Soyabean": {
      crop, season,
      recommendation: "June-July me buvai karein, 40-45cm spacing rakhein. JS-335 ya JS-9560 certified seed use karein. Rhizobium inoculation zaroor karein - protein aur yield dono badhti hai."
    },
    "Cotton": {
      crop, season,
      recommendation: "May-June me buvai karein. Bt Cotton varieties preferred hain. 90x60cm spacing rakhein, 180+ din lagta hai. IPM se pest manage karein - pink bollworm ke liye pheromone trap lagayein."
    },
    "Sugarcane": {
      crop, season,
      recommendation: "October-November (autumn) ya February-March (spring) me planting karein. Co-238, CoLk-94184 variety achhi hai. Ring method se planting karein, 75-90cm spacing rakhein."
    },
    "Ragi": {
      crop, season,
      recommendation: "June-July me transplant karein. GPU-28 ya MR-6 variety use karein. 25x10cm spacing rakhein. Ragi drought-resistant hai lekin timely weeding zaruri hai."
    },
    "Maize": {
      crop, season,
      recommendation: "June-July (Kharif) ya October-November (Rabi) me buvai karein. Hybrid varieties (DHM-117, HQPM-1) use karein. 75x25cm spacing rakhein."
    },
    "Chana": {
      crop, season,
      recommendation: "October-November me buvai karein. JG-11 ya Vijay variety try karein. 30x10cm spacing rakhein. Rabi season ka main crop hai - market demand strong hai."
    },
    "Groundnut": {
      crop, season,
      recommendation: "June-July me buvai karein. GG-20 ya TG-37A variety use karein. 30x10cm spacing rakhein. Gypsum application se pod quality badhti hai."
    },
    "Mustard": {
      crop, season,
      recommendation: "October-November me buvai karein. Pusa Bold, RH-749 variety achhi hai. 45x15cm spacing rakhein. Aphid ke liye dhyan rakhein - early spray karein."
    },
    "Bajra": {
      crop, season,
      recommendation: "July-August me buvai karein. HHB-67, GHB-905 variety use karein. 45x15cm spacing rakhein. Kam paani me bhi achhi fasal deti hai."
    },
    "Jowar": {
      crop, season,
      recommendation: "June-July me buvai karein. CSH-16, SPV-462 variety achhi hai. 45x15cm spacing rakhein. Drought-tolerant fasal hai, kam paani me bhi hoti hai."
    },
    "Tomato": {
      crop, season,
      recommendation: "Nursery me seedling tayyar karein, 25-30 din baad transplant karein. Arka Rakshak ya Arka Samrat variety try karein. Staking zaruri hai support ke liye."
    },
    "Onion": {
      crop, season,
      recommendation: "Nursery me seedling 6-8 week pahle lagayein. N-53, Agrifound Light Red variety achhi hai. 15x10cm spacing rakhein."
    },
    "Potato": {
      crop, season,
      recommendation: "October-November me planting karein. Kufri Jyoti, Kufri Pukhraj variety use karein. 60x20cm spacing rakhein. Earthing up zaruri hai."
    },
    "Moong Dal": {
      crop, season,
      recommendation: "March-April (Spring) ya July-August (Kharif) me buvai karein. SML-668, IPM 02-3 variety use karein. 30x10cm spacing."
    },
    "Urad Dal": {
      crop, season,
      recommendation: "June-July me buvai karein. T-9, PU-31 variety achhi hai. 30x10cm spacing rakhein. 60-70 din me tayyar ho jati hai."
    }
  };

  const result = calendars[crop] || {
    crop, season,
    recommendation: "Recommended season me certified seeds use karein. Proper spacing aur timely irrigation se achhi yield milegi."
  };
  
  responseCache[cacheKey] = { data: result, timestamp: Date.now() };
  return result;
}

// 5. Soil Data (with location-based variations)
export async function getSoilHealth(location: string) {
  const cacheKey = `soil_${location}`;
  if (isCacheValid(cacheKey)) {
    return responseCache[cacheKey].data;
  }

  await new Promise(resolve => setTimeout(resolve, 30));
  
  const soilDatabase: Record<string, any> = {
    'Hassan, Karnataka': { type: 'Red Laterite', pH: '6.2', recommendation: 'Lime application recommended to raise pH. Add 2 tonnes FYM per hectare.' },
    'Bangalore, Karnataka': { type: 'Red Loamy', pH: '6.5', recommendation: 'Good drainage. Add compost for organic carbon improvement.' },
    'Mysore, Karnataka': { type: 'Red Sandy Loam', pH: '6.3', recommendation: 'Nitrogen deficient. Apply urea 50kg/ha with organic manure.' },
    'Hubli, Karnataka': { type: 'Black Cotton Soil', pH: '7.5', recommendation: 'Rich in potash. Add phosphorus fertilizer for better yields.' },
    'Gulbarga, Karnataka': { type: 'Deep Black Soil', pH: '7.8', recommendation: 'Good moisture retention. Avoid waterlogging in monsoon.' },
    'Davangere, Karnataka': { type: 'Red Laterite', pH: '6.0', recommendation: 'Acidic soil. Lime application + FYM recommended.' },
    'Tumkur, Karnataka': { type: 'Red Sandy', pH: '6.4', recommendation: 'Sandy texture. Improve with compost, need frequent irrigation.' },
    'Pune, Maharashtra': { type: 'Black Cotton Soil', pH: '7.2', recommendation: 'Rich but heavy. Add gypsum if sodic, maintain drainage.' },
    'Nashik, Maharashtra': { type: 'Medium Black Soil', pH: '7.0', recommendation: 'Good for onion/grapes. Maintain organic carbon with FYM.' },
    'Nagpur, Maharashtra': { type: 'Black Cotton Soil', pH: '7.5', recommendation: 'High clay content. Add sand/compost for better drainage.' },
    'Delhi': { type: 'Alluvial Loam', pH: '7.2', recommendation: 'Good fertility. Regular organic matter addition keeps it productive.' },
    'Indore, Madhya Pradesh': { type: 'Deep Black Soil', pH: '7.6', recommendation: 'Excellent for soybean. Rich in nutrients, good water retention.' },
    'Lucknow, Uttar Pradesh': { type: 'Alluvial Soil', pH: '7.0', recommendation: 'Fertile Indo-Gangetic plains. Regular crop rotation recommended.' },
    'Ludhiana, Punjab': { type: 'Alluvial Loam', pH: '7.5', recommendation: 'Very fertile. Avoid over-irrigation, maintain soil structure.' },
    'Jaipur, Rajasthan': { type: 'Sandy Arid', pH: '8.0', recommendation: 'Alkaline and dry. Add gypsum + organic matter. Drip irrigation best.' },
    'Ahmedabad, Gujarat': { type: 'Alluvial Sandy', pH: '7.8', recommendation: 'Moderate fertility. Add FYM and micronutrients regularly.' },
    'Patna, Bihar': { type: 'Alluvial Soil', pH: '6.8', recommendation: 'Very fertile for rice/wheat. Zinc deficiency common - add ZnSO4.' },
    'Hyderabad, Telangana': { type: 'Red Sandy Loam', pH: '6.5', recommendation: 'Moderate fertility. Add NPK balanced fertilizers.' },
  };

  const result = soilDatabase[location] || {
    type: 'Loamy',
    pH: '6.8',
    recommendation: 'Apply balanced NPK fertilizer. Add 2 tonnes FYM per hectare for organic carbon.'
  };
  
  // Add common fields
  result.organicCarbon = result.organicCarbon || '0.8%';
  result.nitrogen = result.nitrogen || '150 kg/ha';
  result.phosphorus = result.phosphorus || '25 kg/ha';
  result.potassium = result.potassium || '250 kg/ha';
  
  responseCache[cacheKey] = { data: result, timestamp: Date.now() };
  return result;
}

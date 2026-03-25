import axios from 'axios';

// CACHE for scraped data (avoid hammering the server)
const cacheStore: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

export interface MarketPrice {
  crop: string;
  msp: number;
  currentPrice: number;
  trend: string;
  percentChange: number;
  volume: string;
  market: string;
  lastUpdated: string;
}

// Fallback data (when scraping fails or to speed up responses)
const FALLBACK_PRICES: Record<string, MarketPrice> = {
  'arhar dal': {
    crop: 'Arhar Dal',
    msp: 7000,
    currentPrice: 7300,
    trend: '↑ Up',
    percentChange: 4.3,
    volume: 'High',
    market: 'Hassan APMC',
    lastUpdated: new Date().toISOString()
  },
  'soyabean': {
    crop: 'Soyabean',
    msp: 4600,
    currentPrice: 4550,
    trend: '→ Stable',
    percentChange: -1.1,
    volume: 'Medium',
    market: 'Bangalore Market',
    lastUpdated: new Date().toISOString()
  },
  'wheat': {
    crop: 'Wheat',
    msp: 2125,
    currentPrice: 2200,
    trend: '↑ Up',
    percentChange: 3.5,
    volume: 'High',
    market: 'Hassan APMC',
    lastUpdated: new Date().toISOString()
  },
  'cotton': {
    crop: 'Cotton',
    msp: 5730,
    currentPrice: 5900,
    trend: '↑ Up',
    percentChange: 2.9,
    volume: 'High',
    market: 'Hassan APMC',
    lastUpdated: new Date().toISOString()
  }
};

export async function getMarketPriceAgmarknet(
  crop: string,
  market: string = 'hassan'
): Promise<MarketPrice | null> {
  try {
    const cacheKey = `agmarknet_${crop}_${market}`;
    
    // Check cache
    if (cacheStore[cacheKey] && Date.now() - cacheStore[cacheKey].timestamp < CACHE_DURATION) {
      console.log(`[AgrMarket] Cache hit for ${crop}`);
      return cacheStore[cacheKey].data;
    }

    console.log(`[AgrMarket] Scraping Agmarknet for ${crop} in ${market}`);

    // Try to scrape Agmarknet
    const priceData = await scrapeAgmarknet(crop, market);
    
    if (priceData) {
      cacheStore[cacheKey] = { data: priceData, timestamp: Date.now() };
      console.log(`[AgrMarket] ✓ Got live data: ${priceData.currentPrice}`);
      return priceData;
    }

    // Fallback to pre-set prices
    console.warn(`[AgrMarket] Scraping failed, using fallback prices`);
    const fallback = FALLBACK_PRICES[crop.toLowerCase()] || null;
    if (fallback) {
      cacheStore[cacheKey] = { data: fallback, timestamp: Date.now() };
    }
    return fallback;

  } catch (error) {
    console.error('[AgrMarket] Error:', error instanceof Error ? error.message : error);
    return FALLBACK_PRICES[crop.toLowerCase()] || null;
  }
}

// Scrape Agmarknet website (since they don't have a public API)
async function scrapeAgmarknet(crop: string, market: string): Promise<MarketPrice | null> {
  try {
    // Agmarknet is primarily available through their website with complex HTML
    // For now, we'll use a fallback approach with JSON APIs if available
    // In production, you could use Puppeteer for full browser rendering
    
    console.log(`[Scrape] Agmarknet scraping would require HTML parsing`);
    return null;
  } catch (error) {
    console.error('[Scrape] Failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

// Alternative: Government Agritech API (when available)
export async function getMarketPriceAgrAPI(
  crop: string,
  location: string
): Promise<MarketPrice | null> {
  try {
    // Example: Free Agritech API if available
    const response = await axios.get('http://api.agritech.tnau.ac.in/quotes', {
      params: { crop, location },
      timeout: 10000
    });

    if (response.data?.prices) {
      const price = response.data.prices[0];
      return {
        crop,
        msp: price.msp || 0,
        currentPrice: price.current || 0,
        trend: price.current > price.msp ? '↑ Up' : '→ Stable',
        percentChange: ((price.current - price.msp) / price.msp) * 100,
        volume: 'High',
        market: location,
        lastUpdated: new Date().toISOString()
      };
    }

    return null;
  } catch (error) {
    console.error('[AgrAPI] Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

// Get market analysis
export function getMarketAdvice(price: MarketPrice, quantity: number, sellDate?: Date): string {
  const advice: string[] = [];

  if (price.percentChange > 5) {
    advice.push(`✅ Prices are UP ${price.percentChange.toFixed(1)}% - Good time to sell!`);
  } else if (price.percentChange < -5) {
    advice.push(`⚠️ Prices are DOWN - Consider waiting for recovery.`);
  } else {
    advice.push(`📊 Prices are stable.`);
  }

  const potentialRevenue = price.currentPrice * quantity;
  advice.push(`💰 At current price: ₹${price.currentPrice}/unit × ${quantity} = ₹${potentialRevenue.toLocaleString()}`);

  if (price.currentPrice > price.msp) {
    const premiumRevenue = (price.currentPrice - price.msp) * quantity;
    advice.push(`📈 Earning ₹${premiumRevenue.toLocaleString()} ABOVE MSP!`);
  }

  advice.push(`📍 Market: ${price.market}`);

  return advice.join('\n');
}

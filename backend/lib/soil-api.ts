import axios from 'axios';

// SOILGRIDS API - Completely FREE, NO KEY NEEDED
const SOILGRIDS_BASE = 'https://rest.isric.org/soilgrids/v2.0/properties/query';

export interface SoilData {
  soilType: string;
  sandPercentage: number;
  clayPercentage: number;
  pH: number;
  organicCarbon: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  recommendation: string;
}

export async function getSoilDataFromCoordinates(
  latitude: number,
  longitude: number
): Promise<SoilData | null> {
  try {
    console.log(`[Soil] Fetching soil data for (${latitude}, ${longitude})`);

    const response = await axios.get(SOILGRIDS_BASE, {
      params: {
        lon: longitude,
        lat: latitude,
        property: ['sand', 'clay', 'silt', 'phh2o', 'oc', 'nitrogen', 'cec'],
        depth: '0-5cm'
      },
      timeout: 15000
    });

    if (!response.data?.properties) {
      throw new Error('No soil data in response');
    }

    const props = response.data.properties;
    
    // Extract values (SoilGrids returns arrays with mean values)
    const sand = props.sand?.[0]?.values?.mean || 0;
    const clay = props.clay?.[0]?.values?.mean || 0;
    const silt = props.silt?.[0]?.values?.mean || 0;
    const ph = props.phh2o?.[0]?.values?.mean / 10 || 7.0; // Convert to pH scale
    const oc = props.oc?.[0]?.values?.mean || 0; // Organic Carbon
    const nitrogen = props.nitrogen?.[0]?.values?.mean || 0;
    const cec = props.cec?.[0]?.values?.mean || 0;

    // Determine soil type
    let soilType = 'Unknown';
    if (clay < 27 && sand > 52) soilType = 'Sandy';
    else if (clay < 27 && sand < 52) soilType = 'Loamy Sand';
    else if (clay < 27 && silt > 50) soilType = 'Silt Loam';
    else if (clay >= 27 && clay < 35) soilType = 'Clay Loam';
    else if (clay >= 35) soilType = 'Clay';
    else soilType = 'Loam';

    // Generate recommendation
    let recommendation = ``;
    if (ph < 6.5) recommendation += 'Acidic soil - Add lime. ';
    if (ph > 7.5) recommendation += 'Alkaline soil - Add sulfur. ';
    if (oc < 1) recommendation += 'Low organic matter - Add compost. ';
    if (nitrogen < 100) recommendation += 'Low nitrogen - Use nitrogen fertilizer. ';
    if (!recommendation) recommendation = 'Soil conditions are good. Maintain current practices.';

    const soilData: SoilData = {
      soilType,
      sandPercentage: Math.round(sand),
      clayPercentage: Math.round(clay),
      pH: Math.round(ph * 10) / 10,
      organicCarbon: Math.round(oc * 100) / 100,
      nitrogen: Math.round(nitrogen),
      phosphorus: 0, // SoilGrids doesn't provide direct P data
      potassium: 0, // SoilGrids doesn't provide direct K data
      recommendation
    };

    console.log(`[Soil] ✓ Got soil data: ${soilData.soilType}, pH ${soilData.pH}`);
    return soilData;

  } catch (error) {
    console.error('[Soil] Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

// Practical soil recommendations based on location
export async function getSoilDataFromLocation(location: string): Promise<SoilData | null> {
  const locationCoordinates: Record<string, { lat: number; lon: number }> = {
    'hassan, karnataka': { lat: 15.33, lon: 75.74 },
    'bangalore, karnataka': { lat: 12.97, lon: 77.59 },
    'pune, maharashtra': { lat: 18.52, lon: 73.86 },
    'hassan': { lat: 15.33, lon: 75.74 },
    'bangalore': { lat: 12.97, lon: 77.59 },
    'pune': { lat: 18.52, lon: 73.86 }
  };

  const coords = locationCoordinates[location.toLowerCase()] || { lat: 15.33, lon: 75.74 };
  return getSoilDataFromCoordinates(coords.lat, coords.lon);
}

// Generic soil recommendation based on soil type
export function getSoilRecommendation(soilData: SoilData, cropType: string): string {
  const recommendations: Record<string, string> = {
    'sandy': `${cropType} in sandy soil: Add 20-30 tons FYM/hectare. Use drip irrigation. Apply frequent light irrigation.`,
    'loamy sand': `${cropType} in loamy sand: Add 15-20 tons FYM. Medium water retention. Standard practices suitable.`,
    'silt loam': `${cropType} in silt loam: Ideal soil! 10-15 tons FYM sufficient. Good water holding capacity.`,
    'clay loam': `${cropType} in clay loam: Dense soil - improve drainage. Add organic matter. Watch for waterlogging.`,
    'clay': `${cropType} in clay soil: Heavy soil - serious drainage issues. Mix with sand. Add gypsum. Raised beds recommended.`
  };

  return recommendations[soilData.soilType.toLowerCase()] || 'Standard soil management practices recommended.';
}

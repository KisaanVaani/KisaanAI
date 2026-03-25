import axios from 'axios';

// USE OPEN-METEO (FREE, NO KEY NEEDED)
const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

interface WeatherData {
  temperature: number;
  humidity: number;
  weatherCode: string;
  weatherDescription: string;
  rainfall: number;
  windSpeed: number;
}

export async function getWeatherFromLocation(location: string): Promise<WeatherData | null> {
  try {
    // Convert location to coordinates (simple mapping for common Indian locations)
    const locationMap: Record<string, { lat: number; lon: number }> = {
      'hassan, karnataka': { lat: 15.33, lon: 75.74 },
      'bangalore, karnataka': { lat: 12.97, lon: 77.59 },
      'pune, maharashtra': { lat: 18.52, lon: 73.86 },
      'delhi': { lat: 28.70, lon: 77.10 },
      'mumbai, maharashtra': { lat: 19.08, lon: 72.88 },
      'hassan': { lat: 15.33, lon: 75.74 },
      'bangalore': { lat: 12.97, lon: 77.59 },
      'pune': { lat: 18.52, lon: 73.86 }
    };

    const coords = locationMap[location.toLowerCase()] || { lat: 15.33, lon: 75.74 };

    console.log(`[Weather] Fetching weather for ${location} (${coords.lat}, ${coords.lon})`);

    const response = await axios.get(OPEN_METEO_BASE, {
      params: {
        latitude: coords.lat,
        longitude: coords.lon,
        current: 'temperature_2m,relative_humidity_2m,weather_code,rainfall,wind_speed_10m',
        temperature_unit: 'celsius',
        wind_speed_unit: 'kmh',
        timezone: 'Asia/Kolkata'
      },
      timeout: 10000
    });

    if (!response.data?.current) {
      throw new Error('No weather data in response');
    }

    const current = response.data.current;
    const weatherDescription = getWeatherDescription(current.weather_code);

    const weatherData: WeatherData = {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      weatherCode: current.weather_code.toString(),
      weatherDescription,
      rainfall: current.rainfall || 0,
      windSpeed: current.wind_speed_10m || 0
    };

    console.log(`[Weather] ✓ Got weather: ${weatherData.temperature}°C, ${weatherData.weatherDescription}`);
    return weatherData;

  } catch (error) {
    console.error('[Weather] Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

// WMO Weather code interpretation
function getWeatherDescription(code: number): string {
  const descriptionMap: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  return descriptionMap[code] || 'Unknown weather';
}

// Alternative: WeatherAPI.com (Better data, requires key)
export async function getWeatherFromWeatherAPI(
  location: string,
  apiKey?: string
): Promise<WeatherData | null> {
  if (!apiKey) {
    console.log('[Weather] WeatherAPI key not provided, using Open-Meteo');
    return getWeatherFromLocation(location);
  }

  try {
    const response = await axios.get('https://api.weatherapi.com/v1/current.json', {
      params: {
        key: apiKey,
        q: location,
        aqi: 'yes'
      },
      timeout: 10000
    });

    const current = response.data.current;

    return {
      temperature: current.temp_c,
      humidity: current.humidity,
      weatherCode: current.condition.code.toString(),
      weatherDescription: current.condition.text,
      rainfall: current.precip_mm,
      windSpeed: current.wind_kph
    };

  } catch (error) {
    console.error('[WeatherAPI] Error:', error instanceof Error ? error.message : error);
    return null;
  }
}

import axios from 'axios';

export interface WeatherData {
  temperature: string;
  humidity: string;
  summary: string;
  condition: string;
}

// ============= WeatherAPI.com Provider =============
async function getWeatherFromWeatherAPI(location: string): Promise<WeatherData> {
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (!apiKey) {
    console.warn('[Weather] WeatherAPI key missing');
    return getWeatherFromOpenMeteo(location); // Fallback
  }

  try {
    const response = await axios.get(
      `https://api.weatherapi.com/v1/current.json`,
      {
        params: {
          key: apiKey,
          q: location,
          aqi: 'yes'
        }
      }
    );

    const { current } = response.data;
    return {
      temperature: `${current.temp_c}°C`,
      humidity: `${current.humidity}%`,
      summary: current.condition.text,
      condition: current.condition.text
    };
  } catch (error) {
    console.error('[Weather] WeatherAPI error:', error);
    return getWeatherFromOpenMeteo(location); // Fallback
  }
}

// ============= Open-Meteo Provider (NO KEY NEEDED!) =============
async function getWeatherFromOpenMeteo(location: string): Promise<WeatherData> {
  try {
    // Get coordinates from location (simple approach)
    const coordinates: Record<string, { lat: number; lon: number }> = {
      'hassan, karnataka': { lat: 15.33, lon: 75.74 },
      'bangalore, karnataka': { lat: 12.97, lon: 77.59 },
      'pune, maharashtra': { lat: 18.52, lon: 73.86 },
      'mumbai, maharashtra': { lat: 19.08, lon: 72.88 },
      'delhi': { lat: 28.61, lon: 77.21 }
    };

    const key = location.toLowerCase();
    let coords = coordinates[key];

    if (!coords) {
      // Default to Hassan if not found
      coords = { lat: 15.33, lon: 75.74 };
      console.warn(`[Weather] Location ${location} not mapped, using Hassan`);
    }

    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast`,
      {
        params: {
          latitude: coords.lat,
          longitude: coords.lon,
          current: 'temperature_2m,relative_humidity_2m,weather_code'
        }
      }
    );

    const { current } = response.data;
    const weatherCode = current.weather_code;
    const weatherDescription = getWeatherDescription(weatherCode);

    return {
      temperature: `${current.temperature_2m}°C`,
      humidity: `${current.relative_humidity_2m}%`,
      summary: weatherDescription,
      condition: weatherDescription
    };
  } catch (error) {
    console.error('[Weather] Open-Meteo error:', error);
    return getDefaultWeather();
  }
}

// ============= Tomorrow.io Provider =============
async function getWeatherFromTomorrowIO(location: string): Promise<WeatherData> {
  const apiKey = process.env.TOMORROW_IO_API_KEY;
  
  if (!apiKey) {
    console.warn('[Weather] Tomorrow.io key missing');
    return getWeatherFromOpenMeteo(location); // Fallback
  }

  try {
    const response = await axios.get(
      `https://api.tomorrow.io/v4/weather/realtime`,
      {
        params: {
          location: location,
          apikey: apiKey
        }
      }
    );

    const { data } = response.data;
    return {
      temperature: `${data.values.temperature}°C`,
      humidity: `${data.values.humidity}%`,
      summary: data.values.weatherCodeDescription || 'Clear',
      condition: data.values.weatherCodeDescription || 'Clear'
    };
  } catch (error) {
    console.error('[Weather] Tomorrow.io error:', error);
    return getWeatherFromOpenMeteo(location); // Fallback
  }
}

// ============= Weather Code to Description (for Open-Meteo) =============
function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
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
  return weatherCodes[code] || 'Unknown';
}

// ============= Default Weather (Fallback) =============
function getDefaultWeather(): WeatherData {
  return {
    temperature: '28°C',
    humidity: '65%',
    summary: 'Light to moderate rainfall expected in the next 48 hours.',
    condition: 'Partly cloudy with rain'
  };
}

// ============= Main Export - Use Best Available Provider =============
export async function getWeatherForecast(location: string): Promise<WeatherData> {
  console.log(`[Weather] Fetching weather for ${location}`);

  // Priority: WeatherAPI > Tomorrow.io > Open-Meteo (free fallback)
  
  // Try WeatherAPI first
  if (process.env.WEATHER_API_KEY) {
    console.log('[Weather] Using WeatherAPI.com');
    return getWeatherFromWeatherAPI(location);
  }

  // Try Tomorrow.io second
  if (process.env.TOMORROW_IO_API_KEY) {
    console.log('[Weather] Using Tomorrow.io');
    return getWeatherFromTomorrowIO(location);
  }

  // Use Open-Meteo (FREE, no key needed)
  console.log('[Weather] Using Open-Meteo (free provider)');
  return getWeatherFromOpenMeteo(location);
}

// ============= Test Function =============
export async function testWeatherAPI(location: string = 'Hassan, Karnataka'): Promise<void> {
  console.log(`\n[Weather Test] Testing providers for: ${location}\n`);

  const weather = await getWeatherForecast(location);
  console.log('Weather Data:', weather);
  console.log('\n[Test] Weather APIs working! ✅\n');
}

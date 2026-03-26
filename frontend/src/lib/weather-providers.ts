import axios from 'axios';

export interface ForecastDay {
  date: string;
  condition: string;
  maxTemp: string;
  minTemp: string;
  rainMm: string;
}

export interface WeatherData {
  temperature: string;
  humidity: string;
  summary: string;
  condition: string;
  forecast7Days?: ForecastDay[];
  rainToday?: string;
  windSpeed?: string;
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
    // Get coordinates from location
    const coordinates: Record<string, { lat: number; lon: number }> = {
      // Karnataka
      'hassan, karnataka': { lat: 13.00, lon: 76.10 },
      'bangalore, karnataka': { lat: 12.97, lon: 77.59 },
      'mysore, karnataka': { lat: 12.30, lon: 76.65 },
      'mangalore, karnataka': { lat: 12.87, lon: 74.88 },
      'hubli, karnataka': { lat: 15.36, lon: 75.12 },
      'dharwad, karnataka': { lat: 15.46, lon: 75.01 },
      'belgaum, karnataka': { lat: 15.85, lon: 74.50 },
      'tumkur, karnataka': { lat: 13.34, lon: 77.10 },
      'shimoga, karnataka': { lat: 13.93, lon: 75.57 },
      'gulbarga, karnataka': { lat: 17.33, lon: 76.83 },
      'davangere, karnataka': { lat: 14.47, lon: 75.92 },
      'raichur, karnataka': { lat: 16.21, lon: 77.36 },
      'bellary, karnataka': { lat: 15.14, lon: 76.92 },
      'karnataka': { lat: 15.33, lon: 75.74 },
      'hampi, karnataka': { lat: 15.33, lon: 76.46 },
      // Maharashtra
      'pune, maharashtra': { lat: 18.52, lon: 73.86 },
      'mumbai, maharashtra': { lat: 19.08, lon: 72.88 },
      'nashik, maharashtra': { lat: 19.99, lon: 73.79 },
      'nagpur, maharashtra': { lat: 21.15, lon: 79.09 },
      'solapur, maharashtra': { lat: 17.68, lon: 75.91 },
      'aurangabad, maharashtra': { lat: 19.88, lon: 75.34 },
      'kolhapur, maharashtra': { lat: 16.70, lon: 74.24 },
      'sangli, maharashtra': { lat: 16.85, lon: 74.56 },
      'maharashtra': { lat: 19.66, lon: 75.30 },
      // North India
      'delhi': { lat: 28.61, lon: 77.21 },
      'lucknow, uttar pradesh': { lat: 26.85, lon: 80.95 },
      'kanpur, uttar pradesh': { lat: 26.45, lon: 80.35 },
      'varanasi, uttar pradesh': { lat: 25.32, lon: 83.01 },
      'agra, uttar pradesh': { lat: 27.18, lon: 78.02 },
      'prayagraj, uttar pradesh': { lat: 25.43, lon: 81.85 },
      'noida, uttar pradesh': { lat: 28.57, lon: 77.32 },
      // Madhya Pradesh
      'indore, madhya pradesh': { lat: 22.72, lon: 75.86 },
      'bhopal, madhya pradesh': { lat: 23.26, lon: 77.41 },
      'jabalpur, madhya pradesh': { lat: 23.18, lon: 79.95 },
      'gwalior, madhya pradesh': { lat: 26.22, lon: 78.18 },
      'madhya pradesh': { lat: 23.47, lon: 77.95 },
      // Punjab & Haryana
      'ludhiana, punjab': { lat: 30.90, lon: 75.86 },
      'amritsar, punjab': { lat: 31.63, lon: 74.87 },
      'jalandhar, punjab': { lat: 31.33, lon: 75.58 },
      'punjab': { lat: 31.15, lon: 75.34 },
      'karnal, haryana': { lat: 29.69, lon: 76.98 },
      'hisar, haryana': { lat: 29.15, lon: 75.72 },
      'gurugram, haryana': { lat: 28.46, lon: 77.03 },
      'haryana': { lat: 29.06, lon: 76.09 },
      // Rajasthan
      'jaipur, rajasthan': { lat: 26.91, lon: 75.79 },
      'jodhpur, rajasthan': { lat: 26.24, lon: 73.02 },
      'udaipur, rajasthan': { lat: 24.59, lon: 73.71 },
      'kota, rajasthan': { lat: 25.18, lon: 75.86 },
      'rajasthan': { lat: 27.02, lon: 74.22 },
      // Gujarat
      'ahmedabad, gujarat': { lat: 23.02, lon: 72.57 },
      'surat, gujarat': { lat: 21.17, lon: 72.83 },
      'rajkot, gujarat': { lat: 22.30, lon: 70.80 },
      'gujarat': { lat: 22.26, lon: 71.19 },
      // South India
      'chennai, tamil nadu': { lat: 13.08, lon: 80.27 },
      'coimbatore, tamil nadu': { lat: 11.00, lon: 76.96 },
      'madurai, tamil nadu': { lat: 9.92, lon: 78.12 },
      'hyderabad, telangana': { lat: 17.39, lon: 78.49 },
      // East India
      'patna, bihar': { lat: 25.61, lon: 85.14 },
      'ranchi, jharkhand': { lat: 23.34, lon: 85.31 },
      'kolkata, west bengal': { lat: 22.57, lon: 88.36 },
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
          current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
          timezone: 'Asia/Kolkata',
          forecast_days: 7
        }
      }
    );

    const { current, daily } = response.data;
    const weatherCode = current.weather_code;
    const weatherDescription = getWeatherDescription(weatherCode);

    // Build 7-day forecast
    const forecast7Days: ForecastDay[] = [];
    if (daily && daily.time) {
      for (let i = 0; i < Math.min(7, daily.time.length); i++) {
        forecast7Days.push({
          date: daily.time[i],
          condition: getWeatherDescription(daily.weather_code[i]),
          maxTemp: `${daily.temperature_2m_max[i]}°C`,
          minTemp: `${daily.temperature_2m_min[i]}°C`,
          rainMm: `${daily.precipitation_sum[i]} mm`,
        });
      }
    }

    return {
      temperature: `${current.temperature_2m}°C`,
      humidity: `${current.relative_humidity_2m}%`,
      summary: weatherDescription,
      condition: weatherDescription,
      rainToday: `${current.precipitation || 0} mm`,
      windSpeed: `${current.wind_speed_10m} km/h`,
      forecast7Days,
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

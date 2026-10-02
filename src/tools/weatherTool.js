/**
 * KisanGuard AI — Weather Tool
 * 
 * Tool Interface:
 * - name: 'weatherTool'
 * - description: Describes tool capability for LLM tool selection
 * - inputSchema: Parameter definitions and constraints
 * - execute(params): Function that validates inputs and returns structured weather data or structured error
 */

/**
 * WMO Weather Code Translations
 */
const WMO_MAP = {
  0: { en: 'Clear sky', gu: 'સ્વચ્છ આકાશ' },
  1: { en: 'Mainly clear', gu: 'મુખ્યત્વે સ્વચ્છ આકાશ' },
  2: { en: 'Partly cloudy', gu: 'અંશતઃ વાદળછાયું' },
  3: { en: 'Overcast', gu: 'ઘેરા વાદળો' },
  45: { en: 'Foggy', gu: 'ઝાકળ / ધુમ્મસ' },
  51: { en: 'Light drizzle', gu: 'હળવા ઝાપટા' },
  61: { en: 'Slight rain', gu: 'હળવો વરસાદ' },
  63: { en: 'Moderate rain', gu: 'મધ્યમ વરસાદ' },
  65: { en: 'Heavy rain', gu: 'ભારે વરસાદ' },
  80: { en: 'Rain showers', gu: 'વરસાદી બોછાર' },
  95: { en: 'Thunderstorm', gu: 'વીજળી સાથે વરસાદ' }
};

/**
 * Geocodes city / village name using Open-Meteo Geocoding API
 */
async function geocodeLocationName(query = 'Anand, Gujarat') {
  try {
    const cleanQuery = query.split(',')[0].trim();
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.results?.[0];
    if (result) {
      return {
        lat: result.latitude,
        lon: result.longitude,
        name: `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}`
      };
    }
  } catch (e) {
    console.warn('[weatherTool] Geocode error:', e.message);
  }
  return null;
}

/**
 * Fetches real-time weather & multi-day forecast from Open-Meteo API
 */
async function fetchOpenMeteoWeatherData(lat = 22.5525, lon = 72.9552, locationName = 'Anand, Gujarat', days = 7) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    
    const curr = data.current || {};
    const daily = data.daily || {};

    const currentCode = curr.weather_code || 0;
    const currCondition = WMO_MAP[currentCode] || { en: 'Clear sky', gu: 'સ્વચ્છ વાતાવરણ' };

    const forecastDays = [];
    const maxDays = Math.min(daily.time?.length || 0, Math.max(1, Math.min(days, 7)));

    if (Array.isArray(daily.time)) {
      for (let i = 0; i < maxDays; i++) {
        const code = daily.weather_code?.[i] || 0;
        const cond = WMO_MAP[code] || { en: 'Clear sky', gu: 'સ્વચ્છ વાતાવરણ' };
        forecastDays.push({
          date: daily.time[i],
          dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' }),
          tempMax: Math.round(daily.temperature_2m_max?.[i] || 30),
          tempMin: Math.round(daily.temperature_2m_min?.[i] || 22),
          rainProbability: daily.precipitation_probability_max?.[i] || 0,
          rainfall: daily.precipitation_sum?.[i] || 0,
          conditionEn: cond.en,
          conditionGu: cond.gu
        });
      }
    }

    return {
      location: {
        name: locationName,
        latitude: lat,
        longitude: lon
      },
      current: {
        temperature: Math.round(curr.temperature_2m || 28),
        feelsLike: Math.round(curr.apparent_temperature || 30),
        humidity: curr.relative_humidity_2m || 70,
        windSpeed: Math.round(curr.wind_speed_10m || 10),
        rainfall: curr.rain || 0,
        rainProbability: forecastDays[0]?.rainProbability || 10,
        conditionEn: currCondition.en,
        conditionGu: currCondition.gu
      },
      forecast: forecastDays,
      retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (e) {
    console.error('[weatherTool] Fetch error:', e.message);
    return null;
  }
}

export const weatherTool = {
  name: 'weatherTool',
  description: 'Retrieves current live weather conditions (temperature, rain probability, humidity, wind) and 7-day microclimate forecast for any location or coordinates in India.',
  inputSchema: {
    type: 'object',
    properties: {
      locationName: {
        type: 'string',
        description: 'City, village, or district name (e.g., "Anand", "Rajkot", "Junagadh, Gujarat").'
      },
      latitude: {
        type: 'number',
        description: 'Latitude coordinate (-90 to 90).'
      },
      longitude: {
        type: 'number',
        description: 'Longitude coordinate (-180 to 180).'
      },
      days: {
        type: 'integer',
        description: 'Number of forecast days to retrieve (1 to 7). Defaults to 7.'
      }
    },
    required: []
  },
  
  /**
   * Safe execution function with input validation and error handling
   */
  async execute(params = {}) {
    let { locationName, latitude, longitude, days = 7 } = params || {};

    // 1. INPUT VALIDATION
    let lat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : null;
    let lon = typeof longitude === 'number' && !isNaN(longitude) ? longitude : null;
    let locName = typeof locationName === 'string' && locationName.trim() ? locationName.trim() : 'Anand, Gujarat';
    let validDays = typeof days === 'number' && Number.isInteger(days) ? Math.max(1, Math.min(days, 7)) : 7;

    if (lat !== null && (lat < -90 || lat > 90)) {
      return {
        success: false,
        errorType: 'INVALID_INPUT',
        error: 'Latitude must be between -90 and 90.'
      };
    }
    if (lon !== null && (lon < -180 || lon > 180)) {
      return {
        success: false,
        errorType: 'INVALID_INPUT',
        error: 'Longitude must be between -180 and 180.'
      };
    }

    // 2. LOCATION RESOLUTION
    if ((lat === null || lon === null) && locName) {
      const geo = await geocodeLocationName(locName);
      if (geo) {
        lat = geo.lat;
        lon = geo.lon;
        locName = geo.name;
      } else {
        // Fallback default coordinates for Gujarat center (Anand) if geocoding fails
        lat = 22.5525;
        lon = 72.9552;
      }
    } else if (lat === null || lon === null) {
      lat = 22.5525;
      lon = 72.9552;
    }

    // 3. FETCH WEATHER DATA
    const weatherData = await fetchOpenMeteoWeatherData(lat, lon, locName, validDays);

    if (!weatherData) {
      return {
        success: false,
        errorType: 'WEATHER_UNAVAILABLE',
        error: 'Could not fetch weather data from Open-Meteo API.'
      };
    }

    return {
      success: true,
      data: weatherData
    };
  }
};

export default weatherTool;

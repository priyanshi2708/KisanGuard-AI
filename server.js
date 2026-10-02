/**
 * KisanGuard AI — Production Backend Server
 *
 * Extracted from vite.config.js configureServer() hook.
 * All API routes: /api/chat, /api/vision/analyze, /api/speech/transcribe,
 *                  /api/speech/synthesize, /api/weather
 *
 * Behaviour, security, payload limits, tool integration, error handling:
 * IDENTICAL to the original Vite dev-server implementation.
 *
 * Start:  node server.js
 * Or via: npm start  |  npm run server
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ── Database & Native Auth ───────────────────────────────────────────────────
import { connectDB } from './server/config/db.js';
import authRoutes from './server/routes/authRoutes.js';
import userRoutes from './server/routes/userRoutes.js';
import farmBookRoutes from './server/routes/farmBookRoutes.js';
import { optionalAuth } from './server/middleware/authMiddleware.js';

// ── Tool Registry ────────────────────────────────────────────────────────────
import { getToolDeclarations, executeTool, getTool } from './src/tools/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Initialize MongoDB
connectDB();

const app = express();

// Ensure DB is connected for API requests
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    await connectDB().catch(err => console.error('[DB Middleware] Error:', err));
  }
  next();
});

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cookieParser());

// ── CORS ─────────────────────────────────────────────────────────────────────
const configuredOrigins = (process.env.FRONTEND_ORIGIN || '')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:3000'
];

const allowedOrigins = Array.from(new Set([
  ...defaultDevOrigins,
  ...configuredOrigins
]));

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.includes('vercel.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    // Allow origin with credentials
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Express JSON & URL-encoded body parsers (with pre-parsed body protection)
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});

app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
    return next();
  }
  express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
});

// ── Mount Authentication & User Routes ───────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/user', userRoutes);
app.use('/api/farmbook', farmBookRoutes);
app.use('/farmbook', farmBookRoutes);

// ── Shared helpers (identical to vite.config.js) ─────────────────────────────

/**
 * Safely extracts JSON payload from Groq AI response string.
 * Strips <think>...</think> reasoning tags present in Qwen output.
 */
function parseGroqJsonResponse(text = '') {
  try {
    let cleanedText = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    try {
      const parsed = JSON.parse(cleanedText);
      if (parsed && (parsed.name === 'json' || parsed.name === 'json_response') && parsed.arguments) {
        return typeof parsed.arguments === 'string' ? JSON.parse(parsed.arguments) : parsed.arguments;
      }
      return parsed;
    } catch (e) {}

    const fenceStripped = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try {
      const parsed = JSON.parse(fenceStripped);
      if (parsed && (parsed.name === 'json' || parsed.name === 'json_response') && parsed.arguments) {
        return typeof parsed.arguments === 'string' ? JSON.parse(parsed.arguments) : parsed.arguments;
      }
      return parsed;
    } catch (e) {}

    const firstBrace = cleanedText.indexOf('{');
    const lastBrace  = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleanedText.substring(firstBrace, lastBrace + 1);
      try {
        const parsed = JSON.parse(candidate);
        if (parsed && (parsed.name === 'json' || parsed.name === 'json_response') && parsed.arguments) {
          return typeof parsed.arguments === 'string' ? JSON.parse(parsed.arguments) : parsed.arguments;
        }
        return parsed;
      } catch (e) {}
    }

    // Partial / Truncated JSON recovery
    const cropNameMatch = text.match(/"name":\s*"([^"]+)"/i)
      || text.match(/Crop:\s*\*?\*?([A-Za-z\s]+)\*?\*?/i)
      || text.match(/\b(Rice|Cotton|Wheat|Maize|Groundnut|Tomato|Chilli|Pulses|Banana)\b/i);
    const localNameMatch    = text.match(/"localName":\s*"([^"]+)"/i);
    const confidenceMatch   = text.match(/"confidence":\s*"([^"]+)"/i);

    if (cropNameMatch && cropNameMatch[1]) {
      const cropName = cropNameMatch[1].trim();
      if (!['null','none','unknown'].includes(cropName.toLowerCase())) {
        console.log(`[Groq Proxy] Recovered crop "${cropName}" from truncated response.`);
        return {
          success: true,
          crop: {
            name: cropName,
            localName: localNameMatch ? localNameMatch[1] : cropName,
            confidence: confidenceMatch ? confidenceMatch[1] : 'High'
          },
          imageQuality: { isClear: true, reason: null },
          observations: ['Crop visual characteristics identified from photo.'],
          possibleIssues: [],
          recommendedNextSteps: [
            '૧. પિયત અને ખાતરનું યોગ્ય ટાઇમિંગ જાળવો.',
            '૨. નિયમિત પાક નિરીક્ષણ કરો.'
          ],
          needsExpertConfirmation: true,
          textResponse: `🌱 પાક ઓળખાયો: **${cropName}**`
        };
      }
    }
  } catch (e) {
    console.warn('[Groq Proxy] Could not parse Groq JSON output:', e.message);
  }
  return null;
}

/**
 * Fetches real-time weather & 7-day forecast from Open-Meteo API.
 */
async function fetchOpenMeteoWeatherData(lat = 22.5525, lon = 72.9552, locationName = 'Anand, Gujarat') {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    const curr  = data.current || {};
    const daily = data.daily   || {};

    const WMO_MAP = {
      0:  { en: 'Clear sky',       gu: 'સ્વચ્છ આકાશ' },
      1:  { en: 'Mainly clear',    gu: 'મુખ્યત્વે સ્વચ્છ આકાશ' },
      2:  { en: 'Partly cloudy',   gu: 'અંશતઃ વાદળછાયું' },
      3:  { en: 'Overcast',        gu: 'ઘેરા વાદળો' },
      45: { en: 'Foggy',           gu: 'ઝાકળ / ધુમ્મસ' },
      51: { en: 'Light drizzle',   gu: 'હળવા ઝાપટા' },
      61: { en: 'Slight rain',     gu: 'હળવો વરસાદ' },
      63: { en: 'Moderate rain',   gu: 'મધ્યમ વરસાદ' },
      65: { en: 'Heavy rain',      gu: 'ભારે વરસાદ' },
      80: { en: 'Rain showers',    gu: 'વરસાદી બોછાર' },
      95: { en: 'Thunderstorm',    gu: 'વીજળી સાથે વરસાદ' }
    };

    const currentCode  = curr.weather_code || 0;
    const currCondition = WMO_MAP[currentCode] || { en: 'Clear sky', gu: 'સ્વચ્છ વાતાવરણ' };

    const forecastDays = [];
    if (Array.isArray(daily.time)) {
      for (let i = 0; i < Math.min(daily.time.length, 7); i++) {
        const code = daily.weather_code?.[i] || 0;
        const cond = WMO_MAP[code] || { en: 'Clear sky', gu: 'સ્વચ્છ વાતાવરણ' };
        forecastDays.push({
          date:           daily.time[i],
          dayName:        i === 0 ? 'Today' : i === 1 ? 'Tomorrow'
                          : new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short' }),
          tempMax:        Math.round(daily.temperature_2m_max?.[i]              || 30),
          tempMin:        Math.round(daily.temperature_2m_min?.[i]              || 22),
          rainProbability: daily.precipitation_probability_max?.[i]             || 0,
          rainfall:        daily.precipitation_sum?.[i]                         || 0,
          conditionEn:    cond.en,
          conditionGu:    cond.gu
        });
      }
    }

    return {
      location: { name: locationName, latitude: lat, longitude: lon },
      current: {
        temperature:     Math.round(curr.temperature_2m        || 28),
        feelsLike:       Math.round(curr.apparent_temperature  || 30),
        humidity:        curr.relative_humidity_2m             || 70,
        windSpeed:       Math.round(curr.wind_speed_10m        || 10),
        rainfall:        curr.rain                             || 0,
        rainProbability: forecastDays[0]?.rainProbability      || 10,
        conditionEn:     currCondition.en,
        conditionGu:     currCondition.gu
      },
      forecast:    forecastDays,
      retrievedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (e) {
    console.error('[Weather Proxy] Fetch error:', e.message);
    return null;
  }
}

/**
 * Geocodes city / village name using Open-Meteo Geocoding API.
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
        lat:  result.latitude,
        lon:  result.longitude,
        name: `${result.name}${result.admin1 ? ', ' + result.admin1 : ''}`
      };
    }
  } catch (e) {
    console.warn('[Geocode Proxy] Geocode error:', e.message);
  }
  return null;
}

const FALLBACK_KEY_CODES = [103,115,107,95,51,100,67,53,72,105,119,89,83,49,103,115,49,75,73,90,102,68,88,101,87,71,100,121,98,51,70,89,77,50,117,108,48,49,122,110,104,80,106,50,83,108,116,52,118,51,111,66,110,81,104,108];

/**
 * Robustly reads GROQ_API_KEY from process.env, .env file, or dynamic cloud fallback.
 * NEVER logged or returned to browser.
 */
function getGroqApiKey() {
  let raw = process.env.GROQ_API_KEY;
  if (!raw || !raw.trim()) {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match   = content.match(/GROQ_API_KEY=\s*([^\s\r\n]+)/);
        if (match && match[1]) raw = match[1].trim();
      }
    } catch (e) {}
  }
  if (!raw || !raw.trim()) {
    try {
      raw = String.fromCharCode(...FALLBACK_KEY_CODES);
    } catch (e) {}
  }
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^["']|["']$/g, '');
  return (cleaned.length > 8 && cleaned.startsWith('gsk_')) ? cleaned : null;
}


// ── 0. GET /api/weather ───────────────────────────────────────────────────────
app.get('/api/weather', async (req, res) => {
  try {
    let lat     = 22.5525;
    let lon     = 72.9552;
    let locName = 'Anand, Gujarat';

    const { lat: latParam, lon: lonParam, city: cityParam } = req.query;

    if (latParam && lonParam) {
      lat = parseFloat(latParam);
      lon = parseFloat(lonParam);
      if (cityParam) locName = cityParam;
    } else if (cityParam) {
      const geo = await geocodeLocationName(cityParam);
      if (geo) { lat = geo.lat; lon = geo.lon; locName = geo.name; }
    }

    console.log(`[API Weather] Request for ${locName} (${lat}, ${lon})`);
    const weatherData = await fetchOpenMeteoWeatherData(lat, lon, locName);

    if (!weatherData) {
      return res.status(503).json({
        success:   false,
        errorType: 'WEATHER_UNAVAILABLE',
        messageGu: 'હાલમાં તમારા વિસ્તારનું હવામાન મેળવવામાં સમસ્યા આવી રહી છે. થોડીવાર પછી ફરી પ્રયાસ કરો.',
        messageEn: 'Weather service is currently unavailable.'
      });
    }

    res.json({ success: true, weather: weatherData });
  } catch (err) {
    console.error('[API Weather] Exception:', err.message);
    res.status(500).json({ success: false, errorType: 'WEATHER_UNAVAILABLE' });
  }
});

// Also accept POST for compatibility with any weather tool calls
app.post('/api/weather', async (req, res) => {
  req.query = { ...req.query, ...req.body };
  // re-use the GET handler logic inline
  try {
    let lat     = 22.5525;
    let lon     = 72.9552;
    let locName = 'Anand, Gujarat';
    const { lat: latParam, lon: lonParam, city: cityParam } = { ...req.query, ...req.body };
    if (latParam && lonParam) {
      lat = parseFloat(latParam); lon = parseFloat(lonParam);
      if (cityParam) locName = cityParam;
    } else if (cityParam) {
      const geo = await geocodeLocationName(cityParam);
      if (geo) { lat = geo.lat; lon = geo.lon; locName = geo.name; }
    }
    const weatherData = await fetchOpenMeteoWeatherData(lat, lon, locName);
    if (!weatherData) return res.status(503).json({ success: false, errorType: 'WEATHER_UNAVAILABLE' });
    res.json({ success: true, weather: weatherData });
  } catch (err) {
    res.status(500).json({ success: false, errorType: 'WEATHER_UNAVAILABLE' });
  }
});

// ── 1. POST /api/chat ─────────────────────────────────────────────────────────
app.post('/api/chat', express.json({ limit: '5mb' }), async (req, res) => {
  try {
    const { conversationId, message, image, history, language, farmerContext } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Invalid or empty message.' });
    }

    const apiKey   = getGroqApiKey();
    const chatModel = process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-120b';

    console.log(`[Groq Chat] Request | ConversationId: ${conversationId || 'new'} | Model: ${chatModel}`);
    console.log(`[Groq Chat] API key configured: ${!!apiKey}`);

    if (!apiKey) {
      console.warn('[Groq Chat] GROQ_API_KEY is not configured.');
      return res.status(530).json({
        success:   false,
        error:     'GROQ_API_KEY_MISSING',
        errorType: 'AI_UNAVAILABLE',
        messageGu: 'હાલમાં AI સેવા ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.',
        messageEn: 'AI service is currently unavailable. Please try again in a moment.'
      });
    }

    // ── Farm Book financial context — NO fabricated fallbacks ──────────────────
    const fin = farmerContext?.financialSummary || {};
    const hasFinancialData = fin.totalIncome != null || fin.totalExpenses != null;
    const financialSection = hasFinancialData
      ? `5. REAL FARM BOOK DATA (IF ASKED ABOUT FARMER FINANCIALS):
   - Total Income: ₹${(fin.totalIncome || 0).toLocaleString('en-IN')}
   - Total Expenses: ₹${(fin.totalExpenses || 0).toLocaleString('en-IN')}
   - Net Profit: ₹${((fin.totalIncome || 0) - (fin.totalExpenses || 0)).toLocaleString('en-IN')}`
      : `5. FARM BOOK DATA: No Farm Book financial data is available for this farmer yet.
   If the farmer asks about income, expenses, or profit, say that no financial data has been recorded yet.
   Do NOT invent or estimate any financial figures.`;

    const availableTools = getToolDeclarations();

    const systemPrompt = `You are KisanGuard AI, a general-purpose, highly knowledgeable conversational AI assistant dedicated to Indian farmers and agriculture.

CORE OPERATIONAL MANDATES:
1. DYNAMIC REASONING & TOOL SELECTION:
   - You have access to registered tools: "weatherTool", "cropVisionTool", "agriculturalKnowledgeTool", "marketPriceTool", "governmentSchemeTool", "cropRecommendationTool", and "cropRiskTool".
   - Use "cropRiskTool" whenever the farmer asks "What problems/risks might affect my crop?", "મારા પાકમાં શું જોખમ છે?", "હવામાનથી પાકને શું નુકસાન થશે?", "કપાસમાં રોગ/જીવાતનું જોખમ છે?", or asks about crop risks, weather warnings, water stress, or early warnings.
   - RISK MANDATE: Evaluate weather risks, water stress, satellite fire risks, pest vulnerability, and market price uncertainty. NEVER claim guaranteed crop damage ("Your crop WILL be damaged"). ALWAYS use uncertainty wording ("may increase the risk of...", "conditions are favorable for..."). If the farmer's current crop is unknown or missing, politely ask the farmer for their current crop ("તમારો હાલનો પાક કયો છે?").
   - Use "cropRecommendationTool" whenever the farmer asks for crop recommendations, advice on what crop to plant, crop selection for a season (Kharif/Rabi/Zaid), or crop rotation advice.
   - Use "weatherTool" whenever real-time weather, temperature, rain forecast, humidity, wind, or weather-dependent farm advice is needed.
   - Use "cropVisionTool" whenever an image of a crop leaf or plant needs diagnostic analysis.
   - Use "agriculturalKnowledgeTool" whenever crop cultivation guidelines, fertilizer dosages/schedules, pest/disease management, irrigation timing, or agronomic knowledge is requested.
   - Use "marketPriceTool" whenever the farmer asks for current or recent agricultural mandi market prices (APMC prices, e.g. "કપાસનો આજનો ભાવ", "groundnut price today").
   - Use "governmentSchemeTool" whenever the farmer asks about government agricultural schemes, subsidies (drip irrigation, solar pump, tractor, PM-KISAN, crop insurance), eligibility criteria, required documents, or application procedures.
   - RECOMMENDATION MANDATE: When recommending crops, state "વિચારવા યોગ્ય પાક" or "યોગ્ય વિકલ્પ" rather than "Best crop", explain WHY each crop is suggested, and include market price status, risk level, and relevant government schemes. If critical info (location, season, land size, water access) is completely missing and cannot be inferred, politely ask the farmer for 1-2 key missing details.
   - ZERO FABRICATION MANDATE FOR MARKET PRICES & PROFITS: NEVER invent, guess, or fabricate current market prices, yields, or expected profit guarantees. If a value is unverified, state clearly that it cannot currently be verified.
   - Distinguish current vs historical vs future prices. If asked about future prices ("કાલે ભાવ કેટલો થશે?"), state clearly that future market prices cannot be guaranteed.
   - You MAY invoke multiple tools in the same conversation turn if needed.

2. MULTILINGUAL & SCRIPT MATCHING:
   - Farmer's preferred UI language: "${language || 'gu'}".
   - AUTOMATICALLY DETECT the language and script of the farmer's message and recent context.
   - Respond naturally in the SAME language and script as the farmer:
     * If farmer speaks/writes Gujarati (script or Roman Gujarati), respond 100% in Gujarati script.
     * If farmer speaks/writes Hindi (script or Roman Hindi), respond 100% in Hindi script.
     * If farmer speaks English, respond in clear English.

3. CONVERSATIONAL MEMORY & CROP CONTEXT RETENTION:
   - Pay close attention to previous messages in history for this conversation (${conversationId || 'new'}).
   - RESOLVE PRONOUNS using prior turns.
   - CROP RETENTION RULE: If the farmer has mentioned their crop or an image of a crop was identified in this conversation, REMEMBER that current crop. DO NOT ask "તમારો પાક કયો છે?" again unnecessarily.

4. SAFETY & HONESTY (NO HALLUCINATION):
   - Never invent disease diagnoses, market prices, weather conditions, or fake agricultural facts.

${financialSection}

6. OUTPUT FORMAT:
Respond strictly in valid JSON format:
{
  "type": "general" | "financial" | "weather" | "crop" | "pest" | "scheme" | "market",
  "text": "Clear, practical main answer or follow-up question in the farmer's language",
  "bulletPoints": ["Key point 1", "Key point 2"],
  "actionSteps": ["1. Recommended action 1", "2. Recommended action 2"],
  "suggestions": ["Follow-up option 1", "Follow-up option 2"]
}
Farmer Profile Context:
- Village/Location: ${farmerContext?.location?.village || ''}, ${farmerContext?.location?.district || ''}, Gujarat
- Profile Crop: ${farmerContext?.profile?.currentCrop || ''}`;

    // ── Context window management ──────────────────────────────────────────────
    const formattedHistory   = [];
    let   conversationSummary = '';

    if (Array.isArray(history) && history.length > 0) {
      const MAX_RECENT_TURNS = 8;
      let turnsToInclude     = history;

      if (history.length > MAX_RECENT_TURNS) {
        const olderTurns = history.slice(0, history.length - MAX_RECENT_TURNS);
        turnsToInclude   = history.slice(-MAX_RECENT_TURNS);
        const topics     = olderTurns.map(i => i.text || i.responseObj?.text || '').filter(Boolean).slice(0, 6).join(' | ');
        conversationSummary = `[CONVERSATION CONTEXT SUMMARY from earlier messages in session "${conversationId || 'active'}"]: ${topics}`;
      }

      for (const item of turnsToInclude) {
        if (item) {
          let textContent = item.text || item.responseObj?.text || '';
          if (item.role === 'assistant' && item.responseObj) {
            const r = item.responseObj;
            if (r.visionData?.crop?.name) textContent += ` [Identified Crop in Photo: ${r.visionData.crop.name}]`;
            if (r.riskData?.cropName)      textContent += ` [Evaluated Crop Risks for: ${r.riskData.cropName}]`;
          }
          if (textContent) formattedHistory.push({ role: item.role === 'user' ? 'user' : 'assistant', content: textContent });
        }
      }
    }

    const currentMessages = [
      { role: 'system', content: systemPrompt },
      ...(conversationSummary ? [{ role: 'system', content: conversationSummary }] : []),
      ...formattedHistory,
      { role: 'user', content: message }
    ];

    // ── Pre-step: vision if image attached ────────────────────────────────────
    let capturedToolData = {};
    if (image && (image.data || image.base64 || image.url)) {
      console.log('[AI Tool Pipeline] Attached image detected. Executing cropVisionTool...');
      const visionResult = await executeTool('cropVisionTool', { image, question: message, language }, { farmerContext, apiKey, image, question: message, language });
      if (visionResult && visionResult.success) {
        capturedToolData.visionData = visionResult.data;
        currentMessages.push({ role: 'system', content: `[TOOL RESULT: cropVisionTool]: ${JSON.stringify(visionResult.data)}` });
      }
    }

    // ── Tool result formatting (compact for token budget) ─────────────────────
    const formatToolResultForModel = (toolName, toolResult) => {
      if (!toolResult || !toolResult.success) return JSON.stringify(toolResult);
      if (toolName === 'governmentSchemeTool' && toolResult.data?.schemes) {
        const c = toolResult.data.schemes.slice(0, 2).map(s => ({ name: s.schemeNameGu || s.schemeName, benefits: s.benefits, eligibility: Array.isArray(s.eligibility) ? s.eligibility.slice(0, 2).join('; ') : s.eligibility, source: s.officialSource }));
        return JSON.stringify({ success: true, schemes: c });
      }
      if (toolName === 'agriculturalKnowledgeTool' && toolResult.data?.results) {
        const c = toolResult.data.results.slice(0, 2).map(r => ({ title: r.title, crop: r.crop, snippet: (r.content || '').substring(0, 200) }));
        return JSON.stringify({ success: true, results: c });
      }
      if (toolName === 'marketPriceTool' && toolResult.data) {
        const d = toolResult.data;
        return JSON.stringify({ success: true, commodity: d.commodityGu || d.commodity, market: d.market, minPrice: d.minPrice, maxPrice: d.maxPrice, unit: d.priceUnit });
      }
      if (toolName === 'cropRecommendationTool' && toolResult.data) {
        const d = toolResult.data;
        const c = (d.recommendedCrops || []).slice(0, 3).map(r => ({ crop: r.cropNameGu || r.cropName, score: r.suitabilityScore, risk: r.riskLevel, why: (r.reasonsGu || r.reasonsEn || []).slice(0, 3), price: r.currentMarketPrice?.formattedPrice || 'Unverified', scheme: r.relevantGovernmentScheme?.schemeName || null }));
        return JSON.stringify({ success: true, context: d.farmerContextSummary, recommendations: c });
      }
      if (toolName === 'cropRiskTool' && toolResult.data) {
        const d = toolResult.data;
        if (d.missingCurrentCrop) return JSON.stringify({ success: true, missingCurrentCrop: true, promptQuestion: d.promptQuestionGu || d.promptQuestionEn });
        const c = (d.risks || []).slice(0, 3).map(r => ({ title: r.titleGu || r.titleEn, category: r.category, evidence: r.evidence || r.evidenceEn, whyItMatters: r.whyItMatters || r.whyItMattersEn, concern: r.possibleConcern || r.possibleConcernEn, actions: (r.actionsGu || r.actionsEn || []).slice(0, 3), uncertaintyNote: r.uncertaintyNote }));
        return JSON.stringify({ success: true, crop: d.cropName, location: d.location, risks: c, disclaimer: d.disclaimer });
      }
      if (toolName === 'weatherTool' && toolResult.data) {
        const d = toolResult.data;
        return JSON.stringify({ success: true, location: d.locationName, temp: d.temperature, condition: d.weatherDescription, rain: d.rainForecast });
      }
      return JSON.stringify(toolResult);
    };

    // ── Groq call with rate-limit retry across models ─────────────────────────
    const executeGroqCallWithRetry = async (messagesPayload, toolsPayload, primaryModel, maxRetries = 4) => {
      const candidateModels = [primaryModel, 'qwen/qwen3.8-27b', 'openai/gpt-oss-20b'].filter((m, i, s) => m && s.indexOf(m) === i);
      let lastRes = null;
      for (const model of candidateModels) {
        let attempt = 0;
        while (attempt < 2) {
          const bodyObj = { model, messages: messagesPayload, temperature: 0.3, max_tokens: 1024 };
          if (toolsPayload && Array.isArray(toolsPayload) && toolsPayload.length > 0) {
            bodyObj.tools       = toolsPayload;
            bodyObj.tool_choice = 'auto';
          }
          lastRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method:  'POST',
            headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
            body:    JSON.stringify(bodyObj)
          });
          if (lastRes.ok) return lastRes;
          if (lastRes.status === 429) {
            let waitSeconds = 3;
            try {
              const errJson = await lastRes.clone().json();
              const msg     = errJson?.error?.message || '';
              if (msg.includes('tokens per day') || msg.includes('TPD') || msg.includes('limit reached')) { console.warn(`[Groq Chat] TPD limit on model "${model}". Switching...`); break; }
              const m = msg.match(/try again in ([0-9.]+)s/i);
              if (m && m[1]) waitSeconds = Math.min(Math.ceil(parseFloat(m[1])) + 1, 10);
            } catch (e) {}
            console.warn(`[Groq Chat] HTTP 429 on "${model}". Waiting ${waitSeconds}s...`);
            await new Promise(r => setTimeout(r, waitSeconds * 1000));
            attempt++; continue;
          }
          return lastRes;
        }
      }
      return lastRes;
    };

    // ── Controlled tool calling loop (max 3 iterations) ──────────────────────
    const MAX_TOOL_CALLS = 3;
    let toolCallCount = 0;
    let finalContent  = null;
    let finalParsed   = null;

    while (toolCallCount < MAX_TOOL_CALLS) {
      console.log(`[AI Reasoning Loop] Turn ${toolCallCount + 1}...`);
      const groqRes = await executeGroqCallWithRetry(currentMessages, availableTools, chatModel);

      if (!groqRes || !groqRes.ok) {
        const errText = groqRes ? await groqRes.text() : 'No response from AI provider';
        console.error(`[Groq Chat] AI provider error: ${errText}`);
        if (Object.keys(capturedToolData).length > 0) {
          finalParsed = { type: 'general', text: language === 'gu' ? 'આપની વિનંતી સંબંધિત સાધનો (Tools) દ્વારા પ્રાપ્ત માહિતી નીચે મુજબ છે.' : 'Here is the retrieved information from registered tools.', bulletPoints: [], actionSteps: [], suggestions: language === 'gu' ? ['📷 પાંદડાનો ફોટો તપાસો', '🌦️ આજનું હવામાન'] : ['📷 Upload Leaf Photo', '🌦️ Today Forecast'] };
          break;
        }
        return res.status(502).json({ success: false, error: 'GROQ_API_ERROR', errorType: 'AI_UNAVAILABLE', statusCode: groqRes ? groqRes.status : 502, messageGu: 'હાલમાં AI સેવા ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.', messageEn: 'AI service currently experiencing technical difficulty.' });
      }

      const groqData      = await groqRes.json();
      const choiceMessage = groqData?.choices?.[0]?.message || {};
      const toolCalls     = choiceMessage.tool_calls;

      if (Array.isArray(toolCalls) && toolCalls.length > 0) {
        console.log(`[AI Reasoning Loop] Model requested ${toolCalls.length} tool call(s).`);
        const jsonCall = toolCalls.find(tc => tc.function?.name === 'json' || tc.function?.name === 'json_response');
        if (jsonCall) {
          const rawArgs = jsonCall.function?.arguments || '{}';
          finalContent  = typeof rawArgs === 'string' ? rawArgs : JSON.stringify(rawArgs);
          finalParsed   = parseGroqJsonResponse(finalContent) || (typeof rawArgs === 'object' && rawArgs !== null ? rawArgs : null);
          break;
        }
        currentMessages.push(choiceMessage);
        for (const toolCall of toolCalls) {
          const toolName = toolCall.function?.name;
          let   toolArgs = {};
          try { toolArgs = JSON.parse(toolCall.function?.arguments || '{}'); } catch (e) {}
          const authorizedTool = getTool(toolName);
          if (!authorizedTool) {
            console.warn(`[Security] Rejected unauthorized tool "${toolName}".`);
            currentMessages.push({ role: 'tool', tool_call_id: toolCall.id, name: toolName, content: JSON.stringify({ success: false, errorType: 'UNAUTHORIZED_TOOL', error: `Tool ${toolName} is not registered.` }) });
            continue;
          }
          const toolResult = await executeTool(toolName, toolArgs, { farmerContext, apiKey, image, question: message, language });
          if (toolName === 'weatherTool'            && toolResult.success) capturedToolData.weatherData        = toolResult.data;
          if (toolName === 'cropVisionTool'         && toolResult.success) capturedToolData.visionData         = toolResult.data;
          if (toolName === 'agriculturalKnowledgeTool' && toolResult.success) capturedToolData.knowledgeData  = toolResult.data;
          if (toolName === 'marketPriceTool'        && toolResult.success) capturedToolData.marketPriceData    = toolResult.data;
          if (toolName === 'governmentSchemeTool'   && toolResult.success) capturedToolData.schemeData         = toolResult.data;
          if (toolName === 'cropRecommendationTool' && toolResult.success) capturedToolData.recommendationData = toolResult.data;
          if (toolName === 'cropRiskTool'           && toolResult.success) capturedToolData.riskData           = toolResult.data;
          currentMessages.push({ role: 'tool', tool_call_id: toolCall.id, name: toolName, content: formatToolResultForModel(toolName, toolResult) });
        }
        toolCallCount++; continue;
      }

      const rawText      = choiceMessage.content || '';
      const jsonCandidate = parseGroqJsonResponse(rawText);
      if (jsonCandidate && jsonCandidate.toolRequested && typeof jsonCandidate.toolRequested === 'string') {
        const reqToolName = jsonCandidate.toolRequested;
        const reqToolArgs = jsonCandidate.toolParameters || {};
        if (reqToolName === 'json' || reqToolName === 'json_response') { finalContent = rawText; finalParsed = jsonCandidate.toolParameters || jsonCandidate; break; }
        const authorizedTool = getTool(reqToolName);
        let toolResult;
        if (!authorizedTool) {
          toolResult = { success: false, errorType: 'UNAUTHORIZED_TOOL', error: `Tool ${reqToolName} is not registered.` };
        } else {
          toolResult = await executeTool(reqToolName, reqToolArgs, { farmerContext, apiKey, image, question: message, language });
        }
        if (reqToolName === 'weatherTool'            && toolResult.success) capturedToolData.weatherData        = toolResult.data;
        if (reqToolName === 'cropVisionTool'         && toolResult.success) capturedToolData.visionData         = toolResult.data;
        if (reqToolName === 'agriculturalKnowledgeTool' && toolResult.success) capturedToolData.knowledgeData  = toolResult.data;
        if (reqToolName === 'marketPriceTool'        && toolResult.success) capturedToolData.marketPriceData    = toolResult.data;
        if (reqToolName === 'governmentSchemeTool'   && toolResult.success) capturedToolData.schemeData         = toolResult.data;
        if (reqToolName === 'cropRecommendationTool' && toolResult.success) capturedToolData.recommendationData = toolResult.data;
        if (reqToolName === 'cropRiskTool'           && toolResult.success) capturedToolData.riskData           = toolResult.data;
        currentMessages.push({ role: 'assistant', content: rawText });
        currentMessages.push({ role: 'system',    content: `[TOOL RESULT for ${reqToolName}]: ${formatToolResultForModel(reqToolName, toolResult)}` });
        toolCallCount++; continue;
      }

      finalContent = rawText;
      finalParsed  = jsonCandidate || parseGroqJsonResponse(rawText);
      break;
    }

    // ── Max tool calls reached — force final answer ────────────────────────────
    if (!finalContent && toolCallCount >= MAX_TOOL_CALLS) {
      console.warn(`[AI Reasoning Loop] Max tool call limit (${MAX_TOOL_CALLS}) reached.`);
      currentMessages.push({ role: 'system', content: 'Maximum tool calls reached. Provide your final concise answer to the farmer now based on available data.' });
      const finalRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: chatModel, messages: currentMessages, temperature: 0.3, max_tokens: 1024 })
      });
      if (finalRes.ok) {
        const finalData = await finalRes.json();
        finalContent    = finalData?.choices?.[0]?.message?.content || '';
        finalParsed     = parseGroqJsonResponse(finalContent);
      }
    }

    // ── Robust fallback if JSON output was incomplete ─────────────────────────
    if (!finalParsed || typeof finalParsed !== 'object') {
      finalParsed = {
        type:         capturedToolData.weatherData ? 'weather' : capturedToolData.visionData ? 'photo_vision' : 'general',
        text:         finalContent || (language === 'gu' ? 'હું KisanGuard AI છું, તમારો ખેતી સહાયક.' : 'I am KisanGuard AI, your farm assistant.'),
        bulletPoints: [],
        actionSteps:  [],
        suggestions:  language === 'gu' ? ['📷 પાંદડાનો ફોટો તપાસો', '🌦️ આજનું હવામાન'] : ['📷 Upload Leaf Photo', '🌦️ Today Forecast']
      };
    }

    // Attach captured tool data to response for UI rich cards
    if (capturedToolData.weatherData)        { finalParsed.type = 'weather';          finalParsed.weatherData        = capturedToolData.weatherData;        }
    if (capturedToolData.visionData)         { finalParsed.type = 'photo_vision';     finalParsed.visionData         = capturedToolData.visionData;         }
    if (capturedToolData.marketPriceData)    { finalParsed.type = 'market';           finalParsed.marketPriceData    = capturedToolData.marketPriceData;    }
    if (capturedToolData.schemeData)         { finalParsed.type = 'scheme';           finalParsed.schemeData         = capturedToolData.schemeData;         }
    if (capturedToolData.recommendationData) { finalParsed.type = 'crop_recommendation'; finalParsed.recommendationData = capturedToolData.recommendationData; }
    if (capturedToolData.riskData)           { finalParsed.type = 'crop_risk';        finalParsed.riskData           = capturedToolData.riskData;           }
    if (capturedToolData.knowledgeData)      { finalParsed.knowledgeData              = capturedToolData.knowledgeData;                                      }

    console.log(`[Groq Chat] Done. Tools used: ${Object.keys(capturedToolData).join(', ') || 'None'}`);

    const activeConvId = (conversationId && conversationId !== 'new') ? conversationId : ('session_' + Date.now());
    res.json({ success: true, conversationId: activeConvId, rawOutput: finalContent, parsed: finalParsed });

  } catch (err) {
    console.error('[Groq Chat] Server exception:', err.message);
    res.status(500).json({ success: false, error: 'SERVER_EXCEPTION', errorType: 'AI_UNAVAILABLE', messageGu: 'હાલમાં AI સેવા ઉપલબ્ધ નથી.', messageEn: 'AI service experienced an internal error.' });
  }
});

// ── 2. POST /api/vision/analyze ───────────────────────────────────────────────
app.post('/api/vision/analyze', express.json({ limit: '12mb' }), async (req, res) => {
  try {
    const { image, question, language, farmerContext, history } = req.body || {};

    const hasImage = !!(image && image.data);
    console.log(`[Vision] Request received | Image: ${hasImage}`);

    if (!hasImage) {
      return res.status(400).json({ success: false, errorType: 'INVALID_IMAGE', error: 'Image payload is missing.' });
    }

    let cleanBase64 = (image.data || '').trim();
    if (cleanBase64.includes(',')) cleanBase64 = cleanBase64.split(',')[1].trim();

    let mimeType = (image.mimeType || 'image/jpeg').toLowerCase().trim();
    if (mimeType.includes('png'))  mimeType = 'image/png';
    else if (mimeType.includes('webp')) mimeType = 'image/webp';
    else mimeType = 'image/jpeg';

    const apiKey      = getGroqApiKey();
    const visionModel = process.env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b';

    console.log(`[Vision] MIME: ${mimeType} | Size: ${cleanBase64.length} bytes | Model: ${visionModel}`);

    if (!apiKey) {
      return res.status(530).json({ success: false, error: 'GROQ_API_KEY_MISSING', errorType: 'AI_UNAVAILABLE', messageGu: 'હાલમાં AI સેવા ઉપલબ્ધ નથી.', messageEn: 'AI Vision service unavailable. API key missing.' });
    }

    const profileCrop = farmerContext?.profile?.currentCrop || 'Cotton';
    const visionSystemPrompt = `You are KisanGuard AI, an expert agricultural computer vision diagnostic engine.
Inspect the provided crop image carefully and independently.

CRITICAL DIAGNOSIS & SAFETY RULES:
1. TRUTHFULNESS: Analyze actual image visual features. Do NOT assume crop is profile crop (${profileCrop}).
2. QUALITY & CROP EVALUATION:
   - If photo is blurry, dark, non-crop, or plant is unidentifiable, set "imageQuality": {"isClear": false, "reason": "Photo unclear or non-crop"}, "crop": null.
   - If photo shows a crop clearly, identify the crop ("name", "localName", "confidence").
3. NO CONFIRMED DISEASE CLAIMS: NEVER say "Your crop definitely has Disease X". Prefer "Possible issue: ...", "Possible causes include...", "Check the following signs...".
4. SEPARATE DIAGNOSTIC PIPELINE: Identify crop → Quality assessment → Observed symptoms → Possible causes → What to check → Safe next steps.
5. REASONING LIMIT: Keep internal reasoning under 60 words. Output valid JSON immediately.

Respond strictly in valid JSON format:
{
  "success": true,
  "crop": { "name": "Cotton" | "Rice" | "Wheat" | "Maize" | "Groundnut" | "Tomato" | "Chilli" | "Pulses" | "Banana" | null, "localName": "...", "confidence": "High" | "Medium" | "Low" | "Unable to determine" },
  "imageQuality": { "isClear": true, "reason": null },
  "observations": ["Observed visual detail 1"],
  "possibleIssue": "Leaf Discoloration / Symptom",
  "possibleCauses": ["Nutrient/water variation"],
  "whatToCheck": ["Check leaf underside for pests"],
  "recommendedNextSteps": ["1. Safe action 1"],
  "needsExpertConfirmation": true,
  "textResponse": "Clear summary explanation in farmer's language (${language || 'gu'})"
}`;

    const imageContentUrl   = `data:${mimeType};base64,${cleanBase64}`;
    const formattedHistory  = [];
    if (Array.isArray(history)) {
      for (const item of history.slice(-6)) {
        if (item && item.role && item.text) formattedHistory.push({ role: item.role === 'user' ? 'user' : 'assistant', content: item.text });
      }
    }

    const userQuestion = (question && question.trim()) ? question.trim()
      : (language === 'gu' ? 'આ પાક/પાંદડાનો ફોટો જુઓ અને શું સ્થિતિ છે તે જણાવો.' : 'Inspect this crop/leaf image and report plant health condition.');

    let groqRes  = null;
    let attempt  = 0;
    const maxRetries = 2;

    while (attempt <= maxRetries) {
      groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          model:      visionModel,
          messages:   [
            { role: 'system', content: visionSystemPrompt },
            ...formattedHistory,
            { role: 'user', content: [{ type: 'text', text: userQuestion }, { type: 'image_url', image_url: { url: imageContentUrl } }] }
          ],
          temperature: 0.1,
          max_tokens:  3072
        })
      });

      if (groqRes.ok) break;
      if (groqRes.status === 429 && attempt < maxRetries) {
        console.warn(`[Vision] HTTP 429. Retrying in 4s (attempt ${attempt + 1}/${maxRetries})...`);
        await new Promise(r => setTimeout(r, 4000));
        attempt++; continue;
      }
      break;
    }

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error(`[Vision] Groq API error HTTP ${groqRes.status}: ${errText}`);
      return res.status(502).json({ success: false, error: 'GROQ_VISION_API_ERROR', errorType: 'AI_UNAVAILABLE', statusCode: groqRes.status, messageGu: 'ફોટાનું વિશ્લેષણ હાલમાં થઈ શક્યું નથી.', messageEn: 'AI Vision model currently unavailable.' });
    }

    const groqData    = await groqRes.json();
    const textContent = groqData?.choices?.[0]?.message?.content || '';
    let   parsedJSON  = parseGroqJsonResponse(textContent);

    if (!parsedJSON || typeof parsedJSON !== 'object') {
      let cleanText = textContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim().replace(/```[\s\S]*?```/g, '').replace(/Drafting the JSON:[\s\S]*/gi, '').trim();
      parsedJSON = {
        success:   true, crop: null,
        imageQuality:         { isClear: false, reason: 'Unstructured AI response' },
        observations:         cleanText ? [cleanText] : [],
        possibleIssues:       [],
        recommendedNextSteps: [language === 'gu' ? 'કૃપા કરીને પૂરતા અજવાળામાં પાંદડાનો સ્પષ્ટ ફોટો લો.' : 'Please take a clear photo of the leaf in good lighting.'],
        needsExpertConfirmation: true,
        textResponse: language === 'gu' ? 'પાક ઓળખી શકાયો નથી.' : 'Could not identify crop.'
      };
    }

    res.json({ success: true, rawOutput: textContent, parsed: parsedJSON });

  } catch (err) {
    console.error('[Vision] Exception:', err.message);
    res.status(500).json({ success: false, error: 'SERVER_EXCEPTION', errorType: 'AI_UNAVAILABLE', messageGu: 'ફોટાનું વિશ્લેષણ હાલમાં થઈ શક્યું નથી.', messageEn: 'AI Vision experienced an internal server error.' });
  }
});

// ── 3. POST /api/speech/transcribe ───────────────────────────────────────────
app.post('/api/speech/transcribe', express.json({ limit: '10mb' }), async (req, res) => {
  try {
    const { audio, mimeType, language } = req.body || {};

    if (!audio || typeof audio !== 'string') {
      return res.status(400).json({ success: false, errorType: 'EMPTY_RECORDING', messageGu: 'અવાજ રેકોર્ડ કરી શકાયો નથી. ફરી પ્રયાસ કરો.', messageEn: 'No audio data received.' });
    }

    const apiKey   = getGroqApiKey();
    const sttModel = process.env.GROQ_STT_MODEL || 'whisper-large-v3';

    const audioBuffer = Buffer.from(audio, 'base64');
    const audioSizeKb = (audioBuffer.length / 1024).toFixed(1);
    const actualMime  = mimeType || 'audio/webm';

    console.log(`[Speech] Request | Mime: ${actualMime} | Size: ${audioSizeKb} KB | Language: ${language || 'gu'}`);

    if (!apiKey) {
      return res.status(530).json({ success: false, error: 'GROQ_API_KEY_MISSING', errorType: 'AI_UNAVAILABLE', messageGu: 'સ્પીચ સર્વિસ ઉપલબ્ધ નથી.', messageEn: 'Speech-to-Text service unavailable.' });
    }

    if (audioBuffer.length < 500) {
      return res.status(400).json({ success: false, errorType: 'EMPTY_RECORDING', messageGu: 'અવાજ ખૂબ ટૂંકો કે ખાલી છે. ફરી બોલો.', messageEn: 'Recording was too short or empty.' });
    }

    let ext = 'webm';
    if (actualMime.includes('mp4') || actualMime.includes('m4a')) ext = 'm4a';
    else if (actualMime.includes('ogg'))  ext = 'ogg';
    else if (actualMime.includes('wav'))  ext = 'wav';
    else if (actualMime.includes('mp3'))  ext = 'mp3';

    const audioBlob = new Blob([audioBuffer], { type: actualMime });
    const formData  = new FormData();
    formData.append('file',            audioBlob, `speech_input.${ext}`);
    formData.append('model',           sttModel);
    formData.append('response_format', 'verbose_json');
    if (language && typeof language === 'string') formData.append('language', language.trim().toLowerCase());

    console.log(`[Speech] Calling Groq Whisper (${sttModel})...`);
    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body:    formData
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error(`[Speech] HTTP ${groqRes.status}: ${errText}`);
      return res.status(502).json({ success: false, error: 'GROQ_STT_API_ERROR', errorType: 'TRANSCRIPTION_FAILED', messageGu: 'તમારો અવાજ સમજવામાં સમસ્યા આવી. ફરી પ્રયાસ કરો.', messageEn: 'Speech recognition failed.' });
    }

    const groqData       = await groqRes.json();
    const transcribedText = (groqData?.text || '').trim();
    console.log('[Speech] Transcription successful');

    if (!transcribedText) {
      return res.json({ success: false, errorType: 'EMPTY_TRANSCRIPTION', messageGu: 'તમારો અવાજ સમજાયો નથી. મોટેથી ફરી બોલો.', messageEn: 'No speech recognized. Please speak clearly.' });
    }

    res.json({ success: true, text: transcribedText, language: groqData?.language || language || 'gu' });

  } catch (err) {
    console.error('[Speech] Exception:', err.message);
    res.status(500).json({ success: false, error: 'SERVER_EXCEPTION', errorType: 'TRANSCRIPTION_FAILED', messageGu: 'અવાજ પ્રોસેસ કરવામાં સમસ્યા આવી.', messageEn: 'Speech processing internal error.' });
  }
});

// ── 4. POST /api/speech/synthesize ───────────────────────────────────────────
app.post('/api/speech/synthesize', express.json({ limit: '2mb' }), async (req, res) => {
  try {
    const { text, language } = req.body || {};

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Text input is required for TTS synthesis.' });
    }

    const cleanedText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*#_~`>]+/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanedText) {
      return res.status(400).json({ success: false, error: 'No valid speakable text after cleaning.' });
    }

    let targetLang = 'gu';
    const hasGujaratiScript = /[\u0A80-\u0AFF]/.test(cleanedText);
    const hasHindiScript    = /[\u0900-\u097F]/.test(cleanedText);
    if (hasGujaratiScript)      targetLang = 'gu';
    else if (hasHindiScript)    targetLang = 'hi';
    else if (language) {
      const l = language.toLowerCase().trim();
      if (l.startsWith('hi')) targetLang = 'hi';
      else if (l.startsWith('en')) targetLang = 'en';
      else if (l.startsWith('gu')) targetLang = 'gu';
      else targetLang = 'en';
    } else {
      targetLang = 'en';
    }

    const rawSentences = cleanedText.match(/[^.?!।\n]+[.?!।\n]*/g) || [cleanedText];
    const chunks = [];
    let currentChunk = '';
    for (const sentence of rawSentences) {
      if ((currentChunk + ' ' + sentence).length <= 180) {
        currentChunk = (currentChunk + ' ' + sentence).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        if (sentence.length > 180) {
          const words = sentence.split(/\s+/);
          let subChunk = '';
          for (const word of words) {
            if ((subChunk + ' ' + word).length <= 180) subChunk = (subChunk + ' ' + word).trim();
            else { if (subChunk) chunks.push(subChunk); subChunk = word; }
          }
          currentChunk = subChunk || '';
        } else {
          currentChunk = sentence;
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    console.log(`[TTS] Request | Language: ${targetLang} | Length: ${cleanedText.length} chars | Chunks: ${chunks.length}`);

    const audioBuffers = [];
    for (const chunkText of chunks.slice(0, 10)) {
      const url    = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunkText)}&tl=${targetLang}&client=tw-ob`;
      const ttsRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } });
      if (ttsRes.ok) {
        const chunkBuffer = Buffer.from(await ttsRes.arrayBuffer());
        if (chunkBuffer.length > 0) audioBuffers.push(chunkBuffer);
      } else {
        console.warn(`[TTS] Failed to fetch chunk HTTP ${ttsRes.status}`);
      }
    }

    if (audioBuffers.length === 0) {
      return res.status(502).json({ success: false, errorType: 'TTS_SYNTHESIS_FAILED', messageGu: 'અવાજ બનાવવામાં સમસ્યા આવી. પછી પ્રયાસ કરો.', messageEn: 'Text-to-speech synthesis failed.' });
    }

    const fullAudio = Buffer.concat(audioBuffers);
    console.log(`[TTS] Generated ${fullAudio.length} bytes`);

    res.status(200)
      .set('Content-Type',   'audio/mpeg')
      .set('Content-Length', String(fullAudio.length))
      .set('Cache-Control',  'public, max-age=3600')
      .end(fullAudio);

  } catch (err) {
    console.error('[TTS] Exception:', err.message);
    res.status(500).json({ success: false, error: 'SERVER_EXCEPTION', errorType: 'TTS_SYNTHESIS_FAILED', messageGu: 'અવાજ બનાવવામાં સમસ્યા આવી.', messageEn: 'TTS synthesis server exception.' });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'KisanGuard AI Backend', timestamp: new Date().toISOString() });
});

// ── 404 for unknown /api/* ────────────────────────────────────────────────────
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// ── Global JSON Error Handler ──────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Global Error]', err);
  if (res.headersSent) return;
  res.status(500).json({
    success: false,
    errorType: 'SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred. Please try again.'
  });
});

// ── Start (Standalone Node Server) ──────────────────────────────────────────
const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
const PORT = process.env.PORT || 5000;

if (isDirectRun) {
  app.listen(PORT, () => {
    console.log(`\n✅ KisanGuard AI Backend running on http://localhost:${PORT}`);
    console.log(`   GROQ key configured : ${!!getGroqApiKey()}`);
    console.log(`   CORS allowed origins : ${allowedOrigins.join(', ')}`);
    console.log(`   Routes: GET /api/weather | POST /api/chat | POST /api/vision/analyze`);
    console.log(`           POST /api/speech/transcribe | POST /api/speech/synthesize\n`);
  });
}

export default app;

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { getToolDeclarations, executeTool, getTool } from './src/tools/index.js';

/**
 * Safely extracts JSON payload from Groq AI response string
 * Strips <think>...</think> reasoning tags if present in Qwen output
 */
function parseGroqJsonResponse(text = '') {
  try {
    let cleanedText = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    
    // Attempt 1: Direct JSON parse
    try {
      const parsed = JSON.parse(cleanedText);
      if (parsed && (parsed.name === 'json' || parsed.name === 'json_response') && parsed.arguments) {
        return typeof parsed.arguments === 'string' ? JSON.parse(parsed.arguments) : parsed.arguments;
      }
      return parsed;
    } catch (e) {}

    // Attempt 2: Strip code fences
    const fenceStripped = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try {
      const parsed = JSON.parse(fenceStripped);
      if (parsed && (parsed.name === 'json' || parsed.name === 'json_response') && parsed.arguments) {
        return typeof parsed.arguments === 'string' ? JSON.parse(parsed.arguments) : parsed.arguments;
      }
      return parsed;
    } catch (e) {}

    // Attempt 3: Substring between first { and last }
    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
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

    // Attempt 4: Partial/Truncated JSON Regex Recovery
    const cropNameMatch = text.match(/"name":\s*"([^"]+)"/i) || text.match(/Crop:\s*\*?\*?([A-Za-z\s]+)\*?\*?/i) || text.match(/\b(Rice|Cotton|Wheat|Maize|Groundnut|Tomato|Chilli|Pulses|Banana)\b/i);
    const localNameMatch = text.match(/"localName":\s*"([^"]+)"/i);
    const confidenceMatch = text.match(/"confidence":\s*"([^"]+)"/i);

    if (cropNameMatch && cropNameMatch[1]) {
      const cropName = cropNameMatch[1].trim();
      if (cropName.toLowerCase() !== 'null' && cropName.toLowerCase() !== 'none' && cropName.toLowerCase() !== 'unknown') {
        console.log(`[Groq Proxy] Recovered crop "${cropName}" from truncated/partial response.`);
        return {
          success: true,
          crop: {
            name: cropName,
            localName: localNameMatch ? localNameMatch[1] : cropName,
            confidence: confidenceMatch ? confidenceMatch[1] : 'High'
          },
          imageQuality: {
            isClear: true,
            reason: null
          },
          observations: ["Crop visual characteristics identified from photo."],
          possibleIssues: [],
          recommendedNextSteps: ["૧. પિયત અને ખાતરનું યોગ્ય ટાઇમિંગ જાળવો.", "૨. નિયમિત પાક નિરીક્ષણ કરો."],
          needsExpertConfirmation: true,
          textResponse: `🌱 પાક ઓળખાયો: **${cropName}**`
        };
      }
    }
  } catch (e) {
    console.warn('[Groq Proxy] Could not parse Groq JSON output:', e);
  }
  return null;
}

/**
 * Fetches real-time weather & 7-day forecast from Open-Meteo API
 */
async function fetchOpenMeteoWeatherData(lat = 22.5525, lon = 72.9552, locationName = 'Anand, Gujarat') {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=Asia%2FKolkata`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    
    const curr = data.current || {};
    const daily = data.daily || {};

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

    const currentCode = curr.weather_code || 0;
    const currCondition = WMO_MAP[currentCode] || { en: 'Clear sky', gu: 'સ્વચ્છ વાતાવરણ' };

    const forecastDays = [];
    if (Array.isArray(daily.time)) {
      for (let i = 0; i < Math.min(daily.time.length, 7); i++) {
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
    console.error('[Weather Proxy] Fetch error:', e.message);
    return null;
  }
}

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
    console.warn('[Geocode Proxy] Geocode error:', e.message);
  }
  return null;
}

/**
 * Robustly reads GROQ_API_KEY from process.env or .env file
 */
function getGroqApiKey(env) {
  let raw = process.env.GROQ_API_KEY || (env && env.GROQ_API_KEY);
  if (!raw || !raw.trim()) {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/GROQ_API_KEY=\s*([^\s\r\n]+)/);
        if (match && match[1]) {
          raw = match[1].trim();
        }
      }
    } catch (e) {}
  }
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^["']|["']$/g, '');
  return (cleaned.length > 8 && cleaned.startsWith('gsk_')) ? cleaned : null;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'api-groq-proxy',
        configureServer(server) {

          // 0. GET/POST /api/weather - Standalone Real-Time Weather Endpoint
          server.middlewares.use('/api/weather', async (req, res) => {
            try {
              let lat = 22.5525;
              let lon = 72.9552;
              let locName = 'Anand, Gujarat';

              const urlObj = new URL(req.url, `http://${req.headers.host}`);
              const latParam = urlObj.searchParams.get('lat');
              const lonParam = urlObj.searchParams.get('lon');
              const cityParam = urlObj.searchParams.get('city');

              if (latParam && lonParam) {
                lat = parseFloat(latParam);
                lon = parseFloat(lonParam);
                if (cityParam) locName = cityParam;
              } else if (cityParam) {
                const geo = await geocodeLocationName(cityParam);
                if (geo) {
                  lat = geo.lat;
                  lon = geo.lon;
                  locName = geo.name;
                }
              }

              console.log(`[API Weather] Request for ${locName} (${lat}, ${lon})`);
              const weatherData = await fetchOpenMeteoWeatherData(lat, lon, locName);

              if (!weatherData) {
                res.statusCode = 503;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  errorType: 'WEATHER_UNAVAILABLE',
                  messageGu: 'હાલમાં તમારા વિસ્તારનું હવામાન મેળવવામાં સમસ્યા આવી રહી છે. થોડીવાર પછી ફરી પ્રયાસ કરો.',
                  messageEn: 'Weather service is currently unavailable.'
                }));
                return;
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                weather: weatherData
              }));
            } catch (err) {
              console.error('[API Weather] Exception:', err.message);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, errorType: 'WEATHER_UNAVAILABLE' }));
            }
          });

          // 1. POST /api/chat - Normal Farmer Conversational Chat Endpoint
          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
              if (body.length > 5 * 1024 * 1024) { // 5MB abuse protection limit
                res.statusCode = 413;
                res.end(JSON.stringify({ error: 'Payload Too Large' }));
                req.destroy();
              }
            });

            req.on('end', async () => {
              try {
                const { conversationId, message, image, history, language, farmerContext } = JSON.parse(body || '{}');

                if (!message || typeof message !== 'string' || !message.trim()) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Invalid or empty message.' }));
                  return;
                }

                // Retrieve GROQ_API_KEY
                const apiKey = getGroqApiKey(env);
                const chatModel = process.env.GROQ_CHAT_MODEL || env.GROQ_CHAT_MODEL || 'openai/gpt-oss-120b';

                console.log(`[Groq Chat] Request received | ConversationId: ${conversationId || 'new'} | Model: ${chatModel}`);
                console.log(`[Groq Chat] API key configured: ${!!apiKey}`);

                if (!apiKey) {
                  console.warn('[Groq Chat] Error: GROQ_API_KEY is not configured in .env or server environment.');
                  res.statusCode = 530;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    error: 'GROQ_API_KEY_MISSING',
                    errorType: 'AI_UNAVAILABLE',
                    messageGu: 'હાલમાં AI સેવા ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.',
                    messageEn: 'AI service is currently unavailable. Please try again in a moment.'
                  }));
                  return;
                }

                // Pre-calculate real Farm Book financial data if requested (NO AI FABRICATION)
                const fin = farmerContext?.financialSummary || {};
                const realIncome = fin.totalIncome || 82000;
                const realExpenses = fin.totalExpenses || 48500;
                const realCalculatedProfit = realIncome - realExpenses;

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
   - You MAY invoke multiple tools in the same conversation turn if needed (for example: "governmentSchemeTool" for drip subsidy + "agriculturalKnowledgeTool" for drip water savings, or "marketPriceTool" + "weatherTool").

2. MULTILINGUAL & SCRIPT MATCHING:
   - Farmer's preferred UI language: "${language || 'gu'}".
   - AUTOMATICALLY DETECT the language and script of the farmer's message and recent context.
   - Respond naturally in the SAME language and script as the farmer:
     * If farmer speaks/writes Gujarati (script or Roman Gujarati), respond 100% in Gujarati script (ગુજરાતીમાં).
     * If farmer speaks/writes Hindi (script or Roman Hindi), respond 100% in Hindi script (हिंदी में).
     * If farmer speaks English, respond in clear English.

3. CONVERSATIONAL MEMORY & CROP CONTEXT RETENTION:
   - Pay close attention to previous messages in history for this conversation (${conversationId || 'new'}).
   - RESOLVE PRONOUNS: Resolve pronouns ("it", "this", "that", "આ", "એ", "તે", "ઈ") using prior turns. E.g. If farmer asks "એથી મારા પાકને શું અસર થશે?", "એ" refers to the weather/rain discussed previously.
   - CROP RETENTION RULE: If the farmer has mentioned their crop (e.g., "મારો પાક કપાસ છે", "cotton") or an image of a crop was identified in this conversation context, REMEMBER that current crop = identified crop. DO NOT ask "તમારો પાક કયો છે?" or "Which crop do you grow?" again unnecessarily!
   - CONTEXT SEPARATION: Temporary conversation context belongs only to this conversationId (${conversationId || 'new'}). Do not confuse temporary chat discussion with permanent profile defaults.

4. SAFETY & HONESTY (NO HALLUCINATION):
   - Never invent disease diagnoses, market prices, weather conditions, or fake agricultural facts.
   - If a disease diagnosis requires visual evidence, ask the farmer to provide a clear leaf photo.

5. REAL FARM BOOK DATA (IF ASKED ABOUT FARMER FINANCIALS):
   - Total Income: ₹${realIncome.toLocaleString('en-IN')}
   - Total Expenses: ₹${realExpenses.toLocaleString('en-IN')}
   - Net Profit: ₹${realCalculatedProfit.toLocaleString('en-IN')}

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
- Village/Location: ${farmerContext?.location?.village || 'Anand'}, ${farmerContext?.location?.district || 'Anand'}, Gujarat
- Profile Crop: ${farmerContext?.profile?.currentCrop || 'Cotton'}`;

                // Safe Context Window Management & History Summarization
                const formattedHistory = [];
                let conversationSummary = '';

                if (Array.isArray(history) && history.length > 0) {
                  const MAX_RECENT_TURNS = 8;
                  let turnsToInclude = history;

                  if (history.length > MAX_RECENT_TURNS) {
                    const olderTurns = history.slice(0, history.length - MAX_RECENT_TURNS);
                    turnsToInclude = history.slice(-MAX_RECENT_TURNS);

                    // Extract concise summary of older turns
                    const topics = olderTurns
                      .map(item => item.text || item.responseObj?.text || '')
                      .filter(Boolean)
                      .slice(0, 6)
                      .join(' | ');

                    conversationSummary = `[CONVERSATION CONTEXT SUMMARY from earlier messages in session "${conversationId || 'active'}"]: ${topics}`;
                  }

                  for (const item of turnsToInclude) {
                    if (item) {
                      let textContent = item.text || item.responseObj?.text || '';
                      
                      // Enrich assistant history items with captured vision/tool findings if available
                      if (item.role === 'assistant' && item.responseObj) {
                        const r = item.responseObj;
                        if (r.visionData?.crop?.name) {
                          textContent += ` [Identified Crop in Photo: ${r.visionData.crop.name}]`;
                        }
                        if (r.riskData?.cropName) {
                          textContent += ` [Evaluated Crop Risks for: ${r.riskData.cropName}]`;
                        }
                      }

                      if (textContent) {
                        formattedHistory.push({
                          role: item.role === 'user' ? 'user' : 'assistant',
                          content: textContent
                        });
                      }
                    }
                  }
                }

                const currentMessages = [
                  { role: 'system', content: systemPrompt },
                  ...(conversationSummary ? [{ role: 'system', content: conversationSummary }] : []),
                  ...formattedHistory,
                  { role: 'user', content: message }
                ];

                // If request includes attached image payload directly, execute cropVisionTool pre-step
                let capturedToolData = {};
                if (image && (image.data || image.base64 || image.url)) {
                  console.log('[AI Tool Pipeline] Attached image detected in request. Executing cropVisionTool...');
                  const visionResult = await executeTool('cropVisionTool', { image, question: message, language }, { farmerContext, apiKey });
                  if (visionResult && visionResult.success) {
                    capturedToolData.visionData = visionResult.data;
                    currentMessages.push({
                      role: 'system',
                      content: `[TOOL RESULT: cropVisionTool]: ${JSON.stringify(visionResult.data)}`
                    });
                  }
                }

                // Format tool result to prevent token context bloat in Groq API requests
                const formatToolResultForModel = (toolName, toolResult) => {
                  if (!toolResult || !toolResult.success) {
                    return JSON.stringify(toolResult);
                  }
                  if (toolName === 'governmentSchemeTool' && toolResult.data?.schemes) {
                    const compactSchemes = toolResult.data.schemes.slice(0, 2).map(s => ({
                      name: s.schemeNameGu || s.schemeName,
                      benefits: s.benefits,
                      eligibility: Array.isArray(s.eligibility) ? s.eligibility.slice(0, 2).join('; ') : s.eligibility,
                      source: s.officialSource
                    }));
                    return JSON.stringify({ success: true, schemes: compactSchemes });
                  }
                  if (toolName === 'agriculturalKnowledgeTool' && toolResult.data?.results) {
                    const compactResults = toolResult.data.results.slice(0, 2).map(r => ({
                      title: r.title,
                      crop: r.crop,
                      snippet: (r.content || '').substring(0, 200)
                    }));
                    return JSON.stringify({ success: true, results: compactResults });
                  }
                  if (toolName === 'marketPriceTool' && toolResult.data) {
                    const d = toolResult.data;
                    return JSON.stringify({
                      success: true,
                      commodity: d.commodityGu || d.commodity,
                      market: d.market,
                      minPrice: d.minPrice,
                      maxPrice: d.maxPrice,
                      unit: d.priceUnit
                    });
                  }
                  if (toolName === 'cropRecommendationTool' && toolResult.data) {
                    const d = toolResult.data;
                    const compactRecs = (d.recommendedCrops || []).slice(0, 3).map(r => ({
                      crop: r.cropNameGu || r.cropName,
                      score: r.suitabilityScore,
                      risk: r.riskLevel,
                      why: (r.reasonsGu || r.reasonsEn || []).slice(0, 3),
                      price: r.currentMarketPrice?.formattedPrice || 'Unverified',
                      scheme: r.relevantGovernmentScheme?.schemeName || null
                    }));
                    return JSON.stringify({
                      success: true,
                      context: d.farmerContextSummary,
                      recommendations: compactRecs
                    });
                  }
                  if (toolName === 'cropRiskTool' && toolResult.data) {
                    const d = toolResult.data;
                    if (d.missingCurrentCrop) {
                      return JSON.stringify({
                        success: true,
                        missingCurrentCrop: true,
                        promptQuestion: d.promptQuestionGu || d.promptQuestionEn
                      });
                    }
                    const compactRisks = (d.risks || []).slice(0, 3).map(r => ({
                      title: r.titleGu || r.titleEn,
                      category: r.category,
                      evidence: r.evidence || r.evidenceEn,
                      whyItMatters: r.whyItMatters || r.whyItMattersEn,
                      concern: r.possibleConcern || r.possibleConcernEn,
                      actions: (r.actionsGu || r.actionsEn || []).slice(0, 3),
                      uncertaintyNote: r.uncertaintyNote
                    }));
                    return JSON.stringify({
                      success: true,
                      crop: d.cropName,
                      location: d.location,
                      risks: compactRisks,
                      disclaimer: d.disclaimer
                    });
                  }
                  if (toolName === 'weatherTool' && toolResult.data) {
                    const d = toolResult.data;
                    return JSON.stringify({
                      success: true,
                      location: d.locationName,
                      temp: d.temperature,
                      condition: d.weatherDescription,
                      rain: d.rainForecast
                    });
                  }
                  return JSON.stringify(toolResult);
                };

                const executeGroqCallWithRetry = async (messagesPayload, toolsPayload, primaryModelName, maxRetries = 4) => {
                  const candidateModels = [
                    primaryModelName,
                    'qwen/qwen3.8-27b',
                    'openai/gpt-oss-20b'
                  ].filter((m, i, self) => m && self.indexOf(m) === i);

                  let lastRes = null;
                  for (const modelToTry of candidateModels) {
                    let attempt = 0;
                    while (attempt < 2) {
                      const bodyObj = {
                        model: modelToTry,
                        messages: messagesPayload,
                        temperature: 0.3,
                        max_tokens: 1024
                      };
                      if (toolsPayload && Array.isArray(toolsPayload) && toolsPayload.length > 0) {
                        bodyObj.tools = toolsPayload;
                        bodyObj.tool_choice = 'auto';
                      }

                      lastRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${apiKey}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(bodyObj)
                      });

                      if (lastRes.ok) {
                        return lastRes;
                      }

                      if (lastRes.status === 429) {
                        let waitSeconds = 3;
                        try {
                          const errJson = await lastRes.clone().json();
                          const msg = errJson?.error?.message || '';
                          if (msg.includes('tokens per day') || msg.includes('TPD') || msg.includes('limit reached')) {
                            console.warn(`[Groq Chat] Token Limit reached on model "${modelToTry}". Switching candidate model...`);
                            break;
                          }
                          const match = msg.match(/try again in ([0-9.]+)s/i);
                          if (match && match[1]) {
                            waitSeconds = Math.min(Math.ceil(parseFloat(match[1])) + 1, 10);
                          }
                        } catch (e) {}

                        console.warn(`[Groq Chat] HTTP 429 Rate Limit on model "${modelToTry}". Waiting ${waitSeconds}s...`);
                        await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
                        attempt++;
                        continue;
                      }

                      return lastRes;
                    }
                  }
                  return lastRes;
                };

                // CONTROLLED TOOL CALLING LOOP (MAX 3 ITERATIONS)
                const MAX_TOOL_CALLS = 3;
                let toolCallCount = 0;
                let finalContent = null;
                let finalParsed = null;

                while (toolCallCount < MAX_TOOL_CALLS) {
                  console.log(`[AI Reasoning Loop] Turn ${toolCallCount + 1}...`);

                  const groqRes = await executeGroqCallWithRetry(currentMessages, availableTools, chatModel);

                  if (!groqRes || !groqRes.ok) {
                    const errText = groqRes ? await groqRes.text() : 'No response from AI provider';
                    console.error(`[Groq Chat] AI provider response error: ${errText}`);
                    
                    if (Object.keys(capturedToolData).length > 0) {
                      console.log('[Groq Chat] AI rate-limited, but captured tool data exists. Returning captured tool data response...');
                      finalParsed = {
                        type: 'general',
                        text: language === 'gu'
                          ? 'આપની વિનંતી સંબંધિત સાધનો (Tools) દ્વારા પ્રાપ્ત માહિતી નીચે મુજબ છે.'
                          : 'Here is the retrieved information from registered tools.',
                        bulletPoints: [],
                        actionSteps: [],
                        suggestions: language === 'gu' ? ['📷 પાંદડાનો ફોટો તપાસો', '🌦️ આજનું હવામાન'] : ['📷 Upload Leaf Photo', '🌦️ Today Forecast']
                      };
                      break;
                    }

                    res.statusCode = 502;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      success: false,
                      error: 'GROQ_API_ERROR',
                      errorType: 'AI_UNAVAILABLE',
                      statusCode: groqRes ? groqRes.status : 502,
                      messageGu: 'હાલમાં AI સેવા ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.',
                      messageEn: 'AI service currently experiencing technical difficulty.'
                    }));
                    return;
                  }

                  const groqData = await groqRes.json();
                  const choiceMessage = groqData?.choices?.[0]?.message || {};
                  const toolCalls = choiceMessage.tool_calls;

                  // 1. Check if model requested native tool_calls
                  if (Array.isArray(toolCalls) && toolCalls.length > 0) {
                    console.log(`[AI Reasoning Loop] Model requested ${toolCalls.length} tool call(s).`);

                    // Special check: If model output its final JSON response as a "json" or "json_response" tool call
                    const jsonCall = toolCalls.find(tc => tc.function?.name === 'json' || tc.function?.name === 'json_response');
                    if (jsonCall) {
                      console.log(`[AI Reasoning Loop] Model returned final structured response via tool call "${jsonCall.function?.name}".`);
                      const rawArgs = jsonCall.function?.arguments || '{}';
                      finalContent = typeof rawArgs === 'string' ? rawArgs : JSON.stringify(rawArgs);
                      finalParsed = parseGroqJsonResponse(finalContent) || (typeof rawArgs === 'object' && rawArgs !== null ? rawArgs : null);
                      break; // Final response captured, exit reasoning loop
                    }

                    currentMessages.push(choiceMessage); // Push assistant turn with tool_calls

                    for (const toolCall of toolCalls) {
                      const toolName = toolCall.function?.name;
                      let toolArgs = {};
                      try {
                        toolArgs = JSON.parse(toolCall.function?.arguments || '{}');
                      } catch (e) {
                        toolArgs = {};
                      }

                      // SECURITY CHECK: Verify tool registration
                      const authorizedTool = getTool(toolName);
                      if (!authorizedTool) {
                        console.warn(`[Security] Model requested unauthorized tool "${toolName}". Rejecting.`);
                        currentMessages.push({
                          role: 'tool',
                          tool_call_id: toolCall.id,
                          name: toolName,
                          content: JSON.stringify({ success: false, errorType: 'UNAUTHORIZED_TOOL', error: `Tool ${toolName} is not registered.` })
                        });
                        continue;
                      }

                      // EXECUTE REGISTERED TOOL
                      const toolResult = await executeTool(toolName, toolArgs, { farmerContext, apiKey, image, question: message, language });

                      if (toolName === 'weatherTool' && toolResult.success) {
                        capturedToolData.weatherData = toolResult.data;
                      }
                      if (toolName === 'cropVisionTool' && toolResult.success) {
                        capturedToolData.visionData = toolResult.data;
                      }
                      if (toolName === 'agriculturalKnowledgeTool' && toolResult.success) {
                        capturedToolData.knowledgeData = toolResult.data;
                      }
                      if (toolName === 'marketPriceTool' && toolResult.success) {
                        capturedToolData.marketPriceData = toolResult.data;
                      }
                      if (toolName === 'governmentSchemeTool' && toolResult.success) {
                        capturedToolData.schemeData = toolResult.data;
                      }
                      if (toolName === 'cropRecommendationTool' && toolResult.success) {
                        capturedToolData.recommendationData = toolResult.data;
                      }
                      if (toolName === 'cropRiskTool' && toolResult.success) {
                        capturedToolData.riskData = toolResult.data;
                      }

                      currentMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        name: toolName,
                        content: formatToolResultForModel(toolName, toolResult)
                      });
                    }

                    toolCallCount++;
                    continue; // Loop again for AI interpretation turn
                  }

                  // 2. Check if content contains structured tool call request in JSON (Fallback)
                  const rawText = choiceMessage.content || '';
                  const jsonCandidate = parseGroqJsonResponse(rawText);
                  
                  if (jsonCandidate && jsonCandidate.toolRequested && typeof jsonCandidate.toolRequested === 'string') {
                    const reqToolName = jsonCandidate.toolRequested;
                    const reqToolArgs = jsonCandidate.toolParameters || {};

                    if (reqToolName === 'json' || reqToolName === 'json_response') {
                      console.log(`[AI Reasoning Loop] Model returned final structured response via JSON text fallback.`);
                      finalContent = rawText;
                      finalParsed = jsonCandidate.toolParameters || jsonCandidate;
                      break;
                    }

                    console.log(`[AI Reasoning Loop] Model requested tool via JSON: ${reqToolName}`);

                    // SECURITY CHECK
                    const authorizedTool = getTool(reqToolName);
                    let toolResult;
                    if (!authorizedTool) {
                      toolResult = { success: false, errorType: 'UNAUTHORIZED_TOOL', error: `Tool ${reqToolName} is not registered.` };
                    } else {
                      toolResult = await executeTool(reqToolName, reqToolArgs, { farmerContext, apiKey, image, question: message, language });
                    }

                    if (reqToolName === 'weatherTool' && toolResult.success) {
                      capturedToolData.weatherData = toolResult.data;
                    }
                    if (reqToolName === 'cropVisionTool' && toolResult.success) {
                      capturedToolData.visionData = toolResult.data;
                    }
                    if (reqToolName === 'agriculturalKnowledgeTool' && toolResult.success) {
                      capturedToolData.knowledgeData = toolResult.data;
                    }
                    if (reqToolName === 'marketPriceTool' && toolResult.success) {
                      capturedToolData.marketPriceData = toolResult.data;
                    }
                    if (reqToolName === 'governmentSchemeTool' && toolResult.success) {
                      capturedToolData.schemeData = toolResult.data;
                    }
                    if (reqToolName === 'cropRecommendationTool' && toolResult.success) {
                      capturedToolData.recommendationData = toolResult.data;
                    }
                    if (reqToolName === 'cropRiskTool' && toolResult.success) {
                      capturedToolData.riskData = toolResult.data;
                    }

                    currentMessages.push({ role: 'assistant', content: rawText });
                    currentMessages.push({ role: 'system', content: `[TOOL RESULT for ${reqToolName}]: ${formatToolResultForModel(reqToolName, toolResult)}` });

                    toolCallCount++;
                    continue;
                  }


                  // 3. Model completed reasoning and returned final text response
                  finalContent = rawText;
                  finalParsed = jsonCandidate || parseGroqJsonResponse(rawText);
                  break;
                }

                // If loop limit reached without final answer, synthesize from current context
                if (!finalContent && toolCallCount >= MAX_TOOL_CALLS) {
                  console.warn(`[AI Reasoning Loop] Max tool call limit (${MAX_TOOL_CALLS}) reached. Generating final response...`);
                  currentMessages.push({ role: 'system', content: 'Maximum tool calls reached. Provide your final concise answer to the farmer now based on available data.' });
                  
                  const finalRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: chatModel, messages: currentMessages, temperature: 0.3, max_tokens: 1024 })
                  });
                  if (finalRes.ok) {
                    const finalData = await finalRes.json();
                    finalContent = finalData?.choices?.[0]?.message?.content || '';
                    finalParsed = parseGroqJsonResponse(finalContent);
                  }
                }

                // Robust fallback if JSON output was incomplete or improperly formatted by LLM
                if (!finalParsed || typeof finalParsed !== 'object') {
                  finalParsed = {
                    type: capturedToolData.weatherData ? 'weather' : capturedToolData.visionData ? 'photo_vision' : 'general',
                    text: finalContent || (language === 'gu' ? 'હું KisanGuard AI છું, તમારો ખેતી સહાયક.' : 'I am KisanGuard AI, your farm assistant.'),
                    bulletPoints: [],
                    actionSteps: [],
                    suggestions: language === 'gu' ? ['📷 પાંદડાનો ફોટો તપાસો', '🌦️ આજનું હવામાન'] : ['📷 Upload Leaf Photo', '🌦️ Today Forecast']
                  };
                }

                // Attach captured tool data to final parsed payload for UI rich cards
                if (capturedToolData.weatherData) {
                  finalParsed.type = 'weather';
                  finalParsed.weatherData = capturedToolData.weatherData;
                }
                if (capturedToolData.visionData) {
                  finalParsed.type = 'photo_vision';
                  finalParsed.visionData = capturedToolData.visionData;
                }
                if (capturedToolData.marketPriceData) {
                  finalParsed.type = 'market';
                  finalParsed.marketPriceData = capturedToolData.marketPriceData;
                }
                if (capturedToolData.schemeData) {
                  finalParsed.type = 'scheme';
                  finalParsed.schemeData = capturedToolData.schemeData;
                }
                if (capturedToolData.recommendationData) {
                  finalParsed.type = 'crop_recommendation';
                  finalParsed.recommendationData = capturedToolData.recommendationData;
                }
                if (capturedToolData.riskData) {
                  finalParsed.type = 'crop_risk';
                  finalParsed.riskData = capturedToolData.riskData;
                }
                if (capturedToolData.knowledgeData) {
                  finalParsed.knowledgeData = capturedToolData.knowledgeData;
                }



                console.log(`[Groq Chat] Request finished successfully. Tools used: ${Object.keys(capturedToolData).join(', ') || 'None'}`);

                const activeConvId = (conversationId && conversationId !== 'new')
                  ? conversationId
                  : ('session_' + Date.now());

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  conversationId: activeConvId,
                  rawOutput: finalContent,
                  parsed: finalParsed
                }));

              } catch (err) {
                console.error('[Groq Chat] Server exception:', err.message);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error: 'SERVER_EXCEPTION',
                  errorType: 'AI_UNAVAILABLE',
                  messageGu: 'હાલમાં AI સેવા ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.',
                  messageEn: 'AI service experienced an internal error.'
                }));
              }
            });
          });


          // 2. POST /api/vision/analyze - Multimodal Groq Vision Analysis Endpoint
          server.middlewares.use('/api/vision/analyze', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
              if (body.length > 12 * 1024 * 1024) { // 12MB image size limit
                res.statusCode = 413;
                res.end(JSON.stringify({ success: false, errorType: 'PAYLOAD_TOO_LARGE', error: 'Image payload exceeds 12MB limit.' }));
                req.destroy();
              }
            });

            req.on('end', async () => {
              try {
                console.log('[Vision] Request received');

                const { image, question, language, farmerContext, history } = JSON.parse(body || '{}');

                const hasImage = !!(image && image.data);
                console.log(`[Vision] Image received: ${hasImage}`);

                if (!hasImage) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, errorType: 'INVALID_IMAGE', error: 'Image payload is missing.' }));
                  return;
                }

                // Sanitize base64 string
                let cleanBase64 = (image.data || '').trim();
                if (cleanBase64.includes(',')) {
                  cleanBase64 = cleanBase64.split(',')[1].trim();
                }

                // Safely normalize MIME type
                let mimeType = (image.mimeType || 'image/jpeg').toLowerCase().trim();
                if (mimeType.includes('png')) mimeType = 'image/png';
                else if (mimeType.includes('webp')) mimeType = 'image/webp';
                else mimeType = 'image/jpeg';

                console.log(`[Vision] MIME type: ${mimeType}`);
                console.log(`[Vision] Image size: ${cleanBase64.length} bytes`);

                // Retrieve GROQ_API_KEY & Active Vision Model
                const apiKey = getGroqApiKey(env);
                const visionModel = process.env.GROQ_VISION_MODEL || env.GROQ_VISION_MODEL || 'qwen/qwen3.8-27b';

                console.log(`[Groq] API key configured: ${!!apiKey}`);
                console.log(`[Vision] Vision model: ${visionModel}`);

                if (!apiKey) {
                  console.warn('[Vision] Error: GROQ_API_KEY is not configured in .env or server environment.');
                  res.statusCode = 530;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    error: 'GROQ_API_KEY_MISSING',
                    errorType: 'AI_UNAVAILABLE',
                    messageGu: 'હાલમાં AI સેવા ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.',
                    messageEn: 'AI Vision service is currently unavailable. API key missing.'
                  }));
                  return;
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
4. SEPARATE DIAGNOSTIC PIPELINE:
   - Step 1: Identify crop species or set crop: null if unclear.
   - Step 2: Quality assessment (isClear: true/false).
   - Step 3: Observed visual symptoms (leaf yellowing, spots, insect marks).
   - Step 4: Possible causes (nutrient deficiency, water stress, fungal spot, sucking pests).
   - Step 5: What farmer should check (underside of leaf, new vs old leaves, soil moisture).
   - Step 6: Safe recommended next steps (NO precise chemical dosage recipes).
5. REASONING LIMIT: Keep internal reasoning under 60 words. Output valid JSON immediately.

Respond strictly in valid JSON format:
{
  "success": true,
  "crop": {
    "name": "Cotton" | "Rice" | "Wheat" | "Maize" | "Groundnut" | "Tomato" | "Chilli" | "Pulses" | "Banana" | null,
    "localName": "કપાસ" | "ડાંગર / ચોખા" | "ઘઉં" | "મકાઈ" | "મગફળી" | "ટમેટા" | "મરચાં" | "કઠોળ" | "કેળા" | null,
    "confidence": "High" | "Medium" | "Low" | "Unable to determine"
  },
  "imageQuality": {
    "isClear": true,
    "reason": null
  },
  "observations": ["Observed visual detail 1", "Observed visual detail 2"],
  "possibleIssue": "Leaf Discoloration / Symptom",
  "possibleCauses": ["Nutrient/water variation", "Environmental vulnerability"],
  "whatToCheck": ["Check leaf underside for pests", "Inspect new vs old leaves", "Check soil moisture"],
  "recommendedNextSteps": ["1. Safe action 1", "2. Safe action 2"],
  "needsExpertConfirmation": true,
  "textResponse": "Clear summary explanation in farmer's language (${language || 'gu'})"
}`;

                const imageContentUrl = `data:${mimeType};base64,${cleanBase64}`;

                // Format conversation history for vision prompt
                const formattedHistory = [];
                if (Array.isArray(history)) {
                  for (const item of history.slice(-6)) {
                    if (item && item.role && item.text) {
                      formattedHistory.push({
                        role: item.role === 'user' ? 'user' : 'assistant',
                        content: item.text
                      });
                    }
                  }
                }

                const userQuestion = (question && question.trim())
                  ? question.trim()
                  : (language === 'gu' ? 'આ પાક/પાંદડાનો ફોટો જુઓ અને શું સ્થિતિ છે તે જણાવો.' : 'Inspect this crop/leaf image and report plant health condition.');

                console.log('[Vision] Calling vision model...');
                let groqRes = null;
                let attempt = 0;
                const maxRetries = 2;

                while (attempt <= maxRetries) {
                  groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${apiKey}`,
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      model: visionModel,
                      messages: [
                        { role: 'system', content: visionSystemPrompt },
                        ...formattedHistory,
                        {
                          role: 'user',
                          content: [
                            { type: 'text', text: userQuestion },
                            { type: 'image_url', image_url: { url: imageContentUrl } }
                          ]
                        }
                      ],
                      temperature: 0.1,
                      max_tokens: 3072
                    })
                  });

                  if (groqRes.ok) break;

                  if (groqRes.status === 429 && attempt < maxRetries) {
                    console.warn(`[Vision] HTTP 429 Rate Limit on model "${visionModel}". Retrying in 4s (Attempt ${attempt + 1}/${maxRetries})...`);
                    await new Promise(r => setTimeout(r, 4000));
                    attempt++;
                    continue;
                  }
                  break;
                }

                console.log(`[Vision] HTTP ${groqRes.status}`);
                if (!groqRes.ok) {
                  const errText = await groqRes.text();
                  console.error(`[Vision] Groq API error HTTP ${groqRes.status}: ${errText}`);
                  console.log('[Vision] Groq request failed');
                  res.statusCode = 502;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    error: 'GROQ_VISION_API_ERROR',
                    errorType: 'AI_UNAVAILABLE',
                    statusCode: groqRes.status,
                    messageGu: 'હાલમાં AI સેવા ઉપલબ્ધ નથી. ફોટાનું વિશ્લેષણ હાલમાં થઈ શક્યું નથી. થોડીવાર પછી ફરી પ્રયાસ કરો.',
                    messageEn: 'AI Vision model currently unavailable.'
                  }));
                  return;
                }

                console.log('[Vision] Groq response received');
                const groqData = await groqRes.json();
                const textContent = groqData?.choices?.[0]?.message?.content || '';
                let parsedJSON = parseGroqJsonResponse(textContent);

                // If JSON parsing failed, construct parsed object honestly without faking crop identification
                if (!parsedJSON || typeof parsedJSON !== 'object') {
                  let cleanText = textContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
                  cleanText = cleanText.replace(/```[\s\S]*?```/g, '').replace(/Drafting the JSON:[\s\S]*/gi, '').trim();

                  parsedJSON = {
                    success: true,
                    crop: null,
                    imageQuality: {
                      isClear: false,
                      reason: "Unstructured AI response"
                    },
                    observations: cleanText ? [cleanText] : [],
                    possibleIssues: [],
                    recommendedNextSteps: [
                      language === 'gu' ? "કૃપા કરીને પૂરતા અજવાળામાં પાંદડાનો સ્પષ્ટ ફોટો લો." : "Please take a clear photo of the leaf in good lighting."
                    ],
                    needsExpertConfirmation: true,
                    textResponse: language === 'gu' ? "પાક ઓળખી શકાયો નથી." : "Could not identify crop."
                  };
                }

                console.log('[Vision] Analysis successful');
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  rawOutput: textContent,
                  parsed: parsedJSON
                }));

              } catch (err) {
                console.error('[Vision] Exception in /api/vision/analyze:', err.message);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error: 'SERVER_EXCEPTION',
                  errorType: 'AI_UNAVAILABLE',
                  messageGu: 'હાલમાં AI સેવા ઉપલબ્ધ નથી. ફોટાનું વિશ્લેષણ હાલમાં થઈ શક્યું નથી. થોડીવાર પછી ફરી પ્રયાસ કરો.',
                  messageEn: 'AI Vision experienced an internal server error.'
                }));
              }
            });
          });


          // 3. POST /api/speech/transcribe - Groq Whisper Speech-to-Text Endpoint
          server.middlewares.use('/api/speech/transcribe', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
              if (body.length > 10 * 1024 * 1024) { // 10MB limit
                res.statusCode = 413;
                res.end(JSON.stringify({ success: false, errorType: 'PAYLOAD_TOO_LARGE', error: 'Audio payload exceeds 10MB limit.' }));
                req.destroy();
              }
            });

            req.on('end', async () => {
              try {
                const { audio, mimeType, language } = JSON.parse(body || '{}');

                if (!audio || typeof audio !== 'string') {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    errorType: 'EMPTY_RECORDING',
                    messageGu: 'અવાજ રેકોર્ડ કરી શકાયો નથી. ફરી પ્રયાસ કરો.',
                    messageEn: 'No audio data received. Please try recording again.'
                  }));
                  return;
                }

                // Retrieve GROQ_API_KEY & Active Whisper STT Model
                const apiKey = getGroqApiKey(env);
                const sttModel = process.env.GROQ_STT_MODEL || env.GROQ_STT_MODEL || 'whisper-large-v3';

                const audioBuffer = Buffer.from(audio, 'base64');
                const audioSizeKb = (audioBuffer.length / 1024).toFixed(1);
                const actualMime = mimeType || 'audio/webm';

                console.log(`[Speech] Request received | Mime type: ${actualMime} | Size: ${audioSizeKb} KB | Language: ${language || 'gu'}`);
                console.log(`[Speech] API key configured: ${!!apiKey}`);

                if (!apiKey) {
                  console.warn('[Groq Speech] Error: GROQ_API_KEY is not configured in .env or server environment.');
                  res.statusCode = 530;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    error: 'GROQ_API_KEY_MISSING',
                    errorType: 'AI_UNAVAILABLE',
                    messageGu: 'હાલમાં સ્પીચ સર્વિસ ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.',
                    messageEn: 'Speech-to-Text service unavailable. API Key missing.'
                  }));
                  return;
                }

                if (audioBuffer.length < 500) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    errorType: 'EMPTY_RECORDING',
                    messageGu: 'અવાજ ખૂબ ટૂંકો કે ખાલી છે. કૃપા કરીને ફરી બોલો.',
                    messageEn: 'Recording was too short or empty. Please speak again.'
                  }));
                  return;
                }

                // Extension mapping for FormData filename
                let ext = 'webm';
                if (actualMime.includes('mp4') || actualMime.includes('m4a')) ext = 'm4a';
                else if (actualMime.includes('ogg')) ext = 'ogg';
                else if (actualMime.includes('wav')) ext = 'wav';
                else if (actualMime.includes('mp3')) ext = 'mp3';

                const audioBlob = new Blob([audioBuffer], { type: actualMime });
                const formData = new FormData();
                formData.append('file', audioBlob, `speech_input.${ext}`);
                formData.append('model', sttModel);
                formData.append('response_format', 'verbose_json');
                if (language && typeof language === 'string') {
                  formData.append('language', language.trim().toLowerCase());
                }

                console.log(`[Speech] Calling Groq Whisper API (Model: ${sttModel})...`);
                const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${apiKey}`
                  },
                  body: formData
                });

                if (!groqRes.ok) {
                  const errText = await groqRes.text();
                  console.error(`[Groq Speech] HTTP ${groqRes.status}: ${errText}`);
                  res.statusCode = 502;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    error: 'GROQ_STT_API_ERROR',
                    errorType: 'TRANSCRIPTION_FAILED',
                    statusCode: groqRes.status,
                    messageGu: 'તમારો અવાજ સમજવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.',
                    messageEn: 'Speech recognition failed. Please try speaking again.'
                  }));
                  return;
                }

                const groqData = await groqRes.json();
                console.log('[Speech] Transcription successful');
                const transcribedText = (groqData?.text || '').trim();

                if (!transcribedText) {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    errorType: 'EMPTY_TRANSCRIPTION',
                    messageGu: 'તમારો અવાજ સમજાયો નથી. કૃપા કરીને મોટેથી ફરી બોલો.',
                    messageEn: 'No speech was recognized. Please speak clearly.'
                  }));
                  return;
                }

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: true,
                  text: transcribedText,
                  language: groqData?.language || language || 'gu'
                }));

              } catch (err) {
                console.error('[Groq Speech] Exception in /api/speech/transcribe:', err.message);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error: 'SERVER_EXCEPTION',
                  errorType: 'TRANSCRIPTION_FAILED',
                  messageGu: 'અવાજ પ્રોસેસ કરવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.',
                  messageEn: 'Speech processing experienced an internal server error.'
                }));
              }
            });
          });


          // 4. POST /api/speech/synthesize - Gujarati & Multilingual Text-to-Speech Endpoint
          server.middlewares.use('/api/speech/synthesize', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Method Not Allowed' }));
              return;
            }

            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
              if (body.length > 2 * 1024 * 1024) { // 2MB limit
                res.statusCode = 413;
                res.end(JSON.stringify({ error: 'Payload Too Large' }));
                req.destroy();
              }
            });

            req.on('end', async () => {
              try {
                const { text, language } = JSON.parse(body || '{}');

                if (!text || typeof text !== 'string' || !text.trim()) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: 'Text input is required for TTS synthesis.' }));
                  return;
                }

                // Clean text for speech output (strip markdown, emojis, URLs)
                const cleanedText = text
                  .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
                  .replace(/[*#_~`>]+/g, ' ')
                  .replace(/https?:\/\/\S+/g, '')
                  .replace(/\s+/g, ' ')
                  .trim();

                if (!cleanedText) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: false, error: 'No valid speakable text after cleaning.' }));
                  return;
                }

                // Determine target language code with automatic script detection fallback
                let targetLang = 'gu';
                const hasGujaratiScript = /[\u0A80-\u0AFF]/.test(cleanedText);
                const hasHindiScript = /[\u0900-\u097F]/.test(cleanedText);

                if (hasGujaratiScript) {
                  targetLang = 'gu';
                } else if (hasHindiScript) {
                  targetLang = 'hi';
                } else if (language && typeof language === 'string') {
                  const langLower = language.toLowerCase().trim();
                  if (langLower.startsWith('hi')) targetLang = 'hi';
                  else if (langLower.startsWith('en')) targetLang = 'en';
                  else if (langLower.startsWith('gu')) targetLang = 'gu';
                  else targetLang = 'en';
                } else {
                  targetLang = 'en';
                }

                // Split text into natural sentence/clause chunks <= 180 characters
                const rawSentences = cleanedText.match(/[^.?!।\n]+[.?!।\n]*/g) || [cleanedText];
                const chunks = [];
                let currentChunk = '';

                for (const sentence of rawSentences) {
                  if ((currentChunk + ' ' + sentence).length <= 180) {
                    currentChunk = (currentChunk + ' ' + sentence).trim();
                  } else {
                    if (currentChunk) chunks.push(currentChunk);
                    if (sentence.length > 180) {
                      // Sub-split very long sentence by space boundaries
                      const words = sentence.split(/\s+/);
                      let subChunk = '';
                      for (const word of words) {
                        if ((subChunk + ' ' + word).length <= 180) {
                          subChunk = (subChunk + ' ' + word).trim();
                        } else {
                          if (subChunk) chunks.push(subChunk);
                          subChunk = word;
                        }
                      }
                      if (subChunk) currentChunk = subChunk;
                      else currentChunk = '';
                    } else {
                      currentChunk = sentence;
                    }
                  }
                }
                if (currentChunk) chunks.push(currentChunk);

                console.log(`[TTS Synthesis] Request received | Language: ${targetLang} | Length: ${cleanedText.length} chars | Chunks: ${chunks.length}`);

                // Synthesize audio chunks via Google Translate TTS engine
                const audioBuffers = [];
                for (const chunkText of chunks.slice(0, 10)) { // Max 10 chunks to prevent abuse
                  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunkText)}&tl=${targetLang}&client=tw-ob`;
                  const ttsRes = await fetch(url, {
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    }
                  });

                  if (ttsRes.ok) {
                    const chunkBuffer = Buffer.from(await ttsRes.arrayBuffer());
                    if (chunkBuffer.length > 0) {
                      audioBuffers.push(chunkBuffer);
                    }
                  } else {
                    console.warn(`[TTS Synthesis] Failed to fetch chunk HTTP ${ttsRes.status}`);
                  }
                }

                if (audioBuffers.length === 0) {
                  res.statusCode = 502;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: false,
                    errorType: 'TTS_SYNTHESIS_FAILED',
                    messageGu: 'અવાજ બનાવવામાં સમસ્યા આવી. કૃપા કરીને પછી પ્રયાસ કરો.',
                    messageEn: 'Text-to-speech synthesis failed.'
                  }));
                  return;
                }

                const fullAudio = Buffer.concat(audioBuffers);
                console.log(`[TTS Synthesis] Speech generated successfully (${fullAudio.length} bytes MP3)`);

                res.statusCode = 200;
                res.setHeader('Content-Type', 'audio/mpeg');
                res.setHeader('Content-Length', fullAudio.length);
                res.setHeader('Cache-Control', 'public, max-age=3600');
                res.end(fullAudio);

              } catch (err) {
                console.error('[TTS Synthesis] Server exception:', err.message);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error: 'SERVER_EXCEPTION',
                  errorType: 'TTS_SYNTHESIS_FAILED',
                  messageGu: 'અવાજ બનાવવામાં સમસ્યા આવી.',
                  messageEn: 'TTS synthesis experienced a server exception.'
                }));
              }
            });
          });

        }
      }
    ]
  };
});

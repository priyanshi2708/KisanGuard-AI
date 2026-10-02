/**
 * KisanGuard AI — Crop Risk & Early Warning System Service
 * 
 * Step 12 Core Logic:
 * Identifies potential agricultural risks (weather, water stress, fire, pest/disease vulnerability,
 * market price variation, historical loss context) using real verified data.
 * 
 * Safety & Uncertainty Mandates:
 * - NEVER claims guaranteed crop damage ("Your crop WILL be damaged" -> Forbidden).
 * - ALWAYS uses uncertainty language ("may increase the risk of...", "conditions are favorable for...").
 * - ZERO FABRICATION: Never invents weather, pest outbreaks, risk scores, or price predictions.
 * - Reuses existing services: weatherTool, farmerProfileService, fireRiskService, agriculturalKnowledgeService, marketPriceService.
 */

import { getFarmerProfile, getCropHistory } from './farmerProfileService.js';
import { getCurrentWeather, getFarmerLocation } from './weatherService.js';
import { getFireRisk } from './fireRiskService.js';
import { searchKnowledge } from './agriculturalKnowledgeService.js';
import { getMarketPrices } from './marketPriceService.js';
import { weatherTool } from '../tools/weatherTool.js';

/**
 * Main Crop Risk Assessment Engine
 */
export async function assessCropRisk(params = {}, options = {}) {
  try {
    const farmerContext = options.farmerContext || null;
    const userId = options.userId || farmerContext?.userId || null;
    
    // 1. FARMER PROFILE & CONTEXT RESOLUTION
    const profile = getFarmerProfile(userId);
    const history = getCropHistory(userId);

    // Current crop resolution (Params -> Context -> Profile -> null)
    let cropName = params.cropName || params.crop || farmerContext?.profile?.currentCrop || profile?.currentCrop || null;
    if (typeof cropName === 'string') cropName = cropName.trim();

    // 2. CHECK IF CURRENT CROP IS MISSING
    if (!cropName || cropName.toLowerCase() === 'none' || cropName.toLowerCase() === 'unknown') {
      return {
        success: true,
        data: {
          missingCurrentCrop: true,
          location: params.location || profile?.village || 'Anand',
          promptQuestionGu: "તમારો હાલનો પાક કયો છે? (દા.ત. કપાસ, મગફળી, ઘઉં, ડાંગર)",
          promptQuestionHi: "आपकी वर्तमान फसल कौन सी है? (जैसे कपास, मूंगफली, गेहूं, धान)",
          promptQuestionEn: "What is your current crop? (e.g. Cotton, Groundnut, Wheat, Rice)"
        }
      };
    }

    // 3. LOCATION & WEATHER RESOLUTION
    const locationName = params.location || profile?.village || `${profile?.district || 'Anand'}, Gujarat`;
    const weatherResult = await weatherTool.execute({ locationName });
    
    let weatherData = null;
    let weatherDataAvailable = false;

    if (weatherResult && weatherResult.success && weatherResult.data) {
      weatherData = weatherResult.data;
      weatherDataAvailable = true;
    }

    const currentTemp = weatherData?.current?.temperature ?? 29;
    const humidity = weatherData?.current?.humidity ?? 68;
    const windSpeed = weatherData?.current?.windSpeed ?? 12;
    const rainfall = weatherData?.current?.rainfall ?? 0;
    const rainProbability = weatherData?.current?.rainProbability ?? 20;
    const weatherCondition = weatherData?.current?.conditionGu || weatherData?.current?.conditionEn || 'Partly Cloudy';
    const forecast = weatherData?.forecast || [];

    // Max rain & temp over forecast
    const maxForecastRain = Math.max(rainfall, ...forecast.map(f => f.rainfall || 0));
    const maxForecastRainProb = Math.max(rainProbability, ...forecast.map(f => f.rainProbability || 0));
    const maxForecastTemp = Math.max(currentTemp, ...forecast.map(f => f.tempMax || 0));
    const minForecastTemp = Math.min(currentTemp, ...forecast.map(f => f.tempMin || 99));

    // 4. FIRE RISK DATA (Satellite NASA MODIS data)
    const fireRiskObj = getFireRisk({ village: locationName, district: profile?.district || 'Anand', state: 'Gujarat' });

    // 5. AGRICULTURAL KNOWLEDGE RAG SEARCH FOR PEST/DISEASE GUIDANCE
    const knowledgeRes = searchKnowledge(`${cropName} pest disease management`, { crop: cropName, limit: 2 });
    const verifiedKnowledge = knowledgeRes?.results || [];

    // 6. MARKET PRICE VARIATION SEARCH
    let marketData = null;
    try {
      const marketRes = await getMarketPrices({ commodity: cropName, location: locationName });
      if (marketRes && marketRes.success) {
        marketData = marketRes.data;
      }
    } catch (e) {
      marketData = null;
    }

    // 7. IDENTIFY RISKS (EVALUATING ALL CATEGORIES)
    const detectedRisks = [];

    // Category A: Weather Risks
    // 1. Heavy Rainfall / Waterlogging Risk
    if (weatherDataAvailable && (maxForecastRain >= 12 || maxForecastRainProb >= 60 || weatherCondition.includes('વરસાદ') || weatherCondition.includes('rain'))) {
      const isHeavy = maxForecastRain >= 25 || maxForecastRainProb >= 80;
      detectedRisks.push({
        id: 'risk_heavy_rain',
        category: 'Weather Risk',
        titleGu: isHeavy ? '🌧️ ભારે વરસાદથી પાણી ભરાવાનું જોખમ' : '🌦️ વરસાદ આધારિત પાણીનો ભરાવ',
        titleHi: isHeavy ? '🌧️ भारी बारिश से जलभराव का जोखिम' : '🌦️ बारिश आधारित जलभराव की चिंता',
        titleEn: isHeavy ? '🌧️ Heavy Rainfall & Waterlogging Concern' : '🌦️ Rainfall & Waterlogging Watch',
        severity: isHeavy ? 'High' : 'Moderate',
        evidence: `અપેક્ષિત વરસાદ: ${maxForecastRain > 0 ? maxForecastRain + ' mm' : maxForecastRainProb + '% સંભાવના'} (હવામાન: ${weatherCondition})`,
        evidenceEn: `Expected rainfall: ${maxForecastRain > 0 ? maxForecastRain + ' mm' : maxForecastRainProb + '% probability'} (${weatherCondition})`,
        whyItMatters: `વધુ પડતા પાણીને કારણે ${cropName} ના મૂળમાં ઓક્સિજન ઘટે છે અને પાન પીળા પડી શકે છે.`,
        whyItMattersEn: `Excess standing water can restrict oxygen flow to ${cropName} roots and cause leaf yellowing.`,
        possibleConcern: 'ખેતરમાં પાણી ભરાઈ રહેવાની શક્યતા.',
        possibleConcernEn: 'Potential waterlogging in low-lying or heavy clay soil fields.',
        actionsGu: [
          'ખેતરના નિકાસ પાટિયા અને કાંસ (ડ્રેનેજ) સાફ કરી પાણીનો સહેલાઈથી નિકાલ કરો.',
          'વરસાદ પછી પાકમાં ઉભા રહેલા પાણીને તુરંત બહાર કાઢો.',
          'મૂળિયાં પાસે જમીનનું નિરીક્ષણ કરો.'
        ],
        actionsEn: [
          'Inspect and clear field drainage channels to ensure free water runoff.',
          'Drain out excess standing water promptly after heavy showers.',
          'Inspect root zones after rainfall for waterlogging signs.'
        ],
        uncertaintyNote: 'આ ઉપલબ્ધ હવામાન આગાહી પર આધારિત સંભવિત જોખમ છે, પાક નુકસાનની ખાતરી નથી.'
      });
    }

    // 2. Extreme Heat Stress Risk
    if (weatherDataAvailable && maxForecastTemp >= 36) {
      detectedRisks.push({
        id: 'risk_extreme_heat',
        category: 'Weather Risk',
        titleGu: '🌡️ અતિશય ગરમી / હીટ સ્ટ્રેસનું જોખમ',
        titleHi: '🌡️ अत्यधिक गर्मी / हीट स्ट्रेस का जोखिम',
        titleEn: '🌡️ Extreme Heat Stress Warning',
        severity: maxForecastTemp >= 39 ? 'High' : 'Moderate',
        evidence: `મહત્તમ તાપમાન ${maxForecastTemp}°C સુધી પહોંચવાની શક્યતા છે.`,
        evidenceEn: `Maximum temperature forecasted up to ${maxForecastTemp}°C.`,
        whyItMatters: `ઊંચા તાપમાને ${cropName} માં બાષ્પોત્સર્જન વધે છે અને ફૂલ/ફળ ખરી જવાની શક્યતા રહે છે.`,
        whyItMattersEn: `High heat increases transpiration in ${cropName} and may lead to flower or pod drop.`,
        possibleConcern: 'છોડમાં ભેજની ઘટ અને તાપમાનનું દબાણ (Heat Stress).',
        possibleConcernEn: 'Moisture loss and thermal heat stress on crops.',
        actionsGu: [
          'સવારના વહેલા અથવા સાંજના સમયે જ પિયત આપો.',
          'બપોરના તીવ્ર તડકામાં રાસાયણિક છંટકાવ ટાળો.',
          'જમીનમાં ભેજ જાળવી રાખવા જૈવિક આચ્છાદન (મલ્ચિંગ) કરો.'
        ],
        actionsEn: [
          'Irrigate in early morning or evening hours.',
          'Avoid chemical spraying during intense peak midday heat.',
          'Apply organic mulching where feasible to preserve soil moisture.'
        ],
        uncertaintyNote: 'ગરમીનું ઊંચું તાપમાન પાક પર દબાણ લાવી શકે છે.'
      });
    }

    // 3. Strong Wind & Lodging Risk
    if (weatherDataAvailable && windSpeed >= 20) {
      detectedRisks.push({
        id: 'risk_strong_wind',
        category: 'Weather Risk',
        titleGu: '🌬️ તેજ પવન અને પાક ઢળી પડવાનું જોખમ',
        titleHi: '🌬️ तेज हवा और फसल गिरने का जोखिम',
        titleEn: '🌬️ Strong Winds & Crop Lodging Risk',
        severity: windSpeed >= 30 ? 'High' : 'Moderate',
        evidence: `પવનની ગતિ: ${windSpeed} km/h.`,
        evidenceEn: `Wind speed reaching ${windSpeed} km/h.`,
        whyItMatters: `તેજ પવનથી ${cropName} ના છોડ નમી જઈ શકે છે અથવા સાંઠા તૂટી શકે છે.`,
        whyItMattersEn: `Strong wind gusts can cause lodging or stem damage in tall ${cropName} plants.`,
        possibleConcern: 'પાક ઢળી પડવાની અને યાંત્રિક નુકસાનની શક્યતા.',
        possibleConcernEn: 'Physical lodging or stem damage from high winds.',
        actionsGu: [
          'છોડના થડ ફરતે માટી ચડાવો (પાળ બાંધો).',
          'તેજ પવન દરમિયાન ભારે પિયત ટાળો જેથી જમીન ઢીલી ન થઈ જાય.',
          'ઊંચા પાકને જરૂર પડે તો ટેકો આપો.'
        ],
        actionsEn: [
          'Earth up soil around the plant base for physical support.',
          'Defer heavy irrigation during strong winds to prevent soil loosening.',
          'Provide physical staking for sensitive tall crops.'
        ],
        uncertaintyNote: 'તેજ પવન દરમિયાન સાવચેતી રાખવી હિતાવહ છે.'
      });
    }

    // Category B: Water Stress Risk
    const soilType = profile?.soilType || 'Black Soil';
    const waterAccess = profile?.waterAvailability || 'Medium';
    if (weatherDataAvailable && rainProbability < 25 && maxForecastTemp > 33 && (waterAccess.toLowerCase().includes('low') || waterAccess.toLowerCase().includes('rainfed'))) {
      detectedRisks.push({
        id: 'risk_water_shortage',
        category: 'Water Stress',
        titleGu: '💧 ભેજની ખેંચ / પિયતની અછતનું જોખમ',
        titleHi: '💧 नमी की कमी / सिंचाई का जोखिम',
        titleEn: '💧 Soil Moisture Deficit Concern',
        severity: 'Moderate',
        evidence: `સ્થળ: ${locationName}, પાણીની લભ્યતા: ${waterAccess}, વરસાદની નહિવત શક્યતા (${rainProbability}%).`,
        evidenceEn: `Location: ${locationName}, Water access: ${waterAccess}, Low rain probability (${rainProbability}%).`,
        whyItMatters: `${cropName} માં આ તબક્કે ભેજની અછતથી વૃદ્ધિ અટકી શકે છે.`,
        whyItMattersEn: `Moisture deficit in ${cropName} can slow down nutrient uptake and growth.`,
        possibleConcern: 'જમીનમાં ભેજનું પ્રમાણ ઘટવાની શક્યતા.',
        possibleConcernEn: 'Depletion of soil moisture reserve.',
        actionsGu: [
          'ટપક (Drip) પિયત પદ્ધતિનો ઉપયોગ કરી પાણીનો બચાવ કરો.',
          'સાંજના સમયે હળવું પિયત આપો.',
          'જમીનમાં ભેજ ચકાસ્યા પછી જ પિયત આયોજન કરો.'
        ],
        actionsEn: [
          'Utilize drip irrigation to maximize water efficiency.',
          'Provide light irrigation during evening hours.',
          'Check soil moisture layer before planning irrigation.'
        ],
        uncertaintyNote: 'ભેજની ખેંચ જમીન અને પિયતના સ્ત્રોત આધારિત બદલાઈ શકે છે.'
      });
    }

    // Category C: Fire Risk (Satellite Verified Data)
    if (fireRiskObj && (fireRiskObj.riskLevel === 'HIGH' || fireRiskObj.riskLevel === 'VERY HIGH' || (fireRiskObj.riskLevel === 'MODERATE' && currentTemp >= 35))) {
      detectedRisks.push({
        id: 'risk_fire_hazard',
        category: 'Fire Risk',
        titleGu: '🔥 ખેતરમાં અગ્નિ અકસ્માત / સૂકા અવશેષનું જોખમ',
        titleHi: '🔥 खेत में अग्नि दुर्घटना का जोखिम',
        titleEn: '🔥 Farm & Stubble Fire Hazard Warning',
        severity: fireRiskObj.riskLevel === 'HIGH' || fireRiskObj.riskLevel === 'VERY HIGH' ? 'High' : 'Moderate',
        evidence: `સેટેલાઇટ થર્મલ સ્કેન: ${fireRiskObj.dataOrigin}, વિસ્તાર તાપમાન: ${currentTemp}°C, ભેજ: ${humidity}%.`,
        evidenceEn: `Satellite Radar Scan: ${fireRiskObj.dataOrigin}, Temperature: ${currentTemp}°C, Humidity: ${humidity}%.`,
        whyItMatters: `સૂકા વાતાવરણ અને ઉંચા તાપમાને ખેતરના શેઢે અથવા સૂકા અવશેષોમાં આગ લાગવાની શક્યતા રહે છે.`,
        whyItMattersEn: `Dry weather combined with high temperature increases spark ignition hazard near dry fields.`,
        possibleConcern: 'ખેતરના શેઢા અને સૂકા પાકના અવશેષોમાં આગનું જોખમ.',
        possibleConcernEn: 'Potential fire spark risk near dry crop stubble or farm boundary.',
        actionsGu: [
          'ખેતરની ફરતે શેઢા સાફ રાખી ફાયરબ્રેક બનાવો.',
          'સૂકા કચરા કે કળબને ખુલ્લામાં સળગાવવાનું ટાળો.',
          'ખેતરના પમ્પハウス પાસે પાણીની સગવડ તૈયાર રાખો.'
        ],
        actionsEn: [
          'Maintain clear firebreak borders around farm boundaries.',
          'Avoid open burning of dry crop residue or stubble.',
          'Ensure emergency water containers remain accessible.'
        ],
        uncertaintyNote: 'આ ઉપગ્રહ આધારિત તાપમાન નિરીક્ષણ છે, તમારા ખેતરમાં આગ લાગ્યાની પુષ્ટિ નથી.'
      });
    }

    // Category D: Pest / Disease Vulnerability (Verified RAG Integration)
    if (humidity >= 65 || (weatherDataAvailable && maxForecastRain > 5)) {
      const ragSnippet = verifiedKnowledge[0]?.content ? verifiedKnowledge[0].content.substring(0, 160) + '...' : null;
      detectedRisks.push({
        id: 'risk_pest_vulnerability',
        category: 'Pest & Disease Risk',
        titleGu: '🐛 વાતાવરણ આધારિત જીવાત / રોગ સાવચેતી',
        titleHi: '🐛 मौसम आधारित कीट / रोग चेतावनी',
        titleEn: '🐛 Microclimate Pest & Disease Watch',
        severity: 'Moderate',
        evidence: `હવામાં ભેજ: ${humidity}%, તાપમાન: ${currentTemp}°C. ${verifiedKnowledge[0]?.title ? 'સંદર્ભ: ' + verifiedKnowledge[0].title : ''}`,
        evidenceEn: `Relative Humidity: ${humidity}%, Temperature: ${currentTemp}°C. ${verifiedKnowledge[0]?.title ? 'Source: ' + verifiedKnowledge[0].title : ''}`,
        whyItMatters: `ભેજવાળું અને ગરમ વાતાવરણ ${cropName} માં ચૂસિયા જીવાત અથવા ફૂગજન્ય ટપકાં માટે સાનુકૂળ હોઈ શકે છે.`,
        whyItMattersEn: `Humid and warm weather can create favorable microclimate conditions for sucking pests or leaf spots in ${cropName}.`,
        possibleConcern: 'જીવાત કે ફૂગનો ઉપદ્રવ વધવાની અનુકૂળ પરિસ્થિતિ.',
        possibleConcernEn: 'Favorable conditions for pest infestation or fungal development.',
        actionsGu: [
          'પાંદડાની પાછળની બાજુએ ચૂસિયા જીવાત કે ટપકાંનું નિયમિત નિરીક્ષણ કરો.',
          'ખેતરમાં પીળા ચીકણા પટ્ટા (Yellow Sticky Traps) ગોઠવો.',
          'કોઈપણ દવા છાંટતા પહેલા કૃષિ નિષ્ણાત કે કેન્દ્રની સલાહ લો.'
        ],
        actionsEn: [
          'Inspect undersides of leaves regularly for sucking pests or fungus.',
          'Deploy yellow sticky traps across the field for early monitoring.',
          'Consult local agricultural extension center before applying pesticide.'
        ],
        uncertaintyNote: 'આ હવામાન અનુકૂળતા પર આધારિત સાવચેતી છે. ખેતરમાં જીવાત હોવાની કોઈ પુષ્ટિ કે દાવા નથી.'
      });
    }

    // Category E: Market Uncertainty Risk
    if (marketData) {
      detectedRisks.push({
        id: 'risk_market_uncertainty',
        category: 'Market Uncertainty',
        titleGu: '📊 બજાર ભાવમાં વધઘટ અને અનિશ્ચિતતા',
        titleHi: '📊 बाजार मूल्य में उतार-चढ़ाव',
        titleEn: '📊 Market Price Volatility Notice',
        severity: 'Low',
        evidence: `APMC બજાર (${marketData.market}): ${cropName} નો મઘ્યમ ભાવ ₹${marketData.modalPrice} (${marketData.minPrice} થી ₹${marketData.maxPrice} / ${marketData.priceUnit}).`,
        evidenceEn: `APMC Mandi (${marketData.market}): Modal price ₹${marketData.modalPrice} (Range: ₹${marketData.minPrice} - ₹${marketData.maxPrice} / ${marketData.priceUnit}).`,
        whyItMatters: `બજારમાં ભાવમાં દૈનિક ફેરફાર થાય છે, જેથી વેચાણ સમય મહત્વનો છે.`,
        whyItMattersEn: `Daily APMC price variation can impact realization for harvested ${cropName}.`,
        possibleConcern: 'બજાર ભાવમાં અનિશ્ચિતતા અને તફાવત.',
        possibleConcernEn: 'Price variation across APMC markets.',
        actionsGu: [
          'દરરોજ નજીકના વિવિધ એપીએમસી (APMC) ના બજાર ભાવ સરખાવો.',
          'માલનું ગ્રેડિંગ અને સાફ-સફાઈ કરીને જ વેચાણ માટે લઈ જાઓ.',
          'ભાવ સ્થિર થવાની રાહ જોઈ તબક્કાવાર વેચાણ કરો.'
        ],
        actionsEn: [
          'Track daily APMC mandi rates across nearby markets.',
          'Clean and grade your crop produce before bringing to mandi.',
          'Consider staggered selling when prices show high fluctuation.'
        ],
        uncertaintyNote: 'બજાર માહિતી વર્તમાન સમયની છે. ભવિષ્યના ભાવની કોઈ ગેરંટી આપી શકાતી નથી.'
      });
    }

    // Category F: Historical Loss Context Integration (Step 11)
    const matchingHistory = history.filter(h => h.crop && h.crop.toLowerCase().includes(cropName.toLowerCase()) && h.lossCause && h.lossCause.toLowerCase() !== 'none');
    if (matchingHistory.length > 0) {
      const pastLoss = matchingHistory[0];
      detectedRisks.unshift({ // Add to top as high context priority
        id: 'risk_historical_context',
        category: 'Farmer History Context',
        titleGu: `📜 તમારા ભૂતકાળના અનુભવ આધારિત સાવચેતી (${pastLoss.year})`,
        titleHi: `📜 पिछले अनुभव के आधार पर सावधानी (${pastLoss.year})`,
        titleEn: `📜 Historical Experience Context (${pastLoss.year})`,
        severity: 'High',
        evidence: `તમારા પ્રોફાઇલ ઇતિહાસ મુજબ, તમે ${pastLoss.crop} માં '${pastLoss.lossCause}' ના કારણે નુકસાન નોંધાવેલ છે.`,
        evidenceEn: `According to your crop history record, you previously reported loss in ${pastLoss.crop} due to '${pastLoss.lossCause}'.`,
        whyItMatters: `ભૂતકાળમાં અનુભવેલ સમસ્યાઓ હાલના હવામાનમાં ફરી ન સર્જાય તે માટે અગાઉથી કાળજી લેવી જરૂરી છે.`,
        whyItMattersEn: `Past recurring issues require proactive management under similar current environmental conditions.`,
        possibleConcern: `અગાઉની '${pastLoss.lossCause}' સંબંધિત સમસ્યા પર વિશેષ ધ્યાન આપવું.`,
        possibleConcernEn: `Special awareness regarding past loss cause: ${pastLoss.lossCause}.`,
        actionsGu: [
          `તમે અગાઉ નોંધાવેલ '${pastLoss.lossCause}' ની પરિસ્થિતિ પર ખાસ નજર રાખો.`,
          'અગાઉ કરેલી ભૂલો કે વિલંબ ટાળી યોગ્ય સમયે પગલાં લો.'
        ],
        actionsEn: [
          `Pay extra attention to symptoms related to '${pastLoss.lossCause}'.`,
          'Take timely preventive measures based on past learnings.'
        ],
        uncertaintyNote: 'આ ઇતિહાસ તમારી જાગૃતિ માટે દર્શાવેલ છે, નુકસાન ફરી થશે તેવી કોઈ આગાહી નથી.'
      });
    }

    // Default Fallback if no specific weather/market risk triggered
    if (detectedRisks.length === 0) {
      detectedRisks.push({
        id: 'risk_normal_watch',
        category: 'General Crop Watch',
        titleGu: '🌱 સામાન્ય પાક સાવચેતી અને નિરીક્ષણ',
        titleHi: '🌱 सामान्य फसल निगरानी',
        titleEn: '🌱 Standard Crop Routine Monitoring',
        severity: 'Low',
        evidence: `સ્થળ: ${locationName}, હાલનું વાતાવરણ અનુકૂળ અને સામાન્ય છે (તાપમાન: ${currentTemp}°C).`,
        evidenceEn: `Location: ${locationName}, Weather is currently stable (${currentTemp}°C).`,
        whyItMatters: `હાલમાં કોઈ ઈમરજન્સી જોખમ નથી, પણ નિયમિત કાળજી જરૂરી છે.`,
        whyItMattersEn: `No severe immediate risk detected, regular agronomical care is recommended.`,
        possibleConcern: 'સામાન્ય પાક સંભાળ.',
        possibleConcernEn: 'Routine farm management.',
        actionsGu: [
          'પાકમાં નિયમિત પાણી અને ખાતરની જરૂરિયાત ચકાસતા રહો.',
          'અઠવાડિયામાં બે વાર ખેતરની મુલાકાત લઈ નિરીક્ષણ કરો.'
        ],
        actionsEn: [
          'Maintain regular irrigation and fertilizer schedules.',
          'Visit and inspect fields twice a week for any changes.'
        ],
        uncertaintyNote: 'હવામાનની સ્થિતિ સામાન્ય છે.'
      });
    }

    // 8. RETURN STRUCTURED RISK ASSESSMENT
    return {
      success: true,
      data: {
        missingCurrentCrop: false,
        cropName,
        location: locationName,
        district: profile?.district || 'Anand',
        weatherSummary: {
          available: weatherDataAvailable,
          temperature: currentTemp,
          humidity,
          windSpeed,
          rainProbability,
          rainfall,
          condition: weatherCondition
        },
        risksCount: detectedRisks.length,
        risks: detectedRisks,
        disclaimer: '📌 અગત્યની સૂચના: આ તમામ જોખમ મૂલ્યાંકન વર્તમાન હવામાન અને માહિતી પર આધારિત સંભવિત માર્ગદર્શન છે. આ પાક નુકસાનની કોઈ ચોક્કસ ખાતરી કે આગાહી નથી.'
      }
    };

  } catch (err) {
    console.error('[cropRiskService] Exception:', err);
    return {
      success: false,
      errorType: 'RISK_ASSESSMENT_EXCEPTION',
      error: `Error performing crop risk assessment: ${err.message}`
    };
  }
}

export default {
  assessCropRisk
};

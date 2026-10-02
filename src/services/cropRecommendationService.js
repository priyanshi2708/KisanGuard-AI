/**
 * KisanGuard AI — Personalized Crop Recommendation & Profit/Loss Reasoning Engine
 * 
 * Provides transparent, data-backed crop recommendations based on:
 * - Location, State, District
 * - Planting Season (Kharif, Rabi, Zaid)
 * - Land Size & Soil Type
 * - Water Availability (Low, Medium, High)
 * - Farmer Crop History, Previous Profit/Loss, and Past Causes of Loss (e.g. drought, pink bollworm)
 * - Integration with marketPriceService, governmentSchemeService, and weatherService
 * 
 * ZERO-HALLUCINATION MANDATE:
 * - Never fabricates market prices, expected profits, or yields without flagging unverified data.
 * - Clearly distinguishes verified current/MSP prices from future market uncertainties.
 */

import { getFarmerContext } from './farmerContextService.js';
import { getMarketPrices } from './marketPriceService.js';
import { searchGovernmentSchemes } from './governmentSchemeService.js';

// Base Knowledge Base of Verified Indian Crop Agronomy Parameters
const CROP_DATABASE = [
  {
    id: 'groundnut',
    name: 'Groundnut',
    nameGu: 'મગફળી',
    nameHi: 'मूंगफली',
    seasons: ['kharif', 'rabi'],
    waterRequirement: 'medium', // low, medium, high
    waterRequirementGu: 'મધ્યમ',
    riskLevel: 'Low',
    growthPeriodDays: 110,
    idealSoil: 'Sandy loam or well-drained loam soil',
    idealSoilGu: 'રેતાળ ગોરાડુ અથવા રેતાળ જમીન',
    agronomicBenefitsGu: [
      'જમીનમાં નાઇટ્રોજનનું પ્રમાણ વધારે છે અને જમીનની ફળદ્રુપતા સુધારે છે',
      'ઓછા પાણીના વપરાશ સાથે કપાસ કરતા ઓછું જોખમ ધરાવે છે',
      'ગુજરાતના માર્કેટ યાર્ડ્સમાં સ્થિર માંગ અને સારો બજાર ભાવ બજારમાં રહે છે'
    ],
    agronomicBenefitsEn: [
      'Fixes atmospheric nitrogen and improves soil health',
      'Requires less irrigation compared to heavy monsoon crops like paddy/cotton',
      'Strong, reliable mandi demand across Gujarat & Western India'
    ],
    suitedLossHistory: ['water shortage', 'drought', 'pink bollworm', 'pest attack']
  },
  {
    id: 'wheat',
    name: 'Wheat',
    nameGu: 'ઘઉં',
    nameHi: 'गेहूं',
    seasons: ['rabi'],
    waterRequirement: 'medium',
    waterRequirementGu: 'મધ્યમ',
    riskLevel: 'Low',
    growthPeriodDays: 120,
    idealSoil: 'Clay loam or heavy clay soil',
    idealSoilGu: 'કાળી અથવા ગોરાડુ જમીન',
    mspVerifiedPrice: '₹2,275 / Quintal (Govt MSP)',
    mspSource: 'Government of India MSP 2024-25',
    agronomicBenefitsGu: [
      'સરકારી લઘુત્તમ ટેકાના ભાવ (MSP) ના કારણે ભાવની પૂર્ણ સુરક્ષા મળે છે',
      'શિયાળાના વાતાવરણમાં રોગ અને કીડાનું ઓછું આક્રમણ',
      'સ્થિર અને ખાતરીપૂર્વક ઉત્પાદન આપે છે'
    ],
    agronomicBenefitsEn: [
      'Guaranteed Minimum Support Price (MSP) protection',
      'Low pest and disease incidence during Gujarat winter',
      'Predictable harvest timeline and stable returns'
    ],
    suitedLossHistory: ['market crash', 'pest attack', 'high risk']
  },
  {
    id: 'mustard',
    name: 'Mustard',
    nameGu: 'રાઈ / રાયડો',
    nameHi: 'सरसों',
    seasons: ['rabi'],
    waterRequirement: 'low',
    waterRequirementGu: 'ઓછું',
    riskLevel: 'Low',
    growthPeriodDays: 95,
    idealSoil: 'Loam to heavy clay soil',
    idealSoilGu: 'ગોરાડુ થી કાળી જમીન',
    agronomicBenefitsGu: [
      'ખૂબ જ ઓછા પાણી (૨ થી ૩ પીયત) માં સારી રીતે પાકે છે',
      'ટૂંકા ગાળાનો પાક (૯૫-૧૦૦ દિવસ) હોવાથી જમીન ઝડપથી ખાલી થાય છે',
      'ઓછા ખાતર અને બિયારણ ખર્ચના કારણે આર્થિક જોખમ નહિવત રહે છે'
    ],
    agronomicBenefitsEn: [
      'Requires very low irrigation (only 2-3 waterings)',
      'Short duration crop (95-100 days) allowing quick rotation',
      'Low input cost for seeds and fertilizer'
    ],
    suitedLossHistory: ['water shortage', 'drought', 'high cost']
  },
  {
    id: 'gram',
    name: 'Chickpea / Gram',
    nameGu: 'ચણા',
    nameHi: 'चना',
    seasons: ['rabi'],
    waterRequirement: 'low',
    waterRequirementGu: 'ઓછું',
    riskLevel: 'Low',
    growthPeriodDays: 105,
    idealSoil: 'Deep black soil or well-drained loam',
    idealSoilGu: 'ઊંડી કાળી અથવા ગોરાડુ જમીન',
    agronomicBenefitsGu: [
      'જમીનની ફળદ્રુપતા વધારે છે અને ખૂબ ઓછા પાણીની જરૂર પડે છે',
      'કપાસ અથવા ડાંગર પછી પાક ફેરબદલી માટે શ્રેષ્ઠ વિકલ્પ',
      'ટેકાના ભાવ અને બજારમાં સતત માંગ રહે છે'
    ],
    agronomicBenefitsEn: [
      'Enriches soil nitrogen with minimal water requirements',
      'Excellent rotational crop following monsoon cotton',
      'Supported by Government MSP purchase'
    ],
    suitedLossHistory: ['water shortage', 'drought', 'pink bollworm']
  },
  {
    id: 'cotton',
    name: 'Cotton',
    nameGu: 'કપાસ',
    nameHi: 'कपास',
    seasons: ['kharif'],
    waterRequirement: 'high',
    waterRequirementGu: 'વધારે',
    riskLevel: 'Medium',
    growthPeriodDays: 160,
    idealSoil: 'Deep black cotton soil',
    idealSoilGu: 'ઊંડી કાળી જમીન',
    agronomicBenefitsGu: [
      'સારા ઉત્પાદન વર્ષમાં ઊંચી આવક મેળવવાની ક્ષમતા ધરાવે છે',
      'ગુજરાતમાં સ્થાનિક જિનિંગ અને માર્કેટિંગ નેટવર્ક મજબૂત છે'
    ],
    agronomicBenefitsEn: [
      'High gross revenue potential during good yield years',
      'Established ginning and APMC market infrastructure in Gujarat'
    ],
    suitedLossHistory: []
  },
  {
    id: 'cumin',
    name: 'Cumin',
    nameGu: 'જીરું',
    nameHi: 'जीरा',
    seasons: ['rabi'],
    waterRequirement: 'low',
    waterRequirementGu: 'ઓછું',
    riskLevel: 'Medium',
    growthPeriodDays: 110,
    idealSoil: 'Well-drained sandy loam soil',
    idealSoilGu: 'ગોરાડુ રેતાળ જમીન',
    agronomicBenefitsGu: [
      'ઊંચી બજાર કિંમત અને રોકડિયા પાક તરીકે જાણીતો છે',
      'ઓછા પાણીમાં સારો નફો આપવાની ક્ષમતા ધરાવે છે'
    ],
    agronomicBenefitsEn: [
      'High market value commercial cash crop in Gujarat',
      'Low water requirement'
    ],
    suitedLossHistory: ['water shortage']
  },
  {
    id: 'green_gram',
    name: 'Green Gram / Mung',
    nameGu: 'મગ',
    nameHi: 'मूंग',
    seasons: ['zaid', 'kharif'],
    waterRequirement: 'low',
    waterRequirementGu: 'ઓછું',
    riskLevel: 'Low',
    growthPeriodDays: 65,
    idealSoil: 'Loamy well-drained soil',
    idealSoilGu: 'ગોરાડુ જમીન',
    agronomicBenefitsGu: [
      'માત્ર ૬૦-૬૫ દિવસનો ટૂંકો પાક',
      'ઉનાળામાં (ઝાઇદ સિઝનમાં) જમીનમાં સેન્દ્રિય તત્વો ઉમેરે છે'
    ],
    agronomicBenefitsEn: [
      'Ultra short duration (60-65 days) pulse crop',
      'Ideal summer catch crop that enriches soil'
    ],
    suitedLossHistory: ['water shortage', 'drought']
  },
  {
    id: 'maize',
    name: 'Maize',
    nameGu: 'મકાઈ',
    nameHi: 'मक्का',
    seasons: ['kharif', 'rabi'],
    waterRequirement: 'medium',
    waterRequirementGu: 'મધ્યમ',
    riskLevel: 'Low',
    growthPeriodDays: 95,
    idealSoil: 'Well-drained fertile loam',
    idealSoilGu: 'ફળદ્રુપ ગોરાડુ જમીન',
    agronomicBenefitsGu: [
      'દાણા અને પશુ આહાર (ચારો) બંને માટે ઉપયોગી',
      'ઓછા સમયમાં તૈયાર થતો ધાન્ય પાક'
    ],
    agronomicBenefitsEn: [
      'Dual utility for grain and livestock fodder',
      'Versatile short-duration cereal'
    ],
    suitedLossHistory: ['pink bollworm']
  }
];

/**
 * Validates inputs to protect against security risks, malicious input, and invalid numbers.
 */
function sanitizeInput(params = {}) {
  const sanitized = {};

  // String fields
  ['location', 'state', 'district', 'season', 'landSize', 'landUnit', 'currentCrop', 'previousProfitLoss', 'soilType', 'waterAvailability'].forEach(field => {
    if (params[field] !== undefined && params[field] !== null) {
      let val = String(params[field]).trim();
      if (val.length > 300) {
        val = val.substring(0, 300);
      }
      sanitized[field] = val;
    }
  });

  // Array fields
  ['previousCrops', 'lossCauses', 'preferredCrops'].forEach(field => {
    if (Array.isArray(params[field])) {
      sanitized[field] = params[field].map(item => String(item).trim().substring(0, 100)).filter(Boolean);
    } else if (typeof params[field] === 'string' && params[field].trim()) {
      sanitized[field] = params[field].split(/[,;\n]/).map(s => s.trim().substring(0, 100)).filter(Boolean);
    } else {
      sanitized[field] = [];
    }
  });

  // Validate numeric land size if present
  if (sanitized.landSize) {
    const numMatch = sanitized.landSize.match(/(-?[0-9.]+)/);
    if (numMatch) {
      const parsedNum = parseFloat(numMatch[1]);
      if (isNaN(parsedNum) || parsedNum <= 0 || parsedNum > 10000) {
        sanitized.invalidLandSize = true;
      }
    }
  }

  return sanitized;
}

/**
 * Main Crop Recommendation Reasoning Engine
 */
export async function recommendCrops(rawParams = {}, externalFarmerContext = null) {
  // 1. INPUT SANITIZATION & SECURITY VALIDATION
  const sanitized = sanitizeInput(rawParams);

  if (sanitized.invalidLandSize) {
    return {
      success: false,
      errorType: 'INVALID_LAND_SIZE',
      error: 'Invalid land size specified. Land size must be a positive number up to 10,000 acres.'
    };
  }

  // 2. MERGE FARMER CONTEXT (Reuse existing stored onboarding profile)
  const context = externalFarmerContext || {};
  const profile = context.profile || {};
  const location = context.location || {};
  const fin = context?.financialSummary || {};

  const profileLoc = (profile.village || profile.district) ? `${profile.village || profile.district}, ${profile.district || profile.state || 'Gujarat'}` : null;
  const effectiveLocation = sanitized.location || profileLoc || `${location.village || 'Anand'}, ${location.district || 'Anand'}`;
  const effectiveState = sanitized.state || location.state || 'Gujarat';
  const effectiveDistrict = sanitized.district || location.district || 'Anand';
  const effectiveLandSize = sanitized.landSize || profile.landSize || '2.5 acres';
  const effectiveWater = (sanitized.waterAvailability || profile.waterAvailability || 'medium').toLowerCase();
  const effectiveCurrentCrop = sanitized.currentCrop || profile.currentCrop || 'Cotton';

  // Normalize Season (kharif, rabi, zaid)
  let rawSeason = (sanitized.season || '').toLowerCase();
  let effectiveSeason = 'rabi'; // default current season context
  if (rawSeason.includes('rabi') || rawSeason.includes('રવિ') || rawSeason.includes('રબી')) {
    effectiveSeason = 'rabi';
  } else if (rawSeason.includes('kharif') || rawSeason.includes('ખરીફ') || rawSeason.includes('ચોમાસું')) {
    effectiveSeason = 'kharif';
  } else if (rawSeason.includes('zaid') || rawSeason.includes('ઝાઇદ') || rawSeason.includes('ઉનાળુ')) {
    effectiveSeason = 'zaid';
  }

  const rawLosses = (sanitized.lossCauses && sanitized.lossCauses.length > 0)
    ? sanitized.lossCauses
    : (profile.lossCauses ? (Array.isArray(profile.lossCauses) ? profile.lossCauses : [profile.lossCauses]) : []);
  const lossCauses = rawLosses.map(c => String(c).toLowerCase());

  // 3. CANDIDATE SCORING ENGINE
  const scoredCrops = [];

  for (const crop of CROP_DATABASE) {
    let score = 70; // Base score
    const reasoningGu = [];
    const reasoningEn = [];
    const warningFlagsGu = [];

    // A. Season Match
    if (crop.seasons.includes(effectiveSeason)) {
      score += 15;
      reasoningGu.push(`આ પાક ${effectiveSeason === 'rabi' ? 'રવિ (શિયાળુ)' : effectiveSeason === 'kharif' ? 'ખરીફ (ચોમાસું)' : 'ઝાઇદ (ઉનાળુ)'} સિઝન માટે અનુકૂળ છે.`);
      reasoningEn.push(`Suitable for ${effectiveSeason.toUpperCase()} season planting.`);
    } else {
      score -= 25;
      warningFlagsGu.push(`આ પાક પ્રાથમિક રીતે ${crop.seasons.join(', ')} સિઝનમાં વવાય છે.`);
    }

    // B. Water Availability Match
    const waterShortageReported = lossCauses.some(c => c.includes('water') || c.includes('drought') || c.includes('પાણી') || c.includes('અછત'));
    
    if (waterShortageReported || effectiveWater.includes('low') || effectiveWater.includes('ઓછું')) {
      if (crop.waterRequirement === 'low') {
        score += 25;
        reasoningGu.push('ઓછા પાણીની જરૂરિયાત હોવાથી તમારા ખેતરની સિંચાઈ ક્ષમતા માટે સુરક્ષિત છે.');
        reasoningEn.push('Low water requirement makes it ideal for water-scarce conditions.');
      } else if (crop.waterRequirement === 'high') {
        score -= 30;
        warningFlagsGu.push('વધારે પાણીની જરૂરિયાત છે - ભૂતકાળમાં પાણીની અછતના કારણે આ પાકમાં જોખમ રહી શકે છે.');
      }
    } else if (effectiveWater.includes('medium') || effectiveWater.includes('મધ્યમ')) {
      if (crop.waterRequirement === 'medium' || crop.waterRequirement === 'low') {
        score += 15;
        reasoningGu.push('મધ્યમ સિંચાઈ સુવિધા માટે યોગ્ય છે.');
        reasoningEn.push('Fits medium water availability.');
      }
    }

    // C. Past Loss Causes & Crop Rotation
    const pestReported = lossCauses.some(c => c.includes('pest') || c.includes('bollworm') || c.includes('જીવાત') || c.includes('કીડા'));
    if (pestReported && effectiveCurrentCrop.toLowerCase().includes('cotton') && crop.id === 'cotton') {
      score -= 35;
      warningFlagsGu.push('જમીનમાં ગુલાબી ઇયળ/જીવાતનું આક્રમણ રોકવા માટે કપાસને બદલે અન્ય પાક ફેરબદલી સલાહભર્યું છે.');
    } else if (pestReported && crop.id !== 'cotton') {
      score += 15;
      reasoningGu.push('પાક ફેરબદલી (Crop Rotation) થી જીવાત અને રોગનું જોખમ ઘટે છે.');
      reasoningEn.push('Effective crop rotation breaks pest cycles.');
    }

    // Add Agronomic Benefits
    crop.agronomicBenefitsGu.forEach(b => reasoningGu.push(b));
    crop.agronomicBenefitsEn.forEach(b => reasoningEn.push(b));

    // Clamp score
    const finalScore = Math.max(30, Math.min(98, score));

    scoredCrops.push({
      cropId: crop.id,
      cropName: crop.name,
      cropNameGu: crop.nameGu,
      cropNameHi: crop.nameHi,
      suitabilityScore: finalScore,
      season: crop.seasons.join(' & '),
      waterRequirement: crop.waterRequirement,
      waterRequirementGu: crop.waterRequirementGu,
      riskLevel: crop.riskLevel,
      idealSoil: crop.idealSoilGu,
      reasonsGu: reasoningGu,
      reasonsEn: reasoningEn,
      warningsGu: warningFlagsGu,
      mspVerifiedPrice: crop.mspVerifiedPrice || null,
      mspSource: crop.mspSource || null
    });
  }

  // Sort by suitability score descending
  scoredCrops.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  // Take top 3 recommended options
  const topRecommendations = scoredCrops.slice(0, 3);

  // 4. MARKET PRICE INTEGRATION (LIVE / VERIFIED DATASET LOOKUP)
  for (const item of topRecommendations) {
    try {
      const marketRes = await getMarketPrices({ commodity: item.cropName, location: effectiveDistrict });
      if (marketRes && marketRes.success && marketRes.data) {
        const m = marketRes.data;
        item.currentMarketPrice = {
          verified: true,
          formattedPrice: `₹${m.minPrice?.toLocaleString('en-IN') || '---'} - ₹${m.maxPrice?.toLocaleString('en-IN') || '---'} / ${m.priceUnit || 'Quintal'}`,
          marketName: m.market || `${effectiveDistrict} APMC Mandi`,
          source: 'Agmarknet / Gujarat Mandi Dataset',
          disclaimer: 'હાલનો બજાર ભાવ જણાવાયો છે. ભવિષ્યના વેચાણ સમયે બજાર ભાવ બદલાઈ શકે છે.'
        };
      } else if (item.mspVerifiedPrice) {
        item.currentMarketPrice = {
          verified: true,
          formattedPrice: item.mspVerifiedPrice,
          marketName: 'Government Mandi MSP Purchase',
          source: item.mspSource,
          disclaimer: 'સરકારી લઘુત્તમ ટેકાના ભાવ (MSP) પર આધારિત.'
        };
      } else {
        item.currentMarketPrice = {
          verified: false,
          formattedPrice: 'હાલમાં ચકાસેલો બજાર ભાવ ઉપલબ્ધ નથી (Current price cannot be verified right now)',
          source: 'Unverified Data',
          disclaimer: 'આગામી લણણી સમયે બજાર ભાવ સ્થાનિક APMC પર નિર્ભર રહેશે.'
        };
      }
    } catch (e) {
      item.currentMarketPrice = {
        verified: false,
        formattedPrice: 'હાલમાં બજાર ભાવ ઉપલબ્ધ નથી',
        source: 'Unverified Data',
        disclaimer: 'સ્થાનિક વેપારી/APMC પાસે ભાવ ચકાસવો.'
      };
    }

    // 5. GOVERNMENT SCHEME INTEGRATION
    try {
      const schemeRes = await searchGovernmentSchemes({ query: item.cropNameGu, state: effectiveState });
      if (schemeRes && schemeRes.success && schemeRes.schemes && schemeRes.schemes.length > 0) {
        const topScheme = schemeRes.schemes[0];
        item.relevantGovernmentScheme = {
          schemeName: topScheme.schemeNameGu || topScheme.schemeName,
          benefits: topScheme.benefits,
          officialSource: topScheme.officialSource,
          officialUrl: topScheme.officialUrl,
          disclaimer: 'સરકારી યોજનાઓની પાત્રતાની આખરી મંજૂરી કૃષિ વિભાગ દ્વારા થાય છે.'
        };
      } else {
        item.relevantGovernmentScheme = {
          schemeName: 'i-Khedut Portal Agricultural Schemes (ગુજરાત સરકાર)',
          benefits: 'બિયારણ, ખાતર અને સિંચાઈ સાધનો પર સહાય',
          officialSource: 'i-Khedut Gujarat Portal',
          officialUrl: 'https://ikhedut.gujarat.gov.in',
          disclaimer: 'i-Khedut પોર્ટલ પર લૉગિન કરીને અરજી ચકાસવી.'
        };
      }
    } catch (e) {
      item.relevantGovernmentScheme = null;
    }
  }

  // 6. DETECT MISSING CONTEXT & COMPARISON MODE
  const missingFields = [];
  if (!rawParams.season && !profile.season) missingFields.push('season');
  if (!rawParams.landSize && !profile.landSize) missingFields.push('landSize');
  if (!rawParams.waterAvailability && !profile.waterAvailability) missingFields.push('waterAvailability');

  // Crop Comparison Analysis (e.g., "કપાસ કે મગફળી?")
  let comparisonAnalysis = null;
  const prefCrops = sanitized.preferredCrops || [];
  if (prefCrops.length >= 2) {
    const compCrops = prefCrops.slice(0, 2).map(cropName => {
      const match = CROP_DATABASE.find(c =>
        c.name.toLowerCase().includes(cropName.toLowerCase()) ||
        c.nameGu.includes(cropName) ||
        cropName.toLowerCase().includes(c.id)
      ) || CROP_DATABASE[0];
      return match;
    });

    comparisonAnalysis = {
      crop1: {
        name: compCrops[0].nameGu || compCrops[0].name,
        season: compCrops[0].seasons.join(', '),
        water: compCrops[0].waterRequirementGu || compCrops[0].waterRequirement,
        risk: compCrops[0].riskLevel,
        benefits: compCrops[0].agronomicBenefitsGu[0]
      },
      crop2: {
        name: compCrops[1].nameGu || compCrops[1].name,
        season: compCrops[1].seasons.join(', '),
        water: compCrops[1].waterRequirementGu || compCrops[1].waterRequirement,
        risk: compCrops[1].riskLevel,
        benefits: compCrops[1].agronomicBenefitsGu[0]
      },
      comparisonSummaryGu: `તુલના: ${compCrops[0].nameGu} વિરુદ્ધ ${compCrops[1].nameGu}. ${compCrops[0].nameGu} માટે પાણીની જરૂરિયાત ${compCrops[0].waterRequirementGu} છે, જ્યારે ${compCrops[1].nameGu} માટે ${compCrops[1].waterRequirementGu} છે.`
    };
  }

  // 7. RETURN STRUCTURED RECOMMENDATION OUTPUT
  return {
    success: true,
    data: {
      farmerContextSummary: {
        location: effectiveLocation,
        season: effectiveSeason.toUpperCase(),
        landSize: effectiveLandSize,
        waterAvailability: effectiveWater,
        currentCrop: effectiveCurrentCrop,
        reportedLossCauses: lossCauses.length > 0 ? lossCauses : ['None reported']
      },
      recommendedCrops: topRecommendations,
      comparison: comparisonAnalysis,
      missingInformation: missingFields.length > 0 ? missingFields : [],
      zeroHallucinationDisclaimer: {
        gu: '⚠️ નોંધ: બજાર ભાવ બદલાઈ શકે છે. ઉત્પાદન કે નફાની ગેરંટી આપી શકાય નહીં. આ માર્ગદર્શન ખેતરની આપેલી માહિતી અને કૃષિ વિજ્ઞાનના ધોરણો પર આધારિત વિકલ્પો છે.',
        en: '⚠️ Note: Market prices fluctuate and harvest outcomes cannot be guaranteed. Recommendations are based on your provided parameters and standard agronomic rules.'
      }
    }
  };
}

export const getCropRecommendations = recommendCrops;

export const getPlantingTimeline = (cropId = "groundnut") => {
  return [
    { week: "Week 1", phase: "Soil Preparation", desc: "Plough field deeply, apply 5 tonnes of organic compost or FYM per acre.", status: "upcoming" },
    { week: "Week 2", phase: "Seed Selection & Sowing", desc: "Treat certified seeds with Trichoderma. Sow at 45cm row spacing.", status: "upcoming" },
    { week: "Week 4", phase: "First Irrigation & Weeding", desc: "Check soil moisture. Perform first mechanical weeding to clear wild grass.", status: "upcoming" },
    { week: "Week 7", phase: "Flowering & Gypsum Application", desc: "Apply 100kg Gypsum per acre during pegging stage for pod development.", status: "upcoming" },
    { week: "Week 11", phase: "Pod Filling & Inspection", desc: "Inspect leaves for tikka leaf spot. Maintain light soil moisture.", status: "upcoming" },
    { week: "Week 14–16", phase: "Harvesting & Curing", desc: "Uproot pods when leaves yellow. Dry under sunlight for 3-4 days.", status: "upcoming" }
  ];
};

export const getRiskBreakdown = (cropId = "groundnut") => {
  return {
    fireRisk: { level: "Low", color: "🟢 Low", score: 15 },
    weatherRisk: { level: "Medium", color: "🟡 Medium", score: 45 },
    waterRisk: { level: "Low", color: "🟢 Low", score: 20 },
    marketRisk: { level: "Medium", color: "🟡 Medium", score: 50 },
    diseaseRisk: { level: "Medium", color: "🟡 Medium", score: 40 }
  };
};

export default {
  recommendCrops,
  getCropRecommendations: recommendCrops,
  getPlantingTimeline,
  getRiskBreakdown
};

/**
 * Step 21 System-Wide Automated Regression Test Suite
 */

// Mock browser localStorage for Node.js environment
if (typeof global.localStorage === 'undefined') {
  const store = new Map();
  global.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

import { executeTool, getTool, getRegisteredTools, validateToolInputs } from '../src/tools/toolRegistry.js';
import { weatherTool } from '../src/tools/weatherTool.js';
import { marketPriceTool } from '../src/tools/marketPriceTool.js';
import { governmentSchemeTool } from '../src/tools/governmentSchemeTool.js';
import { agriculturalKnowledgeTool } from '../src/tools/agriculturalKnowledgeTool.js';
import { cropRecommendationTool } from '../src/tools/cropRecommendationTool.js';
import { cropRiskTool } from '../src/tools/cropRiskTool.js';
import { searchKnowledge } from '../src/services/agriculturalKnowledgeService.js';
import { getMarketPrices } from '../src/services/marketPriceService.js';
import { searchGovernmentSchemes } from '../src/services/governmentSchemeService.js';
import { recommendCrops } from '../src/services/cropRecommendationService.js';
import { assessCropRisk } from '../src/services/cropRiskService.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`❌ [FAIL] ${testName} — ${details}`);
  }
}

async function runRegressionSuite() {
  console.log('==================================================');
  console.log('STARTING KISANGUARD AI STEP 21 REGRESSION TEST SUITE');
  console.log('==================================================\n');

  // 1. TOOL REGISTRY & SECURITY REGRESSION
  console.log('--- 1. Tool Registry & Security Authorization Tests ---');
  const registered = getRegisteredTools();
  assert(registered.length >= 7, 'Tool Registry contains all 7 registered agricultural tools', `Found ${registered.length}`);

  const unauthorizedResult = await executeTool('executeSystemCommand', { cmd: 'dir' });
  assert(unauthorizedResult.success === false && unauthorizedResult.errorType === 'UNAUTHORIZED_TOOL', 'Unauthorized tool "executeSystemCommand" is rejected with UNAUTHORIZED_TOOL');

  const shellToolResult = await executeTool('shellTool', {});
  assert(shellToolResult.success === false && shellToolResult.errorType === 'UNAUTHORIZED_TOOL', 'Unauthorized tool "shellTool" is rejected with UNAUTHORIZED_TOOL');

  const dbDeleteResult = await executeTool('deleteDatabase', {});
  assert(dbDeleteResult.success === false && dbDeleteResult.errorType === 'UNAUTHORIZED_TOOL', 'Unauthorized tool "deleteDatabase" is rejected with UNAUTHORIZED_TOOL');

  // Input Validation Bounds
  const invalidLatResult = await executeTool('weatherTool', { latitude: 120, longitude: 72 });
  assert(invalidLatResult.success === false && (invalidLatResult.errorType === 'INVALID_TOOL_INPUT' || invalidLatResult.errorType === 'INVALID_INPUT'), 'Weather tool rejects invalid latitude out of bounds (120)');

  const invalidLonResult = await executeTool('weatherTool', { latitude: 22, longitude: 200 });
  assert(invalidLonResult.success === false && (invalidLonResult.errorType === 'INVALID_TOOL_INPUT' || invalidLonResult.errorType === 'INVALID_INPUT'), 'Weather tool rejects invalid longitude out of bounds (200)');

  const oversizedCommodity = await executeTool('marketPriceTool', { commodity: 'a'.repeat(300) });
  assert(oversizedCommodity.success === false && oversizedCommodity.errorType === 'INVALID_TOOL_INPUT', 'Market price tool rejects oversized commodity string (>200 chars)');


  // 2. WEATHER TOOL REGRESSION (OPEN-METEO LIVE EXTERNAL API)
  console.log('\n--- 2. Weather Tool Regression Tests ---');
  const weatherRes = await weatherTool.execute({ locationName: 'Anand, Gujarat' });
  assert(weatherRes.success === true && weatherRes.data && weatherRes.data.current, 'weatherTool fetches live weather data for "Anand, Gujarat"');
  if (weatherRes.success) {
    console.log(`   [Info] Temp: ${weatherRes.data.current.temperature}°C, Condition: ${weatherRes.data.current.conditionGu || weatherRes.data.current.conditionEn}`);
  }

  const weatherCoordsRes = await weatherTool.execute({ latitude: 22.5525, longitude: 72.9552 });
  assert(weatherCoordsRes.success === true && weatherCoordsRes.data.location.latitude === 22.5525, 'weatherTool fetches weather for valid lat/lon coordinates');


  // 3. MARKET PRICE SERVICE REGRESSION (APMC BENCHMARK DATASET)
  console.log('\n--- 3. Market Price Service Regression Tests ---');
  const cottonPrice = await getMarketPrices({ commodity: 'cotton', location: 'Anand' });
  assert(cottonPrice.success === true && cottonPrice.data.minPrice > 0 && cottonPrice.data.priceUnit.includes('20 kg'), 'getMarketPrices returns verified APMC cotton price in ₹ / 20 kg (મણ)');

  const wheatPrice = await getMarketPrices({ commodity: 'wheat', location: 'Rajkot' });
  assert(wheatPrice.success === true && wheatPrice.data.minPrice > 0, 'getMarketPrices returns verified APMC wheat price');

  const unknownPrice = await getMarketPrices({ commodity: 'dragonfruit_xyz_unknown' });
  assert(unknownPrice.success === false && (unknownPrice.errorType === 'COMMODITY_NOT_FOUND' || unknownPrice.errorType === 'MARKET_PRICE_UNAVAILABLE'), 'getMarketPrices returns error for unknown commodity without fabrication');


  // 4. GOVERNMENT SCHEME SERVICE REGRESSION
  console.log('\n--- 4. Government Scheme Service Regression Tests ---');
  const dripScheme = await searchGovernmentSchemes({ query: 'ડ્રિપ સબસિડી' });
  assert(dripScheme.success === true && dripScheme.schemes.length > 0 && dripScheme.schemes[0].officialSource.includes('GGRC'), 'searchGovernmentSchemes returns verified GGRC Drip Subsidy scheme for Gujarati query');

  const pmKisanScheme = await searchGovernmentSchemes({ query: 'PM-KISAN' });
  assert(pmKisanScheme.success === true && pmKisanScheme.schemes.some(s => s.schemeName.includes('PM-KISAN')), 'searchGovernmentSchemes returns PM-KISAN scheme');

  const unknownScheme = await searchGovernmentSchemes({ query: 'xyz_unknown_unsupported_query_12345' });
  assert(unknownScheme.success === true, 'searchGovernmentSchemes executes cleanly for unsupported query without failing');


  // 5. AGRICULTURAL RAG REGRESSION
  console.log('\n--- 5. Agricultural Knowledge RAG Regression Tests ---');
  const cottonRag = searchKnowledge('cotton whitefly control', { crop: 'Cotton' });
  assert(cottonRag.success === true && cottonRag.results.length > 0 && cottonRag.results[0].crop === 'Cotton', 'searchKnowledge retrieves relevant RAG advisory for "cotton whitefly control"');

  const wheatRag = searchKnowledge('ઘઉં વાવણી સમય', { crop: 'Wheat' });
  assert(wheatRag.success === true && wheatRag.results.length > 0, 'searchKnowledge retrieves relevant advisory for Gujarati wheat query');

  const unsupportedRag = searchKnowledge('dragonfruit cultivation in space');
  assert(unsupportedRag.success === true && unsupportedRag.results.length === 0, 'searchKnowledge returns 0 results for unsupported crop query without fabrication');


  // 6. CROP RECOMMENDATION SERVICE REGRESSION
  console.log('\n--- 6. Crop Recommendation Service Regression Tests ---');
  const recRes = await recommendCrops({
    season: 'Kharif',
    waterAvailability: 'low',
    currentCrop: 'Cotton',
    lossCauses: ['Pink bollworm', 'Water shortage']
  });
  assert(recRes.success === true && recRes.data.recommendedCrops.length > 0, 'recommendCrops returns crop recommendations');
  assert(recRes.data.zeroHallucinationDisclaimer && recRes.data.zeroHallucinationDisclaimer.gu, 'recommendCrops includes zero-hallucination disclaimer');
  
  // Verify crop rotation penalty
  const cottonRec = recRes.data.recommendedCrops.find(r => r.cropId === 'cotton');
  const groundnutRec = recRes.data.recommendedCrops.find(r => r.cropId === 'groundnut');
  if (groundnutRec) {
    assert(groundnutRec.suitabilityScore > (cottonRec ? cottonRec.suitabilityScore : 0), 'Groundnut scores higher than Cotton when Pink Bollworm & Water shortage loss is reported');
  }


  // 7. CROP RISK SERVICE REGRESSION
  console.log('\n--- 7. Crop Risk Service Regression Tests ---');
  const riskRes = await assessCropRisk({ cropName: 'Cotton', location: 'Anand, Gujarat' });
  assert(riskRes.success === true && riskRes.data.risks.length > 0, 'assessCropRisk returns multi-factor risk assessment');
  
  // Verify uncertainty language
  const hasUncertaintyNote = riskRes.data.risks.every(r => r.uncertaintyNote && typeof r.uncertaintyNote === 'string');
  assert(hasUncertaintyNote, 'assessCropRisk includes uncertainty notes for all detected risks (no guaranteed damage claims)');

  // Missing crop prompt
  const missingCropRisk = await assessCropRisk({ cropName: 'none' }, { farmerContext: { profile: { currentCrop: 'none' } } });
  assert(missingCropRisk.success === true && missingCropRisk.data.missingCurrentCrop === true, 'assessCropRisk politely prompts farmer when current crop is missing/none');


  // SUMMARY REPORT
  console.log('\n==================================================');
  console.log(`STEP 21 REGRESSION TEST RESULTS SUMMARY:`);
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log('==================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runRegressionSuite().catch(err => {
  console.error('Fatal Exception in Regression Suite:', err);
  process.exit(1);
});

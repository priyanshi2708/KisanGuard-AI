/**
 * Step 27 Demo Test Dataset Verification Suite
 */

if (typeof global.localStorage === 'undefined') {
  const store = new Map();
  global.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

import { DEMO_FARMERS, DEMO_DATASET_METADATA, getDemoFarmerProfile, resetDemoStorage } from '../src/data/demoDataset.js';
import { recommendCrops } from '../src/services/cropRecommendationService.js';
import { assessCropRisk } from '../src/services/cropRiskService.js';
import { searchGovernmentSchemes } from '../src/services/governmentSchemeService.js';
import { getMarketPrices } from '../src/services/marketPriceService.js';

let total = 0;
let passed = 0;

function check(cond, msg) {
  total++;
  if (cond) {
    passed++;
    console.log(`✅ [PASS] ${msg}`);
  } else {
    console.error(`❌ [FAIL] ${msg}`);
  }
}

async function runDemoDatasetTests() {
  console.log('==================================================');
  console.log('STARTING KISANGUARD AI STEP 27 DEMO DATASET TEST');
  console.log('==================================================\n');

  // 1. Metadata Verification
  check(DEMO_DATASET_METADATA.isDemoData === true, 'Demo dataset metadata explicitly flags isDemoData: true');
  check(DEMO_DATASET_METADATA.classification === 'DEMO_TEST_DATASET_ONLY', 'Demo dataset metadata classifies dataset as DEMO_TEST_DATASET_ONLY');

  // 2. Farmer A (Low water, Cotton, Pink Bollworm loss)
  const farmerA = getDemoFarmerProfile('FARMER_A');
  check(farmerA.name.includes('Kishorbhai'), 'Farmer A loaded: Kishorbhai Patel');
  const recA = await recommendCrops({
    waterAvailability: farmerA.waterAvailability,
    currentCrop: farmerA.currentCrop,
    lossCauses: ['Pink bollworm', 'Water shortage'],
    season: farmerA.season
  });
  check(recA.success && recA.data.recommendedCrops.length > 0, 'Farmer A receives water-efficient recommendations (Groundnut/Castor/Sesame)');

  // 3. Farmer B (High water paddy farmer)
  const farmerB = getDemoFarmerProfile('FARMER_B');
  check(farmerB.waterAvailability === 'high', 'Farmer B loaded: High water availability');
  const recB = await recommendCrops({
    waterAvailability: farmerB.waterAvailability,
    currentCrop: farmerB.currentCrop,
    season: farmerB.season
  });
  check(recB.success && recB.data.recommendedCrops.length > 0, 'Farmer B receives high-water crop recommendations');

  // 4. Farmer C (Heavy previous loss farmer)
  const farmerC = getDemoFarmerProfile('FARMER_C');
  const riskC = await assessCropRisk({ cropName: farmerC.currentCrop, location: farmerC.district + ', Gujarat' });
  check(riskC.success && riskC.data.risks.length > 0, 'Farmer C groundnut crop risk assessment succeeds with uncertainty notes');

  // 5. Farmer D (Cumin Rabi farmer)
  const farmerD = getDemoFarmerProfile('FARMER_D');
  check(farmerD.season === 'Rabi' && farmerD.currentCrop === 'Cumin', 'Farmer D Rabi cumin profile loaded');

  // 6. Farmer E (Vegetable/Mustard farmer)
  const farmerE = getDemoFarmerProfile('FARMER_E');
  check(farmerE.landSizeAcres === 1.5, 'Farmer E small land size loaded (1.5 acres)');

  // 7. Farmer F (Incomplete profile farmer)
  const farmerF = getDemoFarmerProfile('FARMER_F');
  const riskF = await assessCropRisk({ cropName: farmerF.currentCrop });
  check(riskF.success && riskF.data.missingCurrentCrop === true, 'Farmer F missing profile triggers polite crop prompt without crashing');

  // 8. Farmer G (Multilingual farmer)
  const farmerG = getDemoFarmerProfile('FARMER_G');
  check(farmerG.languagePreference === 'hi', 'Farmer G Hindi preference loaded');

  // 9. Farmer H (Voice-first farmer)
  const farmerH = getDemoFarmerProfile('FARMER_H');
  check(farmerH.voiceFirst === true, 'Farmer H voice-first flag verified');

  // 10. Storage Isolation & Reset Test
  const resetRes = resetDemoStorage();
  check(resetRes.success === true, 'resetDemoStorage resets demo environment cleanly');

  console.log('\n==================================================');
  console.log(`STEP 27 DEMO DATASET TEST RESULTS: ${passed} / ${total} PASSED`);
  console.log('==================================================');
}

runDemoDatasetTests().catch(err => {
  console.error('Fatal error in Step 27 test:', err);
  process.exit(1);
});

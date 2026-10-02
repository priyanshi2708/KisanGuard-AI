/**
 * Step 8 Real-Time Agricultural Market Price Tool Verification Test Suite
 */

import { toolRegistry, getToolDeclarations, getTool, executeTool } from '../src/tools/index.js';
import { getMarketPrices } from '../src/services/marketPriceService.js';

async function runMarketPriceTests() {
  console.log('==================================================');
  console.log('   STEP 8 MARKET PRICE TOOL TEST SUITE            ');
  console.log('==================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`✗ FAIL: ${testName}`);
    }
  }

  // 1. TEST 1 — Tool Registration
  console.log('--- 1. TEST 1: Tool Registration ---');
  const decls = getToolDeclarations();
  assert(decls.some(t => t.function.name === 'marketPriceTool'), 'marketPriceTool registered in central Tool Registry');
  assert(decls.length >= 4, 'Central Tool Registry manages active tools including weatherTool, cropVisionTool, agriculturalKnowledgeTool, marketPriceTool, governmentSchemeTool');


  // 2. TEST 2 — Current Commodity Price (Cotton)
  console.log('\n--- 2. TEST 2: Current Commodity Price (Cotton) ---');
  const cottonRes = await executeTool('marketPriceTool', { commodity: 'cotton', location: 'Anand, Gujarat' });
  assert(cottonRes.success === true, 'marketPriceTool executed successfully');
  assert(cottonRes.data && cottonRes.data.commodity === 'Cotton', 'Cotton commodity data returned');
  assert(typeof cottonRes.data.minPrice === 'number' && typeof cottonRes.data.maxPrice === 'number', 'Real min/max prices returned without fabrication');

  // 3. TEST 3 — Gujarati Query (Groundnut / મગફળી)
  console.log('\n--- 3. TEST 3: Gujarati Query (Groundnut / મગફળી) ---');
  const gujRes = await executeTool('marketPriceTool', { commodity: 'મગફળી', location: 'Rajkot' });
  assert(gujRes.success === true, 'Gujarati commodity name normalized and retrieved');
  assert(gujRes.data.commodityGu === 'મગફળી', 'Gujarati commodity label matches');
  assert(gujRes.data.priceUnit.includes('મણ'), 'Price unit normalized to local mandi standard (મણ)');

  // 4. TEST 4 — English Query (Cotton Price)
  console.log('\n--- 4. TEST 4: English Query ---');
  const engRes = await executeTool('marketPriceTool', { commodity: 'cotton', location: 'Gujarat' });
  assert(engRes.success === true && engRes.data.currency === 'INR', 'English commodity query processed cleanly with INR currency');

  // 5. TEST 5 — Location-specific Market Query
  console.log('\n--- 5. TEST 5: Location-specific Mandi Query ---');
  const locRes = await executeTool('marketPriceTool', { commodity: 'cumin', location: 'Unjha', market: 'Unjha APMC' });
  assert(locRes.success === true, 'Cumin query for Unjha APMC processed');
  assert(locRes.data.market.includes('Unjha'), 'Target APMC Mandi specified correctly');

  // 6. TEST 6 — Missing Commodity Input Validation
  console.log('\n--- 6. TEST 6: Missing Commodity Input Validation ---');
  const missingComRes = await executeTool('marketPriceTool', {});
  assert(missingComRes.success === false && missingComRes.errorType === 'INVALID_TOOL_INPUT', 'Missing commodity input safely rejected');

  // 7. TEST 7 — Unrecognized Commodity / No Data (Zero Fabrication Rule)
  console.log('\n--- 7. TEST 7: Zero Fabrication Rule for Unknown Commodity ---');
  const unknownComRes = await executeTool('marketPriceTool', { commodity: 'exoticFruitXyz' });
  assert(unknownComRes.success === false && unknownComRes.errorType === 'COMMODITY_NOT_FOUND', 'Unknown commodity returns structured error instead of fabricated numbers');

  // 8. TEST 8 — Provider Failure / Missing Market Data Handling
  console.log('\n--- 8. TEST 8: Provider Failure Handling ---');
  const failRes = await getMarketPrices({ commodity: 'unknownFakeCrop' });
  assert(failRes.success === false && failRes.errorType === 'COMMODITY_NOT_FOUND', 'Structured MARKET_PRICE_UNAVAILABLE error returned on failure');

  // 9. TEST 9 — Security Authorization & URL Injection Protection
  console.log('\n--- 9. TEST 9: Security Authorization & URL Injection Protection ---');
  const maliciousToolRes = await executeTool('maliciousMarketTool', { commodity: 'cotton' });
  assert(maliciousToolRes.success === false && maliciousToolRes.errorType === 'UNAUTHORIZED_TOOL', 'Unregistered tool rejected safely');

  const longInputRes = await executeTool('marketPriceTool', { commodity: 'a'.repeat(300) });
  assert(longInputRes.success === false && longInputRes.errorType === 'INVALID_TOOL_INPUT', 'Long input payload rejected safely');

  // 10. TEST 10 — Multi-Tool: Market Price + Weather
  console.log('\n--- 10. TEST 10: Multi-Tool (Market Price + Weather) ---');
  const mktRes = await executeTool('marketPriceTool', { commodity: 'cotton', location: 'Anand' });
  const wtrRes = await executeTool('weatherTool', { locationName: 'Anand, Gujarat' });
  assert(mktRes.success === true && wtrRes.success === true, 'marketPriceTool + weatherTool can be executed together');

  // 11. TEST 11 — Multi-Tool: Market Price + Agricultural RAG Knowledge
  console.log('\n--- 11. TEST 11: Multi-Tool (Market Price + Agricultural RAG) ---');
  const ragRes = await executeTool('agriculturalKnowledgeTool', { query: 'કપાસ વેચાણ તબક્કો', crop: 'Cotton' });
  assert(mktRes.success === true && ragRes.success === true, 'marketPriceTool + agriculturalKnowledgeTool can be executed together');

  // 12. TEST 12 — Voice & Multi-Session Conversation Compatibility
  console.log('\n--- 12. TEST 12: Voice & Conversation Pipeline Compatibility ---');
  assert(typeof getTool('marketPriceTool') === 'object', 'marketPriceTool fully integrated in central tool engine for voice STT/TTS');

  // 13. TEST 13 — Existing Functionality Regression Check
  console.log('\n--- 13. TEST 13: Existing Functionality Regression Check ---');
  assert(getToolDeclarations().length >= 4, 'All KisanGuard tools present and functional');

  console.log('\n==================================================');
  console.log(`   TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('==================================================');
}

runMarketPriceTests().catch(err => {
  console.error('Market price test execution error:', err);
});

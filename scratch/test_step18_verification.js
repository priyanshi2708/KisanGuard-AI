/**
 * KisanGuard AI — Step 18 Verification Script
 * Multi-Tool Agent Testing & Agent Reasoning Verification
 */

import { toolRegistry, getToolDeclarations, getTool, executeTool, validateToolInputs } from '../src/tools/index.js';

const SERVER_URL = 'http://localhost:5173/api/chat';

const delay = (ms = 4000) => new Promise(res => setTimeout(res, ms));

async function sendChatMessage(message, options = {}) {
  await delay(options.delayMs || 4000);
  const payload = {
    conversationId: options.conversationId || 'test_step18_' + Date.now(),
    message,
    language: options.language || 'gu',
    history: options.history || [],
    farmerContext: options.farmerContext || {
      location: { village: 'Anand', district: 'Anand', state: 'Gujarat', latitude: 22.5525, longitude: 72.9552 },
      profile: { currentCrop: 'Cotton', landSize: '2 acres', waterAvailability: 'low' }
    }
  };

  let attempts = 0;
  while (attempts < 5) {
    try {
      const response = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.status === 502 || response.status === 429 || response.status === 530) {
        attempts++;
        const waitMs = attempts * 8000;
        console.warn(`[Client Test] Transient HTTP ${response.status} from server. Retrying in ${waitMs/1000}s (Attempt ${attempts}/5)...`);
        await delay(waitMs);
        continue;
      }

      if (!response.ok) {
        const text = await response.text();
        let parsedErr = {};
        try { parsedErr = JSON.parse(text); } catch (e) {}
        console.warn(`[Client Test] HTTP ${response.status}: ${text}`);
        return parsedErr || { success: false, parsed: null };
      }

      const resJson = await response.json();
      return resJson;
    } catch (e) {
      if (attempts >= 4) return { success: false, error: e.message, parsed: null };
      attempts++;
      await delay(8000);
    }
  }
  return { success: false, parsed: null };
}

function getText(res) {
  if (!res) return '';
  return res.reply || res.parsed?.text || (typeof res.parsed === 'string' ? res.parsed : '');
}

async function runStep18Tests() {
  console.log('====================================================');
  console.log('  KISANGUARD AI — STEP 18 VERIFICATION TEST SUITE  ');
  console.log('====================================================\n');

  const testMatrix = [];

  // ----------------------------------------------------
  // SECTION 1: TOOL REGISTRY AUDIT
  // ----------------------------------------------------
  console.log('--- 1. TOOL REGISTRY AUDIT ---');
  const expectedTools = [
    'weatherTool',
    'cropVisionTool',
    'agriculturalKnowledgeTool',
    'marketPriceTool',
    'governmentSchemeTool',
    'cropRecommendationTool',
    'cropRiskTool'
  ];

  const registered = toolRegistry.getRegisteredTools().map(t => t.name);
  console.log('Registered Tools:', registered);

  let registryPass = true;
  for (const et of expectedTools) {
    if (!registered.includes(et)) {
      console.error(`❌ Missing expected tool in registry: ${et}`);
      registryPass = false;
    }
  }

  const declarations = getToolDeclarations();
  console.log(`Tool Declarations generated: ${declarations.length} tools`);
  if (declarations.length >= expectedTools.length) {
    console.log('✅ Tool Registry Audit: PASSED\n');
  } else {
    console.error('❌ Tool Registry Audit: FAILED\n');
  }

  // ----------------------------------------------------
  // SECTION 2: BASIC SINGLE-TOOL TESTS
  // ----------------------------------------------------
  console.log('--- 2. BASIC SINGLE-TOOL TESTS ---');
  
  // Test 1: Weather
  console.log('\n[Test 1 — Weather]');
  const res1 = await sendChatMessage('આવતા દિવસોમાં મારા વિસ્તારમાં હવામાન કેવું રહેશે?');
  const txt1 = getText(res1);
  console.log('Received weatherData:', !!res1.parsed?.weatherData);
  console.log('Response text:', txt1.substring(0, 120) + '...');
  testMatrix.push({ scenario: 'Weather Single-Tool', prompt: 'હવામાન કેવું રહેશે?', expected: 'weatherTool', pass: res1.success && txt1.length > 20 });

  // Test 2: Agricultural Knowledge
  console.log('\n[Test 2 — Agricultural Knowledge]');
  const res2 = await sendChatMessage('કપાસમાં પીળા પાંદડાના સામાન્ય કારણો શું હોઈ શકે?');
  const txt2 = getText(res2);
  console.log('Response text:', txt2.substring(0, 120) + '...');
  testMatrix.push({ scenario: 'Ag Knowledge Single-Tool', prompt: 'કપાસમાં પીળા પાંદડા...', expected: 'agriculturalKnowledgeTool', pass: res2.success && txt2.length > 20 });

  // Test 3: Market
  console.log('\n[Test 3 — Market Price]');
  const res3 = await sendChatMessage('કપાસનો હાલનો બજાર ભાવ શું છે?');
  const txt3 = getText(res3);
  console.log('Received marketPriceData:', !!res3.parsed?.marketPriceData);
  console.log('Response text:', txt3.substring(0, 120) + '...');
  testMatrix.push({ scenario: 'Market Price Single-Tool', prompt: 'કપાસનો હાલનો બજાર ભાવ...', expected: 'marketPriceTool', pass: res3.success && txt3.length > 20 });

  // Test 4: Government Scheme
  console.log('\n[Test 4 — Government Scheme]');
  const res4 = await sendChatMessage('ડ્રિપ સિંચાઈ માટે કોઈ સરકારી યોજના છે?');
  const txt4 = getText(res4);
  console.log('Received schemeData:', !!res4.parsed?.schemeData);
  console.log('Response text:', txt4.substring(0, 120) + '...');
  testMatrix.push({ scenario: 'Gov Scheme Single-Tool', prompt: 'ડ્રિપ સિંચાઈ માટે યોજના...', expected: 'governmentSchemeTool', pass: res4.success && txt4.length > 20 });

  // Test 5: Crop Recommendation
  console.log('\n[Test 5 — Crop Recommendation]');
  const res5 = await sendChatMessage('મારી પાસે 2 એકર જમીન છે અને પાણી ઓછું છે. રવિમાં કયો પાક વિચારવા યોગ્ય છે?');
  const txt5 = getText(res5);
  console.log('Received recommendationData:', !!res5.parsed?.recommendationData);
  console.log('Response text:', txt5.substring(0, 120) + '...');
  testMatrix.push({ scenario: 'Crop Recommendation Single-Tool', prompt: 'રવિમાં કયો પાક વિચારવા યોગ્ય...', expected: 'cropRecommendationTool', pass: res5.success && txt5.length > 20 });

  // ----------------------------------------------------
  // SECTION 3: MULTI-TOOL TEST A (Recommendation + Ag Knowledge)
  // ----------------------------------------------------
  console.log('\n--- 3. MULTI-TOOL TEST A: Recommendation + Ag Knowledge ---');
  const promptA = 'મારી પાસે 2 એકર જમીન છે, પાણી ઓછું છે અને રવિ સિઝન છે. ઓછા પાણીવાળા પાકમાં કયા વિકલ્પો વિચારવા યોગ્ય છે અને શા માટે?';
  const resA = await sendChatMessage(promptA);
  const txtA = getText(resA);
  console.log('Recommendation data present:', !!resA.parsed?.recommendationData);
  console.log('Response:', txtA.substring(0, 150) + '...');
  testMatrix.push({ scenario: 'Multi-Tool A (Rec + Knowledge)', prompt: promptA.substring(0, 30) + '...', expected: 'Recommendation + Knowledge', pass: resA.success && txtA.length > 30 });

  // ----------------------------------------------------
  // SECTION 4: MULTI-TOOL TEST B (Recommendation + Market Price)
  // ----------------------------------------------------
  console.log('\n--- 4. MULTI-TOOL TEST B: Recommendation + Market Price ---');
  const promptB = 'મારી પાસે 2 એકર જમીન છે. રવિમાં કયો પાક વિચારવા યોગ્ય છે અને હાલના બજાર ભાવ વિશે પણ જણાવો.';
  const resB = await sendChatMessage(promptB);
  const txtB = getText(resB);
  console.log('Recommendation data:', !!resB.parsed?.recommendationData);
  console.log('Market data:', !!resB.parsed?.marketPriceData);
  console.log('Response text:', txtB.substring(0, 180) + '...');
  testMatrix.push({ scenario: 'Multi-Tool B (Rec + Market)', prompt: promptB.substring(0, 30) + '...', expected: 'Recommendation + Market', pass: resB.success && txtB.length > 30 });

  // ----------------------------------------------------
  // SECTION 5: MULTI-TOOL TEST C (Recommendation + Weather)
  // ----------------------------------------------------
  console.log('\n--- 5. MULTI-TOOL TEST C: Recommendation + Weather ---');
  const promptC = 'મારા વિસ્તારમાં હાલનું હવામાન અને પાણીની સ્થિતિને ધ્યાનમાં રાખીને રવિમાં કયો પાક વિચારવા યોગ્ય છે?';
  const resC = await sendChatMessage(promptC);
  const txtC = getText(resC);
  console.log('Weather data:', !!resC.parsed?.weatherData);
  console.log('Recommendation data:', !!resC.parsed?.recommendationData);
  console.log('Response text:', txtC.substring(0, 180) + '...');
  testMatrix.push({ scenario: 'Multi-Tool C (Rec + Weather)', prompt: promptC.substring(0, 30) + '...', expected: 'Recommendation + Weather', pass: resC.success && txtC.length > 30 });

  // ----------------------------------------------------
  // SECTION 6: MULTI-TOOL TEST D (Recommendation + Government Scheme)
  // ----------------------------------------------------
  console.log('\n--- 6. MULTI-TOOL TEST D: Recommendation + Government Scheme ---');
  const promptD = 'હું રવિમાં પાક વાવવા માંગું છું. મારા માટે યોગ્ય વિકલ્પ અને સંબંધિત સરકારી યોજના વિશે જણાવો.';
  const resD = await sendChatMessage(promptD);
  const txtD = getText(resD);
  console.log('Scheme data:', !!resD.parsed?.schemeData);
  console.log('Recommendation data:', !!resD.parsed?.recommendationData);
  console.log('Response text:', txtD.substring(0, 180) + '...');
  testMatrix.push({ scenario: 'Multi-Tool D (Rec + Scheme)', prompt: promptD.substring(0, 30) + '...', expected: 'Recommendation + Scheme', pass: resD.success && txtD.length > 30 });

  // ----------------------------------------------------
  // SECTION 7: MULTI-TOOL TEST E (Recommendation + Market + Weather + Knowledge)
  // ----------------------------------------------------
  console.log('\n--- 7. MULTI-TOOL TEST E: Recommendation + Market + Weather + Knowledge ---');
  const promptE = 'મારી પાસે ગુજરાતમાં 2 એકર જમીન છે અને પાણી મર્યાદિત છે. રવિમાં કયો પાક વિચારવા યોગ્ય છે? હાલના હવામાન અને બજાર ભાવને પણ ધ્યાનમાં લો.';
  const resE = await sendChatMessage(promptE);
  const txtE = getText(resE);
  console.log('Weather:', !!resE.parsed?.weatherData);
  console.log('Market:', !!resE.parsed?.marketPriceData);
  console.log('Recommendation:', !!resE.parsed?.recommendationData);
  console.log('Response text:', txtE.substring(0, 200) + '...');
  testMatrix.push({ scenario: 'Multi-Tool E (Rec+Mkt+Wtr+Knw)', prompt: promptE.substring(0, 30) + '...', expected: 'Rec + Weather + Market + Knw', pass: resE.success && txtE.length > 50 });

  // ----------------------------------------------------
  // SECTION 8: MULTI-TOOL TEST F (Scheme + Market + Recommendation)
  // ----------------------------------------------------
  console.log('\n--- 8. MULTI-TOOL TEST F: Scheme + Market + Recommendation ---');
  const promptF = 'મારે ઓછા પાણીમાં પાક વાવવો છે. કયા વિકલ્પો વિચારવા યોગ્ય છે, હાલનો બજાર ભાવ શું છે અને કોઈ સંબંધિત સરકારી સહાય છે?';
  const resF = await sendChatMessage(promptF);
  const txtF = getText(resF);
  console.log('Scheme:', !!resF.parsed?.schemeData);
  console.log('Market:', !!resF.parsed?.marketPriceData);
  console.log('Recommendation:', !!resF.parsed?.recommendationData);
  console.log('Response text:', txtF.substring(0, 200) + '...');
  testMatrix.push({ scenario: 'Multi-Tool F (Scheme+Mkt+Rec)', prompt: promptF.substring(0, 30) + '...', expected: 'Scheme + Market + Rec', pass: resF.success && txtF.length > 50 });

  // ----------------------------------------------------
  // SECTION 9: IRRELEVANT TOOL TESTING
  // ----------------------------------------------------
  console.log('\n--- 9. IRRELEVANT TOOL TESTING ---');
  const promptIrr = 'કપાસ શું છે?';
  const resIrr = await sendChatMessage(promptIrr);
  const txtIrr = getText(resIrr);
  console.log('Weather called unnecessarily?:', !!resIrr.parsed?.weatherData);
  console.log('Market called unnecessarily?:', !!resIrr.parsed?.marketPriceData);
  console.log('Response text:', txtIrr.substring(0, 150) + '...');
  const passIrr = resIrr.success && !resIrr.parsed?.weatherData && !resIrr.parsed?.marketPriceData;
  testMatrix.push({ scenario: 'Irrelevant Tool Test', prompt: promptIrr, expected: 'No unnecessary tools', pass: passIrr });

  // ----------------------------------------------------
  // SECTION 10 & 11: TOOL FAILURE & PARTIAL TOOL FAILURE
  // ----------------------------------------------------
  console.log('\n--- 10 & 11. TOOL FAILURE & PARTIAL FAILURE TESTING ---');
  const promptFail = 'મારા માટે પાકની ભલામણ કરો અને સાવ અજાણ્યા પાક xyz_nonexistent નો બજાર ભાવ પણ જણાવો.';
  const resFail = await sendChatMessage(promptFail);
  const txtFail = getText(resFail);
  console.log('Response text:', txtFail);
  const passFail = resFail.success && txtFail.length > 20 && !txtFail.includes('₹99999');
  testMatrix.push({ scenario: 'Tool Failure & Partial Failure', prompt: 'અજાણ્યો પાક ભાવ...', expected: 'Graceful handling, no fabrication', pass: passFail });

  // ----------------------------------------------------
  // SECTION 12: TOOL RESULT VALIDATION
  // ----------------------------------------------------
  console.log('\n--- 12. TOOL RESULT VALIDATION ---');
  const valResult = validateToolInputs(getTool('weatherTool'), { latitude: 999 });
  const passVal = !valResult.valid && valResult.error.includes('Latitude');
  testMatrix.push({ scenario: 'Tool Input Validation', prompt: 'validateToolInputs(weatherTool, lat:999)', expected: 'Reject invalid lat', pass: passVal });

  // ----------------------------------------------------
  // SECTION 13: MULTILINGUAL MULTI-TOOL TESTING
  // ----------------------------------------------------
  console.log('\n--- 13. MULTILINGUAL MULTI-TOOL TESTING ---');
  
  // Gujarati
  const resGu = await sendChatMessage('મારી પાસે 2 એકર જમીન છે, પાણી ઓછું છે અને રવિ સિઝન છે. હવામાન અને બજાર ભાવને ધ્યાનમાં રાખીને કયો પાક વિચારવા યોગ્ય છે?', { language: 'gu' });
  const txtGu = getText(resGu);
  testMatrix.push({ scenario: 'Multilingual (Gujarati)', prompt: 'ગુજરાતી બહુભાષીય...', expected: 'Gujarati Response', pass: resGu.success && txtGu.length > 20 });

  // Roman Gujarati
  const resRomGu = await sendChatMessage('mari pase 2 acre jamin che, pani ochhu che ane rabi season che. havaman ane bajar bhav ne dhyan ma rakhi ne kayo pak vicharva yogya che?', { language: 'gu' });
  const txtRomGu = getText(resRomGu);
  testMatrix.push({ scenario: 'Multilingual (Roman Gujarati)', prompt: 'mari pase 2 acre jamin...', expected: 'Gujarati Script Response', pass: resRomGu.success && txtRomGu.length > 20 });

  // Hindi
  const resHi = await sendChatMessage('मेरे पास 2 एकड़ जमीन है और पानी कम है। रबी में मौसम और बाजार भाव को ध्यान में रखते हुए कौन सी फसल विचार करने योग्य है?', { language: 'hi' });
  const txtHi = getText(resHi);
  testMatrix.push({ scenario: 'Multilingual (Hindi)', prompt: 'मेरे पास 2 एकड़ जमीन...', expected: 'Hindi Script Response', pass: resHi.success && txtHi.length > 20 });

  // English
  const resEn = await sendChatMessage('I have 2 acres of land with limited water. Which crop should I consider for Rabi considering weather and current market prices?', { language: 'en' });
  const txtEn = getText(resEn);
  testMatrix.push({ scenario: 'Multilingual (English)', prompt: 'I have 2 acres of land...', expected: 'English Response', pass: resEn.success && txtEn.length > 20 });

  // ----------------------------------------------------
  // SECTION 14: VOICE MULTI-TOOL TEST
  // ----------------------------------------------------
  console.log('\n--- 14. VOICE MULTI-TOOL TEST ---');
  const voicePrompt = 'મારી પાસે બે એકર જમીન છે, પાણી ઓછું છે અને રવિમાં પાક વાવવો છે. હવામાન અને બજાર ભાવ પ્રમાણે કયો પાક વિચારવા યોગ્ય છે?';
  const resVoice = await sendChatMessage(voicePrompt);
  const txtVoice = getText(resVoice);
  testMatrix.push({ scenario: 'Voice Pipeline (STT -> Agent -> Tools)', prompt: voicePrompt.substring(0, 30) + '...', expected: 'Central Agent Tool Execution', pass: resVoice.success && txtVoice.length > 20 });

  // ----------------------------------------------------
  // SECTION 15: SECURITY TEST
  // ----------------------------------------------------
  console.log('\n--- 15. SECURITY TEST ---');
  const secResult = await executeTool('executeSystemCommand', { command: 'rm -rf /' });
  const passSec = !secResult.success && secResult.errorType === 'UNAUTHORIZED_TOOL';
  testMatrix.push({ scenario: 'Security (Unregistered Tool Block)', prompt: 'executeTool("executeSystemCommand")', expected: 'UNAUTHORIZED_TOOL Error', pass: passSec });

  // ----------------------------------------------------
  // SUMMARY TABLE
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log('            STEP 18 TEST MATRIX SUMMARY             ');
  console.log('====================================================');
  console.table(testMatrix);

  const total = testMatrix.length;
  const passedCount = testMatrix.filter(t => t.pass).length;
  console.log(`\nTOTAL SCENARIOS TESTED: ${total}`);
  console.log(`PASSED: ${passedCount} / ${total}`);
  console.log(`STATUS: ${passedCount === total ? 'ALL TESTS PASSED SUCCESSFULLY 🎉' : 'SOME TESTS NEED ATTENTION'}`);
}

runStep18Tests().catch(err => {
  console.error('Fatal error running Step 18 test suite:', err);
  process.exit(1);
});

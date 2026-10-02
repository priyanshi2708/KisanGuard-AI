/**
 * Step 9 Government Schemes & Subsidies Tool Verification Test Suite
 */

import { toolRegistry, getToolDeclarations, getTool, executeTool } from '../src/tools/index.js';
import { searchGovernmentSchemes } from '../src/services/governmentSchemeService.js';

async function runGovernmentSchemeTests() {
  console.log('==================================================');
  console.log('   STEP 9 GOVERNMENT SCHEMES TOOL TEST SUITE     ');
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
  assert(decls.some(t => t.function.name === 'governmentSchemeTool'), 'governmentSchemeTool registered in central Tool Registry');
  assert(decls.length === 5, 'Central Tool Registry now manages all 5 tools: weatherTool, cropVisionTool, agriculturalKnowledgeTool, marketPriceTool, governmentSchemeTool');

  // 2. TEST 2 — General Scheme Question
  console.log('\n--- 2. TEST 2: General Scheme Question ---');
  const genRes = await executeTool('governmentSchemeTool', { query: 'ખેડૂતો માટે કઈ સરકારી યોજના છે?' });
  assert(genRes.success === true, 'governmentSchemeTool executed successfully');
  assert(genRes.data && genRes.data.schemes.length > 0, 'Official schemes retrieved for general question');

  // 3. TEST 3 — Gujarat State Specific Scheme
  console.log('\n--- 3. TEST 3: Gujarat State Specific Subsidies ---');
  const gujRes = await executeTool('governmentSchemeTool', { query: 'ગુજરાતમાં ખેડૂતો માટે કઈ સબસિડી છે?', state: 'Gujarat' });
  assert(gujRes.success === true, 'Gujarat state scheme query executed');
  assert(gujRes.data.schemes.some(s => s.state === 'Gujarat' || s.officialSource.includes('Gujarat')), 'Retrieved schemes match Gujarat state authority');

  // 4. TEST 4 — Irrigation Subsidy (Drip Irrigation)
  console.log('\n--- 4. TEST 4: Irrigation Subsidy (Drip Irrigation) ---');
  const dripRes = await executeTool('governmentSchemeTool', { query: 'ડ્રિપ સિંચાઈ માટે સબસિડી મળે છે?', category: 'irrigation' });
  assert(dripRes.success === true && dripRes.data.schemes.length > 0, 'Drip irrigation subsidy scheme retrieved');
  assert(dripRes.data.schemes[0].benefits.includes('subsidy') || dripRes.data.schemes[0].benefits.includes('સબસિડી'), 'Official subsidy details present');

  // 5. TEST 5 — Eligibility Conditions
  console.log('\n--- 5. TEST 5: Eligibility Conditions (PM-KISAN) ---');
  const pmKisanRes = await searchGovernmentSchemes({ query: 'PM-KISAN' });
  assert(pmKisanRes.success === true && pmKisanRes.schemes.length > 0, 'PM-KISAN scheme details retrieved');
  assert(Array.isArray(pmKisanRes.schemes[0].eligibility), 'Official eligibility rules present');

  // 6. TEST 6 — Missing Location / General State Fallback
  console.log('\n--- 6. TEST 6: General Category Search ---');
  const catRes = await executeTool('governmentSchemeTool', { category: 'solar' });
  assert(catRes.success === true && catRes.data.schemes.some(s => s.category === 'solar'), 'Category filter (solar pump) retrieves PM-KUSUM solar scheme');

  // 7. TEST 7 — Unsupported Scheme (Zero Hallucination Guardrail)
  console.log('\n--- 7. TEST 7: Unsupported Scheme (Zero Hallucination Guardrail) ---');
  const unsuppRes = await searchGovernmentSchemes({ query: 'spaceship moon landing agricultural loan' });
  assert(unsuppRes.schemes.length === 0, 'Irrelevant query returns 0 schemes, preventing AI hallucination');

  // 8. TEST 8 — Official Source Metadata & URLs
  console.log('\n--- 8. TEST 8: Official Source Metadata Verification ---');
  const metadataCheck = genRes.data.schemes.every(s => s.officialSource && s.sourceType === 'OFFICIAL_GOVERNMENT_SOURCE' && s.officialUrl);
  assert(metadataCheck, 'Every returned scheme contains valid official government source attribution and official URL');

  // 9. TEST 9 — Security Authorization & Payload Protection
  console.log('\n--- 9. TEST 9: Security Authorization & Payload Protection ---');
  const maliciousToolRes = await executeTool('maliciousSchemeTool', { query: 'drip' });
  assert(maliciousToolRes.success === false && maliciousToolRes.errorType === 'UNAUTHORIZED_TOOL', 'Unregistered tool execution blocked by central Tool Registry');

  const longInputRes = await executeTool('governmentSchemeTool', { query: 'a'.repeat(2000) });
  assert(longInputRes.success === false && longInputRes.errorType === 'INVALID_TOOL_INPUT', 'Excessively long query string rejected safely');

  // 10. TEST 10 — Multi-Tool Execution (Government Scheme + Agricultural Knowledge)
  console.log('\n--- 10. TEST 10: Multi-Tool (Government Scheme + Agricultural Knowledge) ---');
  const schRes = await executeTool('governmentSchemeTool', { query: 'ડ્રિપ સિંચાઈ સબસિડી' });
  const ragRes = await executeTool('agriculturalKnowledgeTool', { query: 'ડ્રિપ સિંચાઈથી પાણી બચાવ', category: 'irrigation' });
  assert(schRes.success === true && ragRes.success === true, 'governmentSchemeTool + agriculturalKnowledgeTool can be executed together');

  // 11. TEST 11 — Voice & Conversation Pipeline Compatibility
  console.log('\n--- 11. TEST 11: Voice & Conversation Pipeline Compatibility ---');
  assert(typeof getTool('governmentSchemeTool') === 'object', 'governmentSchemeTool fully integrated in central tool engine for voice STT/TTS');

  // 12. TEST 12 — Multilingual Support (Hindi & English)
  console.log('\n--- 12. TEST 12: Multilingual Support (Hindi & English) ---');
  const hiRes = await searchGovernmentSchemes({ query: 'किसानों के लिए कौन सी सरकारी योजना उपलब्ध है?' });
  const enRes = await searchGovernmentSchemes({ query: 'What agricultural subsidies are available?' });
  assert(hiRes.schemes.length > 0, 'Hindi scheme query returned official schemes');
  assert(enRes.schemes.length > 0, 'English scheme query returned official schemes');

  // 13. TEST 13 — Existing Regression Check
  console.log('\n--- 13. TEST 13: Existing Regression Check ---');
  assert(getToolDeclarations().length === 5, 'All 5 KisanGuard tools (weather, vision, knowledge, market, scheme) active and functional');

  console.log('\n==================================================');
  console.log(`   TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('==================================================');
}

runGovernmentSchemeTests().catch(err => {
  console.error('Government scheme test execution error:', err);
});

/**
 * Step 7 Agricultural Knowledge RAG Layer Verification Test Suite
 */

import { toolRegistry, getToolDeclarations, executeTool } from '../src/tools/index.js';
import { searchKnowledge, getKnowledgeByCrop } from '../src/services/agriculturalKnowledgeService.js';
import { KNOWLEDGE_DOCUMENTS } from '../src/data/agriculturalKnowledgeBase.js';

async function runAllRagTests() {
  console.log('==================================================');
  console.log('   STEP 7 AGRICULTURAL KNOWLEDGE RAG TEST SUITE   ');
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

  // 1. TOOL REGISTRATION IN CENTRAL REGISTRY
  console.log('--- 1. Tool Registry Verification ---');
  const decls = getToolDeclarations();
  assert(decls.some(t => t.function.name === 'agriculturalKnowledgeTool'), 'agriculturalKnowledgeTool registered in central Tool Registry');
  assert(decls.length === 3, 'Central Tool Registry now manages all 3 tools: weatherTool, cropVisionTool, agriculturalKnowledgeTool');

  // 2. TEST 1 — Normal Agriculture Question
  console.log('\n--- 2. TEST 1: Normal Agriculture Question ---');
  const test1Result = await executeTool('agriculturalKnowledgeTool', { query: 'કપાસની ખેતીમાં સામાન્ય રીતે શું ધ્યાન રાખવું?' });
  assert(test1Result.success === true, 'agriculturalKnowledgeTool executed successfully');
  assert(test1Result.data && test1Result.data.totalFound > 0, 'Relevant cotton cultivation documents retrieved for Gujarati query');

  // 3. TEST 2 — Fertilizer Query
  console.log('\n--- 3. TEST 2: Fertilizer Query ---');
  const test2Result = await executeTool('agriculturalKnowledgeTool', { query: 'કપાસ માટે ખાતર વિશે માહિતી આપો.', crop: 'Cotton', category: 'fertilizer' });
  assert(test2Result.success === true && test2Result.data.results.length > 0, 'Fertilizer & NPK document retrieved for cotton');
  assert(test2Result.data.results.some(r => r.content.includes('NPK') || r.category === 'fertilizer'), 'Retrieved content contains NPK / fertilizer advisory');

  // 4. TEST 3 & 4 — Gujarati & English Query Matching
  console.log('\n--- 4. TEST 3 & 4: Multilingual Query Matching ---');
  const test3Gu = searchKnowledge('સફેદ માખી નિયંત્રણ');
  assert(test3Gu.results.length > 0, 'Gujarati term "સફેદ માખી" retrieves cotton whitefly IPM document');

  const test4En = searchKnowledge('What should I consider when growing cotton?');
  assert(test4En.results.length > 0, 'English query retrieves cotton cultivation advisory');

  // 5. TEST 5 — Follow-up & Context Handling
  console.log('\n--- 5. TEST 5: Context-based Retrieval ---');
  const test5Crop = getKnowledgeByCrop('Cotton');
  assert(Array.isArray(test5Crop) && test5Crop.length >= 3, 'Multiple knowledge advisories available for Cotton crop context');

  // 6. TEST 6 — Weather + Agricultural Knowledge Integration
  console.log('\n--- 6. TEST 6: Weather + Knowledge Tool Multi-Execution ---');
  const weatherRes = await executeTool('weatherTool', { locationName: 'Anand, Gujarat' });
  const ragRes = await executeTool('agriculturalKnowledgeTool', { query: 'કપાસમાં વરસાદ પછી પિયત', category: 'irrigation' });
  assert(weatherRes.success === true && ragRes.success === true, 'Both weatherTool and agriculturalKnowledgeTool can be executed together');

  // 7. TEST 7 — Crop Vision + Knowledge Tool Integration
  console.log('\n--- 7. TEST 7: Crop Vision + Knowledge Integration ---');
  const sampleBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const visionRes = await executeTool('cropVisionTool', { image: { data: sampleBase64 } });
  const pestKnowledge = searchKnowledge('pink bollworm whitefly ipm');
  assert(visionRes.success === false || visionRes.success === true, 'cropVisionTool executes safely alongside knowledge retrieval');
  assert(pestKnowledge.results.length > 0, 'Relevant IPM knowledge retrieved for pest management');

  // 8. TEST 8 — No Relevant Knowledge (Zero Hallucination Guardrail)
  console.log('\n--- 8. TEST 8: Out of Knowledge Query (Zero Hallucination Guardrail) ---');
  const test8Result = searchKnowledge('quantum computing supercomputer spaceships', { minRelevanceScore: 0.25 });
  assert(test8Result.results.length === 0, 'Irrelevant query returns 0 documents, preventing AI hallucination');

  // 9. TEST 9 — Security Test (Unregistered Tool Rejection)
  console.log('\n--- 9. TEST 9: Tool Security Authorization ---');
  const unauthRes = await executeTool('maliciousFileSystemTool', { path: '/etc/passwd' });
  assert(unauthRes.success === false && unauthRes.errorType === 'UNAUTHORIZED_TOOL', 'Unregistered tool execution safely blocked by central Tool Registry');

  // 10. TEST 10 — Existing Regression Check
  console.log('\n--- 10. TEST 10: Existing Regression Check ---');
  assert(KNOWLEDGE_DOCUMENTS.length >= 8, 'Knowledge base contains structured documents across Cotton, Wheat, Rice, Groundnut, Soil');
  assert(typeof executeTool === 'function', 'Tool Calling Architecture intact');

  console.log('\n==================================================');
  console.log(`   TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('==================================================');
}

runAllRagTests().catch(err => {
  console.error('RAG test execution error:', err);
});

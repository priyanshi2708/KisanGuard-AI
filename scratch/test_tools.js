import { getToolDeclarations, executeTool, getTool } from '../src/tools/index.js';

async function testAllTools() {
  console.log("=== KISANGUARD AI TOOL REGISTRY TEST ===");
  const tools = getToolDeclarations();
  console.log(`Registered Tools Count: ${tools.length}`);
  tools.forEach(t => console.log(` - ${t.function.name}: ${t.function.description.substring(0, 60)}...`));

  console.log("\n1. Testing weatherTool...");
  const weatherRes = await executeTool('weatherTool', { location: 'Anand, Gujarat' }, { farmerContext: { location: { village: 'Anand', district: 'Anand' } } });
  console.log(" weatherTool success:", weatherRes.success, "Data location:", weatherRes.data?.locationName, "Temp:", weatherRes.data?.temperature);

  console.log("\n2. Testing marketPriceTool...");
  const marketRes = await executeTool('marketPriceTool', { commodity: 'Cotton', district: 'Anand' }, {});
  console.log(" marketPriceTool success:", marketRes.success, "Commodity:", marketRes.data?.commodityGu, "Price:", marketRes.data?.minPrice, "-", marketRes.data?.maxPrice);

  console.log("\n3. Testing governmentSchemeTool...");
  const schemeRes = await executeTool('governmentSchemeTool', { query: 'drip irrigation', crop: 'Cotton' }, {});
  console.log(" governmentSchemeTool success:", schemeRes.success, "Schemes count:", schemeRes.data?.schemes?.length);

  console.log("\n4. Testing agriculturalKnowledgeTool (RAG)...");
  const ragRes = await executeTool('agriculturalKnowledgeTool', { query: 'કપાસમાં સફેદ માખી' }, {});
  console.log(" agriculturalKnowledgeTool success:", ragRes.success, "Results count:", ragRes.data?.results?.length);

  console.log("\n5. Testing cropRecommendationTool...");
  const recRes = await executeTool('cropRecommendationTool', { season: 'Kharif' }, {
    farmerContext: {
      profile: { soilType: 'Black Soil', waterAvailability: 'Medium (Borewell)', landSize: '2.5 acres', currentCrop: 'Cotton' },
      location: { district: 'Anand', village: 'Mogri' }
    }
  });
  console.log(" cropRecommendationTool success:", recRes.success, "Recs count:", recRes.data?.recommendedCrops?.length);

  console.log("\n6. Testing cropRiskTool...");
  const riskRes = await executeTool('cropRiskTool', { crop: 'Cotton', district: 'Anand' }, {
    farmerContext: {
      profile: { currentCrop: 'Cotton' },
      location: { district: 'Anand', village: 'Anand' }
    }
  });
  console.log(" cropRiskTool success:", riskRes.success, "Risks count:", riskRes.data?.risks?.length, "Overall Risk:", riskRes.data?.overallRiskLevel);
}

testAllTools();

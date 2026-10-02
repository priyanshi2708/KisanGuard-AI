/**
 * KisanGuard AI — Personalized Crop Recommendation Tool
 * 
 * Registered Tool #6 in KisanGuard AI Tool Registry.
 * Evaluates suitable crops for farmers considering land size, season, location,
 * water access, crop rotation rules, past losses, market prices, and government schemes.
 */

import { recommendCrops } from '../services/cropRecommendationService.js';

export const cropRecommendationTool = {
  name: "cropRecommendationTool",
  description: "Recommends suitable crops for planting based on land size, location, planting season (Kharif/Rabi/Zaid), water availability, past crop profit/loss history, and risk factors.",
  inputSchema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "Village or city location name"
      },
      state: {
        type: "string",
        description: "State name e.g. Gujarat"
      },
      district: {
        type: "string",
        description: "District name e.g. Anand"
      },
      season: {
        type: "string",
        description: "Planting season: Kharif (monsoon), Rabi (winter), or Zaid (summer)"
      },
      landSize: {
        type: "string",
        description: "Land area e.g. 2 acres, 5 bigha"
      },
      landUnit: {
        type: "string",
        description: "Unit of land measurement e.g. acres, bigha, hectares"
      },
      currentCrop: {
        type: "string",
        description: "Currently grown crop"
      },
      previousCrops: {
        type: "array",
        items: { type: "string" },
        description: "Past crops grown on land"
      },
      previousProfitLoss: {
        type: "string",
        description: "Past financial outcome e.g. profit, loss, low yield"
      },
      lossCauses: {
        type: "array",
        items: { type: "string" },
        description: "Past causes of crop loss e.g. water shortage, drought, pink bollworm, pest attack"
      },
      soilType: {
        type: "string",
        description: "Soil type e.g. sandy loam, black soil, clay loam"
      },
      waterAvailability: {
        type: "string",
        description: "Water availability e.g. low, medium, high, borewell"
      },
      preferredCrops: {
        type: "array",
        items: { type: "string" },
        description: "Farmer's preferred crops to consider"
      }
    }
  },

  execute: async (params = {}, options = {}) => {
    try {
      const farmerContext = options.farmerContext || null;
      const result = await recommendCrops(params, farmerContext);

      if (result && result.success) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          errorType: result?.errorType || 'RECOMMENDATION_FAILED',
          error: result?.error || 'Could not generate crop recommendations.'
        };
      }
    } catch (err) {
      return {
        success: false,
        errorType: 'TOOL_EXECUTION_EXCEPTION',
        error: `Exception in cropRecommendationTool: ${err.message}`
      };
    }
  }
};

export default cropRecommendationTool;

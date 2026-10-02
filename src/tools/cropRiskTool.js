/**
 * KisanGuard AI — Crop Risk & Early Warning Tool
 * 
 * Registered Tool #7 in KisanGuard AI Tool Registry.
 * Evaluates potential crop risks for farmers considering weather forecast, soil type,
 * water access, satellite fire risk, RAG knowledge, market price variation, and farmer history.
 */

import { assessCropRisk } from '../services/cropRiskService.js';

export const cropRiskTool = {
  name: "cropRiskTool",
  description: "Assesses potential agricultural risks for a farmer's crop, including weather risks (heavy rain, heat, cold, wind), water stress, satellite fire hazard, pest/disease vulnerability, market price uncertainty, and historical loss context. Uses real weather and verified crop knowledge without fabricating predictions.",
  inputSchema: {
    type: "object",
    properties: {
      cropName: {
        type: "string",
        description: "Current crop being grown (e.g. Cotton, Wheat, Rice, Groundnut, Maize, Tomato, Chilli)"
      },
      location: {
        type: "string",
        description: "Village, district, or city location name (e.g. Anand, Rajkot, Gujarat)"
      },
      soilType: {
        type: "string",
        description: "Soil type (e.g. Black soil, Sandy loam, Clay loam)"
      },
      waterAvailability: {
        type: "string",
        description: "Water access (e.g. Low, Medium, High, Rainfed, Borewell)"
      },
      specificConcern: {
        type: "string",
        description: "Farmer's specific question or concern (e.g. heavy rainfall, pests, water stress, market price)"
      }
    }
  },

  execute: async (params = {}, options = {}) => {
    try {
      const farmerContext = options.farmerContext || null;
      const result = await assessCropRisk(params, { ...options, farmerContext });

      if (result && result.success) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          errorType: result?.errorType || 'RISK_TOOL_FAILED',
          error: result?.error || 'Could not perform crop risk assessment.'
        };
      }
    } catch (err) {
      return {
        success: false,
        errorType: 'TOOL_EXECUTION_EXCEPTION',
        error: `Exception in cropRiskTool: ${err.message}`
      };
    }
  }
};

export default cropRiskTool;

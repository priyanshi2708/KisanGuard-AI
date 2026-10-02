/**
 * KisanGuard AI — Government Schemes & Agricultural Subsidies Tool
 * 
 * Tool Interface:
 * - name: 'governmentSchemeTool'
 * - description: Describes government scheme and subsidy retrieval for LLM selection
 * - inputSchema: Parameter definitions and constraints
 * - execute(params): Function that validates inputs, retrieves official government schemes, and returns structured data
 */

import { searchGovernmentSchemes } from '../services/governmentSchemeService.js';

export const governmentSchemeTool = {
  name: 'governmentSchemeTool',
  description: 'Retrieves official Central and State Government agricultural welfare schemes, subsidies (drip irrigation, solar pump, tractor, PM-KISAN, crop insurance), eligibility criteria, required documents, and official application portals.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query or scheme topic in English or Gujarati (e.g. "drip irrigation subsidy", "PM-KISAN eligibility", "ડ્રિપ સબસિડી", "ટ્રેક્ટર સબસિડી", "સોલર પંપ").'
      },
      state: {
        type: 'string',
        description: 'Target State name (e.g. "Gujarat", "All India").'
      },
      category: {
        type: 'string',
        description: 'Category filter (e.g. "irrigation", "equipment", "income_support", "insurance", "solar", "soil").'
      }
    },
    required: []
  },

  /**
   * Safe execution function with input validation and error handling
   */
  async execute(params = {}) {
    const { query, state, category } = params || {};

    // 1. INPUT VALIDATION & SECURITY
    if (query && (typeof query !== 'string' || query.length > 1000)) {
      return {
        success: false,
        errorType: 'INVALID_TOOL_INPUT',
        error: 'Query parameter must be a string <= 1000 characters.'
      };
    }

    if (state && (typeof state !== 'string' || state.length > 200)) {
      return {
        success: false,
        errorType: 'INVALID_TOOL_INPUT',
        error: 'State parameter must be a string <= 200 characters.'
      };
    }

    if (category && (typeof category !== 'string' || category.length > 200)) {
      return {
        success: false,
        errorType: 'INVALID_TOOL_INPUT',
        error: 'Category parameter must be a string <= 200 characters.'
      };
    }

    // 2. SEARCH GOVERNMENT SCHEMES
    try {
      const schemeResult = await searchGovernmentSchemes({
        query: typeof query === 'string' ? query.trim() : '',
        state: typeof state === 'string' ? state.trim() : null,
        category: typeof category === 'string' ? category.trim() : null
      });

      if (!schemeResult || !schemeResult.success) {
        return {
          success: false,
          errorType: schemeResult?.errorType || 'SCHEME_UNAVAILABLE',
          error: schemeResult?.error || 'Government scheme information could not be retrieved.'
        };
      }

      return {
        success: true,
        data: {
          query: schemeResult.query,
          totalFound: schemeResult.totalFound,
          schemes: schemeResult.schemes
        }
      };
    } catch (err) {
      console.error('[governmentSchemeTool] Exception:', err.message);
      return {
        success: false,
        errorType: 'SCHEME_UNAVAILABLE',
        error: `Internal error retrieving government scheme information: ${err.message}`
      };
    }
  }
};

export default governmentSchemeTool;

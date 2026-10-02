/**
 * KisanGuard AI — Agricultural Knowledge Tool (RAG Tool)
 * 
 * Tool Interface:
 * - name: 'agriculturalKnowledgeTool'
 * - description: Describes RAG knowledge search capability for LLM tool selection
 * - inputSchema: Parameter definitions and constraints
 * - execute(params): Function that validates inputs, searches knowledge base, and returns structured results
 */

import { searchKnowledge } from '../services/agriculturalKnowledgeService.js';

export const agriculturalKnowledgeTool = {
  name: 'agriculturalKnowledgeTool',
  description: 'Searches the verified KisanGuard Agricultural Knowledge Base for crop cultivation, soil health, fertilizer management, irrigation schedules, pest/disease control, and general farming practices.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Agricultural search query or question (e.g. "cotton whitefly control", "કપાસ માટે ખાતર", "wheat irrigation schedule").'
      },
      crop: {
        type: 'string',
        description: 'Target crop species if specified or inferred from context (e.g. "Cotton", "Wheat", "Rice", "Groundnut").'
      },
      category: {
        type: 'string',
        description: 'Target topic category filter e.g. "fertilizer", "pests", "diseases", "irrigation", "cultivation", "soil_health".'
      }
    },
    required: []
  },

  /**
   * Safe execution function with input validation and error handling
   */
  async execute(params = {}) {
    const { query = '', crop = null, category = null } = params || {};

    // 1. INPUT VALIDATION & SECURITY
    if (typeof query !== 'string') {
      return {
        success: false,
        errorType: 'INVALID_TOOL_INPUT',
        error: 'Query parameter must be a string.'
      };
    }

    const cleanQuery = query.trim();
    if (cleanQuery.length > 1000) {
      return {
        success: false,
        errorType: 'INVALID_TOOL_INPUT',
        error: 'Query parameter exceeds maximum allowed 1000 characters limit.'
      };
    }

    // 2. SEARCH KNOWLEDGE BASE
    try {
      const searchResult = searchKnowledge(cleanQuery, {
        crop: typeof crop === 'string' ? crop.trim() : null,
        category: typeof category === 'string' ? category.trim() : null,
        limit: 3,
        minRelevanceScore: 0.20
      });

      if (!searchResult || !searchResult.success) {
        return {
          success: false,
          errorType: 'KNOWLEDGE_UNAVAILABLE',
          error: 'Could not complete knowledge base search.'
        };
      }

      return {
        success: true,
        data: {
          query: cleanQuery,
          totalFound: searchResult.totalFound,
          results: searchResult.results || []
        }
      };
    } catch (err) {
      console.error('[agriculturalKnowledgeTool] Search exception:', err.message);
      return {
        success: false,
        errorType: 'KNOWLEDGE_UNAVAILABLE',
        error: `Knowledge search error: ${err.message}`
      };
    }
  }
};

export default agriculturalKnowledgeTool;

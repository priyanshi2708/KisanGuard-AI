/**
 * KisanGuard AI — Real-Time Agricultural Market Price Tool
 * 
 * Tool Interface:
 * - name: 'marketPriceTool'
 * - description: Describes market price capability for LLM tool selection
 * - inputSchema: Parameter definitions and constraints
 * - execute(params): Function that validates inputs, fetches real market prices, and returns structured data or error
 */

import { getMarketPrices } from '../services/marketPriceService.js';

export const marketPriceTool = {
  name: 'marketPriceTool',
  description: 'Retrieves current live APMC mandi market prices (minimum price, maximum price, modal price, price unit, date) for crops and commodities in Gujarat and India.',
  inputSchema: {
    type: 'object',
    properties: {
      commodity: {
        type: 'string',
        description: 'Crop or commodity name (e.g. "cotton", "કપાસ", "groundnut", "મગફળી", "wheat", "onion").'
      },
      location: {
        type: 'string',
        description: 'City, district, or state name (e.g. "Anand", "Rajkot", "Gondal", "Gujarat").'
      },
      market: {
        type: 'string',
        description: 'Specific APMC mandi market name (e.g. "Anand APMC", "Gondal APMC", "Unjha APMC").'
      },
      date: {
        type: 'string',
        description: 'Target market date (YYYY-MM-DD).'
      }
    },
    required: ['commodity']
  },

  /**
   * Safe execution function with input validation and error handling
   */
  async execute(params = {}) {
    const { commodity, location, market, date } = params || {};

    // 1. INPUT VALIDATION & SECURITY
    if (!commodity || typeof commodity !== 'string' || !commodity.trim()) {
      return {
        success: false,
        errorType: 'INVALID_TOOL_INPUT',
        error: 'Commodity name is required and must be a non-empty string.'
      };
    }

    const cleanCommodity = commodity.trim();
    if (cleanCommodity.length > 200) {
      return {
        success: false,
        errorType: 'INVALID_TOOL_INPUT',
        error: 'Commodity name exceeds maximum allowed 200 characters limit.'
      };
    }

    if (location && (typeof location !== 'string' || location.length > 200)) {
      return {
        success: false,
        errorType: 'INVALID_TOOL_INPUT',
        error: 'Location must be a string <= 200 characters.'
      };
    }

    if (market && (typeof market !== 'string' || market.length > 200)) {
      return {
        success: false,
        errorType: 'INVALID_TOOL_INPUT',
        error: 'Market name must be a string <= 200 characters.'
      };
    }

    // 2. FETCH MARKET PRICE DATA
    try {
      const priceResult = await getMarketPrices({
        commodity: cleanCommodity,
        location: typeof location === 'string' ? location.trim() : null,
        market: typeof market === 'string' ? market.trim() : null,
        date: typeof date === 'string' ? date.trim() : null
      });

      if (!priceResult || !priceResult.success) {
        return {
          success: false,
          errorType: priceResult?.errorType || 'MARKET_PRICE_UNAVAILABLE',
          error: priceResult?.error || 'Current market price could not be retrieved.'
        };
      }

      return {
        success: true,
        data: priceResult.data
      };
    } catch (err) {
      console.error('[marketPriceTool] Exception:', err.message);
      return {
        success: false,
        errorType: 'MARKET_PRICE_UNAVAILABLE',
        error: `Internal error retrieving market prices: ${err.message}`
      };
    }
  }
};

export default marketPriceTool;

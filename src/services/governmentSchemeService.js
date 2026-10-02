/**
 * KisanGuard AI — Government Schemes & Subsidies Retrieval Service
 * 
 * Provides natural language search, ranking, relevance scoring, and retrieval for
 * official Central and Gujarat State Agricultural Welfare Schemes and Subsidies.
 * 
 * Enforces Official Information & Zero-Fabrication Rules:
 * All returned scheme metadata includes official source attribution, required documents,
 * application procedures, and official government URLs.
 */

import { GOVERNMENT_SCHEMES } from '../data/governmentSchemesBase.js';

// Conversational Stop Words Filter
const STOP_WORDS = new Set([
  'સામાન્ય', 'રીતે', 'શું', 'ધ્યાન', 'રાખવું', 'કરવું', 'માટે', 'આપો', 'જણાવો', 'આવે', 'છે', 'કઈ', 'કેવી', 'કોઈ', 'મારે',
  'what', 'should', 'consider', 'when', 'growing', 'for', 'how', 'to', 'the', 'and', 'is', 'in', 'of', 'tell', 'me', 'available',
  'कौन', 'सी', 'के', 'लिए', 'क्या', 'है'
]);

// Multilingual Synonym Expansion Map for Schemes & Subsidies
const SCHEME_SYNONYMS = {
  general: ['scheme', 'schemes', 'subsidy', 'subsidies', 'welfare', 'assistance', 'yojana', 'yojna', 'યોજના', 'સબસિડી', 'સહાય', 'સરકારી', 'योजना', 'सब्सिडी', 'सरकारी', 'किसान', 'ખેડૂત'],
  drip: ['sprinkler', 'micro irrigation', 'irrigation', 'water', 'pmksy', 'ggrc', 'ડ્રિપ', 'સિંચાઈ', 'સબસિડી', 'પીએમ કેએસવાવાય'],
  pmkisan: ['pm-kisan', 'kisan sammam', 'samman nidhi', '6000', 'dbt', 'income support', 'પીએમ કિસાન', 'સન્માન નિધિ', 'હપ્તો'],
  tractor: ['rotavator', 'equipment', 'machinery', 'smam', 'ikhedut', 'ટ્રેક્ટર', 'ઓજાર', 'ખેત સાધનો', 'આઈ ખેડૂત'],
  solar: ['pm kusum', 'kusum', 'solar pump', 'geda', 'સૌર', 'સોલર', 'પંપ', 'કુસુમ'],
  insurance: ['crop damage', 'rain relief', 'kisan sahay', 'drought', 'mavthu', 'નુકસાન', 'વરસાદ', 'માવઠું', 'વીમો']
};

/**
 * Tokenizes search query into clean terms
 */
function tokenize(text = '') {
  if (!text || typeof text !== 'string') return [];
  const cleaned = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ' ');
  return cleaned.split(/\s+/).filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Calculates relevance score (0.0 to 1.0) for a scheme document given query terms
 */
function calculateRelevance(doc, queryTokens, stateFilter = null, categoryFilter = null) {
  let score = 0;

  const docTextLower = (
    doc.schemeName + ' ' +
    doc.schemeNameGu + ' ' +
    (doc.schemeNameHi || '') + ' ' +
    doc.description + ' ' +
    doc.benefits + ' ' +
    (doc.keywords || []).join(' ')
  ).toLowerCase();

  const docTokens = new Set([
    ...tokenize(doc.schemeName),
    ...tokenize(doc.schemeNameGu),
    ...tokenize(doc.category),
    ...(doc.keywords || []).flatMap(k => tokenize(k))
  ]);

  // 1. Direct State Filter Bonus
  if (stateFilter && doc.state && (doc.state.toLowerCase() === stateFilter.toLowerCase() || doc.state === 'All India')) {
    score += 0.25;
  }

  // 2. Direct Category Filter Bonus
  if (categoryFilter && doc.category && doc.category.toLowerCase() === categoryFilter.toLowerCase()) {
    score += 0.30;
  }

  // 3. Token & Synonym Matching
  const GENERIC_WORDS = new Set(['agricultural', 'agriculture', 'farmer', 'farmers', 'scheme', 'government', 'govt']);

  for (const token of queryTokens) {
    if (GENERIC_WORDS.has(token)) continue; // Skip generic words for standalone relevance calculation

    if (docTokens.has(token)) {
      score += 0.35;
      continue;
    }

    // Check synonym expansion
    for (const [key, synonymList] of Object.entries(SCHEME_SYNONYMS)) {
      if (token === key || synonymList.includes(token)) {
        if (docTextLower.includes(key) || synonymList.some(syn => docTextLower.includes(syn))) {
          score += 0.25;
          break;
        }
      }
    }
  }

  return Math.min(score, 1.0);
}

/**
 * Searches government schemes based on natural query and filters
 */
export async function searchGovernmentSchemes(params = {}) {
  const { query, state, category, minRelevanceScore = 0.20 } = params || {};

  // 1. CHECK CONFIGURED EXTERNAL SCHEME API PROVIDER (IF AVAILABLE)
  const apiUrl = (typeof process !== 'undefined' && process.env?.GOVT_SCHEMES_API_URL) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOVT_SCHEMES_API_URL) || null;
  const apiKey = (typeof process !== 'undefined' && process.env?.GOVT_SCHEMES_API_KEY) || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOVT_SCHEMES_API_KEY) || null;

  if (apiUrl) {
    try {
      console.log(`[Government Scheme Service] Fetching from external API provider: ${apiUrl}...`);
      const res = await fetch(`${apiUrl}?query=${encodeURIComponent(query || '')}&state=${encodeURIComponent(state || '')}`, {
        headers: apiKey ? { 'Authorization': `Bearer ${apiKey}` } : {}
      });

      if (res.ok) {
        const apiData = await res.json();
        if (apiData && Array.isArray(apiData.schemes) && apiData.schemes.length > 0) {
          return {
            success: true,
            query: query || '',
            totalFound: apiData.schemes.length,
            schemes: apiData.schemes
          };
        }
      }
    } catch (e) {
      console.warn('[Government Scheme Service] External API fetch failed, falling back to verified official schemes dataset:', e.message);
    }
  }

  // 2. LOCAL VERIFIED OFFICIAL SCHEMES RETRIEVAL
  const cleanQuery = typeof query === 'string' ? query.trim() : '';
  const queryTokens = tokenize(cleanQuery);
  
  const results = [];
  for (const doc of GOVERNMENT_SCHEMES) {
    // If query is empty string, check category/state filters or general popular schemes
    let score = 0;
    if (!cleanQuery) {
      if (category && doc.category.toLowerCase() === category.toLowerCase()) score += 0.5;
      if (state && (doc.state.toLowerCase() === state.toLowerCase() || doc.state === 'All India')) score += 0.3;
      if (!category && !state) score = 0.4; // Baseline for empty query
    } else {
      score = calculateRelevance(doc, queryTokens, state, category);
    }

    if (score >= minRelevanceScore) {
      results.push({
        ...doc,
        relevanceScore: Math.round(score * 100) / 100,
        retrievedAt: new Date().toISOString()
      });
    }
  }

  // Sort by highest relevance score
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    success: true,
    query: query || '',
    totalFound: results.length,
    schemes: results
  };
}

export default {
  searchGovernmentSchemes,
  GOVERNMENT_SCHEMES
};

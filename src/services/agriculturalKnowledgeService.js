/**
 * KisanGuard AI — Agricultural Knowledge Retrieval Service (RAG Engine)
 * 
 * Provides fast, language-agnostic term matching, relevance scoring, and document ranking
 * over the controlled Agricultural Knowledge Base.
 */

import { KNOWLEDGE_DOCUMENTS } from '../data/agriculturalKnowledgeBase.js';

/**
 * Roman Gujarati / Hindi Agricultural Term Synonym Dictionary
 */
const AGRICULTURAL_SYNONYMS = {
  // Crop synonyms
  cotton: ['cotton', 'કપાસ', 'कपास', 'kapas', 'pak'],
  wheat: ['wheat', 'ઘઉં', 'गेहूं', 'ghau', 'gehu'],
  rice: ['rice', 'paddy', 'ડાંગર', 'ચોખા', 'धान', 'चावल', 'dangar', 'chokha'],
  groundnut: ['groundnut', 'peanut', 'મગફળી', 'मूंगफली', 'magfali', 'moongfali'],
  maize: ['maize', 'corn', 'મકાઈ', 'मक्का', 'makai'],
  tomato: ['tomato', 'ટમેટા', 'ટમેટી', 'टमाटर', 'tameta'],
  chilli: ['chilli', 'chili', 'મરચાં', 'मिर्च', 'marcha'],

  // Category synonyms
  fertilizer: ['fertilizer', 'npk', 'urea', 'dap', 'khatar', 'ખાતર', 'खाद', 'urom', 'manure', 'potash'],
  pests: ['pest', 'insect', 'whitefly', 'bollworm', 'jivat', 'keeda', 'જીવાત', 'ઈયળ', 'સફેદ માખી', 'દવા', 'ચોંટી', 'સંતુષ્ટ'],
  diseases: ['disease', 'blight', 'fungus', 'rog', 'રોગ', 'ગેરુ', 'ટપકાં', 'કોહવારો', 'રોગચાળો'],
  irrigation: ['irrigation', 'water', 'piyat', 'pani', 'paani', 'પિયત', 'પાણી', 'સિંચાઈ', 'વરસાદ'],
  cultivation: ['sowing', 'planting', 'soil', 'seed', 'vavani', 'વાવણી', 'જમીન', 'વાવેતર', 'તૈયારી']
};

const STOP_WORDS = new Set([
  'સામાન્ય', 'રીતે', 'શું', 'ધ્યાન', 'રાખવું', 'કરવું', 'માટે', 'આપો', 'જણાવો', 'આવે', 'છે', 'કઈ', 'કેવી', 'કોઈ',
  'what', 'should', 'consider', 'when', 'growing', 'for', 'how', 'to', 'the', 'and', 'is', 'in', 'of', 'tell', 'me'
]);

/**
 * Tokenizes text into normalized lowercase terms, filtering common stopwords
 */
function tokenize(text = '') {
  if (!text || typeof text !== 'string') return [];
  const cleaned = text.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, ' ');
  return cleaned.split(/\s+/).filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Calculates relevance score (0.0 to 1.0) for a document given search query tokens
 */
function calculateRelevance(doc, queryTokens, cropFilter = null, categoryFilter = null) {
  let score = 0;
  const docTokens = new Set([
    ...tokenize(doc.title),
    ...tokenize(doc.crop),
    ...tokenize(doc.cropGu),
    ...tokenize(doc.category),
    ...(doc.keywords || []).flatMap(k => tokenize(k)),
    ...tokenize(doc.content).slice(0, 100) // first 100 words of content
  ]);

  const docTextLower = (doc.title + ' ' + (doc.keywords || []).join(' ') + ' ' + doc.content).toLowerCase();

  // 1. Direct Filter Match Bonuses
  if (cropFilter && doc.crop.toLowerCase() === cropFilter.toLowerCase()) {
    score += 0.35;
  }
  if (categoryFilter && doc.category.toLowerCase() === categoryFilter.toLowerCase()) {
    score += 0.25;
  }

  // 2. Crop Name Direct Match Bonus
  const cropNames = [doc.crop.toLowerCase(), (doc.cropGu || '').toLowerCase(), (doc.cropHi || '').toLowerCase()].filter(Boolean);
  for (const token of queryTokens) {
    if (cropNames.some(cn => cn === token || token.includes(cn) || cn.includes(token))) {
      score += 0.35;
      break;
    }
  }

  // 3. Token / Synonym Matching
  let matchedTokens = 0;
  for (const token of queryTokens) {
    // Check direct token match
    if (docTokens.has(token) || docTextLower.includes(token)) {
      matchedTokens++;
      score += 0.15;
      continue;
    }

    // Check synonym expansion
    for (const [key, synonymList] of Object.entries(AGRICULTURAL_SYNONYMS)) {
      if (synonymList.includes(token)) {
        const matchesDoc = synonymList.some(syn => docTokens.has(syn) || docTextLower.includes(syn));
        if (matchesDoc) {
          matchedTokens++;
          score += 0.20;
          break;
        }
      }
    }
  }

  // 3. Title Bonus
  for (const token of queryTokens) {
    if (doc.title.toLowerCase().includes(token)) {
      score += 0.15;
    }
  }

  // Normalize score between 0.0 and 1.0
  return Math.min(1.0, Math.round(score * 100) / 100);
}

/**
 * Searches Knowledge Base and returns top ranked relevant documents
 */
export function searchKnowledge(query = '', options = {}) {
  const { crop = null, category = null, limit = 3, minRelevanceScore = 0.25 } = options || {};

  const cleanQuery = (query || '').trim();
  if (!cleanQuery && !crop && !category) {
    return {
      success: true,
      query: cleanQuery,
      totalFound: 0,
      results: []
    };
  }

  const queryTokens = tokenize(cleanQuery);

  const scoredDocs = KNOWLEDGE_DOCUMENTS.map(doc => {
    const score = calculateRelevance(doc, queryTokens, crop, category);
    return {
      id: doc.id,
      title: doc.title,
      crop: doc.crop,
      cropGu: doc.cropGu,
      category: doc.category,
      categoryLabel: doc.categoryLabel,
      relevanceScore: score,
      source: doc.source,
      sourceType: doc.sourceType,
      content: doc.content
    };
  });

  // Filter by minimum relevance threshold and sort descending by score
  const filtered = scoredDocs
    .filter(doc => doc.relevanceScore >= minRelevanceScore)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);

  return {
    success: true,
    query: cleanQuery,
    totalFound: filtered.length,
    results: filtered
  };
}

/**
 * Retrieves all documents for a given crop name
 */
export function getKnowledgeByCrop(cropName = '') {
  if (!cropName) return [];
  const clean = cropName.toLowerCase().trim();
  return KNOWLEDGE_DOCUMENTS.filter(d => 
    d.crop.toLowerCase() === clean || 
    (d.cropGu && d.cropGu.toLowerCase() === clean)
  );
}

/**
 * Retrieves all documents for a given topic category
 */
export function getKnowledgeByCategory(category = '') {
  if (!category) return [];
  const clean = category.toLowerCase().trim();
  return KNOWLEDGE_DOCUMENTS.filter(d => d.category.toLowerCase() === clean);
}

export default {
  searchKnowledge,
  getKnowledgeByCrop,
  getKnowledgeByCategory
};

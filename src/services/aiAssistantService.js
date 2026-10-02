/**
 * KisanGuard AI - Secure Groq Multi-Session Assistant & NLP Service
 * 
 * Provides ChatGPT-style multi-session chat memory (+ નવી વાતચીત / New Chat),
 * Roman Gujarati / Hindi language normalization, and secure Groq backend API calls.
 * NO client-side API keys, NO Gemini references.
 */

import { getFarmerContext } from './farmerContextService.js';
import { analyzeCropImage } from './cropVisionService.js';
import { getCurrentAccount } from './authService.js';
import { apiUrl } from './apiClient.js';

const STORAGE_SESSIONS_PREFIX = 'kisanguard_chat_sessions_';
const STORAGE_ACTIVE_ID_PREFIX = 'kisanguard_active_session_id_';
const LEGACY_STORAGE_SESSIONS_KEY = 'kisanguard_chat_sessions_v2';
const LEGACY_STORAGE_ACTIVE_ID_KEY = 'kisanguard_active_session_id_v2';

/**
 * Returns active user ID or fallback
 */
function getActiveUserId() {
  const account = getCurrentAccount();
  return account?.id || 'usr_default';
}

function getStorageSessionsKey() {
  return `${STORAGE_SESSIONS_PREFIX}${getActiveUserId()}`;
}

function getStorageActiveIdKey() {
  return `${STORAGE_ACTIVE_ID_PREFIX}${getActiveUserId()}`;
}

/**
 * Agricultural Terminology Normalizer & Roman Script Dictionary
 */
const ROMAN_GUJARATI_MAP = {
  pak: 'પાક',
  khatar: 'ખાતર',
  pani: 'પાણી',
  paani: 'પાણી',
  dava: 'દવા',
  dawa: 'દવા',
  jivat: 'જીવાત',
  keeda: 'કીડા/જીવાત',
  rog: 'રોગ',
  paan: 'પાન',
  pandda: 'પાંદડા',
  patta: 'પાંદડા',
  patte: 'પાંદડા',
  jamin: 'જમીન',
  nafo: 'નફો',
  nuksan: 'નુકસાન',
  chintakav: 'છંટકાવ',
  pila: 'પીળા',
  su: 'શું',
  karvu: 'કરવું',
  ketlu: 'કેટલું',
  aapvu: 'આપવું'
};

export const normalizeInputIntent = (input = '') => {
  const text = (input || '').toLowerCase();
  const words = text.split(/\s+/);
  
  let isRomanGujarati = false;
  let isRomanHindi = false;
  
  words.forEach((w) => {
    if (ROMAN_GUJARATI_MAP[w]) isRomanGujarati = true;
    if (['mere', 'fasal', 'patte', 'peele', 'ho', 'gaye', 'hain', 'kitna', 'kaise'].includes(w)) isRomanHindi = true;
  });

  return {
    raw: text,
    isRomanGujarati,
    isRomanHindi
  };
};

/**
 * Main Groq Assistant Response Engine
 */
export const getAssistantResponse = async (
  userMessage = '',
  farmerContext = null,
  language = 'gu',
  imagePayload = null,
  selectedCropOverride = null,
  history = []
) => {
  const context = farmerContext || getFarmerContext();
  const rawMsg = (userMessage || '').trim();
  const isGu = language === 'gu';
  const isHi = language === 'hi';

  const currentSessionId = getActiveSessionId() || 'new';

  // 1. CHAT REQUEST WITH TOOLS & MULTIMODAL CAPABILITY (POST /api/chat)
  try {
    const response = await fetch(apiUrl('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationId: currentSessionId,
        message: rawMsg || (imagePayload ? (isGu ? 'આ પાંદડાનો ફોટો તપાસો.' : 'Inspect this leaf photo.') : ''),
        image: imagePayload ? { data: imagePayload.base64 || imagePayload.data || imagePayload.url, mimeType: imagePayload.mimeType || 'image/jpeg' } : null,
        history: Array.isArray(history) ? history : [],
        language: language || 'gu',
        farmerContext: context
      })
    });

    const data = await response.json();

    if (response.ok && data.success && data.parsed) {
      const p = data.parsed;
      return {
        conversationId: data.conversationId || currentSessionId,
        type: p.type || (imagePayload ? 'photo_vision' : 'general'),
        text: p.text || (isGu ? 'હું KisanGuard AI છું, તમારો ખેતી સહાયક.' : isHi ? 'मैं KisanGuard AI हूँ, आपका कृषि सहायक।' : 'I am KisanGuard AI, your farm assistant.'),
        bulletPoints: p.bulletPoints || [],
        actionSteps: p.actionSteps || [],
        weatherData: p.weatherData || null,
        visionData: p.visionData || null,
        marketPriceData: p.marketPriceData || null,
        schemeData: p.schemeData || null,
        recommendationData: p.recommendationData || null,
        riskData: p.riskData || null,
        suggestions: p.suggestions || (isGu ? ['⚠️ પાક જોખમ તપાસો', '📷 પાંદડાનો ફોટો તપાસો', '🌦️ આજનું હવામાન'] : isHi ? ['⚠️ फसल जोखिम जांचें', '📷 पत्ती की फोटो भेजें', '🌦️ आज का मौसम'] : ['⚠️ Check Crop Risks', '📷 Upload Leaf Photo', '🌦️ Today Forecast'])
      };
    }

    if (data.error || data.errorType === 'AI_UNAVAILABLE') {
      return {
        conversationId: currentSessionId,
        type: 'general',
        text: isGu
          ? (data.messageGu || 'હાલમાં AI સેવા ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.')
          : isHi
          ? (data.messageHi || 'वर्तमान में AI सेवा उपलब्ध नहीं है। कृपया कुछ समय बाद पुनः प्रयास करें।')
          : (data.messageEn || 'AI service is currently unavailable. Please try again in a moment.'),
        bulletPoints: [
          isGu
            ? 'Groq API Key સરવર પર કન્ફિગર થયેલ નથી.'
            : isHi
            ? 'Groq API Key सर्वर पर कॉन्फ़िगर नहीं है।'
            : 'Groq API key is not configured on the server.'
        ],
        suggestions: isGu
          ? ['📷 પાંદડાનો ફોટો તપાસો', '🌦️ આજનું હવામાન']
          : isHi
          ? ['📷 पत्ती की फोटो भेजें', '🌦️ कल का मौसम']
          : ['📷 Upload Leaf Photo', '🌦️ Today Forecast']
      };
    }
  } catch (err) {
    console.error('[Groq Chat Client] Exception:', err);
  }

  // Fallback for missing GROQ_API_KEY or offline backend server
  return {
    conversationId: currentSessionId,
    type: 'general',
    text: isGu
      ? 'હાલમાં AI સેવા ઉપલબ્ધ નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.'
      : isHi
      ? 'वर्तमान में AI सेवा उपलब्ध नहीं है। कृपया कुछ समय बाद पुनः प्रयास करें।'
      : 'AI service is currently unavailable. Please try again in a moment.',
    bulletPoints: [
      isGu
        ? 'કૃપા કરીને સરવર પર GROQ_API_KEY કન્ફિગર કરો.'
        : isHi
        ? 'कृपया सर्वर पर GROQ_API_KEY कॉन्फ़िगर करें।'
        : 'Please configure GROQ_API_KEY on the server environment.'
    ],
    suggestions: isGu
      ? ['📷 પાંદડાનો ફોટો તપાસો', '🌦️ આજનું હવામાન']
      : isHi
      ? ['📷 पत्ती की फोटो भेजें', '🌦️ कल का मौसम']
      : ['📷 Upload Leaf Photo', '🌦️ Today Forecast']
  };
};

/**
 * USER-SCOPED MULTI-SESSION CHAT MEMORY HELPERS
 */
export const getChatSessions = () => {
  try {
    const userKey = getStorageSessionsKey();
    const raw = localStorage.getItem(userKey);
    if (raw && raw !== 'undefined') {
      return JSON.parse(raw);
    }
    
    // Migration check: If no user-scoped sessions exist yet, attempt legacy migration
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_SESSIONS_KEY);
    if (legacyRaw && legacyRaw !== 'undefined') {
      const legacySessions = JSON.parse(legacyRaw);
      if (Array.isArray(legacySessions) && legacySessions.length > 0) {
        localStorage.setItem(userKey, JSON.stringify(legacySessions));
        return legacySessions;
      }
    }
  } catch (e) {
    console.error("Error reading chat sessions:", e);
  }
  return [];
};

export const getActiveSessionId = () => {
  try {
    const activeKey = getStorageActiveIdKey();
    const activeId = localStorage.getItem(activeKey);
    if (activeId) return activeId;

    // Check legacy key fallback
    const legacyActiveId = localStorage.getItem(LEGACY_STORAGE_ACTIVE_ID_KEY);
    if (legacyActiveId) {
      localStorage.setItem(activeKey, legacyActiveId);
      return legacyActiveId;
    }
  } catch (e) {
    console.error("Error reading active session ID:", e);
  }
  return null;
};

export const createNewChatSession = (language = 'gu') => {
  const newSessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const title = language === 'gu' ? 'નવી વાતચીત' : language === 'hi' ? 'नई बातचीत' : 'New Chat';
  
  const newSession = {
    id: newSessionId,
    title: title,
    createdAt: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    messages: []
  };

  const sessions = getChatSessions();
  const updatedSessions = [newSession, ...sessions];

  try {
    localStorage.setItem(getStorageSessionsKey(), JSON.stringify(updatedSessions));
    localStorage.setItem(getStorageActiveIdKey(), newSessionId);
  } catch (e) {
    console.error("Error creating new chat session:", e);
  }

  return newSession;
};

export const switchChatSession = (sessionId) => {
  try {
    const sessions = getChatSessions();
    const found = sessions.find((s) => s.id === sessionId);

    if (!found) {
      console.warn(`[Security] Session ID "${sessionId}" not found for active user. Resetting to safe default.`);
      return [];
    }

    localStorage.setItem(getStorageActiveIdKey(), sessionId);
    return found.messages || [];
  } catch (e) {
    return [];
  }
};

export const saveActiveSessionMessages = (messages = []) => {
  let activeId = getActiveSessionId();
  let sessions = getChatSessions();

  if (!activeId || !sessions.some(s => s.id === activeId)) {
    const newSess = createNewChatSession();
    activeId = newSess.id;
    sessions = getChatSessions();
  }

  const firstUserMsg = messages.find((m) => m.role === 'user');
  const title = firstUserMsg ? (firstUserMsg.text || '📷 Crop Image Analysis').slice(0, 24) + '...' : 'Farming query';

  const updatedSessions = sessions.map((sess) => {
    if (sess.id === activeId) {
      return {
        ...sess,
        title: sess.title === 'નવી વાતચીત' || sess.title === 'New Chat' || sess.title === 'नई बातचीत' ? title : sess.title,
        messages
      };
    }
    return sess;
  });

  try {
    localStorage.setItem(getStorageSessionsKey(), JSON.stringify(updatedSessions));
  } catch (e) {
    console.error("Error saving active session messages:", e);
  }
};

export default {
  getAssistantResponse,
  getChatSessions,
  getActiveSessionId,
  createNewChatSession,
  switchChatSession,
  saveActiveSessionMessages,
  normalizeInputIntent
};

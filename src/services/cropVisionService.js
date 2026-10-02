/**
 * KisanGuard AI — Secure Groq Multimodal Vision & Crop Health Assistance Service
 * 
 * Step 13 Core Vision Service:
 * Sends base64 image payloads to backend proxy `/api/vision/analyze`.
 * Integrates Step 7 Agricultural RAG (searchKnowledge) to retrieve verified causes,
 * what to check, and safe next steps without fabricating disease diagnoses.
 * 
 * Safety & Diagnosis Rules:
 * - NEVER claims confirmed disease diagnosis ("Your crop definitely has Disease X" -> Forbidden).
 * - ALWAYS uses uncertainty language ("Possible issue...", "Possible causes include...", "Check the following signs...").
 * - If image is unclear/blurry/non-crop, prompts farmer for a clearer photo without guessing.
 * - If crop is unknown, allows crop confirmation without forcing a guess.
 * - Integrates Step 11 Farmer Profile and Step 12 Weather Risk context.
 */

import { searchKnowledge } from './agriculturalKnowledgeService.js';
import { getFarmerProfile } from './farmerProfileService.js';
import { apiUrl } from './apiClient.js';

export const SUPPORTED_CROPS = {
  cotton: { id: "cotton", label: "🌱 Cotton (કપાસ)", nameGu: "કપાસ", nameHi: "कपास", nameEn: "Cotton" },
  rice: { id: "rice", label: "🌾 Rice / Paddy (ડાંગર / ચોખા)", nameGu: "ડાંગર / ચોખા", nameHi: "धान / चावल", nameEn: "Rice / Paddy" },
  maize: { id: "maize", label: "🌽 Maize / Corn (મકાઈ)", nameGu: "મકાઈ", nameHi: "मक्का", nameEn: "Maize" },
  groundnut: { id: "groundnut", label: "🥜 Groundnut (મગફળી)", nameGu: "મગફળી", nameHi: "मूंगफली", nameEn: "Groundnut" },
  wheat: { id: "wheat", label: "🌿 Wheat (ઘઉં)", nameGu: "ઘઉં", nameHi: "गेहूं", nameEn: "Wheat" },
  tomato: { id: "tomato", label: "🍅 Tomato (ટમેટા)", nameGu: "ટમેટા", nameHi: "टमाटर", nameEn: "Tomato" },
  chilli: { id: "chilli", label: "🌶️ Chilli (મરચાં)", nameGu: "મરચાં", nameHi: "मिर्च", nameEn: "Chilli" },
  pulses: { id: "pulses", label: "🫘 Pulses / Tuver (તુવેર)", nameGu: "કઠોળ / તુવેર", nameHi: "दलहन / अरहर", nameEn: "Pulses / Pigeon Pea" },
  banana: { id: "banana", label: "🍌 Banana (કેળા)", nameGu: "કેળા", nameHi: "केला", nameEn: "Banana" },
  unknown: { id: "unknown", label: "❓ Uncertain / Unclear", nameGu: "અજ્ઞાત / સ્પષ્ટ નથી", nameHi: "अज्ञात / स्पष्ट नहीं", nameEn: "Uncertain / Unclear" }
};

/**
 * Preprocess, resize, and compress image before base64 conversion
 */
export const compressAndResizeImage = (fileOrUrl, maxDimension = 1024, quality = 0.85) => {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || typeof Image === 'undefined') {
        fileToBase64(fileOrUrl).then(resolve);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      const processImg = () => {
        let width = img.width;
        let height = img.height;

        if (!width || !height) {
          fileToBase64(fileOrUrl).then(resolve);
          return;
        }

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const rawBase64 = dataUrl.split(',')[1] || '';
          resolve({ base64: rawBase64.trim(), mimeType: 'image/jpeg' });
        } else {
          fileToBase64(fileOrUrl).then(resolve);
        }
      };

      img.onload = processImg;
      img.onerror = () => {
        fileToBase64(fileOrUrl).then(resolve);
      };

      if (typeof fileOrUrl === 'string') {
        img.src = fileOrUrl;
      } else if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
        img.src = URL.createObjectURL(fileOrUrl);
      } else {
        fileToBase64(fileOrUrl).then(resolve);
      }
    } catch (e) {
      console.warn('[Vision] Compression fallback triggered:', e);
      fileToBase64(fileOrUrl).then(resolve);
    }
  });
};

/**
 * Helper to convert Blob / File / Data URL to Base64 directly
 */
const fileToBase64 = (fileOrUrl) => {
  return new Promise((resolve) => {
    try {
      if (typeof fileOrUrl === 'string') {
        const raw = fileOrUrl.includes(',') ? fileOrUrl.split(',')[1] : fileOrUrl;
        resolve({ base64: raw.trim(), mimeType: 'image/jpeg' });
        return;
      }
      if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
        const reader = new FileReader();
        const mimeType = fileOrUrl.type || 'image/jpeg';
        reader.onloadend = () => {
          const res = reader.result || '';
          const raw = typeof res === 'string' && res.includes(',') ? res.split(',')[1] : res;
          resolve({ base64: (raw || '').trim(), mimeType });
        };
        reader.readAsDataURL(fileOrUrl);
        return;
      }
    } catch (e) {
      console.warn("Base64 conversion error:", e);
    }
    resolve({ base64: '', mimeType: 'image/jpeg' });
  });
};

/**
 * Main Groq Multimodal Vision Analysis Entry Point (Step 13 Enhanced)
 */
export const analyzeCropImage = async ({
  images = [],
  userMessage = '',
  farmerContext = null,
  language = 'gu',
  history = [],
  confirmedCropOverride = null
}) => {
  const imageList = Array.isArray(images) ? images : [images].filter(Boolean);
  const primaryImage = imageList[0] || null;

  if (!primaryImage) {
    return {
      status: 'api_unavailable',
      errorType: 'INVALID_IMAGE',
      crop: null,
      textGu: 'કોઈ ફોટો પસંદ કરેલ નથી. કૃપા કરીને પાંદડાનો સ્પષ્ટ ફોટો લો.',
      textEn: 'No photo selected. Please upload a clear leaf photo.'
    };
  }

  // Preprocess and Compress image
  const inputSource = primaryImage.file || primaryImage.url || primaryImage;
  const { base64: base64Data, mimeType } = await compressAndResizeImage(inputSource, 1024, 0.85);

  if (!base64Data) {
    return {
      status: 'api_unavailable',
      errorType: 'INVALID_IMAGE',
      crop: null,
      textGu: 'ફોટો લોડ કરી શકાયો નથી. કૃપા કરીને ફરીથી ફોટો સિલેક્ટ કરો.',
      textEn: 'Could not process image payload. Please select the photo again.'
    };
  }

  try {
    const response = await fetch(apiUrl('/api/vision/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: {
          mimeType,
          data: base64Data
        },
        question: userMessage || (confirmedCropOverride ? `This crop is confirmed as ${confirmedCropOverride}. Inspect leaf symptoms.` : 'Identify the crop and inspect leaf health.'),
        language: language || 'gu',
        farmerContext: farmerContext || (typeof window !== 'undefined' ? getFarmerProfile() : null),
        history,
        confirmedCrop: confirmedCropOverride
      })
    });

    const data = await response.json();

    // STATE C — API / AI ERROR
    if (!response.ok || !data.success) {
      return {
        status: 'api_unavailable',
        crop: null,
        errorType: data.errorType || 'AI_UNAVAILABLE',
        textGu: data.messageGu || '🤖 AI સેવા હાલમાં ઉપલબ્ધ નથી\n\nફોટાનું વિશ્લેષણ હાલમાં થઈ શક્યું નથી.\nથોડીવાર પછી ફરી પ્રયાસ કરો.',
        textHi: '🤖 AI सेवा वर्तमान में उपलब्ध नहीं है\n\nफोटो का विश्लेषण नहीं हो सका। कृपया कुछ समय बाद पुनः प्रयास करें।',
        textEn: data.messageEn || '🤖 AI service is currently unavailable. Photo analysis could not be completed. Please try again later.'
      };
    }

    if (data.success && data.parsed) {
      const p = data.parsed;

      // STATE B — IMAGE UNCLEAR / CANNOT IDENTIFY (Blurry, dark, non-crop)
      if ((!p.crop && !confirmedCropOverride) || (p.imageQuality && p.imageQuality.isClear === false)) {
        return {
          status: 'unclear',
          crop: null,
          imageQuality: p.imageQuality || { isClear: false, reason: "Photo not clear or crop unidentifiable" },
          observations: p.observations || [],
          promptCropConfirmation: true,
          textGu: '🌱 પાક સ્પષ્ટ રીતે ઓળખાયો નથી\n\nફોટો પૂરતો સ્પષ્ટ નથી અથવા પાક ઓળખી શકાયો નથી.\nકૃપા કરીને નીચેનામાંથી પાક પસંદ કરો અથવા વધુ સ્પષ્ટ ફોટો મોકલો.',
          textHi: '🌱 फसल की पहचान नहीं हो सकी। फोटो स्पष्ट नहीं है। कृपया फसल का चयन करें या साफ फोटो भेजें।',
          textEn: '🌱 Could not identify crop clearly. Photo is not clear or crop is unidentifiable. Please select your crop below or send a clearer photo.',
          qualityTips: [
            '૧. પૂરતા અજવાળામાં પાંદડાનો નજીકથી સ્પષ્ટ ફોટો લો.',
            '૨. પાંદડાની બંને બાજુ (આગળ અને પાછળ) દેખાય તે રીતે ફોટો લો.',
            '૩. રોગગ્રસ્ત અને સ્વસ્થ બંને ભાગ આવરી લો.'
          ]
        };
      }

      // STATE A — SUCCESSFUL IDENTIFICATION & DIAGNOSTIC PIPELINE
      const cropObj = p.crop || (confirmedCropOverride ? { name: confirmedCropOverride, localName: confirmedCropOverride, confidence: 'High' } : {});
      const cropNameLower = (cropObj.name || cropObj.localName || confirmedCropOverride || '').toLowerCase();
      let matchedCrop = null;

      if (cropNameLower.includes('rice') || cropNameLower.includes('paddy') || cropNameLower.includes('ચોખા') || cropNameLower.includes('ડાંગર')) {
        matchedCrop = SUPPORTED_CROPS.rice;
      } else if (cropNameLower.includes('cotton') || cropNameLower.includes('કપાસ')) {
        matchedCrop = SUPPORTED_CROPS.cotton;
      } else if (cropNameLower.includes('maize') || cropNameLower.includes('corn') || cropNameLower.includes('મકાઈ')) {
        matchedCrop = SUPPORTED_CROPS.maize;
      } else if (cropNameLower.includes('groundnut') || cropNameLower.includes('peanut') || cropNameLower.includes('મગફળી')) {
        matchedCrop = SUPPORTED_CROPS.groundnut;
      } else if (cropNameLower.includes('wheat') || cropNameLower.includes('ઘઉં')) {
        matchedCrop = SUPPORTED_CROPS.wheat;
      } else if (cropNameLower.includes('tomato') || cropNameLower.includes('ટમેટા')) {
        matchedCrop = SUPPORTED_CROPS.tomato;
      } else if (cropNameLower.includes('chilli') || cropNameLower.includes('chili') || cropNameLower.includes('મરચાં')) {
        matchedCrop = SUPPORTED_CROPS.chilli;
      } else if (cropNameLower.includes('pulse') || cropNameLower.includes('tuver') || cropNameLower.includes('કઠોળ')) {
        matchedCrop = SUPPORTED_CROPS.pulses;
      } else if (cropNameLower.includes('banana') || cropNameLower.includes('કેળા')) {
        matchedCrop = SUPPORTED_CROPS.banana;
      } else {
        matchedCrop = {
          id: cropNameLower.replace(/\s+/g, '_') || 'crop',
          nameGu: cropObj.localName || cropObj.name || confirmedCropOverride,
          nameHi: cropObj.name || confirmedCropOverride,
          nameEn: cropObj.name || confirmedCropOverride
        };
      }

      const profileCropName = farmerContext?.profile?.currentCrop || 'Cotton';
      const isProfileMismatch = profileCropName.toLowerCase() !== matchedCrop.id;

      // STEP 7 AGRICULTURAL RAG INTEGRATION FOR VERIFIED CAUSES & CHECKS
      const cropSearchKey = matchedCrop.nameEn || matchedCrop.nameGu;
      const observationSearchKey = (p.observations || []).join(' ') || (p.possibleIssue || 'leaf health');
      
      let ragResults = [];
      try {
        const ragRes = searchKnowledge(`${cropSearchKey} ${observationSearchKey}`, { crop: cropSearchKey, limit: 2 });
        if (ragRes && ragRes.success && Array.isArray(ragRes.results)) {
          ragResults = ragRes.results;
        }
      } catch (e) {
        ragResults = [];
      }

      // Build verified causes array
      const rawVisionCauses = Array.isArray(p.possibleCauses) 
        ? p.possibleCauses 
        : (Array.isArray(p.possibleIssues) ? p.possibleIssues.map(i => typeof i === 'string' ? i : i.issue) : []);

      const verifiedCauses = [];
      if (rawVisionCauses.length > 0) {
        rawVisionCauses.forEach(c => {
          const textStr = typeof c === 'string' ? c : (c.issue || c.name || '');
          if (textStr) verifiedCauses.push(textStr);
        });
      }

      // Add RAG article title as cause reference if available
      if (ragResults.length > 0) {
        ragResults.forEach(r => {
          if (r.title && !verifiedCauses.some(vc => vc.includes(r.title))) {
            verifiedCauses.push(`ચકાસાયેલ માહિતી સંદર્ભ: ${r.title} (${r.category})`);
          }
        });
      }

      // Build "What to Check" list
      const whatToCheckList = Array.isArray(p.whatToCheck) && p.whatToCheck.length > 0
        ? p.whatToCheck
        : [
            '૧. લક્ષણ નવા (ઉપરના) કે જૂના (નીચેના) પાંદડા પર છે તે ચકાસો.',
            '૨. પાંદડાની પાછળની બાજુએ ઝીણી જીવાત કે જાળું છે કે કેમ તે જુઓ.',
            '૩. જમીનમાં ભેજનું પ્રમાણ અને મૂળિયાં પાસેની સ્થિતિ ચકાસો.'
          ];

      // Safe actionable next steps
      const safeActionSteps = Array.isArray(p.recommendedNextSteps) && p.recommendedNextSteps.length > 0
        ? p.recommendedNextSteps
        : [
            '૧. અસરગ્રસ્ત વિસ્તારનું ૨-૩ દિવસ નિયમિત નિરીક્ષણ કરો.',
            '૨. જો વરસાદ વધુ થયો હોય તો ખેતરમાંથી નકામા પાણીનો નિકાલ કરો.',
            '૩. કોઈપણ રાસાયણિક છંટકાવ પહેલાં સ્થાનિક કૃષિ અધિકારી કે નિષ્ણાતની સલાહ લો.'
          ];

      return {
        status: 'analyzed',
        crop: {
          id: matchedCrop.id,
          nameGu: matchedCrop.nameGu || cropObj.localName || cropObj.name,
          nameHi: matchedCrop.nameHi || cropObj.name,
          nameEn: matchedCrop.nameEn || cropObj.name,
          confidenceLabel: cropObj.confidence || 'High'
        },
        isProfileMismatch,
        profileCropName,
        imageQuality: p.imageQuality || { isClear: true },
        observations: p.observations || ['પાંદડાનું દ્રશ્ય નિરીક્ષણ પૂર્ણ.'],
        possibleIssue: p.possibleIssue || (p.possibleIssues?.[0]?.issue || 'પાંદડામાં વિકૃતિ / રંગ પરિવર્તન'),
        possibleCauses: verifiedCauses.length > 0 ? verifiedCauses : ['પોષક તત્વો અથવા વાતાવરણીય ભેજની અસર'],
        whatToCheck: whatToCheckList,
        actionStepsGu: safeActionSteps,
        actionStepsEn: safeActionSteps,
        ragKnowledgeFound: ragResults.length > 0,
        ragSourceTitle: ragResults[0]?.title || null,
        textGu: p.textResponse || `🌱 પાક ઓળખાયો: **${matchedCrop.nameGu}**`,
        textEn: p.textResponse || `🌱 Crop identified: **${matchedCrop.nameEn}**`,
        textHi: p.textResponse || `🌱 फसल की पहचान: **${matchedCrop.nameHi}**`,
        disclaimerGu: '📌 અગત્યની સૂચના: આ AI-આધારિત દ્રશ્ય વિશ્લેષણ અને સંભવિત માર્ગદર્શન છે, જે રોગની ચોક્કસ ખાતરી નથી. યોગ્ય ઉપચાર માટે સ્થાનિક કૃષિ અધિકારીની સલાહ લો.',
        disclaimerEn: '📌 Important: This is an AI-assisted visual assessment and guidance, not a confirmed diagnosis. Please consult a local agricultural officer for diagnosis.'
      };
    }
  } catch (err) {
    console.error('[Groq Vision Client] Network exception:', err);
  }

  // STATE C — AI / API ERROR
  return {
    status: 'api_unavailable',
    crop: null,
    errorType: 'AI_UNAVAILABLE',
    textGu: 'AI સેવા હાલમાં ઉપલબ્ધ નથી. ફોટોનું વિશ્લેષણ હાલમાં થઈ શક્યું નથી. થોડીવાર પછી ફરી પ્રયાસ કરો.',
    textHi: 'AI सेवा वर्तमान में उपलब्ध नहीं है। कृपया कुछ समय बाद पुनः प्रयास करें।',
    textEn: 'AI service is currently unavailable. Please try again in a moment.'
  };
};

export default {
  SUPPORTED_CROPS,
  analyzeCropImage,
  compressAndResizeImage
};

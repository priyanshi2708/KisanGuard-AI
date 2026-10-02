/**
 * KisanGuard AI — Crop Vision & Disease Assistance Tool
 * 
 * Registered Tool #2 in KisanGuard AI Tool Registry.
 * Analyzes crop leaf/plant images to identify crop species, inspect plant health,
 * detect visible symptoms, identify possible causes using RAG knowledge, recommend what to check,
 * and provide safe practical next steps without claiming confirmed disease diagnosis.
 */

/**
 * Safely extracts JSON payload from Vision AI response string
 */
function parseVisionJsonResponse(text = '') {
  try {
    let cleanedText = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    
    try {
      return JSON.parse(cleanedText);
    } catch (e) {}

    const fenceStripped = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try {
      return JSON.parse(fenceStripped);
    } catch (e) {}

    const firstBrace = cleanedText.indexOf('{');
    const lastBrace = cleanedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = cleanedText.substring(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {}
    }

    const cropNameMatch = text.match(/"name":\s*"([^"]+)"/i) || text.match(/Crop:\s*\*?\*?([A-Za-z\s]+)\*?\*?/i) || text.match(/\b(Rice|Cotton|Wheat|Maize|Groundnut|Tomato|Chilli|Pulses|Banana)\b/i);
    const localNameMatch = text.match(/"localName":\s*"([^"]+)"/i);
    const confidenceMatch = text.match(/"confidence":\s*"([^"]+)"/i);

    if (cropNameMatch && cropNameMatch[1]) {
      const cropName = cropNameMatch[1].trim();
      if (cropName.toLowerCase() !== 'null' && cropName.toLowerCase() !== 'none' && cropName.toLowerCase() !== 'unknown') {
        return {
          success: true,
          crop: {
            name: cropName,
            localName: localNameMatch ? localNameMatch[1] : cropName,
            confidence: confidenceMatch ? confidenceMatch[1] : 'High'
          },
          imageQuality: {
            isClear: true,
            reason: null
          },
          observations: ["Crop visual characteristics identified from photo."],
          possibleIssue: "Visible leaf condition",
          possibleCauses: ["Environmental condition or nutrient variation"],
          whatToCheck: ["Check underside of leaves", "Inspect soil moisture", "Observe new vs old leaves"],
          recommendedNextSteps: ["૧. પિયત અને ખાતરનું યોગ્ય ટાઇમિંગ જાળવો.", "૨. નિયમિત પાક નિરીક્ષણ કરો."],
          needsExpertConfirmation: true,
          textResponse: `🌱 પાક ઓળખાયો: **${cropName}**`
        };
      }
    }
  } catch (e) {
    console.warn('[cropVisionTool] Could not parse Vision JSON output:', e);
  }
  return null;
}

export const cropVisionTool = {
  name: 'cropVisionTool',
  description: 'Analyzes crop leaf/plant images to identify crop species, inspect plant health, detect visible symptoms, provide possible causes, guide what to check, and recommend safe next steps without claiming confirmed disease diagnoses.',
  inputSchema: {
    type: 'object',
    properties: {
      image: {
        type: 'object',
        description: 'Object containing base64 encoded image string in "data" property and optional "mimeType".'
      },
      question: {
        type: 'string',
        description: 'Farmer question or specific query about the image.'
      },
      language: {
        type: 'string',
        description: 'Preferred language code ("gu", "hi", "en"). Defaults to "gu".'
      }
    },
    required: []
  },

  /**
   * Safe execution function with input validation and error handling
   */
  async execute(params = {}) {
    const { image, question, language = 'gu', farmerContext, apiKey, visionModel = 'qwen/qwen3.8-27b' } = params || {};

    // 1. INPUT VALIDATION
    if (!image || typeof image !== 'object') {
      return {
        success: false,
        errorType: 'INVALID_IMAGE',
        error: 'Image object payload is missing.'
      };
    }

    const rawData = image.data || image.base64 || image.url || '';
    if (!rawData || typeof rawData !== 'string' || !rawData.trim()) {
      return {
        success: false,
        errorType: 'INVALID_IMAGE',
        error: 'Image base64 data string is empty or invalid.'
      };
    }

    // Sanitize base64 string
    let cleanBase64 = rawData.trim();
    if (cleanBase64.includes(',')) {
      cleanBase64 = cleanBase64.split(',')[1].trim();
    }

    // Check payload size (12MB limit)
    const byteSize = (cleanBase64.length * 3) / 4;
    if (byteSize > 12 * 1024 * 1024) {
      return {
        success: false,
        errorType: 'PAYLOAD_TOO_LARGE',
        error: 'Image file size exceeds maximum 12MB limit.'
      };
    }

    // Normalize MIME type
    let mimeType = (image.mimeType || 'image/jpeg').toLowerCase().trim();
    if (mimeType.includes('png')) mimeType = 'image/png';
    else if (mimeType.includes('webp')) mimeType = 'image/webp';
    else mimeType = 'image/jpeg';

    if (!apiKey) {
      return {
        success: false,
        errorType: 'VISION_UNAVAILABLE',
        error: 'Vision API key is missing on the server environment.'
      };
    }

    const profileCrop = farmerContext?.profile?.currentCrop || 'Cotton';
    const visionSystemPrompt = `You are KisanGuard AI, an expert agricultural computer vision diagnostic engine.
Inspect the provided crop image carefully and independently.

CRITICAL DIAGNOSIS & SAFETY RULES:
1. TRUTHFULNESS: Analyze actual image visual features. Do NOT assume crop is profile crop (${profileCrop}).
2. QUALITY & CROP EVALUATION:
   - If photo is blurry, dark, non-crop, or plant is unidentifiable, set "imageQuality": {"isClear": false, "reason": "Photo unclear or non-crop"}, "crop": null.
   - If photo shows a crop clearly, identify the crop ("name", "localName", "confidence").
3. NO FAKE CONFIRMED DIAGNOSES: NEVER say "Your crop definitely has Disease X". Prefer "Possible issue: ...", "Possible causes include...", "Check the following signs...".
4. SEPARATE DIAGNOSTIC PIPELINE:
   - Step 1: Identify crop species or set crop: null if unclear.
   - Step 2: Quality assessment (isClear: true/false).
   - Step 3: Observed visual symptoms (what image actually shows e.g., leaf discoloration, spots).
   - Step 4: Possible causes (e.g., nutrient deficiency, water stress, fungal spot, sucking pests).
   - Step 5: What farmer should check (underside of leaves, new vs old leaves, soil moisture).
   - Step 6: Safe recommended next steps (NO precise chemical dosage recipes).
5. REASONING LIMIT: Keep internal reasoning under 60 words. Output valid JSON immediately.

Respond strictly in valid JSON format:
{
  "success": true,
  "crop": {
    "name": "Cotton" | "Rice" | "Wheat" | "Maize" | "Groundnut" | "Tomato" | "Chilli" | "Pulses" | "Banana" | null,
    "localName": "કપાસ" | "ડાંગર / ચોખા" | "ઘઉં" | "મકાઈ" | "મગફળી" | "ટમેટા" | "મરચાં" | "કઠોળ" | "કેળા" | null,
    "confidence": "High" | "Medium" | "Low" | "Unable to determine"
  },
  "imageQuality": {
    "isClear": true,
    "reason": null
  },
  "observations": ["Observed visual detail 1", "Observed visual detail 2"],
  "possibleIssue": "Leaf Discoloration / Symptom name",
  "possibleCauses": ["Nutrient or water-related issue", "Favorable conditions for leaf spot"],
  "whatToCheck": ["Check leaf underside", "Observe new vs old leaves", "Inspect soil moisture"],
  "recommendedNextSteps": ["1. Monitor affected area for 2-3 days.", "2. Maintain proper field drainage.", "3. Consult local agricultural officer before spraying."],
  "needsExpertConfirmation": true,
  "textResponse": "Clear summary explanation in farmer's language (${language || 'gu'})"
}`;

    const imageContentUrl = `data:${mimeType};base64,${cleanBase64}`;
    const userQuestion = (question && question.trim())
      ? question.trim()
      : (language === 'gu' ? 'આ પાક/પાંદડાનો ફોટો જુઓ અને શું સ્થિતિ છે તે જણાવો.' : 'Inspect this crop/leaf image and report plant health condition.');

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: visionModel,
          messages: [
            { role: 'system', content: visionSystemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: userQuestion },
                { type: 'image_url', image_url: { url: imageContentUrl } }
              ]
            }
          ],
          temperature: 0.1,
          max_tokens: 3072
        })
      });

      if (!groqRes.ok) {
        return {
          success: false,
          errorType: 'VISION_UNAVAILABLE',
          error: `Vision API HTTP error ${groqRes.status}`
        };
      }

      const groqData = await groqRes.json();
      const textContent = groqData?.choices?.[0]?.message?.content || '';
      let parsedJSON = parseVisionJsonResponse(textContent);

      if (!parsedJSON || typeof parsedJSON !== 'object') {
        let cleanText = textContent.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        cleanText = cleanText.replace(/```[\s\S]*?```/g, '').replace(/Drafting the JSON:[\s\S]*/gi, '').trim();

        parsedJSON = {
          success: true,
          crop: null,
          imageQuality: {
            isClear: false,
            reason: "Unstructured AI response"
          },
          observations: cleanText ? [cleanText] : [],
          possibleIssue: "Unclear symptom",
          possibleCauses: [],
          whatToCheck: ["કૃપા કરીને પૂરતા અજવાળામાં પાંદડાનો સ્પષ્ટ ફોટો લો."],
          recommendedNextSteps: [
            language === 'gu' ? "કૃપા કરીને પૂરતા અજવાળામાં પાંદડાનો સ્પષ્ટ ફોટો લો." : "Please take a clear photo of the leaf in good lighting."
          ],
          needsExpertConfirmation: true,
          textResponse: language === 'gu' ? "પાક ઓળખી શકાયો નથી." : "Could not identify crop."
        };
      }

      return {
        success: true,
        data: parsedJSON
      };
    } catch (e) {
      console.error('[cropVisionTool] Exception:', e.message);
      return {
        success: false,
        errorType: 'VISION_UNAVAILABLE',
        error: e.message
      };
    }
  }
};

export default cropVisionTool;

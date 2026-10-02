/**
 * KisanGuard AI - Speech-to-Text Frontend Service
 * 
 * Communicates with backend /api/speech/transcribe to transcribe recorded farmer audio.
 * Isolated speech provider client so provider can be changed without touching chatbot UI.
 */
import { apiUrl } from './apiClient.js';

/**
 * Converts a Blob to a Base64 string (data without data URL prefix)
 */
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result || '';
      const base64Data = result.split(',')[1] || '';
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(blob);
  });
};

/**
 * Transcribes audio blob using the backend Speech-to-Text API
 * 
 * @param {Blob} audioBlob - Recorded audio blob from MediaRecorder
 * @param {string} language - Preferred language code ('gu', 'hi', 'en')
 * @returns {Promise<{success: boolean, text?: string, language?: string, errorType?: string, messageGu?: string, messageEn?: string}>}
 */
export const transcribeAudio = async (audioBlob, language = 'gu') => {
  if (!audioBlob || audioBlob.size === 0) {
    return {
      success: false,
      errorType: 'EMPTY_RECORDING',
      messageGu: 'અવાજ રેકોર્ડ કરી શકાયો નથી. ફરી પ્રયાસ કરો.',
      messageHi: 'आवाज़ रिकॉर्ड नहीं हो सकी। कृपया पुनः प्रयास करें।',
      messageEn: 'Could not record audio. Please try again.'
    };
  }

  try {
    const base64Audio = await blobToBase64(audioBlob);

    const response = await fetch(apiUrl('/api/speech/transcribe'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio: base64Audio,
        mimeType: audioBlob.type || 'audio/webm',
        language: language || 'gu'
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        text: data.text,
        language: data.language || language
      };
    }

    return {
      success: false,
      errorType: data.errorType || 'TRANSCRIPTION_FAILED',
      messageGu: data.messageGu || 'તમારો અવાજ સમજવામાં સમસ્યા આવી. કૃપા કરીને ફરી પ્રયાસ કરો.',
      messageHi: data.messageHi || 'आपकी आवाज़ समझने में समस्या आई। कृपया पुनः प्रयास करें।',
      messageEn: data.messageEn || 'Problem understanding your audio. Please try again.'
    };
  } catch (error) {
    console.error('[SpeechToTextService] Network or processing error:', error);
    return {
      success: false,
      errorType: 'NETWORK_ERROR',
      messageGu: 'અવાજ સરવર સુધી પહોંચી શક્યો નથી. ઈન્ટરનેટ જોડાણ ચકાસો.',
      messageHi: 'आवाज़ सर्वर तक नहीं पहुँच सकी। इंटरनेट कनेक्शन जांचें।',
      messageEn: 'Could not reach server. Please check internet connection.'
    };
  }
};

export default {
  transcribeAudio
};

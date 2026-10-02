/**
 * KisanGuard AI - Text-to-Speech Frontend Service
 * 
 * Synthesizes natural spoken Gujarati, Hindi, or English audio from KisanGuard AI response text.
 * Manages audio element lifecycle, Blob URL cleanup, playback listeners, and fallback mechanics.
 */

import { apiUrl } from './apiClient.js';

// Track active playing Audio instance to prevent overlapping speech
let currentAudioInstance = null;
let currentObjectUrl = null;

/**
 * Synthesizes audio Blob from AI text using backend /api/speech/synthesize
 * 
 * @param {string} text - AI response text to synthesize
 * @param {string} language - Language code ('gu', 'hi', 'en')
 * @returns {Promise<{success: boolean, audioUrl?: string, errorType?: string}>}
 */
export const synthesizeSpeech = async (text = '', language = 'gu') => {
  if (!text || !text.trim()) {
    return {
      success: false,
      errorType: 'EMPTY_TEXT'
    };
  }

  // Detect script from text
  let targetLang = language || 'gu';
  if (/[\u0A80-\u0AFF]/.test(text)) {
    targetLang = 'gu';
  } else if (/[\u0900-\u097F]/.test(text)) {
    targetLang = 'hi';
  }

  try {
    const response = await fetch(apiUrl('/api/speech/synthesize'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        language: targetLang
      })
    });

    if (!response.ok) {
      console.warn(`[TextToSpeechService] HTTP ${response.status} from synthesis backend.`);
      return {
        success: false,
        errorType: 'SYNTHESIS_FAILED'
      };
    }

    const audioBlob = await response.blob();
    if (!audioBlob || audioBlob.size < 500) {
      return {
        success: false,
        errorType: 'INVALID_AUDIO_BLOB'
      };
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    return {
      success: true,
      audioUrl
    };

  } catch (error) {
    console.error('[TextToSpeechService] Exception during speech synthesis:', error);
    return {
      success: false,
      errorType: 'NETWORK_ERROR'
    };
  }
};

/**
 * Safely stops and clears current Audio reference
 */
const cleanupCurrentAudio = () => {
  if (currentAudioInstance) {
    try {
      currentAudioInstance.pause();
      currentAudioInstance.onplay = null;
      currentAudioInstance.onended = null;
      currentAudioInstance.onerror = null;
    } catch (e) {}
    currentAudioInstance = null;
  }
};

/**
 * Plays audio from URL using standard HTML5 Audio instance
 * 
 * @param {string} audioUrl - Blob URL or audio stream URL
 * @param {Object} handlers - { onStart, onEnd, onError }
 * @returns {Function} stopFunction to immediately stop playback
 */
export const playAudioUrl = (audioUrl, { onStart, onEnd, onError } = {}) => {
  stopActiveSpeech();

  if (!audioUrl) {
    if (onError) onError('NO_AUDIO_URL');
    return () => {};
  }

  try {
    const audio = new Audio(audioUrl);
    currentAudioInstance = audio;
    currentObjectUrl = audioUrl;

    audio.onplay = () => {
      if (onStart) onStart();
    };

    audio.onended = () => {
      cleanupCurrentAudio();
      if (onEnd) onEnd();
    };

    audio.onerror = (e) => {
      console.error('[TextToSpeechService] Audio element playback error:', e);
      cleanupCurrentAudio();
      if (onError) onError('PLAYBACK_ERROR');
    };

    audio.play().catch((err) => {
      console.warn('[TextToSpeechService] Autoplay prevented or playback interrupted:', err);
      cleanupCurrentAudio();
      if (onError) onError('AUTOPLAY_PREVENTED');
    });

    return () => {
      if (currentAudioInstance === audio) {
        stopActiveSpeech();
      }
    };
  } catch (err) {
    console.error('[TextToSpeechService] Error initializing audio player:', err);
    if (onError) onError('INITIALIZATION_ERROR');
    return () => {};
  }
};

/**
 * Stops any currently playing audio and revokes object URL resources
 */
export const stopActiveSpeech = () => {
  if (currentAudioInstance) {
    try {
      currentAudioInstance.pause();
      currentAudioInstance.currentTime = 0;
      currentAudioInstance.onplay = null;
      currentAudioInstance.onended = null;
      currentAudioInstance.onerror = null;
    } catch (e) {}
    currentAudioInstance = null;
  }

  if (currentObjectUrl && currentObjectUrl.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(currentObjectUrl);
    } catch (e) {}
    currentObjectUrl = null;
  }

  // Also stop browser SpeechSynthesis if active
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
};

/**
 * Client-side browser SpeechSynthesis fallback
 */
export const speakBrowserFallback = (text, language = 'gu', { onStart, onEnd, onError } = {}) => {
  stopActiveSpeech();

  if (!('speechSynthesis' in window)) {
    if (onError) onError('SPEECH_SYNTHESIS_NOT_SUPPORTED');
    return () => {};
  }

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-US';

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.error('[TextToSpeechService] SpeechSynthesis error:', e);
      if (onError) onError('SPEECH_SYNTHESIS_ERROR');
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      window.speechSynthesis.cancel();
    };
  } catch (e) {
    if (onError) onError('FALLBACK_FAILED');
    return () => {};
  }
};

export default {
  synthesizeSpeech,
  playAudioUrl,
  stopActiveSpeech,
  speakBrowserFallback
};

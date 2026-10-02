import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Mic, Camera, Volume2, Sparkles, Globe,
  Bot, User, Sprout, AlertCircle, RefreshCw, Paperclip, X, CheckCircle2, ChevronRight
} from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';
import {
  getAssistantResponse,
  saveActiveSessionMessages,
  switchChatSession
} from '../../services/aiAssistantService';
import { SUPPORTED_CROPS } from '../../services/cropVisionService';
import CropPhotoPreviewModal from './CropPhotoPreviewModal';
import FormattedText from './FormattedText';
import kisanAvatar from '../../assets/kisan_avatar.jpg';
import { transcribeAudio } from '../../services/speechToTextService';
import { audioRecorder } from '../../services/audioRecorderService';
import {
  synthesizeSpeech,
  playAudioUrl,
  stopActiveSpeech,
  speakBrowserFallback
} from '../../services/textToSpeechService';

export const AssistantChatInterface = ({
  farmerContext,
  initialQuery = '',
  activeSessionId = null,
  initialMessages = [],
  onSessionUpdated = null,
  onOpenMobileContext = null,
  onOpenMobileHistory = null
}) => {
  const { language, setLanguage, t } = useLanguage();

  const [messages, setMessages] = useState(initialMessages || []);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null); // { file, url, name }
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(''); // 'analyzing_image', 'detecting_crop', 'generating'
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [recognizedTextPreview, setRecognizedTextPreview] = useState('');
  const [playingMsgId, setPlayingMsgId] = useState(null);
  const [preparingMsgId, setPreparingMsgId] = useState(null);
  const [ttsErrorMsgId, setTtsErrorMsgId] = useState(null);
  const [msgAudioUrls, setMsgAudioUrls] = useState({});
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [voiceToast, setVoiceToast] = useState('');
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [showCropPickerMsgId, setShowCropPickerMsgId] = useState(null);
  const [autoVoiceEnabled, setAutoVoiceEnabled] = useState(false);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Sync messages & cleanup active audio when active session changes
  useEffect(() => {
    setMessages(initialMessages || []);
    stopActiveSpeech();
    setPlayingMsgId(null);
    setPreparingMsgId(null);
    setTtsErrorMsgId(null);

    // Cleanup cached object URLs to prevent browser memory leaks
    setMsgAudioUrls((prevUrls) => {
      Object.values(prevUrls).forEach((url) => {
        if (url && typeof url === 'string' && url.startsWith('blob:')) {
          try { URL.revokeObjectURL(url); } catch (e) {}
        }
      });
      return {};
    });
  }, [activeSessionId, initialMessages]);

  // Handle pre-filled initial query from URL search params
  useEffect(() => {
    if (initialQuery && initialQuery.trim() && messages.length === 0) {
      handleSendMessage(initialQuery.trim());
    }
  }, [initialQuery]);

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, loadingStage]);

  // Handle File attachment via 📎 button
  const handleFileAttach = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage({
          file,
          url: reader.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (textToSend = null, imageOverride = null, cropOverride = null, isFromVoiceInput = false) => {
    const text = textToSend !== null ? textToSend : inputText.trim();
    const activeImage = imageOverride || attachedImage;

    if (!text && !activeImage) return;

    // Reset input states
    if (textToSend === null) setInputText('');
    setAttachedImage(null);

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      image: activeImage?.url || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveActiveSessionMessages(newMessages);
    if (onSessionUpdated) onSessionUpdated();

    setIsLoading(true);

    if (activeImage) {
      setLoadingStage(language === 'gu' ? '🔍 ફોટો તપાસી રહ્યા છીએ...' : '🔍 Inspecting crop image...');
      await new Promise(r => setTimeout(r, 400));
      setLoadingStage(language === 'gu' ? '🌱 પાક ઓળખી રહ્યા છીએ...' : '🌱 Identifying crop species...');
      await new Promise(r => setTimeout(r, 400));
    } else {
      setLoadingStage(language === 'gu' ? '🌱 ખેતી સંબંધિત માહિતી શોધી રહ્યું છે...' : '🌱 Finding agricultural information...');
    }

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text || m.responseObj?.text || '',
        responseObj: m.responseObj || null
      })).filter(m => m.text);

      const responseObj = await getAssistantResponse(
        text,
        farmerContext,
        language,
        activeImage,
        cropOverride,
        historyPayload
      );

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        responseObj: responseObj || {
          type: 'general',
          text: language === 'gu' ? 'નમસ્તે! હું KisanGuard AI છું.' : 'Hello! I am KisanGuard AI.',
          bulletPoints: ['હવામાન, ખાતર કે પાક વિશે પૂછો.'],
          suggestions: ['📷 પાંદડાનો ફોટો તપાસો', '🌦️ આજનું હવામાન']
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedWithAi = [...newMessages, aiMsg];
      setMessages(updatedWithAi);
      saveActiveSessionMessages(updatedWithAi);
      if (onSessionUpdated) onSessionUpdated();

      // Automatic playback for voice input queries or when autoVoiceEnabled is active
      if ((isFromVoiceInput || autoVoiceEnabled) && aiMsg && aiMsg.responseObj && aiMsg.responseObj.text) {
        setTimeout(() => {
          handleSpeechClick(aiMsg.id, aiMsg.responseObj.text);
        }, 150);
      }
    } catch (e) {
      console.error("AI assistant error:", e);
      const fallbackMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        responseObj: {
          type: 'general',
          text: language === 'gu'
            ? 'નમસ્તે! તમારી ખેતી સંબંધિત મદદ માટે હું સક્રિય છું.'
            : 'Hello! I am ready to assist with your farm guidance.',
          bulletPoints: [
            language === 'gu' ? 'તમારો પ્રશ્ન ટાઇપ કરો અથવા ફોટો મોકલો.' : 'Type your question or send a photo.'
          ],
          actionSteps: [
            language === 'gu' ? '૧. કેમેરા બટનથી પાંદડાનો ફોટો મોકલો.' : '1. Upload a leaf photo via camera button.'
          ],
          suggestions: ['📷 પાંદડાનો ફોટો મોકલો', '🌦️ આજનું હવામાન']
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const updatedWithAi = [...newMessages, fallbackMsg];
      setMessages(updatedWithAi);
      saveActiveSessionMessages(updatedWithAi);
      if (onSessionUpdated) onSessionUpdated();
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  // Voice Interaction - Real Browser Recording & STT
  const stopAndTranscribe = async () => {
    setIsListening(false);
    setIsTranscribing(true);

    try {
      const recordResult = await audioRecorder.stopRecording();

      if (!recordResult.success) {
        setIsTranscribing(false);
        const errMsg = language === 'gu'
          ? (recordResult.messageGu || 'અવાજ રેકોર્ડ કરી શકાયો નથી. ફરી પ્રયાસ કરો.')
          : language === 'hi'
          ? (recordResult.messageHi || 'आवाज़ रिकॉर्ड नहीं की जा सकी। पुनः प्रयास करें।')
          : (recordResult.messageEn || 'Could not record audio. Please try again.');
        setSpeechError(errMsg);
        setTimeout(() => setSpeechError(''), 5000);
        return;
      }

      // Transcribe audio using backend STT endpoint
      const sttResult = await transcribeAudio(recordResult.blob, language);
      setIsTranscribing(false);

      if (sttResult.success && sttResult.text && sttResult.text.trim().length >= 2) {
        const transcribedText = sttResult.text.trim();
        setRecognizedTextPreview(transcribedText);
        setInputText(transcribedText);
        setTimeout(() => setRecognizedTextPreview(''), 7000);

        await handleSendMessage(transcribedText, null, null, true);
      } else {
        const errMsg = language === 'gu'
          ? 'તમારો અવાજ સમજાયો નથી. ફરી પ્રયાસ કરો.'
          : language === 'hi'
          ? 'आपकी आवाज़ समझ नहीं आई। कृपया पुनः प्रयास करें।'
          : 'Could not understand your voice. Please try speaking again.';
        setSpeechError(errMsg);
        setTimeout(() => setSpeechError(''), 5000);
      }
    } catch (err) {
      console.error('[Voice] Error in stopAndTranscribe:', err);
      setIsTranscribing(false);
      setIsListening(false);
      const errMsg = language === 'gu'
        ? 'તમારો અવાજ સમજવામાં સમસ્યા આવી. ફરી પ્રયાસ કરો.'
        : language === 'hi'
        ? 'आपकी आवाज़ समझने में समस्या आई। कृपया पुनः प्रयास करें।'
        : 'Problem understanding your audio. Please try again.';
      setSpeechError(errMsg);
      setTimeout(() => setSpeechError(''), 5000);
    }
  };

  const handleStopSpeech = () => {
    stopActiveSpeech();
    setPlayingMsgId(null);
    setPreparingMsgId(null);
  };

  const handleVoiceClick = async () => {
    setSpeechError('');

    if (playingMsgId) {
      handleStopSpeech();
    }

    if (isListening) {
      await stopAndTranscribe();
      return;
    }

    if (isTranscribing || isLoading) {
      return;
    }

    stopActiveSpeech();
    setPlayingMsgId(null);

    setIsListening(true);
    setVoiceToast(t('assistant.voiceToast') || (language === 'gu' ? 'માઇક્રોફોનમાં કુદરતી રીતે બોલો...' : 'Speak naturally into the microphone...'));

    const startResult = await audioRecorder.startRecording({
      onMaxDurationReached: () => {
        stopAndTranscribe();
      }
    });

    if (!startResult.success) {
      setIsListening(false);
      const errMsg = language === 'gu'
        ? (startResult.messageGu || 'માઇક્રોફોનની પરવાનગી જરૂરી છે.')
        : language === 'hi'
        ? (startResult.messageHi || 'माइक्रोफ़ोन की अनुमति आवश्यक है।')
        : (startResult.messageEn || 'Microphone permission is required.');
      setSpeechError(errMsg);
      setTimeout(() => setSpeechError(''), 5000);
    }
  };

  // Text-To-Speech Synthesis & Playback Handler
  const handleSpeechClick = async (msgId, textContent) => {
    if (!textContent || !textContent.trim()) return;

    if (playingMsgId === msgId) {
      stopActiveSpeech();
      setPlayingMsgId(null);
      setPreparingMsgId(null);
      return;
    }

    stopActiveSpeech();
    setPlayingMsgId(null);
    setPreparingMsgId(null);
    setTtsErrorMsgId(null);

    const cachedUrl = msgAudioUrls[msgId];
    if (cachedUrl) {
      playAudioUrl(cachedUrl, {
        onStart: () => setPlayingMsgId(msgId),
        onEnd: () => setPlayingMsgId(null),
        onError: () => fallbackBrowserSpeech(msgId, textContent)
      });
      return;
    }

    setPreparingMsgId(msgId);
    const res = await synthesizeSpeech(textContent, language);
    setPreparingMsgId(null);

    if (res.success && res.audioUrl) {
      setMsgAudioUrls((prev) => ({ ...prev, [msgId]: res.audioUrl }));
      playAudioUrl(res.audioUrl, {
        onStart: () => setPlayingMsgId(msgId),
        onEnd: () => setPlayingMsgId(null),
        onError: () => fallbackBrowserSpeech(msgId, textContent)
      });
    } else {
      fallbackBrowserSpeech(msgId, textContent);
    }
  };

  const fallbackBrowserSpeech = (msgId, textContent) => {
    speakBrowserFallback(textContent, language, {
      onStart: () => setPlayingMsgId(msgId),
      onEnd: () => setPlayingMsgId(null),
      onError: () => {
        setPlayingMsgId(null);
        setTtsErrorMsgId(msgId);
      }
    });
  };

  const welcomeTitle = language === 'gu'
    ? "Welcome, KISAN!"
    : language === 'hi'
    ? "Welcome, KISAN!"
    : "Welcome, KISAN!";

  const welcomeSub = language === 'gu'
    ? "આજે હું તમને કેવી રીતે મદદ કરી શકું?"
    : language === 'hi'
    ? "आज मैं आपकी कैसे मदद कर सकता हूँ?"
    : "How can I help you today?";

  return (
    <div className="flex-1 bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100 flex flex-col h-full overflow-hidden font-sans relative min-w-0">
      
      {/* 1. TOP HEADER & LANGUAGE SELECTOR (Image 1 Style) */}
      <div className="p-4 bg-emerald-800 text-white flex items-center justify-between shadow-md shrink-0 rounded-t-3xl">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold overflow-hidden border border-white/20 shadow-inner">
            <img src={kisanAvatar} alt="Kisan Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-base font-extrabold font-serif flex items-center gap-2">
              <span>KisanGuard AI</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                {language === 'gu' ? 'મદદ માટે તૈયાર' : language === 'hi' ? 'मदद के लिए तैयार' : 'Ready'}
              </span>
            </h2>
            <p className="text-[11px] text-emerald-200 font-medium">
              {language === 'gu' ? 'તમારો ખેતી સહાયક' : language === 'hi' ? 'आपका कृषि सहायक' : 'Your Farming Assistant'}
            </p>
          </div>
        </div>

        {/* Action Controls, Drawers Toggle & Language Selector */}
        <div className="flex items-center gap-2">
          
          {/* 📜 Chat History Drawer Button */}
          {onOpenMobileHistory && (
            <button
              onClick={onOpenMobileHistory}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              title="Open Chat History"
            >
              <span>📜</span>
              <span className="hidden sm:inline">{language === 'gu' ? 'ઈતિહાસ' : language === 'hi' ? 'इतिहास' : 'History'}</span>
            </button>
          )}

          {/* 🌾 Farm Details Drawer Button */}
          {onOpenMobileContext && (
            <button
              onClick={onOpenMobileContext}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
              title="Open Farm Details"
            >
              <Sprout className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">{language === 'gu' ? 'ખેતર વિગતો' : language === 'hi' ? 'खेत विवरण' : 'Farm Details'}</span>
            </button>
          )}

          {/* 🔊 Auto Voice Toggle Button (Image 1 Style) */}
          <button
            type="button"
            onClick={() => setAutoVoiceEnabled(!autoVoiceEnabled)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              autoVoiceEnabled
                ? 'bg-emerald-500 text-white border-emerald-400 shadow-md scale-105'
                : 'bg-white/10 text-emerald-100 hover:text-white border-white/20'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {autoVoiceEnabled
                ? (language === 'gu' ? 'ઓટો અવાજ: ચાલુ' : 'Auto Voice: ON')
                : (language === 'gu' ? 'ઓટો અવાજ: બંધ' : 'Auto Voice: OFF')}
            </span>
          </button>
        </div>

      </div>

      {/* Light Golden Banner (Image 1 Style) */}
      <div className="bg-[#FFF8E7] text-[#8C6D1F] px-4 py-2 text-xs font-extrabold text-center border-b border-[#F5E8C7] flex items-center justify-center gap-2 shadow-inner shrink-0">
        <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
        <span>
          {language === 'gu'
            ? '✨ માઇક્રોફોનમાં કુદરતી રીતે બોલો...'
            : language === 'hi'
            ? '✨ माइक्रोफ़ोन में प्राकृतिक रूप से बोलें...'
            : '✨ Speak naturally into the microphone...'}
        </span>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-gray-50/50">
        
        {/* Welcome State when history is empty (SETO Image 2 Style + Kisan Avatar Image 3) */}
        {messages.length === 0 && (
          <div className="max-w-xl mx-auto space-y-8 text-center py-8">
            
            {/* Centered Kisan Avatar Frame (Image 3) */}
            <div className="relative inline-block group">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-400 opacity-60 blur-md group-hover:opacity-100 transition-opacity animate-pulse" />
              <div className="relative w-28 h-28 rounded-full border-4 border-amber-800 shadow-2xl overflow-hidden bg-amber-50 mx-auto">
                <img src={kisanAvatar} alt="Kisan Avatar" className="w-full h-full object-cover scale-105" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight font-serif">
                {welcomeTitle}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-semibold">
                {welcomeSub}
              </p>
            </div>

            {/* Quick Action Suggestion Cards (SETO Image 2 Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-left">
              <button
                onClick={() => handleSendMessage(language === 'gu' ? 'મારા પાકમાં અત્યારે શું જોખમ છે?' : language === 'hi' ? 'मेरी फसल में क्या जोखिम है?' : 'What risks could affect my current crop?')}
                className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-amber-400 hover:shadow-lg transition-all text-xs text-gray-800 flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform">
                  ⚠️
                </div>
                <div>
                  <div className="font-extrabold text-sm text-gray-900">
                    {language === 'gu' ? 'પાક જોખમ તપાસો' : language === 'hi' ? 'फसल जोखिम जांचें' : 'Check Crop Risks'}
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {language === 'gu' ? 'હવામાન અને જીવાત સાવચેતી' : language === 'hi' ? 'मौसम और कीट चेतावनी' : 'Early warning system'}
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPhotoModalOpen(true)}
                className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-lg transition-all text-xs text-gray-800 flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform">
                  📷
                </div>
                <div>
                  <div className="font-extrabold text-sm text-gray-900">
                    {language === 'gu' ? 'પાક તપાસો' : 'Generate visual'}
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {language === 'gu' ? 'રોગ કે કીડાનો ફોટો મોકલો' : 'Create crop analysis instantly'}
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSendMessage(t('assistant.quickWeather'))}
                className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400 hover:shadow-lg transition-all text-xs text-gray-800 flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform">
                  🌦️
                </div>
                <div>
                  <div className="font-extrabold text-sm text-gray-900">
                    {language === 'gu' ? 'હવામાન આગાહી' : 'Explore forecast'}
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {language === 'gu' ? 'વરસાદ અને સિંચાઈ ગાઈડ' : 'Check local rainfall updates'}
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleSendMessage(language === 'gu' ? 'સરકાર તરફથી કઈ કઈ સબસીડી ખેડુત માટે મળે છે' : 'Government schemes for farmers')}
                className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all text-xs text-gray-800 flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg font-bold group-hover:scale-110 transition-transform">
                  💰
                </div>
                <div>
                  <div className="font-extrabold text-sm text-gray-900">
                    {language === 'gu' ? 'સરકારી સબસિડી' : 'Govt Subsidies'}
                  </div>
                  <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                    {language === 'gu' ? 'i-Khedut અને PM-Kisan' : 'i-Khedut and PM-Kisan schemes'}
                  </div>
                </div>
              </button>
            </div>

          </div>
        )}

        {/* Message History */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-sm overflow-hidden ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-forest-green to-deep-forest text-white'
                : 'bg-amber-50 border-2 border-emerald-500'
            }`}>
              {msg.role === 'user' ? (
                '👨‍🌾'
              ) : (
                <img src={kisanAvatar} alt="Kisan Avatar" className="w-full h-full object-cover" />
              )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[88%] sm:max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              
              {/* User Bubble */}
              {msg.role === 'user' && (
                <div className="bg-forest-green text-white p-4 rounded-3xl text-xs sm:text-sm font-medium shadow-sm leading-relaxed space-y-2">
                  {msg.image && (
                    <div className="rounded-2xl overflow-hidden max-w-sm border-2 border-white/30 shadow-md">
                      <img src={msg.image} alt="Uploaded crop photo" className="w-full h-auto object-cover max-h-64" />
                    </div>
                  )}
                  {msg.text && (
                    <div>{msg.text}</div>
                  )}
                </div>
              )}

              {/* AI Response Bubble */}
              {msg.role === 'assistant' && msg.responseObj && (
                <div className="bg-white border border-gray-200 p-5 rounded-3xl shadow-lg space-y-4 text-xs sm:text-sm text-gray-800 relative overflow-hidden">
                  
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-[11px] font-bold text-forest-green uppercase tracking-wider flex items-center gap-1.5">
                      <Sprout className="w-4 h-4 text-emerald-600" />
                      <span>KisanGuard AI {msg.responseObj.type === 'photo_vision' ? '• Multimodal Vision' : ''}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => handleSpeechClick(msg.id, msg.responseObj.text)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                        playingMsgId === msg.id
                          ? 'bg-emerald-600 text-white animate-pulse shadow-md'
                          : preparingMsgId === msg.id
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-800'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>
                        {playingMsgId === msg.id
                          ? (language === 'gu' ? '🔊 બોલી રહ્યા છીએ...' : '🔊 Speaking...')
                          : (t('assistant.listenVoice') || '🔊 Listen')}
                      </span>
                    </button>
                  </div>

                  {/* MULTIMODAL VISION & CROP HEALTH CARD (STEP 13) */}
                  {msg.responseObj.type === 'photo_vision' && msg.responseObj.visionData && (
                    <div className="space-y-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-left">
                      {msg.responseObj.visionData.status === 'analyzed' && msg.responseObj.visionData.crop ? (
                        <div className="space-y-3">
                          {/* Crop Identified Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm gap-2">
                            <div>
                              <span className="text-[10px] uppercase tracking-wider text-emerald-600 font-extrabold flex items-center gap-1">
                                🌱 પાક ઓળખાયો (Crop Identified)
                              </span>
                              <div className="font-black text-base text-emerald-900 font-serif">
                                {msg.responseObj.visionData.crop.nameGu || msg.responseObj.visionData.crop.nameEn} ({msg.responseObj.visionData.crop.nameEn})
                              </div>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs self-start sm:self-auto">
                              Confidence: {msg.responseObj.visionData.crop.confidenceLabel || 'High'}
                            </span>
                          </div>

                          {/* Visual Observations */}
                          {/* Visual Observations */}
                          {msg.responseObj.visionData.observations && msg.responseObj.visionData.observations.length > 0 && (
                            <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1.5 shadow-sm">
                              <div className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                                🔎 <span>{language === 'gu' ? 'દ્રશ્ય નિરીક્ષણ:' : language === 'hi' ? 'दृश्य निरीक्षण:' : 'Visible Observations:'}</span>
                              </div>
                              <ul className="space-y-1 pl-1">
                                {msg.responseObj.visionData.observations.map((obs, idx) => (
                                  <li key={idx} className="text-xs text-gray-800 flex items-start gap-1.5 font-medium">
                                    <span className="text-emerald-600 font-bold">•</span>
                                    <span>{obs}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Possible Causes (RAG Integrated) */}
                          {msg.responseObj.visionData.possibleCauses && msg.responseObj.visionData.possibleCauses.length > 0 && (
                            <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1.5 shadow-sm">
                              <div className="font-extrabold text-xs text-amber-900 flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  💡 <span>{language === 'gu' ? 'સંભવિત કારણો:' : language === 'hi' ? 'संभावित कारण:' : 'Possible Causes:'}</span>
                                </span>
                                {msg.responseObj.visionData.ragKnowledgeFound && (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                                    📚 RAG Verified
                                  </span>
                                )}
                              </div>
                              <ul className="space-y-1 pl-1">
                                {msg.responseObj.visionData.possibleCauses.map((cause, idx) => (
                                  <li key={idx} className="text-xs text-gray-800 flex items-start gap-1.5 font-medium">
                                    <span className="text-amber-600 font-bold">•</span>
                                    <span>{typeof cause === 'string' ? cause : (cause.name || cause.issue)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* What Farmer Should Check */}
                          {msg.responseObj.visionData.whatToCheck && msg.responseObj.visionData.whatToCheck.length > 0 && (
                            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 space-y-1.5 shadow-sm">
                              <div className="font-extrabold text-xs text-amber-950 flex items-center gap-1.5">
                                🔍 <span>{language === 'gu' ? 'તમે શું ચકાસી શકો:' : language === 'hi' ? 'आप क्या जांच सकते हैं:' : 'What You Should Check:'}</span>
                              </div>
                              <ul className="space-y-1 pl-1">
                                {msg.responseObj.visionData.whatToCheck.map((chk, idx) => (
                                  <li key={idx} className="text-xs text-amber-900 flex items-start gap-1.5 font-medium">
                                    <span className="text-amber-700 font-bold">•</span>
                                    <span>{chk}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Practical Next Steps */}
                          {((language === 'gu' ? msg.responseObj.visionData.actionStepsGu : (msg.responseObj.visionData.actionStepsEn || msg.responseObj.visionData.actionStepsGu)) || []).length > 0 && (
                            <div className="bg-white p-3 rounded-xl border border-emerald-100 space-y-1.5 shadow-sm">
                              <div className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                                📋 <span>{language === 'gu' ? 'વ્યવહારુ સાવચેતીના પગલાં:' : language === 'hi' ? 'व्यावहारिक सावधानी के कदम:' : 'Safe Next Steps:'}</span>
                              </div>
                              <ul className="space-y-1 pl-1">
                                {(language === 'gu' ? msg.responseObj.visionData.actionStepsGu : (msg.responseObj.visionData.actionStepsEn || msg.responseObj.visionData.actionStepsGu)).map((act, idx) => (
                                  <li key={idx} className="text-xs text-gray-800 flex items-start gap-1.5 font-medium">
                                    <span className="text-emerald-600 font-bold">•</span>
                                    <span>{act}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Safety Disclaimer */}
                          <div className="text-[10px] text-gray-500 italic pt-1 border-t border-emerald-200 font-medium">
                            {language === 'gu'
                              ? (msg.responseObj.visionData.disclaimerGu || '📌 આ AI-આધારિત દ્રશ્ય વિશ્લેષણ છે, જે રોગની ચોક્કસ ખાતરી નથી.')
                              : language === 'hi'
                              ? (msg.responseObj.visionData.disclaimerHi || '📌 यह AI-आधारित दृश्य विश्लेषण है, जो रोग की गारंटीकृत पुष्टि नहीं है।')
                              : (msg.responseObj.visionData.disclaimerEn || '📌 This is an AI-based visual analysis and does not constitute a guaranteed diagnosis.')}
                          </div>
                        </div>
                      ) : (
                        /* Unclear Photo / Crop Confirmation Prompt */
                        <div className="space-y-3 bg-white p-4 rounded-xl border border-amber-300">
                          <div className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{language === 'gu' ? 'પાક સ્પષ્ટ રીતે ઓળખાયો નથી' : 'Could not identify crop clearly'}</span>
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed font-medium">
                            {language === 'gu' ? 'કૃપા કરીને નીચે આપેલા પાકની પસંદગી કરો અથવા વધુ નજીકથી સ્પષ્ટ ફોટો લો:' : 'Please select your crop below or take a clearer close-up leaf photo:'}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {['Cotton / કપાસ', 'Groundnut / મગફળી', 'Wheat / ઘઉં', 'Rice / ડાંગર', 'Tomato / ટમેટા', 'Chilli / મરચાં', 'Maize / મકાઈ'].map((cOpt, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={() => handleSendMessage(`આ પાક ${cOpt.split('/')[0].trim()} છે, આનો ઈલાજ અને ચકાસણી જણાવો.`)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                              >
                                🌱 {cOpt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* REAL-TIME WEATHER WIDGET CARD */}
                  {msg.responseObj.weatherData && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-md space-y-3 my-2">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌦️</span>
                          <div>
                            <div className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
                              {msg.responseObj.weatherData.location?.name || 'Anand, Gujarat'}
                            </div>
                            <div className="text-[10px] text-emerald-300/80 font-mono">
                              Live • {msg.responseObj.weatherData.retrievedAt}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-amber-300 font-serif">
                            {msg.responseObj.weatherData.current?.temperature}°C
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CROP RECOMMENDATION CARD */}
                  {msg.responseObj.recommendationData && msg.responseObj.recommendationData.recommendedCrops && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3 my-2">
                      <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                        <div className="font-extrabold text-xs text-forest-green flex items-center gap-1.5 uppercase tracking-wide">
                          <Sprout className="w-4 h-4 text-leaf-green" />
                          <span>🌱 વિચારવા યોગ્ય પાકની ભલામણ (Personalized Crop Options)</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {msg.responseObj.recommendationData.farmerContextSummary?.season || 'RABI'} Season
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.responseObj.recommendationData.recommendedCrops.map((rec, idx) => (
                          <div key={idx} className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-sm space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-sm text-deep-forest flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span>{rec.cropNameGu || rec.cropName} ({rec.cropName})</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                rec.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                Risk: {rec.riskLevel || 'Low'}
                              </span>
                            </div>

                            {/* Details grid */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] text-earth-brown bg-warm-cream/30 p-2 rounded-lg border border-forest-green/10">
                              <div>
                                💧 {language === 'gu' ? 'પાણીની જરૂરિયાત:' : language === 'hi' ? 'पानी की आवश्यकता:' : 'Water Need:'}{' '}
                                <strong>{language === 'gu' ? (rec.waterRequirementGu || rec.waterRequirement || 'મધ્યમ') : language === 'hi' ? (rec.waterRequirementHi || rec.waterRequirement || 'मध्यम') : (rec.waterRequirement || 'Medium')}</strong>
                              </div>
                              <div>
                                🌱 {language === 'gu' ? 'માટી:' : language === 'hi' ? 'मिट्टी:' : 'Soil:'}{' '}
                                <strong>{rec.idealSoil || (language === 'gu' ? 'ગોરાડુ / કાળી જમીન' : language === 'hi' ? 'दोमट / काली मिट्टी' : 'Loamy / Black Soil')}</strong>
                              </div>
                            </div>

                            {/* Market price */}
                            {rec.currentMarketPrice && (
                              <div className="text-[11px] text-forest-green bg-emerald-50 p-2 rounded-lg font-medium">
                                💰 <strong>{language === 'gu' ? 'બજાર ભાવ:' : language === 'hi' ? 'मंडी भाव:' : 'Market Price:'}</strong> {rec.currentMarketPrice.formattedPrice}
                              </div>
                            )}

                            {/* Government scheme */}
                            {rec.relevantGovernmentScheme && (
                              <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg font-medium">
                                🏛️ <strong>{language === 'gu' ? 'સરકારી સહાય:' : language === 'hi' ? 'सरकारी सहायता:' : 'Govt Scheme:'}</strong> {rec.relevantGovernmentScheme.schemeName}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {msg.responseObj.recommendationData.zeroHallucinationDisclaimer && (
                        <div className="text-[10px] text-earth-brown/80 italic pt-1 border-t border-emerald-200">
                          {typeof msg.responseObj.recommendationData.zeroHallucinationDisclaimer === 'object'
                            ? (msg.responseObj.recommendationData.zeroHallucinationDisclaimer[language] || msg.responseObj.recommendationData.zeroHallucinationDisclaimer.gu || msg.responseObj.recommendationData.zeroHallucinationDisclaimer.en)
                            : msg.responseObj.recommendationData.zeroHallucinationDisclaimer}
                        </div>
                      )}
                    </div>
                  )}

                  {/* CROP RISK ALERT CARD (STEP 12) */}
                  {msg.responseObj.riskData && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-300 shadow-md space-y-3.5 my-2 text-left">
                      {msg.responseObj.riskData.missingCurrentCrop ? (
                        <div className="space-y-3">
                          <div className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
                            <span className="text-base">⚠️</span>
                            <span>
                              {language === 'gu'
                                ? (msg.responseObj.riskData.promptQuestionGu || 'તમારો હાલનો પાક કયો છે?')
                                : language === 'hi'
                                ? (msg.responseObj.riskData.promptQuestionHi || 'आपकी वर्तमान फसल कौन सी है?')
                                : (msg.responseObj.riskData.promptQuestionEn || 'What is your current crop?')}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {['Cotton / કપાસ', 'Groundnut / મગફળી', 'Wheat / ઘઉં', 'Rice / ડાંગર', 'Maize / મકાઈ', 'Tomato / ટમેટા'].map((cropOpt, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSendMessage(cropOpt.split('/')[0].trim())}
                                className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-600 hover:text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                              >
                                🌱 {cropOpt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                            <div>
                              <div className="font-black text-sm text-amber-950 flex items-center gap-2 tracking-tight">
                                <span className="text-base">⚠️</span>
                                <span>
                                  {language === 'gu'
                                    ? 'પાક જોખમ અને પૂર્વ ચેતવણી એલર્ટ'
                                    : language === 'hi'
                                    ? 'फसल जोखिम एवं पूर्व चेतावनी अलर्ट'
                                    : 'Crop Risk & Early Warning Alert'}
                                </span>
                              </div>
                              <div className="text-[11px] text-amber-800 font-medium mt-0.5 flex items-center gap-2">
                                <span>🌱 {language === 'gu' ? 'પાક:' : language === 'hi' ? 'फसल:' : 'Crop:'} <strong>{msg.responseObj.riskData.cropName}</strong></span>
                                <span>•</span>
                                <span>📍 {language === 'gu' ? 'સ્થળ:' : language === 'hi' ? 'स्थान:' : 'Location:'} <strong>{msg.responseObj.riskData.location}</strong></span>
                              </div>
                            </div>
                            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-amber-200/90 text-amber-900 border border-amber-300">
                              {msg.responseObj.riskData.risksCount || 0} {language === 'gu' ? 'જોખમ' : language === 'hi' ? 'जोखिम' : 'Risks'}
                            </span>
                          </div>

                          <div className="space-y-3">
                            {(msg.responseObj.riskData.risks || []).map((risk, rIdx) => (
                              <div key={rIdx} className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                                    <span>{language === 'gu' ? (risk.titleGu || risk.titleEn) : (risk.titleEn || risk.titleGu)}</span>
                                  </div>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    risk.severity === 'High'
                                      ? 'bg-red-100 text-red-700 border border-red-200'
                                      : risk.severity === 'Moderate'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  }`}>
                                    {risk.severity || 'Moderate'} {language === 'gu' ? 'જોખમ' : language === 'hi' ? 'जोखिम' : 'Risk'}
                                  </span>
                                </div>

                                <div className="text-xs space-y-1.5 bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                                  {risk.evidence && (
                                    <div className="text-amber-950 font-semibold">
                                      🌦️ <strong>{language === 'gu' ? 'ડેટા:' : language === 'hi' ? 'डेटा:' : 'Data:'}</strong> {risk.evidence}
                                    </div>
                                  )}
                                  {risk.whyItMatters && (
                                    <div className="text-gray-700 font-medium">
                                      🔍 <strong>{language === 'gu' ? 'અસર:' : language === 'hi' ? 'प्रभाव:' : 'Impact:'}</strong> {risk.whyItMatters}
                                    </div>
                                  )}
                                </div>

                                {((language === 'gu' ? risk.actionsGu : (risk.actionsEn || risk.actionsGu)) || []).length > 0 && (
                                  <div className="space-y-1 pt-1">
                                    <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                                      💡 <strong>{language === 'gu' ? 'તમે શું કરી શકો (સાવચેતીના પગલાં):' : language === 'hi' ? 'आप क्या कर सकते हैं (सावधानी के कदम):' : 'Recommended Actions:'}</strong>
                                    </div>
                                    <ul className="space-y-1 pl-1">
                                      {(language === 'gu' ? risk.actionsGu : (risk.actionsEn || risk.actionsGu)).map((act, aIdx) => (
                                        <li key={aIdx} className="text-xs text-gray-800 flex items-start gap-1.5">
                                          <span className="text-emerald-600 font-bold">•</span>
                                          <span>{act}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {risk.uncertaintyNote && (
                                  <div className="text-[10px] text-amber-800/90 italic pt-1 border-t border-amber-100 font-medium">
                                    📌 {risk.uncertaintyNote}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {msg.responseObj.riskData.disclaimer && (
                            <div className="text-[10px] text-amber-900/80 italic font-medium pt-1 border-t border-amber-200">
                              {msg.responseObj.riskData.disclaimer}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Response Text (Formatted without raw asterisks) */}
                  <FormattedText text={msg.responseObj.text} className="text-gray-900 font-medium text-sm leading-relaxed" />

                  {/* Bullet Points */}
                  {msg.responseObj.bulletPoints && msg.responseObj.bulletPoints.length > 0 && (
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60 space-y-2">
                      {msg.responseObj.bulletPoints.map((bp, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs font-medium text-gray-800">
                          <span className="text-emerald-600 font-bold text-sm leading-none">•</span>
                          <FormattedText text={bp} className="text-xs text-gray-800" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommended Action Steps (Matching Image 1 Numbered Badges) */}
                  {msg.responseObj.actionSteps && msg.responseObj.actionSteps.length > 0 && (
                    <div className="space-y-2.5 pt-2">
                      <div className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Recommended Actions:</span>
                      </div>
                      <div className="space-y-2">
                        {msg.responseObj.actionSteps.map((step, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-gray-200 hover:border-emerald-300 shadow-sm transition-all"
                          >
                            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                              {idx + 1}
                            </span>
                            <FormattedText text={step} className="flex-1 text-xs sm:text-sm font-medium text-gray-800 leading-relaxed" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safety Disclaimer */}
                  {msg.responseObj.disclaimer && (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 font-medium leading-relaxed">
                      <FormattedText text={msg.responseObj.disclaimer} />
                    </div>
                  )}

                  {/* Suggestions Chips */}
                  {msg.responseObj.suggestions && msg.responseObj.suggestions.length > 0 && (
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="text-[11px] font-bold text-gray-400">Would you like to know more?</div>
                      <div className="flex flex-wrap gap-2">
                        {msg.responseObj.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              if (sug.includes('📷') || sug.toLowerCase().includes('photo') || sug.includes('ફોટો') || sug.includes('फोटो')) {
                                setPhotoModalOpen(true);
                              } else {
                                handleSendMessage(sug);
                              }
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-emerald-600 hover:text-white text-emerald-800 text-xs font-bold transition-all border border-gray-200 hover:scale-105 shadow-sm cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}

              <div className="text-[10px] text-gray-400 px-2 font-mono">
                {msg.timestamp}
              </div>

            </div>
          </div>
        ))}

        {/* 3. AI THINKING STATE WITH KISAN AVATAR (Image 3) */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 my-4"
          >
            {/* Animated Kisan Avatar Container */}
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 via-amber-400 to-teal-500 opacity-80 blur animate-pulse" />
              <div className="relative w-12 h-12 rounded-2xl border-2 border-amber-800 shadow-xl overflow-hidden bg-amber-50">
                <img src={kisanAvatar} alt="Kisan AI Thinking" className="w-full h-full object-cover scale-110" />
              </div>
            </div>

            {/* Thinking Box */}
            <div className="bg-white border-2 border-emerald-400/50 p-4 rounded-3xl shadow-xl max-w-md space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                <span>KisanGuard AI</span>
                <span className="flex items-center gap-1 text-emerald-600 font-mono text-[10px] ml-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
              <p className="text-xs font-extrabold text-gray-800 font-serif tracking-wide">
                {loadingStage || (language === 'gu' ? 'કિસાનગાર્ડ વિચાર કરી રહ્યું છે...' : language === 'hi' ? 'किसानगार्ड विचार कर रहा है...' : 'KisanGuard AI is thinking...')}
              </p>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* 4. CHATGPT/SETO STYLE COMPOSER INPUT BAR (Image 1 & 2 Style) */}
      <div className="p-4 bg-white border-t border-gray-100 space-y-2 shrink-0 rounded-b-3xl">
        
        {/* VOICE RECORDING STATUS BANNERS */}
        <AnimatePresence>
          {playingMsgId && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex items-center justify-between bg-emerald-700 text-white px-4 py-2 rounded-2xl shadow-md"
            >
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 animate-pulse text-amber-300" />
                <span className="text-xs font-bold">
                  {language === 'gu' ? '🔊 બોલી રહ્યું છે...' : '🔊 Speaking response...'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleStopSpeech}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {language === 'gu' ? 'રોકો' : 'Stop'}
              </button>
            </motion.div>
          )}

          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex items-center justify-between bg-red-50 border border-red-300 px-4 py-2 rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                </span>
                <span className="text-xs font-bold text-red-700">
                  🔴 {language === 'gu' ? 'સાંભળી રહ્યું છે...' : 'Listening...'}
                </span>
              </div>
              <button
                type="button"
                onClick={stopAndTranscribe}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                ⏹️ {language === 'gu' ? 'પૂર્ણ કરો' : 'Done'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ATTACHED IMAGE PREVIEW */}
        {attachedImage && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl max-w-xs">
            <div className="flex items-center gap-2 truncate">
              <img src={attachedImage.url} alt="Attached preview" className="w-7 h-7 object-cover rounded-md" />
              <span className="text-xs font-bold text-emerald-800 truncate font-mono">{attachedImage.name}</span>
            </div>
            <button onClick={() => setAttachedImage(null)} className="p-1 text-gray-500 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Form Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-inner"
        >
          {/* 📎 Attach Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileAttach}
              className="hidden"
            />
          </button>

          {/* 📷 Camera Button */}
          <button
            type="button"
            onClick={() => setPhotoModalOpen(true)}
            className="p-2.5 rounded-xl text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
            title="Camera upload"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={
              isListening
                ? (language === 'gu' ? "🎤 અવાજ રેકોર્ડ થઈ રહ્યો છે..." : "🎤 Listening...")
                : attachedImage
                ? "Type question about this image..."
                : (language === 'gu' ? 'સરકાર તરફથી કઈ કઈ સબસીડી ખેડુત માટે મળે છે' : t('assistant.inputPlaceholder'))
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3 py-2 outline-none text-xs sm:text-sm bg-transparent font-medium text-gray-900 placeholder:text-gray-400"
          />

          {/* 🎙️ Voice Button */}
          <button
            type="button"
            onClick={handleVoiceClick}
            disabled={isTranscribing}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* ➤ Send Button (Image 1 & SETO style) */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !attachedImage) || isListening || isTranscribing}
            className={`p-2.5 rounded-xl font-bold transition-all shadow-md ${
              (inputText.trim() || attachedImage) && !isListening && !isTranscribing
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <p className="text-[10px] text-gray-400 text-center leading-tight font-medium pt-1">
          "કિસાનગાર્ડ એઆઈ સામાન્ય માર્ગદર્શન આપે છે. મહત્વના નિર્ણયો માટે સ્થાનિક કૃષિ નિષ્ણાતની સલાહ લેવી."
        </p>

      </div>

      {/* Crop Photo Preview Modal */}
      <CropPhotoPreviewModal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        onSendPhoto={(photoData) => handleSendMessage('', photoData)}
      />

    </div>
  );
};

export default AssistantChatInterface;


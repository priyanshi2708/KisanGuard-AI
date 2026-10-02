import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Mic, Camera, Send, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AiAssistantWidget = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      navigate('/assistant');
      return;
    }
    navigate(`/assistant?q=${encodeURIComponent(inputVal.trim())}`);
  };

  const handleQuickClick = (queryText) => {
    navigate(`/assistant?q=${encodeURIComponent(queryText)}`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-5 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-leaf-green to-forest-green text-white flex items-center justify-center shadow">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
              <span>🤖 {t('assistant.headerTitle')}</span>
            </h2>
            <p className="text-xs text-earth-brown font-medium">{t('assistant.headerSub')}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/assistant')}
          className="text-xs font-bold text-forest-green bg-light-leaf/60 hover:bg-light-leaf px-3 py-1.5 rounded-full transition-colors"
        >
          {t('assistant.statusReady')} →
        </button>
      </div>

      {/* Preview Suggestions */}
      <div className="space-y-2 pt-1">
        <div className="text-[11px] font-bold text-earth-brown uppercase tracking-wider">
          Quick Questions for KisanGuard AI:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => handleQuickClick(t('assistant.quickWeather'))}
            className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/10 hover:border-forest-green text-left font-bold text-deep-forest hover:bg-warm-cream transition-all"
          >
            {t('assistant.quickWeather')}
          </button>
          <button
            onClick={() => handleQuickClick(t('assistant.quickCrop'))}
            className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/10 hover:border-forest-green text-left font-bold text-deep-forest hover:bg-warm-cream transition-all"
          >
            {t('assistant.quickCrop')}
          </button>
        </div>
      </div>

      {/* Buttons & Input */}
      <form onSubmit={handleSend} className="space-y-3 pt-2 border-t border-forest-green/10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/assistant')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-forest-green/10 text-forest-green hover:bg-forest-green hover:text-white transition-colors text-xs font-bold"
          >
            <Mic className="w-4 h-4 text-leaf-green" />
            <span>{t('assistant.btnVoice')}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/assistant')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-forest-green/10 text-forest-green hover:bg-forest-green hover:text-white transition-colors text-xs font-bold"
          >
            <Camera className="w-4 h-4 text-forest-green" />
            <span>{t('assistant.btnPhoto')}</span>
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={t('assistant.inputPlaceholder')}
            className="flex-1 bg-warm-cream/60 border border-forest-green/20 rounded-xl px-3.5 py-2.5 text-xs text-deep-forest focus:outline-none focus:border-leaf-green"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-forest-green text-white font-bold text-xs hover:bg-deep-forest transition-colors flex items-center gap-1 shadow"
          >
            <span>{t('assistant.btnSend')}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

    </div>
  );
};

export default AiAssistantWidget;

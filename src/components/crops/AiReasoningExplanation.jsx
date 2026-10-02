import React from 'react';
import { Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const AiReasoningExplanation = ({ selectedCrop }) => {
  const { language } = useLanguage();

  if (!selectedCrop) return null;

  const cropName = language === 'gu' ? (selectedCrop.gujaratiName || selectedCrop.name) : selectedCrop.name;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/15 space-y-4 font-sans text-left">
      <div className="flex items-center gap-3 border-b border-forest-green/10 pb-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-leaf-green to-forest-green text-white flex items-center justify-center font-bold shrink-0">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
            <span>🤖 {language === 'gu' ? `કિસાનગાર્ડ AI શા માટે ${cropName} ની ભલામણ કરે છે?` : `WHY KISANGUARD SUGGESTS ${selectedCrop.name.toUpperCase()}`}</span>
          </h2>
          <p className="text-xs text-earth-brown font-medium">
            {language === 'gu'
              ? 'તમારા સ્થાનિક પેરામીટર્સ અને આયોજન લક્ષ્યોના આધારે ચોક્કસ નિર્ણય પૃથક્કરણ'
              : 'Conversational decision explanation based on your parameters'}
          </p>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-warm-cream/60 border border-forest-green/15 space-y-3 text-xs sm:text-sm text-deep-forest leading-relaxed font-medium">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-leaf-green flex-shrink-0 mt-0.5" />
          <span>
            {language === 'gu'
              ? '"તમે ઓછા પાણીનો વપરાશ અને વધુ નફો મેળવવાનું મુખ્ય લક્ષ્ય પસંદ કર્યું છે."'
              : '"You selected lower water usage and high profitability as important goals."'}
          </span>
        </div>

        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-leaf-green flex-shrink-0 mt-0.5" />
          <span>
            {language === 'gu'
              ? '"આણંદ જિલ્લામાં તમારા ખેતરમાં મધ્યમ સિંચાઈ ક્ષમતા છે."'
              : '"Your farm in Anand district has medium water availability."'}
          </span>
        </div>

        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-leaf-green flex-shrink-0 mt-0.5" />
          <span>
            {language === 'gu'
              ? `"આગામી વાવણી સીઝન ${cropName} ના વાવેતર માટે સંપૂર્ણ અનુકૂળ છે."`
              : `"The upcoming season is optimal for sowing ${selectedCrop.name} (${selectedCrop.gujaratiName})."`}
          </span>
        </div>

        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-leaf-green flex-shrink-0 mt-0.5" />
          <span>
            {language === 'gu'
              ? `"અગાઉ કપાસમાં વધારે ખર્ચ થવાથી, હવે ${cropName} પસંદ કરવાથી જમીનમાં નાઇટ્રોજન વધશે અને પાણીનો ખર્ચ ઘટશે."`
              : `"Your previous season had higher cotton input costs; choosing ${selectedCrop.name} helps restore nitrogen levels while lowering irrigation costs."`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AiReasoningExplanation;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, CloudSun, Droplets, Sprout, Calendar, CircleDollarSign, ShieldAlert, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CropDetailDrawer = ({ crop, isOpen, onClose }) => {
  const { language } = useLanguage();

  if (!isOpen || !crop) return null;

  const handleAudioSpeak = () => {
    alert(`🔊 પાક વિગત: ${crop.gujaratiName || crop.name} (${crop.name}). ${crop.whyRecommendKey || 'યોગ્યતા સ્કોર ' + crop.suitabilityScore + '%'}`);
  };

  const cropTitle = language === 'gu' ? (crop.gujaratiName || crop.name) : crop.name;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-soil-dark/70 backdrop-blur-sm font-sans text-left">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-warm-cream rounded-3xl p-6 sm:p-8 max-w-2xl w-full border-2 border-forest-green/20 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest-green text-white flex items-center justify-center font-bold shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
                  {cropTitle} <span className="text-xs sm:text-sm text-forest-green font-normal">({crop.name})</span>
                </h3>
                <span className="text-xs font-bold text-forest-green bg-light-leaf/60 px-2.5 py-0.5 rounded-full">
                  {language === 'gu' ? `યોગ્યતા સ્કોર: ${crop.suitabilityScore}%` : `Suitability Score: ${crop.suitabilityScore}%`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAudioSpeak}
                className="p-2 rounded-full bg-white border border-forest-green/20 text-forest-green hover:bg-forest-green hover:text-white transition-colors cursor-pointer"
                title="Audio Advisory"
              >
                <Volume2 className="w-5 h-5 text-leaf-green" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white border border-forest-green/20 text-deep-forest hover:bg-light-leaf/40 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Key Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold">
            <div className="p-3 rounded-2xl bg-white border border-forest-green/10 space-y-1">
              <div className="flex items-center gap-1 text-forest-green uppercase font-bold">
                <CloudSun className="w-3.5 h-3.5 text-golden-wheat shrink-0" />
                <span>{language === 'gu' ? 'હવામાન' : 'Weather'}</span>
              </div>
              <div className="text-deep-forest">{crop.weatherSuitability || (language === 'gu' ? 'અનુકૂળ' : 'Suitable')}</div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-forest-green/10 space-y-1">
              <div className="flex items-center gap-1 text-forest-green uppercase font-bold">
                <Droplets className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>{language === 'gu' ? 'સિંચાઈ જરૂરિયાત' : 'Water Req'}</span>
              </div>
              <div className="text-deep-forest">{crop.waterRequirement}</div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-forest-green/10 space-y-1">
              <div className="flex items-center gap-1 text-forest-green uppercase font-bold">
                <Sprout className="w-3.5 h-3.5 text-leaf-green shrink-0" />
                <span>{language === 'gu' ? 'જમીન અનુકૂળતા' : 'Soil Needed'}</span>
              </div>
              <div className="text-deep-forest">{crop.soilRequirement || (language === 'gu' ? 'ગોરાડુ / કાળી જમીન' : 'Loam Soil')}</div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-forest-green/10 space-y-1">
              <div className="flex items-center gap-1 text-forest-green uppercase font-bold">
                <Calendar className="w-3.5 h-3.5 text-forest-green shrink-0" />
                <span>{language === 'gu' ? 'પાક સમયગાળો' : 'Growth Period'}</span>
              </div>
              <div className="text-deep-forest font-serif text-sm font-bold">{crop.growthPeriodDays} {language === 'gu' ? 'દિવસ' : 'Days'}</div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-forest-green/10 space-y-1">
              <div className="flex items-center gap-1 text-forest-green uppercase font-bold">
                <Calendar className="w-3.5 h-3.5 text-forest-green shrink-0" />
                <span>{language === 'gu' ? 'લણણી સમય' : 'Harvest Time'}</span>
              </div>
              <div className="text-deep-forest font-bold">{crop.expectedHarvestPeriod || (language === 'gu' ? 'નવેમ્બર' : 'Nov')}</div>
            </div>

            <div className="p-3 rounded-2xl bg-white border border-forest-green/10 space-y-1">
              <div className="flex items-center gap-1 text-forest-green uppercase font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{language === 'gu' ? 'જોખમ સ્તર' : 'Risk Level'}</span>
              </div>
              <div className="text-emerald-700 font-bold">{crop.risk}</div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="p-4 rounded-2xl bg-white border border-forest-green/15 space-y-2">
            <h4 className="font-bold font-serif text-sm text-deep-forest flex items-center gap-1.5">
              <CircleDollarSign className="w-4 h-4 text-forest-green" />
              <span>{language === 'gu' ? 'અંદાજિત નાણાકીય હિસાબ (પ્રતિ એકર)' : 'Estimated Financial Returns (Per Acre)'}</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
              <div className="p-2.5 rounded-xl bg-warm-cream">
                <div className="text-[10px] text-earth-brown font-sans font-medium">{language === 'gu' ? 'વાવણી ખર્ચ' : 'Input Cost'}</div>
                <div>₹{crop.estimatedCost?.toLocaleString()}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-warm-cream">
                <div className="text-[10px] text-earth-brown font-sans font-medium">{language === 'gu' ? 'કુલ આવક' : 'Est. Revenue'}</div>
                <div className="text-forest-green">₹{crop.estimatedRevenue?.toLocaleString()}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-forest-green text-white">
                <div className="text-[10px] text-light-leaf font-sans font-medium">{language === 'gu' ? 'ચોખ્ખો નફો' : 'Est. Net Profit'}</div>
                <div>₹{crop.estimatedProfit?.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Conversational Explanation */}
          <div className="p-4 rounded-2xl bg-light-leaf/40 border border-leaf-green/30 space-y-2 text-xs">
            <h4 className="font-bold font-serif text-deep-forest text-sm flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-golden-wheat" />
              <span>{language === 'gu' ? 'કિસાનગાર્ડ AI ની સલાહ' : 'Why KisanGuard Recommends This'}</span>
            </h4>
            <p className="text-earth-brown leading-relaxed font-medium">
              "{crop.whyRecommendKey || crop.aiExplanation || (language === 'gu' ? 'ઓછા સિંચાઈ પાણી અને વધુ નફાકારકતા માટે તમારા ખેતર માટે ઉત્તમ વિકલ્પ.' : 'Optimal crop for your soil and water availability.')}"
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-forest-green text-white font-bold text-xs hover:bg-deep-forest transition-colors cursor-pointer shadow"
            >
              {language === 'gu' ? 'વિગતો બંધ કરો' : 'Close Details'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CropDetailDrawer;

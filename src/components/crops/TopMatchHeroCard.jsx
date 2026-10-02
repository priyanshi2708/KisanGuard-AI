import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, CheckCircle2, ArrowRight, Volume2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TopMatchHeroCard = ({ topCrop, onViewDetailsClick }) => {
  const { language } = useLanguage();

  if (!topCrop) return null;

  const handleAudioSpeak = () => {
    alert(`🔊 સલાહ: ${topCrop.gujaratiName || topCrop.name} તમારા ખેતર માટે પ્રથમ ક્રમાંકનો શ્રેષ્ઠ પાક છે. યોગ્યતા સ્કોર ${topCrop.suitabilityScore}% છે.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-light-leaf/60 via-warm-cream to-white rounded-3xl p-5 sm:p-7 border-2 border-leaf-green shadow-xl space-y-5 relative overflow-hidden font-sans text-left"
    >
      {/* Top Banner Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-leaf-green/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-golden-wheat text-deep-forest text-xs font-extrabold uppercase tracking-wider shadow flex items-center gap-1.5">
            <Award className="w-4 h-4 fill-deep-forest" />
            <span>🥇 {language === 'gu' ? 'તમારા ખેતર માટે સૌથી શ્રેષ્ઠ પાક' : 'BEST MATCH FOR YOUR FARM'}</span>
          </div>
          <span className="text-[10px] font-bold text-forest-green bg-white px-2.5 py-1 rounded-full border border-forest-green/10">
            {language === 'gu' ? 'શ્રેષ્ઠ પસંદગી' : 'Top Choice'}
          </span>
        </div>

        <button
          onClick={handleAudioSpeak}
          className="p-2 rounded-full bg-white text-forest-green border border-forest-green/20 hover:bg-forest-green hover:text-white transition-colors shadow-sm flex items-center gap-1 text-xs font-bold cursor-pointer"
          title="Audio advisory"
        >
          <Volume2 className="w-4 h-4 text-leaf-green" />
          <span className="hidden sm:inline">{language === 'gu' ? 'સાંભળો 🔊' : 'Listen 🔊'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Crop Title & Score */}
        <div className="md:col-span-5 space-y-3">
          <div className="space-y-1">
            <span className="text-xs text-earth-brown uppercase font-bold tracking-wider">
              {language === 'gu' ? 'પ્રથમ ભલામણ વિકલ્પ' : 'Top Recommended Option'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-deep-forest">
              {topCrop.gujaratiName || topCrop.name}
            </h2>
            <div className="text-xs font-bold text-forest-green font-serif">
              ({topCrop.name} • {topCrop.hindiName})
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-forest-green/15 w-fit shadow-sm">
            <div className="text-3xl font-extrabold font-serif text-forest-green">
              {topCrop.suitabilityScore}%
            </div>
            <div className="text-xs text-earth-brown font-semibold">
              <div className="flex text-golden-wheat">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-golden-wheat" />
                ))}
              </div>
              <div>{language === 'gu' ? 'યોગ્યતા સ્કોર' : 'Suitability Score'}</div>
            </div>
          </div>
        </div>

        {/* Right 4 Key Highlights */}
        <div className="md:col-span-7 space-y-3 bg-white/80 p-4.5 rounded-2xl border border-forest-green/15">
          <h3 className="text-xs font-bold uppercase tracking-wider text-forest-green">
            {language === 'gu' ? 'શા માટે આ પાક તમારા ખેતર માટે ઉત્તમ છે:' : 'Why this suits your farm:'}
          </h3>

          <div className="space-y-2 text-xs font-semibold text-deep-forest">
            {topCrop.reasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-leaf-green shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-forest-green/10 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-earth-brown">
              {language === 'gu' ? 'અંદાજિત નફો:' : 'Est. Net Profit:'}{' '}
              <span className="font-bold font-mono text-forest-green text-sm">
                ₹{topCrop.estimatedProfit.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => onViewDetailsClick(topCrop)}
              className="px-5 py-2 rounded-xl bg-forest-green text-white font-bold text-xs hover:bg-deep-forest transition-colors shadow flex items-center gap-1.5 cursor-pointer"
            >
              <span>{language === 'gu' ? 'પાકની સંપૂર્ણ વિગત જુઓ' : 'View Crop Details'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default TopMatchHeroCard;

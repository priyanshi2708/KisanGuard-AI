import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, Star, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CropCardGrid = ({ crops = [], onViewDetailsClick }) => {
  const { language } = useLanguage();
  const safeCrops = Array.isArray(crops) ? crops : (crops?.data?.recommendedCrops || []);

  return (
    <div className="space-y-4 font-sans text-left">
      <div className="flex items-center justify-between border-b border-forest-green/10 pb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
            <Sprout className="w-5 h-5 text-forest-green" />
            <span>{language === 'gu' ? 'તમારા ખેતર માટે તમામ ભલામણ કરેલ પાક' : 'All Recommended Crops For You'}</span>
          </h2>
          <p className="text-xs text-earth-brown font-medium">
            {language === 'gu'
              ? 'યોગ્યતા સ્કોર, રોગ પ્રતિકારક શક્તિ અને બજાર માંગ મુજબ વર્ગીકૃત'
              : 'Ranked by overall farm suitability, weather resilience, and market demand'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {safeCrops.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            whileHover={{ y: -4 }}
            className="p-5 rounded-3xl bg-white border border-forest-green/15 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-forest-green/10 text-forest-green">
                  {language === 'gu' ? `વિકલ્પ ૦${idx + 1}` : `Option 0${idx + 1}`}
                </span>

                <div className="flex items-center gap-1 text-[11px] font-bold text-forest-green bg-light-leaf/60 px-2 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-golden-wheat text-golden-wheat" />
                  <span>{item.suitabilityScore}%</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold font-serif text-deep-forest">
                  {item.gujaratiName || item.name}
                </h3>
                <div className="text-xs text-forest-green font-semibold">
                  {item.name} • {item.hindiName}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-earth-brown bg-warm-cream/60 p-2 rounded-xl border border-forest-green/10">
                <div>
                  <div className="text-forest-green/80 font-bold">{language === 'gu' ? 'સિંચાઈ' : 'Water'}</div>
                  <div className="text-deep-forest font-bold">{item.waterRequirement}</div>
                </div>
                <div>
                  <div className="text-forest-green/80 font-bold">{language === 'gu' ? 'જોખમ' : 'Risk'}</div>
                  <div className="text-emerald-800 font-bold">{item.risk}</div>
                </div>
              </div>

              <p className="text-xs text-earth-brown leading-relaxed font-medium line-clamp-2">
                "{item.whyRecommendKey}"
              </p>
            </div>

            <div className="pt-3 border-t border-forest-green/10 space-y-2 shrink-0">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-earth-brown">{language === 'gu' ? 'અંદાજિત નફો:' : 'Est. Profit:'}</span>
                <span className="font-bold font-mono text-forest-green">₹{item.estimatedProfit.toLocaleString()}</span>
              </div>

              <button
                onClick={() => onViewDetailsClick(item)}
                className="w-full py-2 rounded-xl bg-forest-green/10 text-forest-green font-bold text-xs hover:bg-forest-green hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{language === 'gu' ? 'પાકની વિગત જુઓ' : 'View Crop Details'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-[10px] text-earth-brown/70 font-semibold italic text-center pt-1">
        * {language === 'gu'
          ? 'નોંધ: તમામ યોગ્યતા ટકાવારી અને નફાની રકમ આયોજન માર્ગદર્શન માટે અંદાજિત કિંમતો છે.'
          : 'Note: All suitability percentages and profit figures are estimated demo values for planning guidance.'}
      </div>
    </div>
  );
};

export default CropCardGrid;

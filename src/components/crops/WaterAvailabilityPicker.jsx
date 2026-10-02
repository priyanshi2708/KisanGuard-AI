import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const WaterAvailabilityPicker = ({ waterLevel, onSelectWater }) => {
  const { language } = useLanguage();

  const levels = [
    { id: 'very_low', labelGu: '💧 ખુબ ઓછું', labelEn: '💧 Very Low', descGu: 'માત્ર વરસાદ આધારિત', descEn: 'Rainfed only' },
    { id: 'low', labelGu: '💧 ઓછું', labelEn: '💧 Low', descGu: 'મર્યાદિત બોરવેલ પાણી', descEn: 'Limited tube-well' },
    { id: 'medium', labelGu: '💧 મધ્યમ', labelEn: '💧 Medium', descGu: 'સામાન્ય કેનાલ અને બોર', descEn: 'Normal canal & well' },
    { id: 'high', labelGu: '💧 સારો જથ્થો', labelEn: '💧 High', descGu: 'સારી સિંચાઈ સુવિધા', descEn: 'Good irrigation' },
    { id: 'very_high', labelGu: '💧 ભરપૂર', labelEn: '💧 Very High', descGu: 'કેનાલ અને નદીનું પાણી', descEn: 'Abundant canal & river' }
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-forest-green/10 space-y-4 font-sans text-left h-full flex flex-col justify-between">
      <div className="space-y-0.5">
        <h2 className="text-base sm:text-lg font-bold font-serif text-deep-forest flex items-center gap-2">
          <Droplets className="w-5 h-5 text-sky-600" />
          <span>{language === 'gu' ? 'તમારા ખેતરમાં પાણી કેટલું ઉપલબ્ધ છે?' : 'How Much Water Is Available?'}</span>
        </h2>
        <p className="text-xs text-earth-brown font-medium">
          {language === 'gu' ? 'આગામી સીઝન માટે તમારી સિંચાઈ ક્ષમતા પસંદ કરો:' : 'Select your irrigation capacity for the next season:'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 items-stretch">
        {levels.map((item) => {
          const isSelected = waterLevel === item.id;
          const label = language === 'gu' ? item.labelGu : item.labelEn;
          const desc = language === 'gu' ? item.descGu : item.descEn;

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectWater(item.id)}
              className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-center flex flex-col justify-between h-full space-y-1 ${
                isSelected
                  ? 'bg-sky-50 border-sky-500 shadow-sm font-bold text-sky-950'
                  : 'bg-warm-cream/40 border-forest-green/15 text-deep-forest'
              }`}
            >
              <div className="text-xs sm:text-sm font-bold font-serif">{label}</div>
              <div className="text-[10px] text-earth-brown leading-tight font-medium opacity-90">{desc}</div>
              <div className={`text-[10px] font-bold pt-1 border-t border-current/10 ${isSelected ? 'text-sky-700' : 'text-earth-brown/60'}`}>
                {isSelected ? (language === 'gu' ? '✓ પસંદ કર્યું' : '✓ Selected') : (language === 'gu' ? '+ પસંદ કરો' : '+ Select')}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default WaterAvailabilityPicker;

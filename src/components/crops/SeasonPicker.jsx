import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const SeasonPicker = ({ selectedSeason, onSelectSeason }) => {
  const { language } = useLanguage();

  const seasons = [
    {
      id: 'kharif',
      titleGu: '🌧️ ચોમાસુ (ખરીફ)',
      titleEn: '🌧️ Kharif (Monsoon)',
      periodGu: 'જૂન – ઓક્ટોબર',
      periodEn: 'June – Oct',
      descGu: 'ડાંગર, કપાસ, મગફળી'
    },
    {
      id: 'rabi',
      titleGu: '❄️ શિયાળુ (રવિ)',
      titleEn: '❄️ Rabi (Winter)',
      periodGu: 'નવેમ્બર – માર્ચ',
      periodEn: 'Nov – March',
      descGu: 'ઘઉં, સરસવ, રાઈ, ચણા'
    },
    {
      id: 'zaid',
      titleGu: '☀️ ઉનાળુ (જાયદ)',
      titleEn: '☀️ Zaid (Summer)',
      periodGu: 'માર્ચ – જૂન',
      periodEn: 'March – June',
      descGu: 'શાકભાજી, તરબૂચ, ઘાસચારો'
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-forest-green/10 space-y-4 font-sans text-left h-full flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-forest-green/10 pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-serif text-deep-forest flex items-center gap-2">
            <Calendar className="w-5 h-5 text-forest-green" />
            <span>{language === 'gu' ? 'તમે કઈ સીઝન માટે આયોજન કરી રહ્યા છો?' : 'Planning Season'}</span>
          </h2>
          <p className="text-xs text-earth-brown font-medium">
            {language === 'gu' ? 'તમારો વાવણી સમયગાળો પસંદ કરો:' : 'Select your target planting window:'}
          </p>
        </div>

        <span className="text-[10px] font-bold text-forest-green bg-light-leaf/60 px-2.5 py-1 rounded-full">
          3 Seasons Active
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
        {seasons.map((item) => {
          const isSelected = selectedSeason === item.id;
          const title = language === 'gu' ? item.titleGu : item.titleEn;
          const period = language === 'gu' ? item.periodGu : item.periodEn;
          const desc = item.descGu;

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectSeason(item.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between h-full space-y-2 relative ${
                isSelected
                  ? 'bg-gradient-to-br from-light-leaf/40 to-warm-cream border-leaf-green shadow-sm'
                  : 'bg-warm-cream/40 border-forest-green/15'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full bg-leaf-green text-white flex items-center justify-center shadow">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div className="space-y-1">
                <h3 className="font-extrabold font-serif text-sm text-deep-forest pr-5">{title}</h3>
                <div className="text-[11px] font-bold text-forest-green">{period}</div>
                <p className="text-[11px] text-earth-brown font-medium">{desc}</p>
              </div>

              <div className={`text-[10px] font-bold pt-1 border-t border-current/10 ${isSelected ? 'text-forest-green' : 'text-earth-brown/60'}`}>
                {isSelected ? (language === 'gu' ? '✓ પસંદ કર્યું' : '✓ Selected') : (language === 'gu' ? '+ પસંદ કરો' : '+ Select')}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SeasonPicker;

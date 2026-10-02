import React from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CloudRain } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const SevenDayForecastSection = ({ forecastList }) => {
  const { t } = useLanguage();

  if (!forecastList || !Array.isArray(forecastList)) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest-green/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
            <CalendarDays className="w-4 h-4 text-leaf-green" />
            <span>EXTENDED FORECAST</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
            {t('weatherPage.forecastTitle')}
          </h2>
          <p className="text-xs text-earth-brown font-medium">
            {t('weatherPage.forecastSub')}
          </p>
        </div>
        <span className="text-[11px] font-bold text-earth-brown/80 bg-warm-cream px-3 py-1 rounded-full w-fit">
          Swipe horizontally on mobile ↔
        </span>
      </div>

      {/* Horizontally Scrollable Grid on Mobile */}
      <div className="flex sm:grid sm:grid-cols-7 gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-forest-green/20">
        {forecastList.map((item, idx) => (
          <motion.div
            key={item.dayKey || idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`min-w-[110px] sm:min-w-0 flex-1 p-4 rounded-2xl text-center border space-y-2 transition-all shrink-0 ${
              idx === 0
                ? 'bg-gradient-to-b from-forest-green to-leaf-green text-white border-forest-green shadow-lg ring-2 ring-forest-green/20'
                : 'bg-warm-cream/50 border-forest-green/15 text-deep-forest hover:bg-warm-cream'
            }`}
          >
            <div className={`text-xs font-bold uppercase tracking-wider ${idx === 0 ? 'text-light-leaf' : 'text-earth-brown'}`}>
              {item.dayName}
            </div>

            <div className="text-3xl py-1 transform hover:scale-110 transition-transform">
              {item.icon}
            </div>

            <div className="space-y-0.5">
              <div className="text-lg font-extrabold font-serif">
                {item.tempHigh}°
                <span className={`text-xs font-normal ml-1 ${idx === 0 ? 'text-white/70' : 'text-earth-brown'}`}>
                  / {item.tempLow}°
                </span>
              </div>
              <div className={`text-[10px] font-medium truncate ${idx === 0 ? 'text-white/80' : 'text-earth-brown'}`}>
                {item.condition}
              </div>
            </div>

            <div className={`text-xs font-bold pt-1.5 border-t ${idx === 0 ? 'border-white/20 text-golden-wheat' : 'border-forest-green/10 text-sky-700'} flex items-center justify-center gap-1`}>
              <CloudRain className="w-3.5 h-3.5" />
              <span>{item.rainProb}%</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SevenDayForecastSection;

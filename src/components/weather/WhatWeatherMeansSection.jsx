import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Droplets, Sprout, Flame, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const WhatWeatherMeansSection = ({ meansList }) => {
  const { t } = useLanguage();

  if (!meansList || !Array.isArray(meansList)) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      {/* Header */}
      <div className="border-b border-forest-green/10 pb-4 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
          <Sprout className="w-4 h-4 text-leaf-green" />
          <span>FARM IMPACT ADVISORY</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
          {t('weatherPage.whatMeansTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-earth-brown font-medium">
          {t('weatherPage.whatMeansSub')}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meansList.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 0.5 }}
            whileHover={{ y: -3 }}
            className="bg-gradient-to-br from-warm-cream/80 to-white rounded-2xl p-5 border border-forest-green/15 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="text-base font-bold font-serif text-deep-forest">
                    {item.title}
                  </h3>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-forest-green bg-light-leaf px-2.5 py-1 rounded-full">
                  Action Item
                </span>
              </div>
              
              <p className="text-xs text-earth-brown font-medium leading-relaxed">
                {item.summary}
              </p>
            </div>

            {/* Actionable Advice Box */}
            <div className="bg-white p-3.5 rounded-xl border border-forest-green/10 text-xs font-semibold text-deep-forest space-y-1">
              <div className="text-[11px] font-extrabold text-forest-green flex items-center gap-1 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-leaf-green" />
                <span>{t('weatherPage.actionHeader')}</span>
              </div>
              <p className="leading-normal text-deep-forest/90">
                {item.action}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WhatWeatherMeansSection;

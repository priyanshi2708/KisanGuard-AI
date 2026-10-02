import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Info, Droplet } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const RainfallForecastSection = ({ rainData }) => {
  const { t } = useLanguage();

  if (!rainData) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      
      {/* Header & Demo Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest-green/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
            <CloudRain className="w-4 h-4 text-sky-600" />
            <span>PRECIPITATION ADVISORY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
            {t('weatherPage.rainForecastTitle')}
          </h2>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider w-fit">
          <Info className="w-3 h-3 text-amber-600" />
          <span>{t('weatherPage.demoDataTag')}</span>
        </span>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/60 space-y-1">
          <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">
            {t('weatherPage.expectedRainfallLabel')}
          </div>
          <div className="text-2xl font-extrabold font-serif text-sky-900">
            {rainData.expectedRainfall}
          </div>
          <p className="text-[11px] text-sky-700 font-medium">Estimated 48-hour volume</p>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/60 space-y-1">
          <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">
            {t('weatherPage.nextRainLabel')}
          </div>
          <div className="text-2xl font-extrabold font-serif text-sky-900">
            {rainData.nextSignificantRain}
          </div>
          <p className="text-[11px] text-sky-700 font-medium">Monsoon shower band</p>
        </div>

        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/60 space-y-1">
          <div className="text-xs font-bold text-sky-800 uppercase tracking-wider">
            {t('weatherPage.rainProbabilityLabel')}
          </div>
          <div className="text-2xl font-extrabold font-serif text-sky-900">
            {rainData.rainProbability}
          </div>
          <p className="text-[11px] text-sky-700 font-medium">High cloud density</p>
        </div>
      </div>

      {/* Visual Volume Intensity Bar */}
      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-xs font-bold text-deep-forest">
          <span>Expected Rainfall Intensity</span>
          <span className="text-sky-700 font-extrabold">{rainData.rainProbability} Probability</span>
        </div>

        <div className="w-full h-4 bg-sky-100 rounded-full overflow-hidden p-0.5 border border-sky-200">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${rainData.intensityPercentage}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-sky-400 via-sky-600 to-sky-800 rounded-full shadow-inner relative"
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
          </motion.div>
        </div>
      </div>

      {/* Farmer Advice */}
      <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/15 flex items-start gap-3">
        <Droplet className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <p className="text-xs font-semibold text-deep-forest leading-relaxed">
          {rainData.advice}
        </p>
      </div>

    </div>
  );
};

export default RainfallForecastSection;

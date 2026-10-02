import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const PersonalizedCropWeatherSection = ({ cropSuitability }) => {
  const { t } = useLanguage();

  if (!cropSuitability) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-green/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
            <Sprout className="w-4 h-4 text-leaf-green" />
            <span>PERSONALIZED CROP ADVISORY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
            {t('weatherPage.cropWeatherTitle', { crop: cropSuitability.cropName })}
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 bg-light-leaf px-4 py-2 rounded-full border border-forest-green/20">
          <span className="text-xs font-bold text-earth-brown">{t('weatherPage.cropSuitabilityLabel')}</span>
          <span className="text-xs font-extrabold text-forest-green">{cropSuitability.overallLabel}</span>
        </div>
      </div>

      {/* Factors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cropSuitability.factors.map((factor, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-2xl bg-warm-cream/60 border border-forest-green/15 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-deep-forest">{factor.name}</span>
              <span className="text-xs font-extrabold">{factor.label}</span>
            </div>
            <p className="text-[11px] text-earth-brown font-medium leading-relaxed">
              {factor.detail}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Recommendation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-light-leaf/80 to-warm-cream border border-forest-green/20 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-forest-green shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-extrabold text-deep-forest uppercase tracking-wider">
            AI Crop Recommendation Summary
          </div>
          <p className="text-xs font-semibold text-deep-forest/90 leading-relaxed">
            {cropSuitability.recommendation}
          </p>
        </div>
      </div>

    </div>
  );
};

export default PersonalizedCropWeatherSection;

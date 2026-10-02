import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const IrrigationAdvisorSection = ({ irrigationData }) => {
  const { t } = useLanguage();

  if (!irrigationData) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      <div className="border-b border-forest-green/10 pb-4 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
          <Droplets className="w-4 h-4 text-sky-600" />
          <span>SMART WATER MANAGEMENT</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
          {t('weatherPage.irrigationTitle')}
        </h2>
      </div>

      {/* Main Result Hero Pill */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-700 via-forest-green to-leaf-green text-white shadow-xl space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-light-leaf">
          <Sparkles className="w-4 h-4 text-golden-wheat" />
          <span>AI Irrigation Recommendation</span>
        </div>

        <div className="text-xl sm:text-3xl font-extrabold font-serif tracking-tight text-golden-wheat">
          {irrigationData.badgeLabel}
        </div>

        <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed max-w-xl">
          <span className="font-bold">Reason:</span> {irrigationData.reason}
        </p>

        {irrigationData.savingsEstimate && (
          <div className="inline-block text-xs font-bold bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-light-leaf">
            💡 {irrigationData.savingsEstimate}
          </div>
        )}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-warm-cream/60 border border-forest-green/15 text-center space-y-1">
          <div className="text-xs text-earth-brown font-bold uppercase tracking-wider">
            {t('weatherPage.recentRainfall')}
          </div>
          <div className="text-xl font-extrabold font-serif text-deep-forest">
            {irrigationData.recentRainfall}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-warm-cream/60 border border-forest-green/15 text-center space-y-1">
          <div className="text-xs text-earth-brown font-bold uppercase tracking-wider">
            {t('weatherPage.expectedRainfall')}
          </div>
          <div className="text-xl font-extrabold font-serif text-sky-700">
            {irrigationData.expectedRainfall}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-warm-cream/60 border border-forest-green/15 text-center space-y-1">
          <div className="text-xs text-earth-brown font-bold uppercase tracking-wider">
            {t('weatherPage.soilMoisture')}
          </div>
          <div className="text-xl font-extrabold font-serif text-forest-green">
            {irrigationData.soilMoisture}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IrrigationAdvisorSection;

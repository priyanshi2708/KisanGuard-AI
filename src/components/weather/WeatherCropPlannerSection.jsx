import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, ArrowRight, Calendar, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const WeatherCropPlannerSection = ({ cropName = "Cotton" }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-deep-forest via-forest-green to-leaf-green rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4 relative overflow-hidden font-sans border border-white/10">
      <div className="absolute top-0 right-0 w-64 h-64 bg-golden-wheat/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-extrabold text-light-leaf border border-white/20 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-golden-wheat" />
            <span>SEASON PLANNER SYNERGY</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white">
            {t('weatherPage.cropPlannerTitle')}
          </h2>

          <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
            You selected <span className="font-bold text-golden-wheat">{cropName}</span>. Rain is expected in the coming days. Consider checking soil moisture and weather windows before planting or fertilizing.
          </p>
        </div>

        <Link
          to="/crops"
          className="inline-flex items-center gap-2 bg-golden-wheat hover:bg-amber-400 text-deep-forest font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg hover:scale-105 transition-all shrink-0 w-fit"
        >
          <span>{t('weatherPage.viewCropPlanBtn')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default WeatherCropPlannerSection;

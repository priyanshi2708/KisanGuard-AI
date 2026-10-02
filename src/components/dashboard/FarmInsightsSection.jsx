import React from 'react';
import { Sprout, TrendingUp, Droplets, Flame, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const FarmInsightsSection = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-forest-green/10 space-y-4 font-sans">
      <h3 className="font-bold font-serif text-deep-forest text-lg border-b border-forest-green/10 pb-3 flex items-center gap-2">
        <Award className="w-5 h-5 text-golden-wheat" />
        <span>{t('dashboard.insightsTitle')}</span>
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/10 space-y-1">
          <Sprout className="w-4 h-4 text-leaf-green mx-auto" />
          <div className="text-[10px] text-earth-brown font-semibold">Last Crop</div>
          <div className="text-xs font-bold text-deep-forest">Cotton</div>
        </div>

        <div className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/10 space-y-1">
          <TrendingUp className="w-4 h-4 text-forest-green mx-auto" />
          <div className="text-[10px] text-earth-brown font-semibold">Last Season</div>
          <div className="text-xs font-bold text-forest-green font-mono">₹29,800 Est.</div>
        </div>

        <div className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/10 space-y-1">
          <Droplets className="w-4 h-4 text-sky-600 mx-auto" />
          <div className="text-[10px] text-earth-brown font-semibold">Water Usage</div>
          <div className="text-xs font-bold text-deep-forest">Medium</div>
        </div>

        <div className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/10 space-y-1">
          <Flame className="w-4 h-4 text-emerald-600 mx-auto" />
          <div className="text-[10px] text-earth-brown font-semibold">Fire Risk</div>
          <div className="text-xs font-bold text-emerald-600">Low</div>
        </div>

        <div className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/10 space-y-1">
          <Award className="w-4 h-4 text-golden-wheat mx-auto" />
          <div className="text-[10px] text-earth-brown font-semibold">Farm Trend</div>
          <div className="text-xs font-bold text-forest-green">Improving</div>
        </div>
      </div>
    </div>
  );
};

export default FarmInsightsSection;

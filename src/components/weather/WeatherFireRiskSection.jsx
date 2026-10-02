import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, ShieldCheck, Thermometer, Wind, Droplets } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const WeatherFireRiskSection = ({ fireRiskData }) => {
  const { t } = useLanguage();

  if (!fireRiskData) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest-green/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>THERMAL & SAFETY INTELLIGENCE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
            {t('weatherPage.fireRiskTitle')}
          </h2>
        </div>

        <Link
          to={fireRiskData.linkPath || "/fire-risk"}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-forest-green hover:text-leaf-green transition-colors bg-light-leaf px-4 py-2 rounded-full border border-forest-green/20 w-fit"
        >
          <span>{t('weatherPage.viewFireRiskBtn')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Risk Badge */}
        <div className="md:col-span-5 p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-warm-cream border border-emerald-200 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs text-earth-brown font-bold uppercase tracking-wider">Fire Risk Level</div>
            <div className="text-2xl font-extrabold font-serif text-emerald-800">
              {fireRiskData.riskBadge}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold pt-0.5">
              NASA FIRMS Thermal Radar Active
            </div>
          </div>
        </div>

        {/* 3 Parameter Pills */}
        <div className="md:col-span-7 grid grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/15 text-center space-y-1">
            <Thermometer className="w-4 h-4 text-amber-600 mx-auto" />
            <div className="text-[10px] text-earth-brown font-bold">TEMP</div>
            <div className="text-sm font-extrabold text-deep-forest">{fireRiskData.temperature}</div>
          </div>

          <div className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/15 text-center space-y-1">
            <Wind className="w-4 h-4 text-forest-green mx-auto" />
            <div className="text-[10px] text-earth-brown font-bold">WIND</div>
            <div className="text-sm font-extrabold text-deep-forest">{fireRiskData.windSpeed}</div>
          </div>

          <div className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/15 text-center space-y-1">
            <Droplets className="w-4 h-4 text-sky-600 mx-auto" />
            <div className="text-[10px] text-earth-brown font-bold">HUMIDITY</div>
            <div className="text-sm font-extrabold text-deep-forest">{fireRiskData.humidity}</div>
          </div>
        </div>

      </div>

      <p className="text-xs text-earth-brown font-medium leading-relaxed bg-warm-cream/40 p-3.5 rounded-xl border border-forest-green/10">
        💡 <span className="font-bold text-deep-forest">Safety Note:</span> {fireRiskData.explanation}
      </p>
    </div>
  );
};

export default WeatherFireRiskSection;

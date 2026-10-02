import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Flame, Thermometer, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const GlassCard = () => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.8 }}
      whileHover={{ scale: 1.03 }}
      className="bg-warm-cream/85 backdrop-blur-md border border-light-leaf/40 rounded-2xl p-5 shadow-2xl max-w-xs text-deep-forest space-y-3 relative overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-forest-green/10 pb-2">
        <span className="font-semibold text-xs tracking-wider uppercase text-forest-green flex items-center gap-1.5">
          {t('hero.cardTitle')}
        </span>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leaf-green opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-leaf-green"></span>
        </span>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-forest-green/10 text-forest-green">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-deep-forest">{t('hero.temp')}</div>
            <div className="text-[11px] text-earth-brown font-medium">Anand, GJ</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-light text-forest-green">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-deep-forest">{t('hero.rain')}</div>
            <div className="text-[11px] text-earth-brown font-medium">Precipitation</div>
          </div>
        </div>
      </div>

      <div className="bg-light-leaf/50 border border-leaf-green/30 rounded-xl p-2.5 flex items-center justify-between text-xs font-semibold text-deep-forest">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-golden-wheat" />
          <span>{t('hero.fireRisk')}</span>
        </div>
        <ShieldCheck className="w-4 h-4 text-forest-green" />
      </div>
    </motion.div>
  );
};

export default GlassCard;

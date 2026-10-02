import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Sprout, Droplets, FlaskConical, Shovel } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TodayFarmingAdviceSection = ({ adviceList }) => {
  const { t } = useLanguage();

  if (!adviceList || !Array.isArray(adviceList)) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      <div className="border-b border-forest-green/10 pb-4 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
          <UserCheck className="w-4 h-4 text-leaf-green" />
          <span>FARMER ADVISORY MATRIX</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
          {t('weatherPage.todayAdviceTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-earth-brown font-medium">
          {t('weatherPage.todayAdviceSub')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adviceList.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            className="p-4 rounded-2xl bg-warm-cream/60 border border-forest-green/15 space-y-2.5 hover:bg-warm-cream transition-colors"
          >
            <div className="text-xs font-bold text-forest-green uppercase tracking-wider">
              {item.categoryName}
            </div>

            <p className="text-xs text-deep-forest font-medium leading-relaxed">
              "{item.advice}"
            </p>

            <div className="text-[10px] text-earth-brown font-semibold italic pt-1 border-t border-forest-green/10">
              💡 Recommendation for today
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TodayFarmingAdviceSection;

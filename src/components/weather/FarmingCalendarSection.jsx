import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const FarmingCalendarSection = ({ calendarList }) => {
  const { t } = useLanguage();

  if (!calendarList || !Array.isArray(calendarList)) return null;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      <div className="border-b border-forest-green/10 pb-4 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-leaf-green" />
          <span>FARM OPERATION SCHEDULE</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
          {t('weatherPage.calendarTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-earth-brown font-medium">
          {t('weatherPage.calendarSub')}
        </p>
      </div>

      {/* Timeline Grid / Stack */}
      <div className="relative space-y-3 before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-forest-green/15 sm:before:hidden">
        {calendarList.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            className="relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-warm-cream/50 border border-forest-green/15 hover:bg-warm-cream transition-colors gap-3 pl-12 sm:pl-4"
          >
            {/* Timeline Dot on Mobile */}
            <div className="absolute left-3.5 top-5 w-3.5 h-3.5 rounded-full bg-forest-green border-2 border-white sm:hidden" />

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-forest-green text-white font-extrabold font-serif text-sm flex items-center justify-center shrink-0 shadow-sm">
                {item.day}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-earth-brown">
                  <span>{item.weatherIcon}</span>
                  <span>{item.weatherText}</span>
                </div>
                <div className="text-sm font-bold text-deep-forest flex items-center gap-2">
                  <span className="text-lg">{item.activityIcon}</span>
                  <span>{item.activity}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 self-end sm:self-center">
              <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                item.status === 'caution'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : item.status === 'action'
                  ? 'bg-sky-100 text-sky-800 border border-sky-200'
                  : 'bg-light-leaf text-forest-green border border-forest-green/20'
              }`}>
                {item.status === 'caution' ? '🌧️ Caution' : item.status === 'action' ? '💧 Check' : '🌱 Ideal Work'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FarmingCalendarSection;

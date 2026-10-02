import React from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const WeatherAlertsSection = ({ alerts }) => {
  const { t } = useLanguage();

  if (!alerts || !Array.isArray(alerts) || alerts.length === 0) return null;

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'important':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          badge: 'bg-red-600 text-white',
          label: t('weatherPage.importantBadge'),
          icon: <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
        };
      case 'watch':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          badge: 'bg-amber-500 text-white',
          label: t('weatherPage.watchBadge'),
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        };
      case 'normal':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          badge: 'bg-emerald-600 text-white',
          label: t('weatherPage.normalBadge'),
          icon: <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      <div className="border-b border-forest-green/10 pb-4 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
          <Bell className="w-4 h-4 text-golden-wheat animate-bounce" />
          <span>MICRO-CLIMATE NOTIFICATIONS</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
          {t('weatherPage.alertsTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-earth-brown font-medium">
          {t('weatherPage.alertsSub')}
        </p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, idx) => {
          const style = getSeverityBadge(alert.severity);
          return (
            <motion.div
              key={alert.id || idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${style.bg}`}
            >
              <div className="flex items-start gap-3">
                {style.icon}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-deep-forest font-serif">
                      {alert.title}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed opacity-90">
                    {alert.description}
                  </p>
                </div>
              </div>

              {alert.action && (
                <div className="shrink-0 self-end sm:self-center">
                  <span className="inline-block text-[11px] font-bold bg-white/80 border border-current px-3 py-1.5 rounded-xl shadow-xs">
                    💡 {alert.action}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default WeatherAlertsSection;

import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Sprout, Flame, Droplets, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TodayAdviceSection = () => {
  const { t } = useLanguage();

  const adviceList = [
    {
      id: 1,
      category: "Weather",
      title: t('advice.rainTitle'),
      desc: t('advice.rainDesc'),
      priority: "good",
      priorityLabel: "🟢 Good",
      icon: CloudRain,
      color: "border-sky-200 bg-sky-50/50"
    },
    {
      id: 2,
      category: "Crop Health",
      title: t('advice.soilTitle'),
      desc: t('advice.soilDesc'),
      priority: "watch",
      priorityLabel: "🟡 Watch",
      icon: Sprout,
      color: "border-amber-200 bg-amber-50/50"
    },
    {
      id: 3,
      category: "Safety",
      title: t('advice.fireTitle'),
      desc: t('advice.fireDesc'),
      priority: "good",
      priorityLabel: "🟢 Good",
      icon: Flame,
      color: "border-emerald-200 bg-emerald-50/50"
    },
    {
      id: 4,
      category: "Irrigation",
      title: t('advice.waterTitle'),
      desc: t('advice.waterDesc'),
      priority: "good",
      priorityLabel: "🟢 Good",
      icon: Droplets,
      color: "border-emerald-200 bg-emerald-50/50"
    }
  ];

  return (
    <section className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest flex items-center gap-2">
          <span>{t('advice.title')}</span>
          <span className="text-xs font-sans font-semibold bg-light-leaf/60 text-forest-green px-3 py-1 rounded-full">
            {t('advice.badge')}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {adviceList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -4 }}
              className={`p-5 rounded-3xl border ${item.color} shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-white text-forest-green shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white text-deep-forest border border-forest-green/10">
                    {item.priorityLabel}
                  </span>
                </div>

                <h3 className="font-bold text-base text-deep-forest font-serif pt-1">
                  {item.title}
                </h3>

                <p className="text-xs text-earth-brown leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>

              <div className="text-[11px] font-bold text-forest-green uppercase tracking-wider flex items-center gap-1 pt-2 border-t border-forest-green/10">
                <Info className="w-3.5 h-3.5 text-leaf-green" />
                <span>{item.category}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default TodayAdviceSection;

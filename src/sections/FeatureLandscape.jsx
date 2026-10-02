import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, CloudRain, Flame, CircleDollarSign, Bot, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FeatureLandscape = () => {
  const { t } = useLanguage();

  const features = [
    {
      id: 1,
      title: t('features.f1Title'),
      desc: t('features.f1Desc'),
      icon: Sprout,
      color: "text-leaf-green",
      badge: "Crop ML",
      bgGradient: "from-light-leaf/40 to-warm-cream"
    },
    {
      id: 2,
      title: t('features.f2Title'),
      desc: t('features.f2Desc'),
      icon: CloudRain,
      color: "text-sky-600",
      badge: "Weather Forecast",
      bgGradient: "from-sky-light/50 to-warm-cream"
    },
    {
      id: 3,
      title: t('features.f3Title'),
      desc: t('features.f3Desc'),
      icon: Flame,
      color: "text-amber-600",
      badge: "Satellite Guard",
      bgGradient: "from-amber-100/60 to-warm-cream"
    },
    {
      id: 4,
      title: t('features.f4Title'),
      desc: t('features.f4Desc'),
      icon: CircleDollarSign,
      color: "text-forest-green",
      badge: "Farm Book",
      bgGradient: "from-emerald-100/50 to-warm-cream"
    },
    {
      id: 5,
      title: t('features.f5Title'),
      desc: t('features.f5Desc'),
      icon: Bot,
      color: "text-golden-wheat",
      badge: "AI Companion",
      bgGradient: "from-amber-50 to-warm-cream"
    }
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-gradient-to-b from-warm-cream via-light-leaf/20 to-warm-cream text-deep-forest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-green/10 text-forest-green text-xs font-bold uppercase tracking-wider"
          >
            <span>🌾 {t('features.badge')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-bold font-serif text-deep-forest"
          >
            {t('features.heading')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-earth-brown text-base sm:text-lg font-medium"
          >
            {t('features.subtext')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative rounded-3xl p-7 bg-gradient-to-br ${item.bgGradient} border border-forest-green/15 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden`}
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl bg-white shadow-md border border-forest-green/10 ${item.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/80 border border-forest-green/10 text-earth-brown">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-serif text-deep-forest group-hover:text-forest-green transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-earth-brown leading-relaxed font-sans font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 relative z-10 flex items-center gap-1 text-xs font-bold text-forest-green group-hover:text-leaf-green transition-colors">
                  <span>{t('features.exploreBtn')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default FeatureLandscape;

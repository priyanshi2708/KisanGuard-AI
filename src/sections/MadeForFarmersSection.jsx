import React from 'react';
import { motion } from 'framer-motion';
import heroFarmerImg from '../assets/hero_farmer.png';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Mic, Camera, Smartphone, Check } from 'lucide-react';

export const MadeForFarmersSection = () => {
  const { language, setLanguage, t } = useLanguage();

  const highlights = [
    { icon: Globe, label: t('madeForFarmers.pill1'), desc: t('madeForFarmers.pill1Desc') },
    { icon: Mic, label: t('madeForFarmers.pill2'), desc: t('madeForFarmers.pill2Desc') },
    { icon: Camera, label: t('madeForFarmers.pill3'), desc: t('madeForFarmers.pill3Desc') },
    { icon: Smartphone, label: t('madeForFarmers.pill4'), desc: t('madeForFarmers.pill4Desc') },
  ];

  return (
    <section id="made-for-farmers" className="relative py-24 bg-gradient-to-b from-warm-cream via-light-leaf/30 to-warm-cream text-deep-forest overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 relative flex justify-center"
          >
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src={heroFarmerImg}
                alt="Indian farmer in field"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-forest/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <div className="flex items-center gap-2 bg-leaf-green/90 text-white text-xs font-bold px-3 py-1 rounded-full w-fit">
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('madeForFarmers.badge')}</span>
                </div>
                <p className="text-sm font-semibold font-serif leading-snug">
                  "{t('madeForFarmers.subtext')}"
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-forest-green/10 text-forest-green text-xs font-bold uppercase tracking-wider">
                <span>{t('madeForFarmers.badge')}</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-bold font-serif text-deep-forest leading-tight">
                {t('madeForFarmers.heading')}
              </h2>

              <p className="text-base sm:text-lg text-earth-brown leading-relaxed font-sans font-medium">
                {t('madeForFarmers.subtext')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    className="p-4 rounded-2xl bg-white border border-forest-green/10 shadow-md space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-forest-green font-bold text-sm">
                      <div className="p-2 rounded-xl bg-light-leaf/50 text-forest-green">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <p className="text-xs text-earth-brown font-medium pl-1">
                      {item.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default MadeForFarmersSection;

import React from 'react';
import { motion } from 'framer-motion';
import GrassEdge from '../components/GrassEdge';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Sprout, Flame, MessageSquare, Award, CheckCircle2 } from 'lucide-react';

export const SoilRootsSection = () => {
  const { t } = useLanguage();

  const steps = [
    {
      num: "01",
      title: t('soilRoots.step1Title'),
      desc: t('soilRoots.step1Desc'),
      icon: MapPin,
    },
    {
      num: "02",
      title: t('soilRoots.step2Title'),
      desc: t('soilRoots.step2Desc'),
      icon: Sprout,
    },
    {
      num: "03",
      title: t('soilRoots.step3Title'),
      desc: t('soilRoots.step3Desc'),
      icon: Flame,
    },
    {
      num: "04",
      title: t('soilRoots.step4Title'),
      desc: t('soilRoots.step4Desc'),
      icon: MessageSquare,
    },
    {
      num: "05",
      title: t('soilRoots.step5Title'),
      desc: t('soilRoots.step5Desc'),
      icon: Award,
    }
  ];

  return (
    <div className="relative bg-soil-dark text-warm-cream">
      <GrassEdge fillColor="#3B2417" />

      <section className="py-20 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-forest-green/40 border border-leaf-green/30 text-light-leaf text-xs font-bold uppercase tracking-wider"
            >
              <span>{t('soilRoots.badge')}</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-5xl font-bold font-serif text-warm-cream"
            >
              {t('soilRoots.heading')}
            </motion.h2>

            <p className="text-warm-cream/80 text-sm sm:text-base">
              {t('soilRoots.subtext')}
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-1.5 bg-gradient-to-b from-leaf-green via-forest-green to-earth-brown rounded-full hidden md:block" />

            <div className="space-y-16 relative">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isEven = idx % 2 === 0;

                return (
                  <motion.div
                    key={step.num}
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, delay: idx * 0.1 }}
                    className={`flex flex-col md:flex-row items-center gap-8 ${
                      isEven ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    <div className="w-full md:w-1/2 text-center md:text-left">
                      <div className={`p-6 sm:p-8 rounded-3xl bg-forest-green/20 backdrop-blur-md border border-light-leaf/20 shadow-2xl hover:border-leaf-green/50 transition-all ${
                        isEven ? 'md:text-right' : 'md:text-left'
                      }`}>
                        <div className={`inline-flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-golden-wheat`}>
                          <CheckCircle2 className="w-4 h-4 text-leaf-green" />
                          <span>STEP {step.num}</span>
                        </div>

                        <h3 className="text-xl sm:text-2xl font-bold font-serif text-warm-cream mb-2">
                          {step.title}
                        </h3>

                        <p className="text-sm text-warm-cream/80 leading-relaxed font-sans font-medium">
                          {step.desc}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 flex-shrink-0 w-16 h-16 rounded-full bg-deep-forest border-4 border-leaf-green/60 flex items-center justify-center shadow-glow-green text-white">
                      <Icon className="w-7 h-7" />
                    </div>

                    <div className="w-full md:w-1/2 hidden md:block" />
                  </motion.div>
                );
              })}
            </div>

          </div>

        </div>
      </section>
    </div>
  );
};

export default SoilRootsSection;

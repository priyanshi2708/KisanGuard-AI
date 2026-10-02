import React from 'react';
import { motion } from 'framer-motion';
import soilHandsImg from '../assets/soil_hands.png';
import heroFarmerImg from '../assets/hero_farmer.png';
import { useLanguage } from '../context/LanguageContext';
import { Sprout, CloudSun, Users, Compass } from 'lucide-react';

export const DecisionSection = () => {
  const { t } = useLanguage();

  return (
    <section id="decision" className="relative py-24 bg-warm-cream text-deep-forest overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-light-leaf/60 border border-leaf-green/30 text-forest-green text-xs font-bold uppercase tracking-wider">
              <Sprout className="w-4 h-4 text-leaf-green" />
              <span>{t('decision.tagline')}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-serif leading-tight text-deep-forest">
              {t('decision.heading')}
            </h2>

            <p className="text-base sm:text-lg text-earth-brown leading-relaxed font-sans font-medium">
              {t('decision.subtext')}
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-forest-green/10">
              <div className="space-y-1">
                <div className="text-3xl font-extrabold font-serif text-forest-green flex items-center gap-2">
                  <span>{t('decision.stat1Number')}</span>
                  <Users className="w-5 h-5 text-golden-wheat" />
                </div>
                <div className="text-xs font-semibold text-earth-brown">
                  {t('decision.stat1Label')}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-extrabold font-serif text-forest-green flex items-center gap-2">
                  <span>{t('decision.stat2Number')}</span>
                  <CloudSun className="w-5 h-5 text-leaf-green" />
                </div>
                <div className="text-xs font-semibold text-earth-brown">
                  {t('decision.stat2Label')}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3 text-xs font-semibold text-forest-green">
              <Compass className="w-4 h-4 text-leaf-green" />
              <span>{t('hero.trustLine')}</span>
            </div>
          </motion.div>

          <div className="lg:col-span-6 relative flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative z-10 w-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:rotate-1 transition-transform duration-500"
            >
              <img
                src={soilHandsImg}
                alt="Farmer hands holding rich soil and green sprout"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-forest/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-semibold bg-deep-forest/80 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                🌱 "{t('decision.subtext')}"
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40, y: -20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute -bottom-8 -left-2 sm:left-4 z-20 w-3/5 rounded-2xl overflow-hidden shadow-xl border-4 border-white transform -rotate-3 hover:rotate-0 transition-transform duration-500"
            >
              <img
                src={heroFarmerImg}
                alt="Indian paddy field"
                className="w-full h-44 sm:h-52 object-cover"
              />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DecisionSection;

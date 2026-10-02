import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Bot } from 'lucide-react';
import harvestSunsetImg from '../assets/harvest_sunset.png';
import LeavesParticles from '../animations/LeavesParticles';
import { useLanguage } from '../context/LanguageContext';

export const FinalCtaSection = () => {
  const { t } = useLanguage();

  return (
    <section className="relative py-28 w-full flex items-center justify-center overflow-hidden bg-soil-dark text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={harvestSunsetImg}
          alt="Golden harvest sunset over Indian wheat field"
          className="w-full h-full object-cover opacity-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-soil-dark via-deep-forest/70 to-deep-forest/80" />
      </div>

      <LeavesParticles count={10} />

      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-golden-wheat/20 backdrop-blur-md border border-golden-wheat/40 text-golden-wheat text-xs font-bold uppercase tracking-widest"
        >
          <span>🌾 YOUR FARM. YOUR FUTURE.</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-6xl font-extrabold font-serif text-warm-cream leading-tight max-w-4xl mx-auto"
        >
          {t('cta.heading')}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base sm:text-xl text-warm-cream/90 font-sans max-w-2xl mx-auto font-medium"
        >
          {t('cta.subtext')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link
            to="/signup"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-leaf-green to-forest-green hover:from-forest-green hover:to-leaf-green text-white font-bold text-base px-9 py-4 rounded-2xl shadow-glow-green hover:scale-105 transition-all duration-300 group"
          >
            <span>{t('cta.btnPrimary')}</span>
            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </Link>

          <Link
            to="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-300"
          >
            <Bot className="w-5 h-5 text-golden-wheat" />
            <span>{t('cta.btnSecondary')}</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCtaSection;

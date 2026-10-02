import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Bot, ChevronDown, ShieldCheck } from 'lucide-react';
import LeavesParticles from '../animations/LeavesParticles';
import GlassCard from '../components/GlassCard';
import heroFarmerImg from '../assets/hero_farmer.png';
import { useLanguage } from '../context/LanguageContext';

export const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-[92vh] lg:min-h-screen w-full flex items-center justify-center overflow-hidden bg-soil-dark text-white">
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={heroFarmerImg}
          alt="Indian farmers working in paddy field"
          className="w-full h-full object-cover animate-kenburns origin-center opacity-85 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-soil-dark via-deep-forest/50 to-deep-forest/70" />
      </div>

      <LeavesParticles count={12} />

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-7 space-y-6 text-left">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-light-leaf/20 backdrop-blur-md border border-light-leaf/40 text-light-leaf text-xs font-bold tracking-widest uppercase shadow-md"
          >
            <span>{t('hero.tagline')}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold font-serif leading-[1.1] tracking-tight text-warm-cream"
          >
            <span className="block">{t('hero.headingLine1')}</span>
            <span className="block text-golden-wheat">{t('hero.headingLine2')}</span>
            <span className="block text-leaf-green">{t('hero.headingLine3')}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-xl text-warm-cream/90 max-w-2xl font-sans leading-relaxed font-normal"
          >
            {t('hero.subtext')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
          >
            <Link
              to="/signup"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-leaf-green to-forest-green hover:from-forest-green hover:to-leaf-green text-white font-bold text-base px-8 py-4 rounded-2xl shadow-glow-green hover:scale-105 transition-all duration-300 group"
            >
              <span>{t('hero.btnStart')}</span>
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </Link>

            <a
              href="#ai-assistant"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-base px-7 py-4 rounded-2xl transition-all duration-300"
            >
              <Bot className="w-5 h-5 text-golden-wheat" />
              <span>{t('hero.btnMeet')}</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex items-center gap-2 text-xs text-light-leaf/80 pt-1 font-medium"
          >
            <ShieldCheck className="w-4 h-4 text-leaf-green" />
            <span>{t('hero.trustLine')}</span>
          </motion.div>

        </div>

        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <GlassCard />
        </div>

      </div>

      <motion.a
        href="#decision"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 text-light-leaf/80 hover:text-white transition-colors cursor-pointer text-xs font-semibold uppercase tracking-widest"
      >
        <span>{t('hero.scrollText')}</span>
        <ChevronDown className="w-4 h-4 text-leaf-green animate-bounce" />
      </motion.a>
    </section>
  );
};

export default HeroSection;

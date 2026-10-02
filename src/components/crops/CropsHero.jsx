import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, Sparkles, MapPin, CloudSun, Droplets, CircleDollarSign } from 'lucide-react';
import harvestSunsetImg from '../../assets/harvest_sunset.png';
import LeavesParticles from '../../animations/LeavesParticles';
import { useLanguage } from '../../context/LanguageContext';

export const CropsHero = ({ onFindCropsClick }) => {
  const { language } = useLanguage();

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl bg-soil-dark text-white min-h-[280px] sm:min-h-[320px] flex flex-col justify-between p-6 sm:p-8 border-2 border-forest-green/30 font-sans text-left">
      {/* Background Photography with subtle motion */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={harvestSunsetImg}
          alt="Golden harvest crop field"
          className="w-full h-full object-cover opacity-60 scale-105 animate-kenburns origin-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-forest/95 via-deep-forest/80 to-deep-forest/40" />
      </div>

      <LeavesParticles count={8} />

      <div className="relative z-10 space-y-4 sm:space-y-5 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-golden-wheat/20 backdrop-blur-md border border-golden-wheat/40 text-golden-wheat text-xs font-extrabold uppercase tracking-wider"
        >
          <Sparkles className="w-4 h-4 text-golden-wheat" />
          <span>{language === 'gu' ? '🌱 સ્માર્ટ પાક આયોજન' : language === 'hi' ? '🌱 स्मार्ट फसल योजना' : '🌱 SMART CROP PLANNING'}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-4xl font-extrabold font-serif text-warm-cream leading-tight"
        >
          {language === 'gu'
            ? 'તમારા ખેતર માટે સૌથી સાચો પાક શોધો.'
            : language === 'hi'
            ? 'अपने खेत के लिए सही फसल चुनें।'
            : 'Let’s find the right crop for your farm.'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xs sm:text-sm text-warm-cream/90 font-sans font-medium leading-relaxed"
        >
          {language === 'gu'
            ? 'તમારા સ્થળ, જમીનનો પ્રકાર, ચોમાસાની આગાહી, પાણીની ઉપલબ્ધતા અને અગાઉના પાકના આધારે શ્રેષ્ઠ સલાહ.'
            : language === 'hi'
            ? 'आपके स्थान, मिट्टी के प्रकार, मौसम और पानी की उपलब्धता के आधार पर सटीक सलाह।'
            : 'Recommendations tailored specifically to your location, soil type, local monsoon forecast, and water availability.'}
        </motion.p>

        {/* 5 Parameters Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 text-xs font-bold text-light-leaf"
        >
          <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-leaf-green" />
            {language === 'gu' ? 'તમારું સ્થળ' : 'Your location'}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
            <CloudSun className="w-3.5 h-3.5 text-golden-wheat" />
            {language === 'gu' ? 'હવામાન આગાહી' : 'Weather forecast'}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-sky-400" />
            {language === 'gu' ? 'પાણીની સ્થિતિ' : 'Water availability'}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-leaf-green" />
            {language === 'gu' ? 'અગાઉના પાક' : 'Previous crops'}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
            <CircleDollarSign className="w-3.5 h-3.5 text-golden-wheat" />
            {language === 'gu' ? 'નફા નો હિસાબ' : 'Profit / Loss history'}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-1"
        >
          <button
            onClick={onFindCropsClick}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-leaf-green to-forest-green hover:from-forest-green hover:to-leaf-green text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-2xl shadow-glow-green hover:scale-105 transition-all duration-300 group cursor-pointer"
          >
            <span>{language === 'gu' ? 'મારા માટે શ્રેષ્ઠ પાક શોધો → 🌱' : 'Find My Best Crops → 🌱'}</span>
            <Sprout className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default CropsHero;

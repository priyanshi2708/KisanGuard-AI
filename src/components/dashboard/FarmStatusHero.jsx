import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, MapPin, CloudSun, Flame, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import heroFarmerImg from '../../assets/hero_farmer.png';
import { useLanguage } from '../../context/LanguageContext';
import { getFarmerProfile } from '../../services/farmerProfileService';
import { getCurrentAccount } from '../../services/authService';

export const FarmStatusHero = ({
  temp = '29°C',
  fireRisk = 'LOW'
}) => {
  const { language, t } = useLanguage();
  const profile = getFarmerProfile();
  const account = getCurrentAccount();

  const farmerName = account?.name || profile?.name || 'Kisan';
  const village = profile?.village || 'Anand';
  const district = profile?.district || 'Anand';
  const currentCrop = profile?.currentCrop || 'Cotton';
  const landSize = profile?.landSize || '2.5 acres';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="relative rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 bg-soil-dark text-white min-h-[220px] flex flex-col justify-between border-2 border-forest-green/30 font-sans text-left"
    >
      {/* Background Image with subtle Ken Burns zoom */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={heroFarmerImg}
          alt="Farm scene"
          className="w-full h-full object-cover opacity-60 scale-105 animate-kenburns origin-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-forest/95 via-deep-forest/80 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 space-y-4">
        
        {/* Top Badge & Welcome Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-light-leaf text-xs font-bold uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-golden-wheat" />
              <span>📍 {village}, {district}, Gujarat</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-warm-cream">
              👨‍🌾 {language === 'gu' ? `નમસ્તે, ${farmerName}` : language === 'hi' ? `नमस्ते, ${farmerName}` : `Welcome, ${farmerName}`}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 bg-leaf-green/90 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4" />
            <span>KisanGuard AI Active</span>
          </div>
        </div>

        {/* 4 Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-light-leaf font-semibold">
              <Sprout className="w-4 h-4 text-leaf-green" />
              <span>{language === 'gu' ? 'વર્તમાન પાક' : 'Current Crop'}</span>
            </div>
            <div className="text-base font-bold font-serif text-warm-cream">{currentCrop}</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-light-leaf font-semibold">
              <MapPin className="w-4 h-4 text-leaf-green" />
              <span>{language === 'gu' ? 'જમીન' : 'Land Size'}</span>
            </div>
            <div className="text-base font-bold font-serif text-warm-cream">{landSize}</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-light-leaf font-semibold">
              <CloudSun className="w-4 h-4 text-golden-wheat" />
              <span>{language === 'gu' ? 'હવામાન' : 'Weather'}</span>
            </div>
            <div className="text-base font-bold font-serif text-warm-cream">{temp}</div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs text-light-leaf font-semibold">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{language === 'gu' ? 'સેટેલાઇટ જોખમ' : 'Fire Radar'}</span>
            </div>
            <div className="text-base font-bold font-serif text-golden-wheat">🟢 LOW</div>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default FarmStatusHero;

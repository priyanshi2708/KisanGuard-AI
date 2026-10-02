import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, MapPin, Droplets, CircleDollarSign, CloudSun, Flame, ShieldCheck, Info, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const FarmContextPanel = ({ farmerContext, isOpen = false, onClose = null, isOpenMobile = false, onCloseMobile = null }) => {
  const { t } = useLanguage();
  const [showTrustModal, setShowTrustModal] = useState(false);

  const { profile, location, weather, fireRisk, financialSummary } = farmerContext;

  const panelContent = (
    <div className="space-y-4 font-sans flex flex-col h-full bg-white p-6 rounded-3xl">
      
      {/* Header with Trust Indicator */}
      <div className="border-b border-forest-green/10 pb-3 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold font-serif text-deep-forest flex items-center gap-2">
            <span>🌾 {t('assistant.myFarmTitle')}</span>
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            Live
          </span>
        </div>

        <button
          onClick={() => setShowTrustModal(true)}
          className="mt-2 text-left w-full p-2 rounded-xl bg-light-leaf/40 border border-leaf-green/30 text-[11px] font-bold text-forest-green hover:bg-light-leaf/70 transition-colors flex items-center justify-between"
        >
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-forest-green" />
            <span>{t('assistant.usingFarmInfo')}</span>
          </span>
          <ChevronRight className="w-3 h-3 opacity-60" />
        </button>
      </div>

      {/* Context Metrics List */}
      <div className="space-y-2.5 text-xs flex-1 overflow-y-auto pr-1">
        
        {/* Location */}
        <div className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest-green" />
            <span className="text-earth-brown font-semibold">Location</span>
          </div>
          <span className="font-bold text-deep-forest">{location.village}, {location.district}</span>
        </div>

        {/* Current Crop */}
        <div className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span className="text-earth-brown font-semibold">Current Crop</span>
          </div>
          <span className="font-bold text-emerald-700">{profile.currentCrop}</span>
        </div>

        {/* Land Size */}
        <div className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">📏</span>
            <span className="text-earth-brown font-semibold">Land Size</span>
          </div>
          <span className="font-bold text-deep-forest">{profile.landSize}</span>
        </div>

        {/* Water Availability */}
        <div className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-earth-brown font-semibold">Water</span>
          </div>
          <span className="font-bold text-deep-forest truncate max-w-[120px]">{profile.waterAvailability}</span>
        </div>

        {/* Financial Year Profit */}
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-900 font-semibold">2026 Result</span>
          </div>
          <span className="font-black font-serif text-emerald-700">
            ₹{financialSummary.netProfit.toLocaleString('en-IN')} {financialSummary.status === 'PROFIT' ? 'Profit' : 'Loss'}
          </span>
        </div>

        {/* Weather */}
        <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-sky-600" />
            <span className="text-sky-900 font-semibold">Today's Weather</span>
          </div>
          <span className="font-bold text-sky-800">{weather.currentTemp}°C, {weather.condition}</span>
        </div>

        {/* Fire Risk */}
        <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="text-orange-900 font-semibold">Fire Risk</span>
          </div>
          <span className="font-bold text-orange-700">{fireRisk.riskLevel} ({fireRisk.nearbyFireCount} spots)</span>
        </div>

      </div>

      {/* Trust Info Modal */}
      {showTrustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-forest-green/10 space-y-4">
            <div className="flex items-center justify-between border-b border-forest-green/10 pb-3">
              <h4 className="font-bold font-serif text-deep-forest text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest-green" />
                <span>{t('assistant.contextModalTitle')}</span>
              </h4>
              <button onClick={() => setShowTrustModal(false)} className="text-earth-brown hover:text-deep-forest">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-earth-brown leading-relaxed font-medium">
              {t('assistant.contextModalSub')}
            </p>

            <div className="p-3 rounded-2xl bg-warm-cream text-[11px] text-deep-forest font-semibold space-y-1">
              <div>📍 Location: {location.village}, {location.district}</div>
              <div>🌱 Active Crop: {profile.currentCrop}</div>
              <div>🌦️ Temp: {weather.currentTemp}°C</div>
              <div>💰 Net Profit: ₹{financialSummary.netProfit.toLocaleString('en-IN')}</div>
            </div>

            <button
              onClick={() => setShowTrustModal(false)}
              className="w-full py-2.5 rounded-xl bg-forest-green text-white font-bold text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );

  const activeIsOpen = isOpen || isOpenMobile;
  const activeOnClose = onClose || onCloseMobile;

  return (
    <AnimatePresence>
      {activeIsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-80 sm:w-96 h-full p-4 relative"
          >
            <button
              onClick={activeOnClose}
              className="absolute top-6 right-6 z-10 p-2 rounded-xl bg-gray-100 text-gray-600 hover:text-black cursor-pointer shadow-sm"
              title="Close farm details"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="h-full">
              {panelContent}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FarmContextPanel;

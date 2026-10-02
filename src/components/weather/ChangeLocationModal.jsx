import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Check, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { gujaratDistrictsAndVillages } from '../../data/locationData';

export const ChangeLocationModal = ({ isOpen, onClose, currentLocation, onSaveLocation }) => {
  const { t } = useLanguage();

  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('Gujarat');

  useEffect(() => {
    if (currentLocation) {
      setVillage(currentLocation.village || 'Anand');
      setDistrict(currentLocation.district || 'Anand');
      setState(currentLocation.state || 'Gujarat');
    }
  }, [currentLocation, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveLocation({
      village: village.trim() || 'Anand',
      district: district.trim() || 'Anand',
      state: state.trim() || 'Gujarat'
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-forest/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-forest-green/10 space-y-6 relative overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-light-leaf text-forest-green">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-deep-forest">
                  {t('weatherPage.modalTitle')}
                </h3>
                <p className="text-xs text-earth-brown font-medium">
                  {t('weatherPage.modalSub')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-warm-cream text-earth-brown transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-deep-forest mb-1.5 uppercase tracking-wider">
                {t('weatherPage.villageLabel')}
              </label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Anand"
                required
                className="w-full px-4 py-3 rounded-2xl border border-forest-green/20 focus:border-forest-green focus:ring-2 focus:ring-forest-green/20 outline-none text-sm font-medium text-deep-forest bg-warm-cream/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-deep-forest mb-1.5 uppercase tracking-wider">
                {t('weatherPage.districtLabel')}
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Anand"
                required
                className="w-full px-4 py-3 rounded-2xl border border-forest-green/20 focus:border-forest-green focus:ring-2 focus:ring-forest-green/20 outline-none text-sm font-medium text-deep-forest bg-warm-cream/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-deep-forest mb-1.5 uppercase tracking-wider">
                {t('weatherPage.stateLabel')}
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Gujarat"
                required
                className="w-full px-4 py-3 rounded-2xl border border-forest-green/20 focus:border-forest-green focus:ring-2 focus:ring-forest-green/20 outline-none text-sm font-medium text-deep-forest bg-warm-cream/30"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-2xl border border-earth-brown/20 text-earth-brown font-bold text-xs hover:bg-warm-cream transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-forest-green to-leaf-green text-white font-bold text-xs shadow-glow-green hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t('weatherPage.saveLocationBtn')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChangeLocationModal;

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle, Sparkles } from 'lucide-react';
import { getCropRecommendations } from '../../services/cropRecommendationService';
import { useLanguage } from '../../context/LanguageContext';

export const CropComparisonModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const crops = getCropRecommendations();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-soil-dark/70 backdrop-blur-sm font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-warm-cream rounded-3xl p-6 sm:p-8 max-w-3xl w-full border-2 border-forest-green/20 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-forest-green uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-golden-wheat" />
                <span>Crop Decision Comparison</span>
              </div>
              <h3 className="text-2xl font-bold font-serif text-deep-forest">
                Next Season Crop Breakdown
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white border border-forest-green/20 text-deep-forest hover:bg-light-leaf/40 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Disclaimer Banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>Note: Figures represent estimated financial values based on regional market benchmarks.</span>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto border border-forest-green/15 rounded-2xl bg-white shadow-sm">
            <table className="w-full text-left text-sm font-sans">
              <thead className="bg-light-leaf/50 text-forest-green uppercase text-xs tracking-wider border-b border-forest-green/10">
                <tr>
                  <th className="p-3.5 font-bold">Parameter</th>
                  <th className="p-3.5 font-bold">Groundnut (Recommended)</th>
                  <th className="p-3.5 font-bold">Cotton</th>
                  <th className="p-3.5 font-bold">Wheat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-green/10 text-deep-forest text-xs font-semibold">
                <tr>
                  <td className="p-3.5 text-earth-brown font-bold">Water Requirement</td>
                  <td className="p-3.5 text-forest-green font-bold">Medium</td>
                  <td className="p-3.5 text-amber-600 font-bold">High</td>
                  <td className="p-3.5 text-forest-green font-bold">Medium</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-earth-brown font-bold">Risk Level</td>
                  <td className="p-3.5 text-emerald-600 font-bold">Low</td>
                  <td className="p-3.5 text-amber-600 font-bold">Medium</td>
                  <td className="p-3.5 text-emerald-600 font-bold">Low</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-earth-brown font-bold">Expected Cost</td>
                  <td className="p-3.5 font-mono font-bold">₹18,000</td>
                  <td className="p-3.5 font-mono font-bold">₹25,000</td>
                  <td className="p-3.5 font-mono font-bold">₹20,000</td>
                </tr>
                <tr>
                  <td className="p-3.5 text-earth-brown font-bold">Expected Revenue</td>
                  <td className="p-3.5 font-mono font-bold text-forest-green">₹42,000</td>
                  <td className="p-3.5 font-mono font-bold text-forest-green">₹48,000</td>
                  <td className="p-3.5 font-mono font-bold text-forest-green">₹40,000</td>
                </tr>
                <tr className="bg-light-leaf/30 font-bold">
                  <td className="p-3.5 text-deep-forest">Expected Net Profit</td>
                  <td className="p-3.5 font-mono text-forest-green text-sm font-bold">₹24,000</td>
                  <td className="p-3.5 font-mono text-forest-green text-sm font-bold">₹23,000</td>
                  <td className="p-3.5 font-mono text-forest-green text-sm font-bold">₹20,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-forest-green text-white font-bold text-xs hover:bg-deep-forest transition-colors"
            >
              Close Comparison
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CropComparisonModal;

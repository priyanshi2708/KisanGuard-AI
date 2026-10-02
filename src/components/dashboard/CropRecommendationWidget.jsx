import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, Star, ArrowRight, CheckCircle, Info } from 'lucide-react';
import { getCropRecommendations } from '../../services/cropRecommendationService';
import CropComparisonModal from './CropComparisonModal';
import { useLanguage } from '../../context/LanguageContext';

export const CropRecommendationWidget = () => {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  
  const recResult = getCropRecommendations();
  const recommendations = Array.isArray(recResult)
    ? recResult
    : (Array.isArray(recResult?.data?.recommendedCrops) ? recResult.data.recommendedCrops : []);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest-green/10 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
            <Sprout className="w-5 h-5 text-leaf-green" />
            <span>{t('dashboard.cropRecTitle') || 'Crop Recommendation'}</span>
          </h2>
          <p className="text-xs text-earth-brown font-medium">{t('dashboard.cropRecSub') || 'AI-backed personalized crop suggestions'}</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-green/10 text-forest-green font-bold text-xs hover:bg-forest-green hover:text-white transition-colors cursor-pointer"
        >
          <span>{t('dashboard.cropRecDetails') || 'Compare Options'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top 3 Crop Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recommendations.slice(0, 3).map((item, idx) => {
          const cropName = item.cropName || item.name || 'Groundnut';
          const cropGu = item.cropNameGu || item.gujaratiName || 'મગફળી';
          const cropHi = item.cropNameHi || item.hindiName || 'मूंगफली';
          const score = item.suitabilityScore || 92;
          const risk = item.riskLevel || item.risk || 'Low';
          const water = item.waterRequirementGu || item.waterRequirement || 'Medium';
          const reason = Array.isArray(item.reasonsGu) && item.reasonsGu.length > 0
            ? item.reasonsGu[0]
            : (item.whyRecommendKey || 'ઉચ્ચ ઉત્પાદન અને ઓછા સિંચાઈ ખર્ચ માટે ઉત્તમ પાક.');
          const profit = item.estimatedProfit ? item.estimatedProfit.toLocaleString('en-IN') : (idx === 0 ? '24,000' : idx === 1 ? '23,000' : '20,000');

          return (
            <motion.div
              key={item.cropId || item.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`p-5 rounded-3xl border flex flex-col justify-between space-y-4 ${
                idx === 0
                  ? 'bg-gradient-to-br from-light-leaf/40 to-warm-cream border-leaf-green/40 shadow-lg'
                  : 'bg-warm-cream/50 border-forest-green/15 shadow-sm'
              }`}
            >
              <div className="space-y-3 text-left">
                
                {/* Badge & Rating */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                    idx === 0 ? 'bg-leaf-green text-white shadow' : 'bg-forest-green/10 text-forest-green'
                  }`}>
                    {idx === 0 ? (t('dashboard.topMatch') || 'Top Match') : `Option 0${idx + 1}`}
                  </span>

                  <div className="flex items-center text-golden-wheat text-xs gap-1">
                    <Star className="w-3.5 h-3.5 fill-golden-wheat" />
                    <span className="font-bold text-forest-green">{score}% Match</span>
                  </div>
                </div>

                {/* Crop Name */}
                <div>
                  <h3 className="text-xl font-bold font-serif text-deep-forest">
                    {cropName}
                  </h3>
                  <div className="text-xs font-bold text-forest-green">
                    {cropGu} • {cropHi}
                  </div>
                </div>

                {/* Parameter Metrics */}
                <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-earth-brown bg-white/70 p-2.5 rounded-xl border border-forest-green/10">
                  <div>
                    <div className="text-forest-green/70">{t('dashboard.demand') || 'Demand'}</div>
                    <div className="text-deep-forest font-bold">{item.expectedDemand || 'High'}</div>
                  </div>
                  <div>
                    <div className="text-forest-green/70">{t('dashboard.water') || 'Water'}</div>
                    <div className="text-deep-forest font-bold">{water}</div>
                  </div>
                  <div>
                    <div className="text-forest-green/70">{t('dashboard.risk') || 'Risk'}</div>
                    <div className="text-emerald-700 font-bold">{risk}</div>
                  </div>
                </div>

                {/* Recommendation Reason */}
                <p className="text-xs text-earth-brown leading-relaxed font-medium line-clamp-2">
                  "{reason}"
                </p>
              </div>

              {/* Estimated Profit Banner */}
              <div className="pt-3 border-t border-forest-green/10 flex items-center justify-between text-xs">
                <span className="text-earth-brown font-medium">{t('dashboard.estNetProfitLabel') || 'Est. Net Profit'}</span>
                <span className="font-bold font-mono text-forest-green text-sm">₹{profit}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison Modal */}
      <CropComparisonModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

    </div>
  );
};

export default CropRecommendationWidget;

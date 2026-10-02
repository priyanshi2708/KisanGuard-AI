import React from 'react';
import { Flame, CloudRain, Droplets, CircleDollarSign, ShieldAlert } from 'lucide-react';
import { getRiskBreakdown } from '../../services/cropRecommendationService';
import { useLanguage } from '../../context/LanguageContext';

export const RiskBreakdownWidget = ({ cropId = "groundnut" }) => {
  const { language } = useLanguage();
  const risks = getRiskBreakdown(cropId);

  const items = [
    { labelGu: "🔥 આગનું જોખમ", labelEn: "🔥 Fire Risk", data: risks.fireRisk },
    { labelGu: "🌧️ હવામાન જોખમ", labelEn: "🌧️ Weather Risk", data: risks.weatherRisk },
    { labelGu: "💧 પાણી જોખમ", labelEn: "💧 Water Risk", data: risks.waterRisk },
    { labelGu: "💰 બજાર જોખમ", labelEn: "💰 Market Risk", data: risks.marketRisk },
    { labelGu: "🌱 રોગ-જીવાત જોખમ", labelEn: "🌱 Crop Disease Risk", data: risks.diseaseRisk }
  ];

  const getLevelLabel = (score) => {
    if (score < 30) return language === 'gu' ? '🟢 ઓછું' : '🟢 Low';
    if (score < 60) return language === 'gu' ? '🟡 મધ્યમ' : '🟡 Medium';
    return language === 'gu' ? '🔴 વધારે' : '🔴 High';
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/15 space-y-4 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-green/10 pb-3">
        <h2 className="text-lg sm:text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-emerald-600" />
          <span>{language === 'gu' ? '🛡️ ૫-પરિમાણીય જોખમ પૃથક્કરણ' : '🛡️ 5-DIMENSION RISK BREAKDOWN'}</span>
        </h2>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
          {language === 'gu' ? 'આકસ્મિક જોખમ પ્રોફાઈલ: ઓછું–મધ્યમ' : 'Overall Risk Profile: Low–Medium'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {items.map((item, idx) => {
          const label = language === 'gu' ? item.labelGu : item.labelEn;
          return (
            <div key={idx} className="p-3.5 rounded-2xl bg-warm-cream/60 border border-forest-green/10 text-center space-y-1.5 flex flex-col justify-between h-full">
              <div className="text-xs text-earth-brown font-bold">{label}</div>
              <div className="text-sm font-extrabold font-serif">{getLevelLabel(item.data.score)}</div>
              <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-forest-green/10">
                <div
                  className={`h-full ${item.data.score < 30 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${item.data.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskBreakdownWidget;

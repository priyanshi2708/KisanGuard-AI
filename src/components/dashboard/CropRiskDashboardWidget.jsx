import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, ChevronRight, RefreshCw, Sprout } from 'lucide-react';
import { assessCropRisk } from '../../services/cropRiskService';
import { getFarmerProfile } from '../../services/farmerProfileService';
import { useLanguage } from '../../context/LanguageContext';

export const CropRiskDashboardWidget = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadRiskData = async () => {
      try {
        setLoading(true);
        const profile = getFarmerProfile();
        const res = await assessCropRisk({
          cropName: profile?.currentCrop,
          location: profile?.village || profile?.district || 'Anand'
        });

        if (isMounted && res && res.success && res.data) {
          setRiskData(res.data);
        }
      } catch (err) {
        console.error('[CropRiskWidget] Error fetching crop risk:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadRiskData();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-md border border-forest-green/10 space-y-4 font-sans animate-pulse">
        <div className="flex items-center gap-2 text-amber-700 font-bold text-base border-b border-gray-100 pb-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>{language === 'gu' ? 'પાક જોખમ તપાસી રહ્યા છીએ...' : 'Evaluating Crop Risks...'}</span>
        </div>
        <div className="h-16 bg-amber-50 rounded-2xl"></div>
      </div>
    );
  }

  // Graceful handling when no data or crop is missing
  if (!riskData || riskData.missingCurrentCrop) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-md border border-forest-green/10 space-y-3 font-sans text-left">
        <div className="flex items-center justify-between border-b border-forest-green/10 pb-3">
          <div className="flex items-center gap-2 font-bold font-serif text-deep-forest text-lg">
            <span className="text-xl">⚠️</span>
            <span>{language === 'gu' ? 'પાક જોખમ અને સાવચેતી' : 'Crop Risk Watch'}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
          <div className="font-bold text-sm">🌱 {language === 'gu' ? 'વર્તમાન પાકની માહિતી આપો' : 'Select Current Crop'}</div>
          <p className="leading-relaxed">
            {language === 'gu'
              ? 'પાક જોખમ ચકાસવા માટે તમારો હાલનો પાક પ્રોફાઇલમાં સેટ કરો.'
              : 'Please set your current crop in your profile to view customized risk alerts.'}
          </p>
        </div>
      </div>
    );
  }

  const risks = riskData.risks || [];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-200/80 space-y-5 font-sans text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-amber-950 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span>{language === 'gu' ? 'પાક જોખમ અને પૂર્વ ચેતવણી' : 'Crop Risk & Early Warning'}</span>
          </h2>
          <p className="text-xs text-amber-800 font-medium mt-0.5">
            🌱 {riskData.cropName} • 📍 {riskData.location}
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300">
          {riskData.risksCount || 0} {language === 'gu' ? 'જોખમ ચિહ્નો' : 'Risk Signals'}
        </span>
      </div>

      {/* Risk Items List */}
      <div className="space-y-3.5">
        {risks.map((risk, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-amber-950">
                {language === 'gu' ? (risk.titleGu || risk.titleEn) : (risk.titleEn || risk.titleGu)}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                risk.severity === 'High'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : risk.severity === 'Moderate'
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {risk.severity || 'Moderate'} {language === 'gu' ? 'જોખમ' : language === 'hi' ? 'जोखिम' : 'Risk'}
              </span>
            </div>

            {risk.evidence && (
              <div className="text-xs text-amber-900 font-semibold bg-white p-2 rounded-xl border border-amber-100">
                🌦️ <strong>{language === 'gu' ? 'દસ્તાવેજી ડેટા:' : language === 'hi' ? 'दस्तावेजी डेटा:' : 'Observed Data:'}</strong> {risk.evidence}
              </div>
            )}

            {risk.whyItMatters && (
              <div className="text-xs text-gray-700 font-medium">
                🔍 <strong>{language === 'gu' ? 'અસર:' : language === 'hi' ? 'प्रभाव:' : 'Impact:'}</strong> {risk.whyItMatters}
              </div>
            )}

            {((language === 'gu' ? risk.actionsGu : (risk.actionsEn || risk.actionsGu)) || []).length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-bold text-emerald-900">
                  💡 <strong>{language === 'gu' ? 'સાવચેતીના પગલાં:' : language === 'hi' ? 'सावधानी के कदम:' : 'Recommended Actions:'}</strong>
                </div>
                {(language === 'gu' ? risk.actionsGu : (risk.actionsEn || risk.actionsGu)).slice(0, 2).map((act, aIdx) => (
                  <div key={aIdx} className="text-xs text-gray-800 flex items-start gap-1 font-medium">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            )}

            {risk.uncertaintyNote && (
              <div className="text-[10px] text-amber-800 italic pt-1 border-t border-amber-200/60 font-medium">
                📌 {risk.uncertaintyNote}
              </div>
            )}
          </div>
        ))}
      </div>

      {riskData.disclaimer && (
        <div className="text-[10px] text-amber-900/80 italic font-medium pt-1 border-t border-amber-200">
          {riskData.disclaimer}
        </div>
      )}
    </div>
  );
};

export default CropRiskDashboardWidget;

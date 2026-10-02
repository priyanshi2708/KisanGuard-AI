import React, { useState, useEffect } from 'react';
import { AlertTriangle, ChevronRight, X } from 'lucide-react';
import { assessCropRisk } from '../../services/cropRiskService';
import { getFarmerProfile } from '../../services/farmerProfileService';
import { useLanguage } from '../../context/LanguageContext';

export const CropRiskAlertBanner = () => {
  const { language } = useLanguage();
  const [highRisk, setHighRisk] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkRisk = async () => {
      try {
        const profile = getFarmerProfile();
        const res = await assessCropRisk({
          cropName: profile?.currentCrop,
          location: profile?.village || profile?.district || 'Anand'
        });

        if (isMounted && res && res.success && res.data?.risks) {
          // Find first High severity risk or Moderate risk
          const urgent = res.data.risks.find(r => r.severity === 'High') || res.data.risks.find(r => r.severity === 'Moderate');
          if (urgent) {
            setHighRisk(urgent);
          }
        }
      } catch (e) {
        console.error('[CropRiskAlertBanner] Check error:', e);
      }
    };

    checkRisk();
    return () => { isMounted = false; };
  }, []);

  if (dismissed || !highRisk) return null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans text-left relative">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md text-white shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <div className="font-extrabold text-sm flex items-center gap-2 tracking-tight">
            <span>⚠️ {highRisk.titleGu || highRisk.titleEn}</span>
          </div>
          <div className="text-xs text-white/95 font-medium leading-relaxed">
            {highRisk.evidence} — {highRisk.possibleConcern}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CropRiskAlertBanner;

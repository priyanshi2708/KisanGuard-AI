import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CropHealthActionCard = () => {
  const { language } = useLanguage();

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-900 via-forest-green to-deep-forest text-white shadow-xl space-y-4 relative overflow-hidden font-sans text-left">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-light-leaf uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-golden-wheat" />
          <span>Step 13 • Crop Vision AI</span>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white backdrop-blur-md">
          Multimodal Diagnostic
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-black font-serif text-warm-cream">
          {language === 'gu' ? '📷 પાકમાં કોઈ સમસ્યા છે? ફોટો સ્કેન કરો' : '📷 Notice any Crop Issue? Scan Photo'}
        </h3>
        <p className="text-xs sm:text-sm text-light-leaf/90 leading-relaxed font-medium">
          {language === 'gu'
            ? 'પાંદડાનો ફોટો પાડીને રોગચાળો, પીળાશ કે કીડાનું એઆઈ નિદાન મેળવો. નિદાન આધારિત ચકાસણી અને સલામત પગલાં જુઓ.'
            : 'Upload a leaf photo to get instant AI diagnostic observations, possible causes, and safe recommended next steps.'}
        </p>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <Link
          to="/crop-health"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-leaf-green to-emerald-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-lg hover:scale-105 transition-transform"
        >
          <Camera className="w-4 h-4" />
          <span>{language === 'gu' ? 'પાક નો ફોટો તપાસો (Crop Health Scan)' : 'Scan Crop Health Photo'}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <div className="text-[11px] text-light-leaf/80 flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-4 h-4 text-golden-wheat shrink-0" />
          <span>{language === 'gu' ? 'ચકાસાયેલ RAG કૃષિ માહિતી આધારિત' : 'Powered by Verified Agricultural RAG'}</span>
        </div>
      </div>
    </div>
  );
};

export default CropHealthActionCard;

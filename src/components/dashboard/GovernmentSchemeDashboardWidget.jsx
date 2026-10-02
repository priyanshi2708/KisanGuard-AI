import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';
import { searchGovernmentSchemes } from '../../services/governmentSchemeService';
import { getFarmerProfile } from '../../services/farmerProfileService';
import { useLanguage } from '../../context/LanguageContext';

export const GovernmentSchemeDashboardWidget = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const loadSchemes = async () => {
      try {
        setLoading(true);
        const profile = getFarmerProfile();
        const crop = profile?.currentCrop || 'Cotton';
        const res = await searchGovernmentSchemes({ query: crop, state: 'Gujarat' });

        if (isMounted && res && res.success && Array.isArray(res.schemes)) {
          // Keep top 2 compact schemes for clean visual balance
          setSchemes(res.schemes.slice(0, 2));
        }
      } catch (err) {
        console.error('[GovernmentSchemeWidget] Error fetching schemes:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSchemes();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-md border border-forest-green/10 font-sans animate-pulse h-full flex flex-col justify-between">
        <div className="flex items-center gap-2 text-purple-700 font-bold text-base border-b border-gray-100 pb-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>{language === 'gu' ? 'સરકારી યોજનાઓ શોધી રહ્યા છીએ...' : 'Searching Schemes...'}</span>
        </div>
        <div className="h-32 bg-purple-50/50 rounded-2xl"></div>
      </div>
    );
  }

  if (schemes.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-md border border-forest-green/10 space-y-3 font-sans text-left h-full flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-forest-green/10 pb-3">
          <div className="flex items-center gap-2 font-bold font-serif text-deep-forest text-base">
            <Landmark className="w-5 h-5 text-purple-700" />
            <span>{language === 'gu' ? 'સરકારી યોજનાઓ' : 'Govt Schemes'}</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
          {language === 'gu' ? 'હાલમાં ચકાસાયેલ યોજના માહિતી ઉપલબ્ધ નથી.' : 'No active schemes currently listed.'}
        </div>
        <div className="pt-2 border-t border-forest-green/10 text-right">
          <Link to="/crops" className="text-[11px] font-extrabold text-purple-800 hover:underline">
            {language === 'gu' ? 'બધી યોજનાઓ જુઓ →' : 'View All Schemes →'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-forest-green/10 font-sans text-left flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forest-green/10 pb-3 shrink-0">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-serif text-deep-forest flex items-center gap-2">
            <Landmark className="w-5 h-5 text-purple-700" />
            <span>
              {language === 'gu'
                ? 'સંબંધિત સરકારી યોજનાઓ'
                : language === 'hi'
                ? 'संबंधित सरकारी योजनाएं'
                : 'Relevant Govt Schemes'}
            </span>
          </h2>
          <p className="text-[11px] text-earth-brown font-medium mt-0.5">
            i-Khedut Portal & PM-Kisan
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 shrink-0">
          {language === 'gu' ? 'સત્તાવાર i-Khedut' : language === 'hi' ? 'आधिकारिक i-Khedut' : 'Official i-Khedut'}
        </span>
      </div>

      {/* Compact Schemes List */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-center">
        {schemes.map((s, idx) => (
          <div key={idx} className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-xs sm:text-sm text-purple-950 font-serif line-clamp-1">
                {language === 'gu' ? (s.schemeNameGu || s.schemeName) : language === 'hi' ? (s.schemeNameHi || s.schemeName) : (s.schemeNameEn || s.schemeName)}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white text-purple-900 border border-purple-200 shrink-0">
                {s.category || 'Subsidy'}
              </span>
            </div>

            <p className="text-[11px] text-earth-brown leading-snug font-medium line-clamp-2">
              {language === 'gu' ? (s.benefitsGu || s.benefits || s.description) : (s.benefits || s.description)}
            </p>

            {s.officialSource && (
              <div className="pt-0.5 flex justify-end">
                <a
                  href={s.officialSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-800 hover:underline"
                >
                  <span>
                    {language === 'gu' ? 'સત્તાવાર પોર્ટલ' : language === 'hi' ? 'आधिकारिक पोर्टल' : 'Official Portal'}
                  </span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between text-[11px] text-earth-brown font-medium pt-2 border-t border-forest-green/10 shrink-0">
        <span className="italic">
          {language === 'gu' ? '🏛️ સરકારી સહાય' : language === 'hi' ? '🏛️ सरकारी सब्सिडी' : '🏛️ Government Subsidy'}
        </span>
        <Link to="/crops" className="font-extrabold text-purple-800 hover:text-purple-950 flex items-center gap-1 transition-colors">
          <span>{language === 'gu' ? 'બધી યોજનાઓ જુઓ →' : language === 'hi' ? 'सभी योजनाएं देखें →' : 'View All Schemes →'}</span>
        </Link>
      </div>
    </div>
  );
};

export default GovernmentSchemeDashboardWidget;

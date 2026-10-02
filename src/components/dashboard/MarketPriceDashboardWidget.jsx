import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, RefreshCw, ShoppingBag } from 'lucide-react';
import { getMarketPrices } from '../../services/marketPriceService';
import { getFarmerProfile } from '../../services/farmerProfileService';
import { useLanguage } from '../../context/LanguageContext';

export const MarketPriceDashboardWidget = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const profile = getFarmerProfile();
        const crop = profile?.currentCrop || 'Cotton';
        const location = profile?.village || profile?.district || 'Anand';

        const res = await getMarketPrices({ commodity: crop, location });
        if (isMounted && res && res.success && res.data) {
          setMarketData(res.data);
          setError(false);
        } else if (isMounted) {
          setError(true);
        }
      } catch (err) {
        if (isMounted) setError(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPrices();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-md border border-forest-green/10 font-sans animate-pulse h-full flex flex-col justify-between">
        <div className="flex items-center gap-2 text-forest-green font-bold text-base border-b border-gray-100 pb-3">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>{language === 'gu' ? 'બજાર ભાવ લોડ થઈ રહ્યા છે...' : 'Loading Market Prices...'}</span>
        </div>
        <div className="h-32 bg-warm-cream/60 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-md border border-forest-green/10 space-y-3 font-sans text-left h-full flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-forest-green/10 pb-3">
          <div className="flex items-center gap-2 font-bold font-serif text-deep-forest text-base">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <span>{language === 'gu' ? 'બજાર ભાવ' : 'Market Rates'}</span>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          {language === 'gu'
            ? 'આ પાક માટે હાલમાં ચકાસાયેલ બજાર ભાવ ઉપલબ્ધ નથી.'
            : 'Verified market prices currently unavailable for this crop.'}
        </div>
        <div className="pt-2 border-t border-forest-green/10 text-right">
          <Link to="/crops" className="text-[11px] font-extrabold text-emerald-800 hover:underline">
            {language === 'gu' ? 'વિગતો જુઓ →' : 'View Details →'}
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
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>
              {language === 'gu'
                ? 'બજાર ભાવ (APMC Mandi)'
                : language === 'hi'
                ? 'मंडी भाव (APMC Mandi)'
                : 'Live APMC Mandi Rates'}
            </span>
          </h2>
          <p className="text-[11px] text-earth-brown font-medium mt-0.5">
            📍 {marketData.market || 'Anand APMC'} • 🌱 {language === 'gu' ? (marketData.commodityGu || marketData.commodity) : language === 'hi' ? (marketData.commodityHi || marketData.commodity) : (marketData.commodityEn || marketData.commodity)}
          </p>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
          {language === 'gu' ? 'APMC માન્ય' : language === 'hi' ? 'APMC सत्यापित' : 'APMC Verified'}
        </span>
      </div>

      {/* 3 Price Boxes Grid */}
      <div className="grid grid-cols-3 gap-2.5 text-center flex-1 items-center">
        <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 space-y-1">
          <div className="text-[10px] text-emerald-800 font-bold uppercase">
            {language === 'gu' ? 'ઓછામાં ઓછો' : language === 'hi' ? 'न्यूनतम भाव' : 'Min Price'}
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-900 font-serif">₹{marketData.minPrice}</div>
          <div className="text-[9px] text-earth-brown font-mono">{marketData.priceUnit}</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-forest-green text-white p-3 rounded-2xl shadow-sm space-y-1">
          <div className="text-[10px] text-light-leaf font-bold uppercase">
            {language === 'gu' ? 'મધ્યમ ભાવ' : language === 'hi' ? 'औसत भाव' : 'Modal Price'}
          </div>
          <div className="text-lg sm:text-xl font-black font-serif">₹{marketData.modalPrice}</div>
          <div className="text-[9px] text-light-leaf/80 font-mono">{marketData.priceUnit}</div>
        </div>

        <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/80 space-y-1">
          <div className="text-[10px] text-emerald-800 font-bold uppercase">
            {language === 'gu' ? 'મહત્તમ ભાવ' : language === 'hi' ? 'अधिकतम भाव' : 'Max Price'}
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-900 font-serif">₹{marketData.maxPrice}</div>
          <div className="text-[9px] text-earth-brown font-mono">{marketData.priceUnit}</div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between text-[11px] text-earth-brown font-medium pt-2 border-t border-forest-green/10 shrink-0">
        <span className="italic">
          {language === 'gu' ? '📌 APMC Mandi દર' : language === 'hi' ? '📌 APMC Mandi दर' : '📌 APMC Mandi Rates'}
        </span>
        <Link to="/crops" className="font-extrabold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors">
          <span>{language === 'gu' ? 'વિગતો જુઓ →' : language === 'hi' ? 'विवरण देखें →' : 'View Details →'}</span>
        </Link>
      </div>
    </div>
  );
};

export default MarketPriceDashboardWidget;

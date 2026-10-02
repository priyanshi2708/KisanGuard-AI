import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, CloudSun, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const RecommendationLoadingState = ({ onComplete }) => {
  const { language } = useLanguage();
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    {
      labelGu: "તમારા ખેતરની વિગતો ચકાસાઈ રહી છે...",
      labelEn: "Understanding your farm profile...",
      icon: Sprout
    },
    {
      labelGu: "સ્થાનિક ચોમાસા હવામાનની આગાહી મેળવી રહ્યા છીએ...",
      labelEn: "Checking monsoon weather forecast...",
      icon: CloudSun
    },
    {
      labelGu: "પાક યોગ્યતા અને જોખમ પરિબળોની તુલના કરી રહ્યા છીએ...",
      labelEn: "Comparing crop suitability & risk factors...",
      icon: RefreshCw
    },
    {
      labelGu: "તમારા ખેતર માટે શ્રેષ્ઠ પાક ભલામણ તૈયાર થઈ રહી છે...",
      labelEn: "Preparing personalized crop recommendations...",
      icon: CheckCircle2
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(timer);
        setTimeout(() => onComplete(), 600);
        return prev;
      });
    }, 700);

    return () => clearInterval(timer);
  }, [onComplete, steps.length]);

  const CurrentIcon = steps[stepIndex].icon;
  const currentLabel = language === 'gu' ? steps[stepIndex].labelGu : steps[stepIndex].labelEn;

  return (
    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border-2 border-forest-green/20 text-center space-y-6 max-w-xl mx-auto my-8 font-sans">
      <div className="w-20 h-20 rounded-full bg-light-leaf/60 text-forest-green flex items-center justify-center mx-auto shadow-inner border border-leaf-green/30">
        <CurrentIcon className="w-10 h-10 animate-pulse text-leaf-green" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
          {currentLabel}
        </h3>
        <p className="text-xs text-earth-brown font-medium">
          {language === 'gu'
            ? 'જમીનના પ્રકાર, પાણીનું સ્તર અને સ્થાનિક માર્કેટ યાર્ડના ભાવનું વિશ્લેષણ'
            : 'Analyzing soil parameters, water levels, and regional market prices'}
        </p>
      </div>

      <div className="w-full bg-warm-cream h-3 rounded-full overflow-hidden border border-forest-green/10">
        <motion.div
          className="bg-gradient-to-r from-forest-green to-leaf-green h-full rounded-full"
          initial={{ width: '10%' }}
          animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex justify-center gap-4 text-xs font-bold text-forest-green pt-2">
        {steps.map((_, idx) => (
          <span
            key={idx}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx <= stepIndex ? 'bg-leaf-green scale-125' : 'bg-earth-brown/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationLoadingState;

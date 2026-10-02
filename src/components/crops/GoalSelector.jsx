import React from 'react';
import { motion } from 'framer-motion';
import { Check, DollarSign, Droplets, ShieldCheck, Zap, Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const GoalSelector = ({ selectedGoals, onToggleGoal }) => {
  const { language } = useLanguage();

  const goals = [
    {
      id: 'profit',
      titleGu: '💰 વધુ નફો',
      titleEn: '💰 Higher Profit',
      descGu: 'પ્રતિ એકર ઉત્પાદન અને આવક વધારો',
      descEn: 'Maximize potential net returns per acre',
      icon: DollarSign
    },
    {
      id: 'water',
      titleGu: '💧 ઓછું પાણી',
      titleEn: '💧 Less Water',
      descGu: 'ઓછી સિંચાઈની જરૂરિયાત વાળા પાક',
      descEn: 'Crops requiring minimal irrigation',
      icon: Droplets
    },
    {
      id: 'risk',
      titleGu: '🛡️ ઓછું જોખમ',
      titleEn: '🛡️ Lower Risk',
      descGu: 'સ્થિર માંગ અને રોગ-મુક્ત પાક',
      descEn: 'Safe options with steady demand',
      icon: ShieldCheck
    },
    {
      id: 'speed',
      titleGu: '⚡ ઝડપી પાક',
      titleEn: '⚡ Quick Harvest',
      descGu: 'ઝડપથી પાકતા (૯૦-૧૧૦ દિવસ)',
      descEn: 'Short duration crops (90–110 days)',
      icon: Zap
    },
    {
      id: 'soil',
      titleGu: '🌱 જમીન સુધારણા',
      titleEn: '🌱 Soil Health',
      descGu: 'નાઇટ્રોજન ઉમેરતા ફળદ્રુપ પાક',
      descEn: 'Legumes that fix nitrogen & restore soil',
      icon: Sprout
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-forest-green/10 space-y-4 font-sans text-left">
      <div className="space-y-0.5">
        <h2 className="text-base sm:text-lg font-bold font-serif text-deep-forest flex items-center gap-2">
          <span>🎯 {language === 'gu' ? 'તમારા મુખ્ય લક્ષ્યો કયા છે?' : 'What Are Your Farming Goals?'}</span>
        </h2>
        <p className="text-xs text-earth-brown font-medium">
          {language === 'gu'
            ? 'તમારી આગામી સીઝન માટે એક કે વધુ પ્રાથમિકતાઓ પસંદ કરો:'
            : 'Select one or multiple priorities for your upcoming crop planning:'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-stretch">
        {goals.map((item) => {
          const isSelected = selectedGoals.includes(item.id);
          const title = language === 'gu' ? item.titleGu : item.titleEn;
          const desc = language === 'gu' ? item.descGu : item.descEn;

          return (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggleGoal(item.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between h-full space-y-3 relative ${
                isSelected
                  ? 'bg-gradient-to-br from-light-leaf/40 to-warm-cream border-leaf-green shadow-md'
                  : 'bg-warm-cream/40 border-forest-green/15 hover:border-forest-green/30'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-leaf-green text-white flex items-center justify-center shadow">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div className="space-y-1.5">
                <h3 className="font-extrabold font-serif text-sm text-deep-forest pt-0.5 pr-5">
                  {title}
                </h3>
                <p className="text-[11px] text-earth-brown font-medium leading-relaxed opacity-90">
                  {desc}
                </p>
              </div>

              <div className={`text-[10px] font-bold ${isSelected ? 'text-forest-green' : 'text-earth-brown/60'} border-t border-current/10 pt-1.5`}>
                {isSelected ? (language === 'gu' ? '✓ લક્ષ્ય પસંદ કર્યું' : '✓ Goal Selected') : (language === 'gu' ? '+ પસંદ કરો' : '+ Select Goal')}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalSelector;

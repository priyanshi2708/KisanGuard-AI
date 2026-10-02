import React from 'react';
import { MapPin, Sprout, Droplets, CircleDollarSign, Edit3, UserCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const FarmProfileSummaryBar = ({ farmerProfile, onEditClick }) => {
  const { language } = useLanguage();

  const village = farmerProfile?.village || 'આણંદ';
  const district = farmerProfile?.district || 'આણંદ';
  const landSize = farmerProfile?.landSize || '૨.૫ એકર';
  const waterAvailability = farmerProfile?.waterAvailability || 'બોરવેલ / મધ્યમ';
  const previousCrop = farmerProfile?.previousCrop || 'કપાસ (Cotton)';
  const previousProfit = farmerProfile?.previousProfit || '₹૨૮,૫૦૦ નફો';

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-md border border-forest-green/15 space-y-4 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-green/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-forest-green/10 text-forest-green flex items-center justify-center font-bold shrink-0">
            <UserCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h3 className="font-bold font-serif text-deep-forest text-sm sm:text-base">
              {language === 'gu' ? '👨‍🌾 તમારું ખેતર પ્રોફાઇલ વિગતો' : '👨‍🌾 YOUR FARM PROFILE'}
            </h3>
            <p className="text-[11px] text-earth-brown font-medium">
              {language === 'gu'
                ? 'પાક ભલામણ માટે ઉપયોગમાં લેવાયેલ સક્રિય ખેતર પેરામીટર્સ'
                : 'Active parameters used to personalize your crop recommendation'}
            </p>
          </div>
        </div>

        <button
          onClick={onEditClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-forest-green/20 text-xs font-bold text-forest-green hover:bg-light-leaf/40 transition-colors self-start sm:self-auto cursor-pointer shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{language === 'gu' ? 'ખેતર વિગત બદલો' : 'Edit Farm Information'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-stretch">
        <div className="p-3.5 rounded-2xl bg-warm-cream/60 border border-forest-green/10 flex flex-col justify-between h-full space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-forest-green uppercase font-bold tracking-wider">
            <MapPin className="w-3 h-3 text-leaf-green shrink-0" />
            <span>{language === 'gu' ? 'સ્થળ' : 'LOCATION'}</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-deep-forest font-serif">
            {village}, {district}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-warm-cream/60 border border-forest-green/10 flex flex-col justify-between h-full space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-forest-green uppercase font-bold tracking-wider">
            <Sprout className="w-3 h-3 text-leaf-green shrink-0" />
            <span>{language === 'gu' ? 'જમીન કદ' : 'LAND SIZE'}</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-deep-forest font-serif">{landSize}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-warm-cream/60 border border-forest-green/10 flex flex-col justify-between h-full space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-forest-green uppercase font-bold tracking-wider">
            <Droplets className="w-3 h-3 text-sky-600 shrink-0" />
            <span>{language === 'gu' ? 'પાણી પ્રાપ્યતા' : 'WATER AVAILABLE'}</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-deep-forest font-serif">{waterAvailability}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-warm-cream/60 border border-forest-green/10 flex flex-col justify-between h-full space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-forest-green uppercase font-bold tracking-wider">
            <Sprout className="w-3 h-3 text-leaf-green shrink-0" />
            <span>{language === 'gu' ? 'અગાઉનો પાક' : 'PREVIOUS CROP'}</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-deep-forest font-serif">{previousCrop}</div>
        </div>

        <div className="p-3.5 rounded-2xl bg-warm-cream/60 border border-forest-green/10 flex flex-col justify-between h-full space-y-1">
          <div className="flex items-center gap-1 text-[10px] text-forest-green uppercase font-bold tracking-wider">
            <CircleDollarSign className="w-3 h-3 text-golden-wheat shrink-0" />
            <span>{language === 'gu' ? 'છેલ્લી સીઝન' : 'LAST SEASON'}</span>
          </div>
          <div className="text-xs sm:text-sm font-bold text-forest-green font-mono">{previousProfit}</div>
        </div>
      </div>
    </div>
  );
};

export default FarmProfileSummaryBar;

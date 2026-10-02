import React from 'react';
import { Sprout, MapPin, Droplets, Maximize2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getFarmerProfile } from '../../services/farmerProfileService';
import { getCurrentAccount } from '../../services/authService';
import kisanAvatarImg from '../../assets/kisan_avatar.jpg';

export const CompactFarmerSummary = () => {
  const { language } = useLanguage();
  const profile = getFarmerProfile();
  const account = getCurrentAccount();

  const defaultFarmerName = language === 'gu' ? 'ખેડૂતભાઈ' : language === 'hi' ? 'किसान भाई' : 'Farmer Friend';
  const defaultVillage = language === 'gu' ? 'આણંદ' : language === 'hi' ? 'आनंद' : 'Anand';
  const defaultDistrict = language === 'gu' ? 'આણંદ' : language === 'hi' ? 'आनंद' : 'Anand';
  const defaultCrop = language === 'gu' ? 'કપાસ' : language === 'hi' ? 'कपास' : 'Cotton';
  const defaultLandSize = language === 'gu' ? '2.5 એકર' : language === 'hi' ? '2.5 एकड़' : '2.5 acres';
  const defaultWater = language === 'gu' ? 'બોરવેલ' : language === 'hi' ? 'बोरवेल' : 'Borewell';
  const defaultSoil = language === 'gu' ? 'કાળી જમીન' : language === 'hi' ? 'काली मिट्टी' : 'Black Soil';

  const farmerName = account?.name || profile?.name || defaultFarmerName;
  const village = profile?.village || defaultVillage;
  const district = profile?.district || defaultDistrict;
  const currentCrop = profile?.currentCrop || defaultCrop;
  const landSize = profile?.landSize ? `${profile.landSize} ${profile.landUnit || (language === 'gu' ? 'એકર' : language === 'hi' ? 'एकड़' : 'acres')}` : defaultLandSize;
  const waterSource = profile?.waterAvailability || defaultWater;
  const soilType = profile?.soilType || defaultSoil;

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-forest-green to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-700/40 font-sans text-left relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="relative z-10 space-y-4">
        
        {/* Farmer Summary Card Header with Image */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3.5">
          <div className="flex items-center gap-3.5">
            {/* Farmer Image Avatar */}
            <div className="relative shrink-0">
              <img
                src={kisanAvatarImg}
                alt={farmerName}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-amber-300 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-emerald-950 rounded-full" />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-black font-serif text-amber-200 tracking-tight flex items-center gap-2">
                <span>
                  {language === 'gu'
                    ? '🌾 ખેતર સ્ટેટસ સંક્ષિપ્ત'
                    : language === 'hi'
                    ? '🌾 खेत स्थिति सारांश'
                    : '🌾 Farm Status Overview'}
                </span>
              </h2>
              <p className="text-xs text-emerald-200 font-medium mt-0.5">
                {language === 'gu'
                  ? 'તમારા ખેતર માટે આજની મહત્વની વિગતો અને સલાહ'
                  : language === 'hi'
                  ? 'आपके खेत के लिए आज की महत्वपूर्ण जानकारी और सलाह'
                  : 'Key farm status & operational recommendations'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-800/90 border border-emerald-600/60 px-3 py-1.5 rounded-full text-[11px] font-extrabold text-emerald-100 self-start sm:self-auto shrink-0 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>KisanGuard AI Active</span>
          </div>
        </div>

        {/* 4 Compact Summary Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-2xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/50 flex items-center justify-center text-amber-300 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                {language === 'gu' ? 'સ્થળ' : language === 'hi' ? 'स्थान' : 'Location'}
              </div>
              <div className="text-xs font-bold font-serif text-white truncate">
                {village}, {district}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-2xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/50 flex items-center justify-center text-emerald-300 shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                {language === 'gu' ? 'વર્તમાન પાક' : language === 'hi' ? 'वर्तमान फसल' : 'Crop'}
              </div>
              <div className="text-xs font-bold font-serif text-white truncate">
                {currentCrop}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-2xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/50 flex items-center justify-center text-amber-300 shrink-0">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                {language === 'gu' ? 'જમીન' : language === 'hi' ? 'भूमि' : 'Land'}
              </div>
              <div className="text-xs font-bold font-serif text-white truncate">
                {landSize}
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-2.5 rounded-2xl flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/50 flex items-center justify-center text-sky-300 shrink-0">
              <Droplets className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                {language === 'gu' ? 'સિંચાઈ / જમીન' : language === 'hi' ? 'सिंचाई / मिट्टी' : 'Irrigation / Soil'}
              </div>
              <div className="text-xs font-bold font-serif text-white truncate">
                {waterSource} • {soilType}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CompactFarmerSummary;

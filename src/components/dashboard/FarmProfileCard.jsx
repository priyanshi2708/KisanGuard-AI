import React from 'react';
import { Link } from 'react-router-dom';
import { User, MapPin, Sprout, Globe, Edit3 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const FarmProfileCard = ({ farmerName = 'Friend', village = 'Anand', district = 'Anand', state = 'Gujarat', landSize = '2–5 acres', currentCrop = 'Cotton', waterAvailability = 'Medium (Borewell)', soilType = 'Black Soil' }) => {
  const { language, t } = useLanguage();
  const langLabel = language === 'gu' ? 'ગુજરાતી' : language === 'hi' ? 'हिंदी' : 'English';

  return (
    <div className="bg-white rounded-3xl p-6 shadow-md border border-forest-green/10 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-forest-green/10 pb-3">
        <div className="flex items-center gap-2 font-bold font-serif text-deep-forest text-lg">
          <User className="w-5 h-5 text-forest-green" />
          <span>👤 {t('dashboard.profileCardTitle')}</span>
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-xs font-bold text-forest-green hover:underline"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{t('dashboard.editProfileBtn')}</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-earth-brown">
        <div className="bg-warm-cream/60 p-3 rounded-2xl border border-forest-green/10 space-y-0.5">
          <div className="text-[10px] text-forest-green uppercase font-bold">{t('auth.fullName')}</div>
          <div className="text-sm font-bold text-deep-forest font-serif">{farmerName}</div>
        </div>

        <div className="bg-warm-cream/60 p-3 rounded-2xl border border-forest-green/10 space-y-0.5">
          <div className="text-[10px] text-forest-green uppercase font-bold">{t('onboarding.districtLabel')}</div>
          <div className="text-sm font-bold text-deep-forest font-serif">{village}, {district}</div>
        </div>

        <div className="bg-warm-cream/60 p-3 rounded-2xl border border-forest-green/10 space-y-0.5">
          <div className="text-[10px] text-forest-green uppercase font-bold">{t('onboarding.q3Title')}</div>
          <div className="text-sm font-bold text-deep-forest font-serif">{landSize}</div>
        </div>

        <div className="bg-warm-cream/60 p-3 rounded-2xl border border-forest-green/10 space-y-0.5">
          <div className="text-[10px] text-forest-green uppercase font-bold">Water / Irrigation</div>
          <div className="text-sm font-bold text-deep-forest font-serif">{waterAvailability}</div>
        </div>
      </div>
    </div>
  );
};

export default FarmProfileCard;

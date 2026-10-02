import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe, CloudSun } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import kisanAvatarImg from '../../assets/kisan_avatar.jpg';

export const DashboardHeader = ({ farmerName = 'Friend', village = 'Anand', district = 'Anand' }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-forest-green/10 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm font-sans">
      
      {/* Welcome Greeting with User Name */}
      <div className="space-y-0.5 text-left">
        <h1 className="text-xl sm:text-2xl font-black font-serif text-deep-forest tracking-tight flex items-center gap-2">
          <span>
            {language === 'gu'
              ? `નમસ્તે, ${farmerName}!`
              : language === 'hi'
              ? `नमस्ते, ${farmerName}!`
              : `Welcome, ${farmerName}!`}
          </span>
          <span className="animate-bounce text-lg">👋</span>
        </h1>
        <p className="text-xs text-earth-brown font-medium">
          {language === 'gu'
            ? 'ચાલો જોઈએ આજે તમારું ખેતર કેવું ચાલી રહ્યું છે.'
            : language === 'hi'
            ? 'आइए देखें कि आज आपका खेत कैसा चल रहा है।'
            : 'Let’s see how your farm is doing today.'}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
        
        {/* Live Weather Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
          <CloudSun className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {language === 'gu'
              ? '29°C • 🌤️ સ્વચ્છ'
              : language === 'hi'
              ? '29°C • 🌤️ साफ मौसम'
              : '29°C • 🌤️ Clear'}
          </span>
        </div>

        {/* Location Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-bold text-emerald-900">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <span>{village}, {district}</span>
        </div>

        {/* Profile Avatar Button with Image & Name */}
        <Link
          to="/profile"
          className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50 hover:border-emerald-500 transition-all cursor-pointer shadow-sm group"
          title="Profile"
        >
          <img
            src={kisanAvatarImg}
            alt={farmerName}
            className="w-7 h-7 rounded-full object-cover border border-emerald-600 shrink-0 group-hover:scale-105 transition-transform"
          />
          <span className="text-xs font-bold font-serif text-deep-forest truncate max-w-[100px]">
            {farmerName}
          </span>
        </Link>

      </div>

    </header>
  );
};

export default DashboardHeader;

import React from 'react';
import { CloudRain, Sun, CheckCircle2 } from 'lucide-react';
import { getWeather } from '../../services/weatherService';
import { useLanguage } from '../../context/LanguageContext';

export const WeatherConnectionWidget = () => {
  const { language } = useLanguage();
  const weather = getWeather("Anand, Gujarat");

  const daysGu = ["સોમ", "મંગળ", "બુધ", "ગુરુ", "શુક્ર", "શનિ", "રવિ"];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/15 space-y-4 font-sans text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-forest-green/10 pb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-sky-600" />
            <span>{language === 'gu' ? '🌦️ તમારા પાક માટે આગામી ૭ દિવસની હવામાન આગાહી' : '🌦️ WEATHER FOR YOUR CROP (Next 7 Days)'}</span>
          </h2>
          <p className="text-xs text-earth-brown font-medium">
            {language === 'gu' ? 'સ્થાનિક ચોમાસા પરિસ્થિતિ અને પાક વાવણી અનુકૂળતા' : 'Local monsoon conditions suitability assessment'}
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{language === 'gu' ? 'હવામાન વાવણી માટે સંપૂર્ણ અનુકૂળ' : 'Conditions Look Suitable'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {weather.forecast.map((item, idx) => (
          <div key={idx} className="p-3 rounded-2xl bg-warm-cream/60 border border-forest-green/10 text-center space-y-1">
            <div className="text-xs font-bold text-earth-brown">
              {language === 'gu' ? (daysGu[idx % 7] || item.day) : item.day}
            </div>
            <div className="text-xl">{item.icon}</div>
            <div className="text-sm font-bold font-serif">{item.temp}</div>
            <div className="text-[11px] text-forest-green font-semibold">🌧️ {item.rain}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherConnectionWidget;

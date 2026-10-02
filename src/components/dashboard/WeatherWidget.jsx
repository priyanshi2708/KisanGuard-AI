import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CloudRain, Sun, Wind, Droplets, ArrowRight } from 'lucide-react';
import { getCurrentWeather, getForecast, getFarmerLocation } from '../../services/weatherService';
import { useLanguage } from '../../context/LanguageContext';

export const WeatherWidget = () => {
  const { t } = useLanguage();
  const farmerLoc = getFarmerLocation();
  const weatherData = getCurrentWeather(farmerLoc);
  const forecastList = getForecast(farmerLoc).slice(0, 5);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest-green/10 pb-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-sky-600" />
            <span>{t('dashboard.yourWeather')}</span>
          </h2>
          <p className="text-xs text-earth-brown font-medium">
            Localized micro-climate forecast for 📍 {weatherData.locationName}
          </p>
        </div>

        <Link
          to="/weather"
          className="inline-flex items-center gap-1 text-xs font-bold text-forest-green hover:text-leaf-green transition-colors"
        >
          <span>{t('dashboard.viewFullWeather')} →</span>
        </Link>
      </div>

      {/* Main Temperature & Parameter Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Big Temp */}
        <div className="md:col-span-5 flex items-center gap-4 bg-gradient-to-br from-sky-light/60 to-warm-cream p-5 rounded-2xl border border-sky-200">
          <div className="p-3 rounded-2xl bg-white text-golden-wheat shadow">
            <Sun className="w-10 h-10" />
          </div>
          <div>
            <div className="text-4xl font-extrabold font-serif text-deep-forest">
              {weatherData.currentTemp}°C
            </div>
            <div className="text-xs text-earth-brown font-semibold pt-0.5">
              {t('dashboard.feelsLike', { temp: weatherData.feelsLike })}
            </div>
          </div>
        </div>

        {/* Right 3 Metric Pills */}
        <div className="md:col-span-7 grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-warm-cream border border-forest-green/10 text-center space-y-1">
            <Droplets className="w-4 h-4 text-sky-600 mx-auto" />
            <div className="text-xs text-earth-brown font-semibold">{t('dashboard.humidity')}</div>
            <div className="text-sm font-bold text-deep-forest">{weatherData.humidity}%</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-warm-cream border border-forest-green/10 text-center space-y-1">
            <Wind className="w-4 h-4 text-forest-green mx-auto" />
            <div className="text-xs text-earth-brown font-semibold">{t('dashboard.wind')}</div>
            <div className="text-sm font-bold text-deep-forest">{weatherData.windSpeed} km/h</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-warm-cream border border-forest-green/10 text-center space-y-1">
            <CloudRain className="w-4 h-4 text-sky-600 mx-auto" />
            <div className="text-xs text-earth-brown font-semibold">{t('dashboard.rainChance')}</div>
            <div className="text-sm font-bold text-deep-forest">{weatherData.rainProbability}%</div>
          </div>
        </div>

      </div>

      {/* 5-Day Forecast Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
        {forecastList.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            className={`p-3.5 rounded-2xl text-center border space-y-1.5 transition-all ${
              idx === 0
                ? 'bg-forest-green text-white border-forest-green shadow-md'
                : 'bg-warm-cream/60 border-forest-green/15 text-deep-forest'
            }`}
          >
            <div className={`text-xs font-bold ${idx === 0 ? 'text-light-leaf' : 'text-earth-brown'}`}>
              {item.dayName}
            </div>
            <div className="text-2xl py-1">{item.icon}</div>
            <div className="text-base font-bold font-serif">{item.tempHigh}°C</div>
            <div className={`text-[11px] font-semibold ${idx === 0 ? 'text-light-leaf' : 'text-forest-green'}`}>
              🌧️ {item.rainProb}%
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default WeatherWidget;

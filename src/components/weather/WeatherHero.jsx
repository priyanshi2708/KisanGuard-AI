import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, RefreshCw, Leaf } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Twinkling Star Particles for Night Mode
const StarsParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {Array.from({ length: 30 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          width: `${(i % 3) + 1.2}px`,
          height: `${(i % 3) + 1.2}px`,
          top: `${(i * 17) % 78 + 4}%`,
          left: `${(i * 23) % 94 + 3}%`,
          boxShadow: '0 0 5px 1.5px rgba(255, 255, 255, 0.8)'
        }}
        animate={{
          opacity: [0.2, 1, 0.2],
          scale: [0.8, 1.3, 0.8]
        }}
        transition={{
          duration: 2 + (i % 4) * 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: (i % 5) * 0.4
        }}
      />
    ))}
  </div>
);

// Pink & Coral Drifting Sunset Clouds for Evening Mode
const EveningPinkClouds = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      animate={{ x: [-60, 200] }}
      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      className="absolute top-4 left-6 w-64 h-20 bg-gradient-to-r from-rose-400/35 via-pink-400/45 to-purple-400/25 rounded-full blur-xl"
    />
    <motion.div
      animate={{ x: [200, -60] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="absolute top-12 right-8 w-72 h-24 bg-gradient-to-r from-fuchsia-500/35 via-rose-400/40 to-amber-300/25 rounded-full blur-xl"
    />
  </div>
);

// Realistic Glowing Moon for Night Mode
const NightMoon = () => (
  <motion.div
    animate={{ y: [0, -4, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    className="absolute top-4 right-6 sm:top-6 sm:right-10 pointer-events-none z-0"
  >
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-100 via-slate-100 to-amber-200 shadow-[0_0_40px_rgba(255,255,240,0.85)] border border-white/60 overflow-hidden flex items-center justify-center">
      <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-slate-300/40 shadow-inner" />
      <div className="absolute bottom-4 right-4 w-5 h-5 rounded-full bg-slate-300/40 shadow-inner" />
    </div>
  </motion.div>
);

// Sunny Lens Flare Bubbles for Day Mode
const SunnySunLens = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <motion.div
      animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-10 -right-10 w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-amber-100 via-amber-300 to-yellow-400 shadow-[0_0_60px_rgba(255,220,90,0.9)] blur-sm"
    />
    <div className="absolute top-12 right-20 w-8 h-8 rounded-full bg-white/25 backdrop-blur-md border border-white/30" />
    <div className="absolute top-24 right-32 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/25" />
  </div>
);

export const WeatherHero = ({ weatherData, onChangeLocation }) => {
  const { language } = useLanguage();
  const [mode, setMode] = useState('auto');

  const getActiveThemeKey = () => {
    if (mode !== 'auto') return mode;
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'evening';
    return 'night';
  };

  const activeTheme = getActiveThemeKey();

  if (!weatherData) return null;

  const village = weatherData.location?.village || 'Changa';
  const district = weatherData.location?.district || 'Anand';

  const themeConfigs = {
    day: {
      bgGradient: "from-[#2b88f3] via-[#3a94ff] to-[#60b0ff]",
      labelGu: "ચોખ્ખો તડકો (Day)",
      labelEn: "Mostly Sunny",
      temp: weatherData.currentTemp || 29,
      range: "૨૪° / ૩૨°",
      rangeEn: "24° / 32°",
      airQualityScore: 52,
      airQualityStatusGu: "મધ્યમ",
      airQualityStatusEn: "Moderate",
      airQualityDescGu: "હવાની ગુણવત્તા સ્વીકાર્ય છે; બહાર કૃષિ કામગીરી માટે અનુકૂળ સમય.",
      airQualityDescEn: "Air quality is acceptable; however, for some pollutants there may be a moderate health concern...",
      icon: "☀️"
    },
    evening: {
      bgGradient: "from-[#3a1c58] via-[#a84279] to-[#f47063]",
      labelGu: "ગુલાબી સાંજ (Evening)",
      labelEn: "Pink Evening Sunset",
      temp: 27,
      range: "૨૨° / ૨૯°",
      rangeEn: "22° / 29°",
      airQualityScore: 48,
      airQualityStatusGu: "ઉત્તમ",
      airQualityStatusEn: "Good",
      airQualityDescGu: "સાંજનું વાતાવરણ ઠંડુ રહેવાથી પાક પર સ્પ્રે અને ખાતર આપવા માટે શ્રેષ્ઠ સમય.",
      airQualityDescEn: "Cool evening breeze with optimal moisture. Ideal time for crop spraying and field checks.",
      icon: "🌅"
    },
    night: {
      bgGradient: "from-[#0a0f24] via-[#141b3a] to-[#1d274c]",
      labelGu: "તારામંડળ રાત (Night)",
      labelEn: "Clear Starry Night",
      temp: 23,
      range: "૨૦° / ૨૬°",
      rangeEn: "20° / 26°",
      airQualityScore: 42,
      airQualityStatusGu: "સારી",
      airQualityStatusEn: "Good",
      airQualityDescGu: "રાત્રિનું તાપમાન ઠંડુ રહેશે, સવારે સિંચાઈ માટે અનુકૂળ સમય.",
      airQualityDescEn: "Cool nocturnal temperature with heavy dew probability. High soil moisture retention.",
      icon: "🌙"
    },
    rainy: {
      bgGradient: "from-[#1e293b] via-[#334155] to-[#475569]",
      labelGu: "વરસાદી ચોમાસું (Rainy)",
      labelEn: "Rain & Thunderstorm",
      temp: 25,
      range: "૨૧° / ૨૬°",
      rangeEn: "21° / 26°",
      airQualityScore: 28,
      airQualityStatusGu: "ખૂબ જ સરસ",
      airQualityStatusEn: "Very Good",
      airQualityDescGu: "વરસાદથી જમીનમાં ભેજનું પ્રમાણ વધશે, નિંદામણ અને ખેડાણ રોકી રાખવું.",
      airQualityDescEn: "Heavy precipitation refreshes ground water levels. Hold pesticide sprays until rain stops.",
      icon: "🌧️"
    }
  };

  const currentTheme = themeConfigs[activeTheme] || themeConfigs.day;

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-b ${currentTheme.bgGradient} text-white shadow-xl border border-white/25 p-4 sm:p-6 font-sans transition-all duration-700 text-left`}>
      
      {/* Background Atmosphere */}
      {activeTheme === 'day' && <SunnySunLens />}
      {activeTheme === 'evening' && <EveningPinkClouds />}
      {activeTheme === 'night' && (
        <>
          <StarsParticles />
          <NightMoon />
        </>
      )}
      {activeTheme === 'rainy' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-50">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: -40, x: i * 80 }}
              animate={{ y: 400 }}
              transition={{
                repeat: Infinity,
                duration: 0.7 + (i % 4) * 0.2,
                ease: "linear",
                delay: i * 0.1
              }}
              className="w-0.5 h-10 bg-gradient-to-b from-transparent via-sky-200 to-white rounded-full"
            />
          ))}
        </div>
      )}

      {/* Main Content Container */}
      <div className="relative z-10 space-y-4">

        {/* Top Location & Theme Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/20 pb-3">
          
          <div className="flex items-center gap-2">
            <button
              onClick={onChangeLocation}
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/30 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-xs font-bold text-white border border-white/30 shadow-sm transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <span>{village}, {district}</span>
              <RefreshCw className="w-3 h-3 ml-0.5 opacity-70" />
            </button>

            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/15 text-amber-200">
              {language === 'gu' ? currentTheme.labelGu : currentTheme.labelEn}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-black/25 backdrop-blur-md p-1 rounded-xl border border-white/20 self-start sm:self-auto text-[11px]">
            {[
              { id: "auto", icon: "⏰", labelGu: "ઓટો સમય", labelEn: "Auto" },
              { id: "day", icon: "☀️", labelGu: "દિવસ", labelEn: "Day" },
              { id: "evening", icon: "🌅", labelGu: "ગુલાબી સાંજ", labelEn: "Pink Evening" },
              { id: "night", icon: "🌙", labelGu: "રાત (Moon)", labelEn: "Night" },
              { id: "rainy", icon: "🌧️", labelGu: "વરસાદ", labelEn: "Rain" }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setMode(btn.id)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  mode === btn.id
                    ? 'bg-white text-slate-900 shadow scale-105 font-serif'
                    : 'text-white/80 hover:bg-white/20'
                }`}
              >
                <span>{btn.icon}</span>
                <span className="hidden sm:inline">{language === 'gu' ? btn.labelGu : btn.labelEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Temperature & Condition Center Piece */}
        <div className="text-center py-2 space-y-1 relative">
          <motion.div
            key={activeTheme}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-block"
          >
            <div className="text-6xl sm:text-7xl font-extrabold text-white font-serif tracking-tighter drop-shadow-md leading-none">
              {currentTheme.temp}°
            </div>
          </motion.div>

          <div className="space-y-0.5">
            <div className="text-base sm:text-xl font-bold font-serif text-white tracking-wide flex items-center justify-center gap-1.5">
              <span>{currentTheme.icon}</span>
              <span>{language === 'gu' ? currentTheme.labelGu : currentTheme.labelEn}</span>
            </div>
            
            <p className="text-xs text-white/95 font-medium tracking-wide">
              {language === 'gu' ? currentTheme.labelGu : currentTheme.labelEn}{' '}
              <span className="font-bold">{language === 'gu' ? currentTheme.range : currentTheme.rangeEn}</span>{' '}
              · {language === 'gu' ? 'હવાની ગુણવત્તા:' : 'Air quality:'}{' '}
              <span className="font-bold">{currentTheme.airQualityScore} - {language === 'gu' ? currentTheme.airQualityStatusGu : currentTheme.airQualityStatusEn}</span>
            </p>
          </div>
        </div>

        {/* Compact Frosted Glass Air Quality Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white/20 backdrop-blur-xl border border-white/35 rounded-2xl p-3.5 sm:p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
        >
          <div className="space-y-1 max-w-xl text-left">
            <div className="flex items-center gap-1.5 text-white font-bold font-serif text-sm">
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <span>{language === 'gu' ? currentTheme.airQualityStatusGu : currentTheme.airQualityStatusEn}</span>
            </div>
            <p className="text-[11px] sm:text-xs text-white/90 font-medium leading-relaxed">
              {language === 'gu' ? currentTheme.airQualityDescGu : currentTheme.airQualityDescEn}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 bg-black/15 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray="76, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm font-extrabold font-serif text-white">76</span>
            </div>

            <div className="text-left text-[11px] font-semibold text-white/90 space-y-0.5">
              <div className="text-amber-200 font-bold uppercase text-[9px] tracking-wider">{language === 'gu' ? 'હવામાન ઇન્ડેક્સ' : 'AQI INDEX'}</div>
              <div>{language === 'gu' ? '૭૬ - સ્વીકાર્ય' : '76 - Moderate'}</div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default WeatherHero;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, ShieldCheck, MapPin, Wind, Thermometer, Droplets,
  CloudRain, AlertTriangle, RefreshCw, ArrowRight, PhoneCall,
  Sparkles, Info, Eye, CheckCircle2, ChevronRight
} from 'lucide-react';

import DashboardLayout from '../../components/dashboard/DashboardLayout';
import IndiaSatelliteMap from '../../components/dashboard/IndiaSatelliteMap';
import { useLanguage } from '../../context/LanguageContext';
import {
  getFireRisk,
  getRiskFactors,
  getFireDetections,
  getFireAlerts,
  getFireHistory,
  getWhatShouldIDo,
  getPreventionTips,
  getCropFireRiskInfo,
  RISK_LEVELS
} from '../../services/fireRiskService';
import { getCurrentWeather } from '../../services/weatherService';

export const FireRiskPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // State Management
  const [loadingStep, setLoadingStep] = useState(0); // 0: activity, 1: satellite, 2: weather, 3: done
  const [isSimulatingLoading, setIsSimulatingLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [selectedRadius, setSelectedRadius] = useState(25); // 5, 10, 25, 50 km
  const [activeTab, setActiveTab] = useState('all');
  const [selectedDetectionId, setSelectedDetectionId] = useState(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');

  const mapRef = useRef(null);

  // Fetch Data from Service
  const fireRisk = getFireRisk();
  const riskFactors = getRiskFactors();
  const detectionData = getFireDetections(fireRisk.location, selectedRadius);
  const fireAlerts = getFireAlerts();
  const fireHistory = getFireHistory();
  const safetyAdvice = getWhatShouldIDo(fireRisk.riskLevel);
  const preventionTips = getPreventionTips();
  const cropInfo = getCropFireRiskInfo("Cotton");
  const weather = getCurrentWeather();

  const villageName = fireRisk.location?.village || "Anand";
  const districtName = fireRisk.location?.district || "Anand";
  const stateName = fireRisk.location?.state || "Gujarat";

  // Loading Sequence Simulation on initial mount
  useEffect(() => {
    let timer1, timer2, timer3;
    setIsSimulatingLoading(true);
    setLoadingStep(0);

    timer1 = setTimeout(() => setLoadingStep(1), 600);
    timer2 = setTimeout(() => setLoadingStep(2), 1200);
    timer3 = setTimeout(() => {
      setLoadingStep(3);
      setIsSimulatingLoading(false);
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleManualRefresh = () => {
    setIsSimulatingLoading(true);
    setHasError(false);
    setLoadingStep(0);

    setTimeout(() => setLoadingStep(1), 400);
    setTimeout(() => setLoadingStep(2), 800);
    setTimeout(() => {
      setLoadingStep(3);
      setIsSimulatingLoading(false);
    }, 1200);
  };

  const handleUseCurrentLocation = () => {
    setGeoLocating(true);
    setLocationSuccessMsg('');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoLocating(false);
          setLocationSuccessMsg(`📍 GPS Location updated (${pos.coords.latitude.toFixed(2)}°N, ${pos.coords.longitude.toFixed(2)}°E)`);
          setTimeout(() => setLocationSuccessMsg(''), 4000);
        },
        (err) => {
          setGeoLocating(false);
          setLocationSuccessMsg(`📍 Location synced to ${villageName}, ${districtName}`);
          setTimeout(() => setLocationSuccessMsg(''), 4000);
        }
      );
    } else {
      setGeoLocating(false);
      setLocationSuccessMsg(`📍 Location synced to ${villageName}, ${districtName}`);
      setTimeout(() => setLocationSuccessMsg(''), 4000);
    }
  };

  const scrollToMap = () => {
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Circular Score Meter Calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fireRisk.riskScore / 100) * circumference;

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans pb-12 max-w-7xl mx-auto">
        
        {/* Loading Overlay Simulation */}
        <AnimatePresence>
          {isSimulatingLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-lg border border-forest-green/10 text-center space-y-4 py-12"
            >
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
                <Flame className="w-7 h-7" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold font-serif text-deep-forest">
                  {loadingStep === 0 && t('fireRisk.checkingActivity')}
                  {loadingStep === 1 && t('fireRisk.checkingSatellite')}
                  {loadingStep === 2 && t('fireRisk.checkingWeather')}
                  {loadingStep === 3 && t('fireRisk.riskReady')}
                </h3>
                <p className="text-xs text-earth-brown">
                  {villageName}, {districtName} • Satellite Radar Refresh
                </p>
              </div>

              {/* Step indicator pills */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className={`w-2.5 h-2.5 rounded-full transition-colors ${loadingStep >= 0 ? 'bg-amber-500' : 'bg-gray-200'}`} />
                <span className={`w-2.5 h-2.5 rounded-full transition-colors ${loadingStep >= 1 ? 'bg-amber-500' : 'bg-gray-200'}`} />
                <span className={`w-2.5 h-2.5 rounded-full transition-colors ${loadingStep >= 2 ? 'bg-amber-500' : 'bg-gray-200'}`} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State View */}
        {hasError && !isSimulatingLoading && (
          <div className="bg-red-50 rounded-3xl p-8 border border-red-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-serif text-red-900">
                {t('fireRisk.unavailableTitle')}
              </h3>
              <p className="text-xs text-red-700">
                Weather conditions remain available below.
              </p>
            </div>
            <button
              onClick={handleManualRefresh}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('fireRisk.tryAgainBtn')}</span>
            </button>
          </div>
        )}

        {/* Main Content when loaded and clean */}
        {!isSimulatingLoading && !hasError && (
          <>
            {/* 1. Page Header & Subtitle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-forest-green/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-deep-forest">
                    {t('fireRisk.pageTitle')}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                    {t('fireRisk.demoDataTag')}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-earth-brown mt-1">
                  {t('fireRisk.pageSubtitle')}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={handleManualRefresh}
                  className="px-3.5 py-2 rounded-xl bg-forest-green/10 hover:bg-forest-green hover:text-white text-forest-green font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Radar</span>
                </button>
                
                <button
                  onClick={() => setHasError(true)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 text-[11px] font-medium transition-colors"
                  title="Simulate Error State"
                >
                  Test Error
                </button>
              </div>
            </div>

            {/* 2. HERO SECTION + RISK SCORE METER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Large Hero Card */}
              <div className="lg:col-span-8 rounded-3xl bg-gradient-to-br from-amber-700 via-amber-600 to-forest-green text-white p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6">
                
                {/* Background SVG Motif */}
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                  <Flame className="w-80 h-80 text-white" />
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-amber-200 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('fireRisk.heroTitle')}</span>
                    </span>

                    <span className="text-xs text-amber-100 font-mono">
                      {t('fireRisk.lastUpdated')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {/* EXPLICIT STATUS TEXT REQUIRED */}
                    <div className="flex items-center gap-3">
                      <span className="text-4xl sm:text-6xl font-black font-serif tracking-tight text-warm-cream">
                        {t('fireRisk.riskLow')}
                      </span>
                      <span className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-white font-extrabold text-sm shadow-md">
                        {t('fireRisk.badgeLow')}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-amber-100/90 max-w-xl leading-relaxed font-medium">
                      "{t('fireRisk.lowRiskHeroSub')}"
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-100 relative z-10">
                  <div className="flex items-center gap-2 font-bold">
                    <MapPin className="w-4 h-4 text-golden-wheat" />
                    <span>📍 {villageName}, {districtName}, {stateName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>{t('fireRisk.surroundingAreaNote')}</span>
                  </div>
                </div>

              </div>

              {/* Right Circular Risk Meter Card */}
              <div className="lg:col-span-4 rounded-3xl bg-white p-6 sm:p-8 shadow-md border border-forest-green/10 flex flex-col items-center justify-center text-center space-y-4">
                
                <div className="flex items-center justify-between w-full border-b border-forest-green/10 pb-3">
                  <span className="text-xs font-bold text-earth-brown uppercase tracking-wider">
                    {t('fireRisk.riskScoreTitle')}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                    {t('fireRisk.demoDataTag')}
                  </span>
                </div>

                {/* Animated Circular Score Meter */}
                <div className="relative w-36 h-36 flex items-center justify-center my-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background Track */}
                    <circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="10"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                      cx="60"
                      cy="60"
                      r={radius}
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black font-serif text-deep-forest">
                      {fireRisk.riskScore}
                    </span>
                    <span className="text-[11px] font-bold text-earth-brown/70">
                      / 100
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-600 mt-0.5">
                      {t('fireRisk.badgeLow')}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-earth-brown leading-relaxed font-medium">
                  {t('fireRisk.scoreCaption')}
                </p>

              </div>

            </div>

            {/* 3. WHY THIS RISK? (🔎 WHY THIS RISK?) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6">
              
              <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
                    <span>{t('fireRisk.whyThisRisk')}</span>
                  </h2>
                  <p className="text-xs text-earth-brown mt-0.5">
                    {t('fireRisk.whyExplanation')}
                  </p>
                </div>
              </div>

              {/* 5 Risk Factors Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                
                {/* Temperature */}
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-earth-brown font-medium">
                    <span>{t('fireRisk.temperature')}</span>
                    <Thermometer className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-lg font-bold text-deep-forest">
                    {weather.temperature}°C
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    🟢 {t('fireRisk.statusNormal')}
                  </span>
                </div>

                {/* Wind */}
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-earth-brown font-medium">
                    <span>{t('fireRisk.windSpeed')}</span>
                    <Wind className="w-4 h-4 text-forest-green" />
                  </div>
                  <div className="text-lg font-bold text-deep-forest">
                    {weather.windSpeed} km/h
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    🟢 {t('fireRisk.statusLow')}
                  </span>
                </div>

                {/* Humidity */}
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-earth-brown font-medium">
                    <span>{t('fireRisk.humidity')}</span>
                    <Droplets className="w-4 h-4 text-sky-500" />
                  </div>
                  <div className="text-lg font-bold text-deep-forest">
                    {weather.humidity}%
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    🟢 {t('fireRisk.statusGood')}
                  </span>
                </div>

                {/* Nearby Fire Activity */}
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-2">
                  <div className="flex items-center justify-between text-xs text-earth-brown font-medium">
                    <span>{t('fireRisk.nearbyFireActivity')}</span>
                    <Flame className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-lg font-bold text-deep-forest">
                    Low
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    🟢 {t('fireRisk.statusNormal')}
                  </span>
                </div>

                {/* Recent Rainfall */}
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-2 col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-xs text-earth-brown font-medium">
                    <span>{t('fireRisk.recentRainfall')}</span>
                    <CloudRain className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-lg font-bold text-deep-forest">
                    {weather.rainfallAmount || 18} mm
                  </div>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    🟢 {t('fireRisk.statusHelpful')}
                  </span>
                </div>

              </div>

            </div>

            {/* 4. "WHAT SHOULD I DO?" (👨‍🌾 WHAT SHOULD I DO?) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-4">
              
              <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2 border-b border-forest-green/10 pb-3">
                <span>{t('fireRisk.whatShouldIDoTitle')}</span>
              </h2>

              <div className={`p-6 rounded-2xl border ${safetyAdvice.bgColor} space-y-3`}>
                <div className="flex items-center gap-2 font-bold text-base">
                  <span>{t('fireRisk.noImmediateAction')}</span>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  "{t('fireRisk.lowAdvice')}"
                </p>
                <div className="pt-2 text-xs opacity-80 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span>{t('fireRisk.safetyDisclaimer')}</span>
                </div>
              </div>

            </div>

            {/* 5. FIRE ALERTS (🔔 FIRE ALERT) */}
            {fireAlerts.length > 0 && (
              <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-900 text-sm">{t('fireRisk.fireAlertsTitle')}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                        {fireAlerts[0].riskBadge}
                      </span>
                    </div>
                    <p className="text-xs text-amber-800 font-medium">
                      "{t('fireRisk.alertMessage')}" • Distance: <strong>{fireAlerts[0].distance}</strong> ({fireAlerts[0].direction})
                    </p>
                  </div>
                </div>

                <button
                  onClick={scrollToMap}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>{t('fireRisk.viewOnMapBtn')}</span>
                </button>
              </div>
            )}

            {/* 6. MONITORING RADIUS & FIRE ACTIVITY MAP (🗺️ FIRE ACTIVITY NEAR YOUR FARM) */}
            <div ref={mapRef} className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-forest-green/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
                    <span>{t('fireRisk.mapSectionTitle')}</span>
                  </h2>
                  <p className="text-xs text-earth-brown mt-0.5">
                    Interactive satellite detection map centered on your village
                  </p>
                </div>

                {/* Radius Buttons */}
                <div className="flex items-center gap-2 bg-warm-cream p-1.5 rounded-2xl border border-forest-green/10 text-xs">
                  <span className="text-earth-brown font-bold text-[11px] px-2 hidden md:inline">
                    {t('fireRisk.monitorFiresWithin')}
                  </span>
                  {[5, 10, 25, 50].map((r) => (
                    <button
                      key={r}
                      onClick={() => setSelectedRadius(r)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs ${
                        selectedRadius === r
                          ? 'bg-forest-green text-white shadow-md'
                          : 'text-earth-brown hover:bg-forest-green/10'
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-earth-brown font-semibold">
                  {t('fireRisk.detectionsFound', { count: detectionData.count })}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  {t('fireRisk.demoFireDataTag')}
                </span>
              </div>

              {/* Main SVG Map Component */}
              <IndiaSatelliteMap
                activeLocation={`${villageName}, ${districtName}`}
                heightClass="h-[480px]"
                radiusKm={selectedRadius}
                detections={detectionData.detections}
                selectedDetectionId={selectedDetectionId}
                onDetectionClick={(spot) => setSelectedDetectionId(spot.id)}
                showDemoTag={true}
              />

            </div>

            {/* 7. NEARBY FIRE DETECTIONS LIST (🔥 NEARBY FIRE ACTIVITY) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6">
              
              <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <span>{t('fireRisk.nearbyFireActivityTitle')}</span>
                  </h2>
                  <p className="text-xs text-earth-brown mt-0.5">
                    Detailed hotspot detections within {selectedRadius} km monitoring radius
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                  {t('fireRisk.demoFireDataTag')}
                </span>
              </div>

              {detectionData.detections.length === 0 ? (
                <div className="p-8 rounded-2xl bg-warm-cream text-center text-earth-brown font-medium text-xs">
                  {t('fireRisk.noDetectionsFound')}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detectionData.detections.map((det) => (
                    <div
                      key={det.id}
                      onClick={() => {
                        setSelectedDetectionId(det.id);
                        scrollToMap();
                      }}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        selectedDetectionId === det.id
                          ? 'border-forest-green bg-light-leaf/30 shadow-md'
                          : 'border-forest-green/10 bg-warm-cream hover:border-forest-green/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-deep-forest flex items-center gap-1.5">
                          <Flame className="w-4 h-4 text-amber-500" />
                          <span>{det.title}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${det.statusColor}`}>
                          {det.statusBadge}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs py-1">
                        <div>
                          <span className="text-earth-brown/70 font-medium">{t('fireRisk.distance')}:</span>
                          <div className="font-bold text-deep-forest">{det.distance} km</div>
                        </div>
                        <div>
                          <span className="text-earth-brown/70 font-medium">{t('fireRisk.direction')}:</span>
                          <div className="font-bold text-deep-forest">{det.directionFull || det.direction}</div>
                        </div>
                        <div>
                          <span className="text-earth-brown/70 font-medium">{t('fireRisk.detectedAt')}:</span>
                          <div className="font-bold text-deep-forest">{det.detectedAt}</div>
                        </div>
                      </div>

                      <p className="text-xs text-earth-brown/90 font-medium italic">
                        "{det.note}"
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* 8. FARM LOCATION (📍 YOUR FARM) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-4">
              
              <div className="flex items-center justify-between border-b border-forest-green/10 pb-3">
                <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-forest-green" />
                  <span>{t('fireRisk.yourFarmLocation')}</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10">
                  <span className="text-xs text-earth-brown font-medium">{t('fireRisk.village')}</span>
                  <div className="text-base font-bold text-deep-forest">{villageName}</div>
                </div>
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10">
                  <span className="text-xs text-earth-brown font-medium">{t('fireRisk.district')}</span>
                  <div className="text-base font-bold text-deep-forest">{districtName}</div>
                </div>
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10">
                  <span className="text-xs text-earth-brown font-medium">{t('fireRisk.state')}</span>
                  <div className="text-base font-bold text-deep-forest">{stateName}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={geoLocating}
                  className="px-4 py-2.5 rounded-xl bg-forest-green text-white font-bold text-xs hover:bg-deep-forest transition-colors self-start flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{geoLocating ? 'Locating...' : t('fireRisk.useCurrentLocation')}</span>
                </button>

                <span className="text-xs text-earth-brown font-medium">
                  {t('fireRisk.surroundingAreaNote')}
                </span>
              </div>

              {locationSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-fadeIn">
                  {locationSuccessMsg}
                </div>
              )}

            </div>

            {/* 9. WEATHER + FIRE CONNECTION (🌦️ WEATHER CONDITIONS) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest-green/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
                    <CloudRain className="w-5 h-5 text-sky-600" />
                    <span>{t('fireRisk.weatherSectionTitle')}</span>
                  </h2>
                  <p className="text-xs text-earth-brown mt-0.5">
                    Synced with KisanGuard Smart Weather Service
                  </p>
                </div>

                <button
                  onClick={() => navigate('/weather')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-green/10 hover:bg-forest-green hover:text-white text-forest-green font-bold text-xs transition-colors self-start sm:self-auto"
                >
                  <span>{t('fireRisk.viewWeatherBtn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10 text-center">
                  <div className="text-xs text-earth-brown font-semibold">{t('fireRisk.temperature')}</div>
                  <div className="text-xl font-extrabold text-deep-forest mt-1">{weather.temperature}°C</div>
                </div>
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10 text-center">
                  <div className="text-xs text-earth-brown font-semibold">{t('fireRisk.humidity')}</div>
                  <div className="text-xl font-extrabold text-deep-forest mt-1">{weather.humidity}%</div>
                </div>
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10 text-center">
                  <div className="text-xs text-earth-brown font-semibold">{t('fireRisk.windSpeed')}</div>
                  <div className="text-xl font-extrabold text-deep-forest mt-1">{weather.windSpeed} km/h</div>
                </div>
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10 text-center">
                  <div className="text-xs text-earth-brown font-semibold">{t('fireRisk.recentRainfall')}</div>
                  <div className="text-xl font-extrabold text-deep-forest mt-1">{weather.rainfallAmount || 18} mm</div>
                </div>
              </div>

              {/* How weather affects fire risk */}
              <div className="p-5 rounded-2xl bg-light-leaf/40 border border-leaf-green/30 space-y-2">
                <div className="font-bold text-sm text-deep-forest flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>{t('fireRisk.howWeatherAffectsTitle')}</span>
                </div>
                <ul className="text-xs text-earth-brown space-y-1 font-medium list-disc list-inside leading-relaxed">
                  <li>"{t('fireRisk.weatherAffectLowHumidity')}"</li>
                  <li>"{t('fireRisk.weatherAffectRain')}"</li>
                </ul>
              </div>

            </div>

            {/* 10. CROP + FIRE RISK (🌱 YOUR CROP) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6">
              
              <div className="border-b border-forest-green/10 pb-4">
                <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-forest-green" />
                  <span>{t('fireRisk.yourCropTitle')}</span>
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10">
                  <span className="text-xs text-earth-brown font-medium">{t('fireRisk.currentCrop')}</span>
                  <div className="text-base font-bold text-deep-forest">{cropInfo.cropName}</div>
                </div>
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10">
                  <span className="text-xs text-earth-brown font-medium">{t('fireRisk.cropResidue')}</span>
                  <div className="text-base font-bold text-deep-forest">{t('fireRisk.cottonResidueInfo')}</div>
                </div>
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10">
                  <span className="text-xs text-earth-brown font-medium">{t('fireRisk.dryness')}</span>
                  <div className="text-base font-bold text-amber-600">{t('fireRisk.medium')}</div>
                </div>
                <div className="p-4 rounded-2xl bg-warm-cream border border-forest-green/10">
                  <span className="text-xs text-earth-brown font-medium">{t('fireRisk.fireSensitivity')}</span>
                  <div className="text-base font-bold text-amber-600">{t('fireRisk.medium')}</div>
                </div>
              </div>

              <p className="text-xs text-earth-brown leading-relaxed font-medium bg-amber-50/60 p-4 rounded-2xl border border-amber-200">
                "{t('fireRisk.cropResidueExplanation')}"
              </p>

            </div>

            {/* 11. FIRE PREVENTION TIPS (🌾 FARM FIRE PREVENTION) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6">
              
              <div className="border-b border-forest-green/10 pb-4">
                <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-forest-green" />
                  <span>{t('fireRisk.preventionTitle')}</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                <div className="p-5 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-deep-forest">
                    <Flame className="w-4 h-4 text-amber-500" />
                    <span>{t('fireRisk.avoidBurningTitle')}</span>
                  </div>
                  <p className="text-xs text-earth-brown leading-relaxed font-medium">
                    "{t('fireRisk.avoidBurningDesc')}"
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-deep-forest">
                    <Droplets className="w-4 h-4 text-sky-500" />
                    <span>{t('fireRisk.keepWaterTitle')}</span>
                  </div>
                  <p className="text-xs text-earth-brown leading-relaxed font-medium">
                    "{t('fireRisk.keepWaterDesc')}"
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-deep-forest">
                    <Wind className="w-4 h-4 text-forest-green" />
                    <span>{t('fireRisk.watchWindTitle')}</span>
                  </div>
                  <p className="text-xs text-earth-brown leading-relaxed font-medium">
                    "{t('fireRisk.watchWindDesc')}"
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-deep-forest">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{t('fireRisk.manageResidueTitle')}</span>
                  </div>
                  <p className="text-xs text-earth-brown leading-relaxed font-medium">
                    "{t('fireRisk.manageResidueDesc')}"
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-warm-cream border border-forest-green/10 space-y-2 col-span-1 md:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-deep-forest">
                    <PhoneCall className="w-4 h-4 text-red-500" />
                    <span>{t('fireRisk.followGuidanceTitle')}</span>
                  </div>
                  <p className="text-xs text-earth-brown leading-relaxed font-medium">
                    "{t('fireRisk.followGuidanceDesc')}"
                  </p>
                </div>

              </div>

            </div>

            {/* 12. RISK HISTORY (📊 FIRE RISK — LAST 7 DAYS) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6">
              
              <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-deep-forest flex items-center gap-2">
                    <span>{t('fireRisk.riskHistoryTitle')}</span>
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                  {t('fireRisk.demoHistoryDataTag')}
                </span>
              </div>

              {/* 7-Day Day Pills */}
              <div className="grid grid-cols-7 gap-2">
                {fireHistory.days.map((item) => (
                  <div
                    key={item.dayKey}
                    className="p-3 rounded-2xl bg-warm-cream border border-forest-green/10 text-center space-y-1"
                  >
                    <div className="text-xs text-earth-brown font-semibold">{item.label}</div>
                    <div className="text-sm font-bold text-deep-forest">{item.badge}</div>
                    <div className="text-[10px] text-earth-brown/70 font-mono">{item.score}</div>
                  </div>
                ))}
              </div>

              {/* Animated Line Graph */}
              <div className="bg-warm-cream/60 rounded-2xl p-4 border border-forest-green/10">
                <div className="h-40 w-full relative">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 140" preserveAspectRatio="none">
                    {/* Background Grid */}
                    <line x1="0" y1="30" x2="700" y2="30" stroke="#E5E7EB" strokeDasharray="4 4" />
                    <line x1="0" y1="70" x2="700" y2="70" stroke="#E5E7EB" strokeDasharray="4 4" />
                    <line x1="0" y1="110" x2="700" y2="110" stroke="#E5E7EB" strokeDasharray="4 4" />

                    {/* Smooth Line Path */}
                    <motion.path
                      d="M 50,95 L 150,87 L 250,68 L 350,60 L 450,74 L 550,83 L 650,91"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />

                    {/* Data Points */}
                    {[
                      { x: 50, y: 95, val: 18 },
                      { x: 150, y: 87, val: 22 },
                      { x: 250, y: 68, val: 31 },
                      { x: 350, y: 60, val: 35 },
                      { x: 450, y: 74, val: 28 },
                      { x: 550, y: 83, val: 24 },
                      { x: 650, y: 91, val: 20 }
                    ].map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.x} cy={pt.y} r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                        <text x={pt.x} y={pt.y - 12} fill="#286B3F" fontSize="10" fontWeight="bold" textAnchor="middle">
                          {pt.val}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

            </div>

            {/* 13. SAFETY / TRUST FOOTER DISCLAIMER */}
            <div className="bg-amber-500/10 rounded-3xl p-6 border border-amber-300 space-y-2 text-xs text-amber-900 leading-relaxed font-medium">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>IMPORTANT SAFETY DISCLAIMER</span>
              </div>
              <p>"{t('fireRisk.safetyDisclaimer')}"</p>
              <p className="font-bold text-red-700">"{t('fireRisk.emergencyInstruction')}"</p>
            </div>

          </>
        )}

      </div>
    </DashboardLayout>
  );
};

export default FireRiskPage;

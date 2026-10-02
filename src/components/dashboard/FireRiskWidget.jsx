import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ShieldCheck, Wind, Thermometer, MapPin, ArrowRight } from 'lucide-react';
import { getFireRisk, getFireDetections } from '../../services/fireRiskService';
import IndiaSatelliteMap from './IndiaSatelliteMap';
import { useLanguage } from '../../context/LanguageContext';

export const FireRiskWidget = () => {
  const { t } = useLanguage();
  const fireData = getFireRisk();
  const detectionData = getFireDetections(fireData.location, 25);

  const villageName = fireData.location?.village || 'Anand';
  const districtName = fireData.location?.district || 'Anand';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-forest-green/10 space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-forest-green/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold font-serif text-deep-forest">
              {t('fireRisk.heroTitle')}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
              {t('fireRisk.demoDataTag')}
            </span>
          </div>
          <p className="text-xs text-earth-brown font-medium mt-0.5">
            {t('fireRisk.pageSubtitle')}
          </p>
        </div>

        <Link
          to="/fire-risk"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-green/10 text-forest-green font-bold text-xs hover:bg-forest-green hover:text-white transition-colors self-start sm:self-auto"
        >
          <span>{t('fireRisk.pageTitle')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Status Hero Card */}
        <div className="md:col-span-6 bg-gradient-to-br from-amber-500/10 via-light-leaf/30 to-warm-cream p-6 rounded-3xl border border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-earth-brown uppercase tracking-wider">
              📍 {villageName}, {districtName}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow">
              {t('fireRisk.badgeLow')}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold font-serif text-deep-forest">
              {t('fireRisk.riskLow')}
            </span>
            <span className="text-sm font-bold text-forest-green">
              {fireData.riskScore} / 100
            </span>
          </div>

          <p className="text-xs text-earth-brown leading-relaxed font-medium">
            "{t('fireRisk.lowRiskHeroSub')}"
          </p>

          <div className="text-[11px] text-earth-brown/70 pt-1 flex items-center justify-between border-t border-forest-green/10">
            <span>Nearby demo detections: <strong className="text-deep-forest">{detectionData.count}</strong></span>
            <span>{fireData.lastUpdated}</span>
          </div>
        </div>

        {/* Right Parameter Metric Pills */}
        <div className="md:col-span-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-warm-cream border border-forest-green/10 text-center space-y-1">
              <Flame className="w-4 h-4 text-emerald-600 mx-auto" />
              <div className="text-xs text-earth-brown font-semibold">{t('fireRisk.nearbyFireActivity')}</div>
              <div className="text-xs font-bold text-emerald-600">🟢 {t('fireRisk.statusNormal')}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-warm-cream border border-forest-green/10 text-center space-y-1">
              <Thermometer className="w-4 h-4 text-amber-500 mx-auto" />
              <div className="text-xs text-earth-brown font-semibold">{t('fireRisk.temperature')}</div>
              <div className="text-xs font-bold text-deep-forest">{fireData.weatherSnapshot.temperature}°C</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-warm-cream border border-forest-green/10 text-center space-y-1">
              <Wind className="w-4 h-4 text-forest-green mx-auto" />
              <div className="text-xs text-earth-brown font-semibold">{t('fireRisk.windSpeed')}</div>
              <div className="text-xs font-bold text-deep-forest">{fireData.weatherSnapshot.windSpeed} km/h</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-light-leaf/40 border border-leaf-green/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-deep-forest font-bold">
              <MapPin className="w-4 h-4 text-forest-green" />
              <span>{villageName}, {districtName}</span>
            </div>
            <Link to="/fire-risk" className="text-forest-green font-bold hover:underline flex items-center gap-1">
              <span>{t('fireRisk.pageTitle')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Interactive Satellite Radar Preview */}
      <div className="pt-2">
        <IndiaSatelliteMap
          activeLocation={`${villageName}, ${districtName}`}
          heightClass="h-72"
          radiusKm={25}
          detections={detectionData.detections}
          showDemoTag={false}
        />
      </div>

    </div>
  );
};

export default FireRiskWidget;

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useLanguage } from '../../context/LanguageContext';
import { 
  fetchLiveWeatherData,
  getCurrentWeather, 
  getForecast, 
  getWeatherAlerts, 
  getWhatWeatherMeans, 
  getFarmingAdvice, 
  getCropWeatherSuitability, 
  getIrrigationAdvice, 
  getRainForecast, 
  getFarmingCalendar, 
  getWeatherFireRisk,
  getFarmerLocation,
  saveFarmerLocation
} from '../../services/weatherService';
import { getFarmerProfile } from '../../services/farmerProfileService';
import { getCurrentAccount } from '../../services/authService';

import WeatherHero from '../../components/weather/WeatherHero';
import WhatWeatherMeansSection from '../../components/weather/WhatWeatherMeansSection';
import TodayFarmingAdviceSection from '../../components/weather/TodayFarmingAdviceSection';
import WeatherAlertsSection from '../../components/weather/WeatherAlertsSection';
import SevenDayForecastSection from '../../components/weather/SevenDayForecastSection';
import TemperatureChartSection from '../../components/weather/TemperatureChartSection';
import RainfallForecastSection from '../../components/weather/RainfallForecastSection';
import PersonalizedCropWeatherSection from '../../components/weather/PersonalizedCropWeatherSection';
import IrrigationAdvisorSection from '../../components/weather/IrrigationAdvisorSection';
import FarmingCalendarSection from '../../components/weather/FarmingCalendarSection';
import WeatherFireRiskSection from '../../components/weather/WeatherFireRiskSection';
import WeatherCropPlannerSection from '../../components/weather/WeatherCropPlannerSection';
import ChangeLocationModal from '../../components/weather/ChangeLocationModal';

import { CloudRain, AlertCircle, RefreshCw, MapPin } from 'lucide-react';

export const WeatherPage = () => {
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Active Weather Data State
  const [locationData, setLocationData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [meansList, setMeansList] = useState([]);
  const [adviceList, setAdviceList] = useState([]);
  const [cropSuitability, setCropSuitability] = useState(null);
  const [irrigationData, setIrrigationData] = useState(null);
  const [rainData, setRainData] = useState(null);
  const [calendarList, setCalendarList] = useState([]);
  const [fireRiskData, setFireRiskData] = useState(null);

  const [activeCrop, setActiveCrop] = useState('Cotton');

  const loadWeatherData = async (loc = null) => {
    try {
      setLoading(true);
      setError(false);

      const locObj = loc || getFarmerLocation();
      setLocationData(locObj);

      // Read current crop from user-scoped profile
      let farmerCrop = '';
      const account = getCurrentAccount();
      if (account?.id) {
        const prof = getFarmerProfile(account.id);
        if (prof?.currentCrop) {
          farmerCrop = prof.currentCrop;
        } else if (prof?.selectedCrops?.length > 0) {
          farmerCrop = prof.selectedCrops[0];
        }
      }
      farmerCrop = farmerCrop || 'Cotton';
      setActiveCrop(farmerCrop);

      // Fetch live weather data from API
      const liveData = await fetchLiveWeatherData(locObj);

      if (liveData && liveData.currentWeather) {
        const currentWeather = liveData.currentWeather;
        const sevenDayForecast = liveData.forecast || [];
        const activeAlerts = liveData.alerts || [];
        const whatMeans = getWhatWeatherMeans(currentWeather, farmerCrop);
        const advice = getFarmingAdvice(currentWeather, farmerCrop);
        const cropSuit = getCropWeatherSuitability(farmerCrop, currentWeather);
        const irrigation = getIrrigationAdvice(currentWeather);
        const rainfall = getRainForecast(currentWeather);
        const calendar = getFarmingCalendar(currentWeather);
        const fireRisk = getWeatherFireRisk(currentWeather);

        setWeather(currentWeather);
        setForecast(sevenDayForecast);
        setAlerts(activeAlerts);
        setMeansList(whatMeans);
        setAdviceList(advice);
        setCropSuitability(cropSuit);
        setIrrigationData(irrigation);
        setRainData(rainfall);
        setCalendarList(calendar);
        setFireRiskData(fireRisk);
      } else {
        const currentWeather = getCurrentWeather(locObj);
        setWeather(currentWeather);
        setForecast(getForecast(locObj));
        setAlerts(getWeatherAlerts(locObj));
        setMeansList(getWhatWeatherMeans(currentWeather, farmerCrop));
        setAdviceList(getFarmingAdvice(currentWeather, farmerCrop));
        setCropSuitability(getCropWeatherSuitability(farmerCrop, currentWeather));
        setIrrigationData(getIrrigationAdvice(currentWeather));
        setRainData(getRainForecast(currentWeather));
        setCalendarList(getFarmingCalendar(currentWeather));
        setFireRiskData(getWeatherFireRisk(currentWeather));
      }

      setLoading(false);
    } catch (e) {
      console.error("Error loading live weather data:", e);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

  const handleSaveLocation = (newLoc) => {
    saveFarmerLocation(newLoc);
    loadWeatherData(newLoc);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans max-w-6xl mx-auto pb-12">


        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-md space-y-4 border border-forest-green/10">
            <RefreshCw className="w-10 h-10 text-forest-green animate-spin mx-auto" />
            <p className="text-sm font-bold text-earth-brown">
              {t('common.loading')}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-md space-y-4 border border-red-200">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-3xl">
              🌦️
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold font-serif text-deep-forest">
                {t('weatherPage.errorTitle')}
              </h3>
              <p className="text-xs text-earth-brown">
                Please check your internet connection or try again.
              </p>
            </div>
            <button
              onClick={() => loadWeatherData()}
              className="px-6 py-3 rounded-2xl bg-forest-green text-white font-bold text-xs shadow-glow-green hover:bg-leaf-green transition-all"
            >
              {t('weatherPage.tryAgainBtn')}
            </button>
          </div>
        )}

        {/* Main Weather Content */}
        {!loading && !error && (
          <>
            {/* 2. Weather Hero */}
            <WeatherHero
              weatherData={weather}
              onChangeLocation={() => setLocationModalOpen(true)}
            />

            {/* 3. Most Important Section: What Does This Weather Mean for Your Farm? */}
            <WhatWeatherMeansSection meansList={meansList} />

            {/* 7. Today's Farming Advice */}
            <TodayFarmingAdviceSection adviceList={adviceList} />

            {/* 8. Weather Alerts */}
            <WeatherAlertsSection alerts={alerts} />

            {/* 4. 7-Day Forecast */}
            <SevenDayForecastSection forecastList={forecast} />

            {/* 5. Temperature Graph */}
            <TemperatureChartSection forecastList={forecast} />

            {/* 6. Rainfall Forecast Section */}
            <RainfallForecastSection rainData={rainData} />

            {/* 9. Personalized Crop Weather */}
            <PersonalizedCropWeatherSection cropSuitability={cropSuitability} />

            {/* 10. Irrigation Advisor */}
            <IrrigationAdvisorSection irrigationData={irrigationData} />

            {/* 11. Farming Calendar */}
            <FarmingCalendarSection calendarList={calendarList} />

            {/* 12 & 13. Weather + Fire Risk & Crop Planner Connections */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7">
                <WeatherFireRiskSection fireRiskData={fireRiskData} />
              </div>
              <div className="lg:col-span-5">
                <WeatherCropPlannerSection cropName={activeCrop} />
              </div>
            </div>
          </>
        )}

        {/* Location Change Modal */}
        <ChangeLocationModal
          isOpen={locationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          currentLocation={locationData}
          onSaveLocation={handleSaveLocation}
        />

      </div>
    </DashboardLayout>
  );
};

export default WeatherPage;

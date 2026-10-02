import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CropsHero from '../../components/crops/CropsHero';
import FarmProfileSummaryBar from '../../components/crops/FarmProfileSummaryBar';
import GoalSelector from '../../components/crops/GoalSelector';
import WaterAvailabilityPicker from '../../components/crops/WaterAvailabilityPicker';
import SeasonPicker from '../../components/crops/SeasonPicker';
import RecommendationLoadingState from '../../components/crops/RecommendationLoadingState';
import TopMatchHeroCard from '../../components/crops/TopMatchHeroCard';
import CropCardGrid from '../../components/crops/CropCardGrid';
import CropDetailDrawer from '../../components/crops/CropDetailDrawer';
import FarmEconomicsVisualizer from '../../components/crops/FarmEconomicsVisualizer';
import InteractiveCropComparison from '../../components/crops/InteractiveCropComparison';
import AiReasoningExplanation from '../../components/crops/AiReasoningExplanation';
import RiskBreakdownWidget from '../../components/crops/RiskBreakdownWidget';
import PlantingTimelineVisualizer from '../../components/crops/PlantingTimelineVisualizer';
import WeatherConnectionWidget from '../../components/crops/WeatherConnectionWidget';

import { getCropRecommendations } from '../../services/cropRecommendationService';
import { useLanguage } from '../../context/LanguageContext';
import { getFarmerProfile } from '../../services/farmerProfileService';
import { getCurrentAccount } from '../../services/authService';

const DEFAULT_DEMO_CROPS = [
  {
    id: 'groundnut',
    name: 'Groundnut',
    gujaratiName: 'મગફળી',
    hindiName: 'मूंगफली',
    suitabilityScore: 94,
    waterRequirement: 'મધ્યમ (Medium)',
    risk: 'ઓછું (Low)',
    growthPeriodDays: 110,
    estimatedCost: 18500,
    estimatedRevenue: 48000,
    estimatedProfit: 29500,
    whyRecommendKey: 'જમીનમાં નાઇટ્રોજનનું પ્રમાણ વધારે છે, કપાસ કરતા ૪૦% ઓછું પાણી અને જોખમ, અને બજારમાં સ્થિર ઊંચો ભાવ રહે છે.',
    reasons: [
      'જમીનની ફળદ્રુપતા અને નાઇટ્રોજન તત્વોમાં વધારો કરે છે',
      'કપાસની તુલનામાં ૪૦% ઓછી સિંચાઈ અને પાણીની જરૂરિયાત',
      'સ્થાનિક આણંદ અને સૌરાષ્ટ્ર માર્કેટ યાર્ડ્સમાં સ્થિર માંગ અને સારો ભાવ',
      'જીવાત અને રોગનું જોખમ ખૂબ જ ઓછું'
    ]
  },
  {
    id: 'mustard',
    name: 'Mustard',
    gujaratiName: 'રાઈ / રાયડો',
    hindiName: 'सरसों',
    suitabilityScore: 88,
    waterRequirement: 'ઓછું (Low)',
    risk: 'ઓછું (Low)',
    growthPeriodDays: 95,
    estimatedCost: 12000,
    estimatedRevenue: 37000,
    estimatedProfit: 25000,
    whyRecommendKey: 'માત્ર ૨ થી ૩ પીયતમાં પાકી જાય છે. ટૂંકા ગાળાનો અને બિયારણ-ખાતરના ઓછા ખર્ચવાળો રોકડિયા પાક.',
    reasons: [
      'ખૂબ જ ઓછા પાણીમાં (માત્ર ૨-૩ પીયત) સારી રીતે પાકે છે',
      '૯૫ દિવસનો ટૂંકો પાક સમયગાળો હોવાથી જમીન ઝડપથી ખાલી થાય છે',
      'ઓછા ખાતર અને બિયારણ ખર્ચના કારણે આર્થિક રક્ષણ'
    ]
  },
  {
    id: 'gram',
    name: 'Chickpea / Gram',
    gujaratiName: 'ચણા',
    hindiName: 'चना',
    suitabilityScore: 85,
    waterRequirement: 'ઓછું (Low)',
    risk: 'ઓછું (Low)',
    growthPeriodDays: 105,
    estimatedCost: 14000,
    estimatedRevenue: 38000,
    estimatedProfit: 24000,
    whyRecommendKey: 'કપાસ પછી પાક ફેરબદલી માટે શ્રેષ્ઠ અને સરકારી ટેકાના ભાવ (MSP) પર વેચાણની ખાતરી.',
    reasons: [
      'પાક ફેરબદલીથી રોગ-જીવાતચક્ર તૂટે છે',
      'સરકારી ટેકાના ભાવ (MSP) દ્વારા ભાવ સુરક્ષા',
      'ઓછી મજૂરી અને ખાતર જરૂરિયાત'
    ]
  },
  {
    id: 'wheat',
    name: 'Wheat',
    gujaratiName: 'ઘઉં',
    hindiName: 'गेहूं',
    suitabilityScore: 82,
    waterRequirement: 'મધ્યમ (Medium)',
    risk: 'ઓછું (Low)',
    growthPeriodDays: 120,
    estimatedCost: 16500,
    estimatedRevenue: 42000,
    estimatedProfit: 25500,
    whyRecommendKey: 'શિયાળાની સીઝનનો સલામત પાક અને બજારમાં વર્ષભર ભારે રોકડિયા માંગ.',
    reasons: [
      'બજારમાં અને ઘરવપરાશ માટે સતત માગ રહે છે',
      'સરકારી MSP ખરીદીનું પૂરું રક્ષણ',
      'સ્થિર અને ખાતરીપૂર્વક આવક આપતો પાક'
    ]
  }
];

export const CropsPage = () => {
  const { language } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [selectedGoals, setSelectedGoals] = useState(['profit', 'water']);
  const [waterLevel, setWaterLevel] = useState('medium');
  const [season, setSeason] = useState('kharif');

  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);

  const [recommendationResult, setRecommendationResult] = useState(DEFAULT_DEMO_CROPS);
  const [selectedDetailCrop, setSelectedDetailCrop] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // Use user-scoped profile service — never the global legacy key
    const account = getCurrentAccount();
    let parsedProf = null;
    if (account?.id) {
      parsedProf = getFarmerProfile(account.id);
      if (parsedProf) setProfile(parsedProf);
    }

    const fetchCrops = async () => {
      try {
        const res = await getCropRecommendations(parsedProf, selectedGoals, waterLevel, season);
        if (res && res.success && res.data && Array.isArray(res.data.recommendedCrops) && res.data.recommendedCrops.length > 0) {
          const formatted = res.data.recommendedCrops.map((c, i) => ({
            id: c.cropId || `crop_${i}`,
            name: c.cropName || 'Groundnut',
            gujaratiName: c.cropNameGu || 'મગફળી',
            hindiName: c.cropNameHi || 'मूंगफली',
            suitabilityScore: c.suitabilityScore || 90 - i * 5,
            waterRequirement: c.waterRequirementGu ? `${c.waterRequirementGu} (${c.waterRequirement})` : 'મધ્યમ',
            risk: c.riskLevel ? (language === 'gu' ? (c.riskLevel === 'Low' ? 'ઓછું (Low)' : 'મધ્યમ (Medium)') : c.riskLevel) : 'ઓછું',
            growthPeriodDays: 110,
            estimatedCost: 18000 + i * 2000,
            estimatedRevenue: 45000 - i * 3000,
            estimatedProfit: 27000 - i * 3000,
            whyRecommendKey: c.reasonsGu?.[0] || 'ઉચ્ચ ઉત્પાદન અને ઓછી સિંચાઈ જરૂરિયાત.',
            reasons: c.reasonsGu || ['જમીનની ફળદ્રુપતા સુધારે છે', 'ઓછા પાણીમાં સારો પાક']
          }));
          setRecommendationResult(formatted);
        }
      } catch (err) {}
    };

    fetchCrops();
  }, [waterLevel, season, selectedGoals, language]);

  const handleToggleGoal = (id) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(selectedGoals.filter((item) => item !== id));
    } else {
      setSelectedGoals([...selectedGoals, id]);
    }
  };

  const handleFindCrops = () => {
    setIsLoading(true);
    setHasSearched(false);
  };

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setHasSearched(true);
  };

  const handleViewDetails = (crop) => {
    setSelectedDetailCrop(crop);
    setDrawerOpen(true);
  };

  const allCrops = Array.isArray(recommendationResult) && recommendationResult.length > 0 ? recommendationResult : DEFAULT_DEMO_CROPS;
  const topCrop = allCrops[0] || DEFAULT_DEMO_CROPS[0];

  return (
    <DashboardLayout>
      <div className="space-y-8 font-sans">
        {/* 1. Agricultural Hero */}
        <CropsHero onFindCropsClick={handleFindCrops} />

        {/* 2. Farm Information Summary Bar */}
        <FarmProfileSummaryBar
          farmerProfile={profile}
          onEditClick={() => window.location.href = '/profile'}
        />

        {/* 3. Interactive Goal Selector */}
        <GoalSelector
          selectedGoals={selectedGoals}
          onToggleGoal={handleToggleGoal}
        />

        {/* 4. Water Availability Picker & Season Picker Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 h-full">
            <WaterAvailabilityPicker
              waterLevel={waterLevel}
              onSelectWater={setWaterLevel}
            />
          </div>
          <div className="lg:col-span-5 h-full">
            <SeasonPicker
              selectedSeason={season}
              onSelectSeason={setSeason}
            />
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center pt-2">
          <button
            onClick={handleFindCrops}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-forest-green to-leaf-green hover:from-leaf-green hover:to-forest-green text-white font-bold text-sm sm:text-base px-10 py-4 rounded-2xl shadow-glow-green hover:scale-105 transition-all cursor-pointer"
          >
            <span>{language === 'gu' ? 'મારા માટે શ્રેષ્ઠ પાક શોધો → 🌱' : 'Find My Best Crops → 🌱'}</span>
          </button>
        </div>

        {/* 5. Animated Loading Sequence */}
        {isLoading && (
          <RecommendationLoadingState onComplete={handleLoadingComplete} />
        )}

        {/* 6. Results Sections */}
        {hasSearched && !isLoading && (
          <>
            {/* Top Match Hero */}
            <TopMatchHeroCard
              topCrop={topCrop}
              onViewDetailsClick={handleViewDetails}
            />

            {/* All Recommended Crops Grid */}
            <CropCardGrid
              crops={allCrops}
              onViewDetailsClick={handleViewDetails}
            />

            {/* Conversational AI Reason Explanation */}
            <AiReasoningExplanation selectedCrop={topCrop} />

            {/* Estimated Farm Economics Bar Visualizer */}
            <FarmEconomicsVisualizer selectedCrop={topCrop} />

            {/* Side-by-Side Crop Comparison */}
            <InteractiveCropComparison allCrops={allCrops} />

            {/* 5-Dimension Risk Breakdown */}
            <RiskBreakdownWidget cropId={topCrop?.id} />

            {/* Planting Plan Timeline */}
            <PlantingTimelineVisualizer cropId={topCrop?.id} />

            {/* Weather Readiness Check */}
            <WeatherConnectionWidget />
          </>
        )}

        {/* Detailed Crop Drawer */}
        <CropDetailDrawer
          crop={selectedDetailCrop}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
};

export default CropsPage;

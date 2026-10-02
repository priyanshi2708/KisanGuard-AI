import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowRight, ArrowLeft, MapPin, Check, Sparkles, Globe, Search } from 'lucide-react';
import heroFarmerImg from '../assets/hero_farmer.png';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { updateAccount, getCurrentAccount } from '../services/authService';
import { saveFarmerProfile } from '../services/farmerProfileService';
import { landSizes } from '../data/mockData';
import { searchLocations, gujaratDistrictsAndVillages } from '../data/locationData';

export const OnboardingPage = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Onboarding Form State - Starts empty so farmer types their own data
  const [profile, setProfile] = useState({
    language: language,
    village: '',
    district: '',
    state: 'Gujarat',
    landSize: '',
    selectedCrops: [],
    seasonOutcome: '',
    affectedCauses: [],
    expenses: { seeds: '', fertilizer: '', water: '', medicine: '', labour: '' },
    onboardingCompleted: false
  });

  const [isFinished, setIsFinished] = useState(false);

  // Search autocomplete state for Step 2
  const [villageSearch, setVillageSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [villageSuggestions, setVillageSuggestions] = useState([]);
  const [districtSuggestions, setDistrictSuggestions] = useState([]);
  const [showVillageDropdown, setShowVillageDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  const handleNext = () => {
    if (currentStep < 7) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    const activeAccount = getCurrentAccount();
    const userId = activeAccount?.id;

    if (!userId) {
      // Should not happen — ProtectedRoute ensures auth. Safety fallback.
      navigate('/login', { replace: true });
      return;
    }

    // Save ONLY what the user actually entered — no fake default injections.
    // If the user skipped a field, it stays empty (not filled with 'Anand', 'Cotton', etc.)
    const finalProfile = {
      ...profile,
      name: activeAccount?.name || profile.name || '',
      currentCrop: profile.selectedCrops && profile.selectedCrops.length > 0
        ? profile.selectedCrops[0]
        : '',
      onboardingCompleted: true
    };

    saveFarmerProfile(finalProfile, userId);
    // Do NOT write to the global legacy key — use only user-scoped key
    navigate('/dashboard');
  };

  const toggleCrop = (cropId) => {
    setProfile((prev) => {
      const exists = prev.selectedCrops.includes(cropId);
      return {
        ...prev,
        selectedCrops: exists
          ? prev.selectedCrops.filter((id) => id !== cropId)
          : [...prev.selectedCrops, cropId]
      };
    });
  };

  const toggleCause = (causeId) => {
    setProfile((prev) => {
      const exists = prev.affectedCauses.includes(causeId);
      return {
        ...prev,
        affectedCauses: exists
          ? prev.affectedCauses.filter((id) => id !== causeId)
          : [...prev.affectedCauses, causeId]
      };
    });
  };

  // Autocomplete Handlers
  const handleVillageChange = (val) => {
    setProfile((prev) => ({ ...prev, village: val }));
    setVillageSearch(val);
    if (val.trim().length > 0) {
      const matches = searchLocations(val);
      setVillageSuggestions(matches);
      setShowVillageDropdown(true);
    } else {
      setShowVillageDropdown(false);
    }
  };

  const handleDistrictChange = (val) => {
    setProfile((prev) => ({ ...prev, district: val }));
    setDistrictSearch(val);
    if (val.trim().length > 0) {
      const matches = gujaratDistrictsAndVillages.filter((d) =>
        d.district.toLowerCase().includes(val.toLowerCase())
      );
      setDistrictSuggestions(matches);
      setShowDistrictDropdown(true);
    } else {
      setShowDistrictDropdown(false);
    }
  };

  const selectLocationSuggestion = (loc) => {
    setProfile((prev) => ({
      ...prev,
      village: loc.village,
      district: loc.district,
      state: loc.state || 'Gujarat'
    }));
    setVillageSearch(loc.village);
    setDistrictSearch(loc.district);
    setShowVillageDropdown(false);
    setShowDistrictDropdown(false);
  };

  const cropsKeys = ['wheat', 'rice', 'maize', 'cotton', 'groundnut', 'onion', 'vegetables', 'other'];
  const outcomesKeys = ['good', 'small', 'even', 'loss', 'heavy_loss'];
  const causesKeys = ['heavy_rain', 'drought', 'fire', 'pests', 'disease', 'market', 'water', 'yield'];

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-soil-dark p-4 sm:p-6 overflow-hidden font-sans">
      
      {/* Background Farmer Image with Subtle Ken Burns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          src={heroFarmerImg}
          alt="Farmer field background"
          className="w-full h-full object-cover opacity-40 scale-105 animate-kenburns origin-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-soil-dark via-deep-forest/80 to-deep-forest/90" />
      </div>

      {/* Main Centered Question Card */}
      <div className="relative z-20 w-full max-w-2xl bg-warm-cream/95 backdrop-blur-xl border border-light-leaf/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-deep-forest">
        
        {/* Top Bar: Brand + Progress Indicator */}
        <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-leaf-green flex items-center justify-center text-white shadow">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg font-serif text-deep-forest">{t('nav.brand')}</span>
          </Link>

          {!isFinished && (
            <div className="flex items-center gap-2">
              <div className="text-xs font-bold text-forest-green font-mono">
                {t('onboarding.stepProgress', { current: currentStep })}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <span
                    key={num}
                    className={`w-2 h-2 rounded-full transition-all ${
                      num === currentStep
                        ? 'w-5 bg-leaf-green'
                        : num < currentStep
                        ? 'bg-forest-green'
                        : 'bg-forest-green/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {!isFinished ? (
          <div className="min-h-[340px] flex flex-col justify-between relative overflow-hidden py-2">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="space-y-6"
              >
                
                {/* QUESTION 1: Language */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-forest-green flex items-center gap-1.5">
                        <Globe className="w-4 h-4 text-leaf-green" />
                        <span>01 / 07</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold font-serif text-deep-forest">
                        {t('onboarding.q1Title')}
                      </h2>
                      <p className="text-xs text-earth-brown font-medium">
                        {t('onboarding.q1Sub')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      {[
                        { id: 'gu', label: 'ગુજરાતી', desc: 'Gujarati UI' },
                        { id: 'hi', label: 'हिंदी', desc: 'Hindi UI' },
                        { id: 'en', label: 'English', desc: 'English UI' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setLanguage(item.id);
                            updateAccount({ language: item.id });
                            setProfile({ ...profile, language: item.id });
                          }}
                          className={`p-5 rounded-2xl border-2 text-center transition-all ${
                            language === item.id
                              ? 'border-leaf-green bg-light-leaf/70 text-deep-forest shadow-md scale-105 font-bold'
                              : 'border-forest-green/20 bg-white text-deep-forest hover:bg-light-leaf/30'
                          }`}
                        >
                          <div className="text-xl font-bold font-serif mb-1">{item.label}</div>
                          <div className="text-xs text-earth-brown font-medium">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* QUESTION 2: Location (Searchable Autocomplete Dropdown) */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-forest-green flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-leaf-green" />
                        <span>02 / 07</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold font-serif text-deep-forest">
                        {t('onboarding.q2Title')}
                      </h2>
                      <p className="text-xs text-earth-brown font-medium">
                        Type your village or city to search and select from the list.
                      </p>
                    </div>

                    <div className="space-y-4 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        
                        {/* Village Input + Search Dropdown */}
                        <div className="space-y-1 relative">
                          <label className="text-xs font-bold text-earth-brown uppercase flex items-center gap-1">
                            <span>{t('onboarding.villageLabel')}</span>
                            <Search className="w-3 h-3 text-forest-green" />
                          </label>
                          <input
                            type="text"
                            value={profile.village}
                            onChange={(e) => handleVillageChange(e.target.value)}
                            onFocus={() => {
                              if (profile.village) handleVillageChange(profile.village);
                            }}
                            placeholder="Type village/city name..."
                            className="w-full bg-white border border-forest-green/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-deep-forest focus:outline-none focus:border-leaf-green shadow-sm"
                          />

                          {/* Village Search Dropdown */}
                          {showVillageDropdown && villageSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-forest-green/20 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-forest-green/10 text-xs">
                              {villageSuggestions.map((item, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => selectLocationSuggestion(item)}
                                  className="p-3 hover:bg-light-leaf/40 cursor-pointer text-deep-forest font-semibold flex items-center justify-between"
                                >
                                  <span>{item.display}</span>
                                  <MapPin className="w-3.5 h-3.5 text-forest-green opacity-60" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* District / City Input + Search Dropdown */}
                        <div className="space-y-1 relative">
                          <label className="text-xs font-bold text-earth-brown uppercase flex items-center gap-1">
                            <span>{t('onboarding.districtLabel')}</span>
                            <Search className="w-3 h-3 text-forest-green" />
                          </label>
                          <input
                            type="text"
                            value={profile.district}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            onFocus={() => {
                              if (profile.district) handleDistrictChange(profile.district);
                            }}
                            placeholder="Type district/city..."
                            className="w-full bg-white border border-forest-green/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-deep-forest focus:outline-none focus:border-leaf-green shadow-sm"
                          />

                          {/* District Search Dropdown */}
                          {showDistrictDropdown && districtSuggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-forest-green/20 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-forest-green/10 text-xs">
                              {districtSuggestions.map((d, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    setProfile((prev) => ({ ...prev, district: d.district }));
                                    setShowDistrictDropdown(false);
                                  }}
                                  className="p-3 hover:bg-light-leaf/40 cursor-pointer text-deep-forest font-semibold flex items-center justify-between"
                                >
                                  <span>{d.district} (District)</span>
                                  <MapPin className="w-3.5 h-3.5 text-forest-green opacity-60" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* State Input */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-earth-brown uppercase">
                            {t('onboarding.stateLabel')}
                          </label>
                          <input
                            type="text"
                            value={profile.state}
                            onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                            placeholder={t('onboarding.statePlaceholder')}
                            className="w-full bg-white border border-forest-green/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-deep-forest focus:outline-none focus:border-leaf-green shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Quick Location Shortcuts */}
                      <div className="pt-2">
                        <div className="text-[11px] font-bold text-earth-brown uppercase mb-1.5">
                          Quick Select Major Districts:
                        </div>
                        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
                          {["Anand", "Rajkot", "Ahmedabad", "Vadodara", "Bhavnagar", "Junagadh", "Surat", "Amreli"].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                setProfile({ ...profile, village: d, district: d });
                                setVillageSearch(d);
                                setDistrictSearch(d);
                              }}
                              className={`px-3 py-1 rounded-full border transition-all ${
                                profile.district === d
                                  ? 'bg-forest-green text-white border-forest-green font-bold shadow'
                                  : 'bg-white border-forest-green/20 text-deep-forest hover:bg-light-leaf/40'
                              }`}
                            >
                              📍 {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setProfile((prev) => ({
                            ...prev,
                            village: prev.village || 'Anand',
                            district: prev.district || 'Anand',
                            state: 'Gujarat'
                          }));
                          alert(t('common.useLocation') + " ✓");
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-leaf-green/40 bg-light-leaf/40 text-forest-green font-bold text-xs hover:bg-light-leaf/70 transition-colors"
                      >
                        <span>{t('common.useLocation')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* QUESTION 3: Land Size */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-forest-green">
                        03 / 07
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold font-serif text-deep-forest">
                        {t('onboarding.q3Title')}
                      </h2>
                      <p className="text-xs text-earth-brown font-medium">
                        {t('onboarding.q3Sub')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {landSizes.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setProfile({ ...profile, landSize: item.label })}
                          className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                            profile.landSize === item.label
                              ? 'border-leaf-green bg-light-leaf/60 shadow-md font-bold'
                              : 'border-forest-green/20 bg-white hover:bg-light-leaf/30'
                          }`}
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <span className="text-sm font-serif text-deep-forest">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* QUESTION 4: Past Crops */}
                {currentStep === 4 && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-forest-green">
                        04 / 07
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold font-serif text-deep-forest">
                        {t('onboarding.q4Title')}
                      </h2>
                      <p className="text-xs text-earth-brown font-medium">
                        {t('onboarding.q4Sub')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {cropsKeys.map((cropId) => {
                        const selected = profile.selectedCrops.includes(cropId);
                        const icons = { wheat: '🌾', rice: '🌾', maize: '🌽', cotton: '🌱', groundnut: '🥜', onion: '🧅', vegetables: '🍅', other: '🌱' };
                        return (
                          <button
                            key={cropId}
                            onClick={() => toggleCrop(cropId)}
                            className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all ${
                              selected
                                ? 'border-leaf-green bg-light-leaf/70 shadow-md font-bold'
                                : 'border-forest-green/20 bg-white hover:bg-light-leaf/30'
                            }`}
                          >
                            <span className="text-2xl">{icons[cropId]}</span>
                            <span className="text-xs font-semibold text-deep-forest">
                              {t(`crops.${cropId}`)}
                            </span>
                            {selected && <Check className="w-3.5 h-3.5 text-forest-green" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* QUESTION 5: Last Season Outcome */}
                {currentStep === 5 && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-forest-green">
                        05 / 07
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold font-serif text-deep-forest">
                        {t('onboarding.q5Title')}
                      </h2>
                      <p className="text-xs text-earth-brown font-medium">
                        {t('onboarding.q5Sub')}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {outcomesKeys.map((key) => {
                        const emojis = { good: '😊', small: '🙂', even: '😐', loss: '😟', heavy_loss: '😔' };
                        const selected = profile.seasonOutcome === key;
                        return (
                          <button
                            key={key}
                            onClick={() => setProfile({ ...profile, seasonOutcome: key })}
                            className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                              selected
                                ? 'border-leaf-green bg-light-leaf/70 shadow-md font-bold'
                                : 'border-forest-green/20 bg-white hover:bg-light-leaf/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{emojis[key]}</span>
                              <span className="text-sm font-semibold text-deep-forest">{t(`outcomes.${key}`)}</span>
                            </div>
                            {selected && <Check className="w-4 h-4 text-forest-green" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* QUESTION 6: Affected Causes */}
                {currentStep === 6 && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-forest-green">
                        06 / 07
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold font-serif text-deep-forest">
                        {t('onboarding.q6Title')}
                      </h2>
                      <p className="text-xs text-earth-brown font-medium">
                        {t('onboarding.q6Sub')}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      {causesKeys.map((causeId) => {
                        const emojis = { heavy_rain: '🌧️', drought: '☀️', fire: '🔥', pests: '🐛', disease: '🧪', market: '💰', water: '💧', yield: '🌱' };
                        const selected = profile.affectedCauses.includes(causeId);
                        return (
                          <button
                            key={causeId}
                            onClick={() => toggleCause(causeId)}
                            className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                              selected
                                ? 'border-leaf-green bg-light-leaf/70 shadow-md font-bold'
                                : 'border-forest-green/20 bg-white hover:bg-light-leaf/30'
                            }`}
                          >
                            <span className="text-xl">{emojis[causeId]}</span>
                            <span className="text-xs font-semibold text-deep-forest">{t(`causes.${causeId}`)}</span>
                            {selected && <Check className="w-3.5 h-3.5 text-forest-green" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* QUESTION 7: Rough Expenses - Starts Empty for Farmer Input */}
                {currentStep === 7 && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-forest-green">
                        07 / 07
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold font-serif text-deep-forest">
                        {t('onboarding.q7Title')}
                      </h2>
                      <p className="text-xs text-earth-brown font-medium">
                        Enter your rough expenses for each category below:
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      {[
                        { key: 'seeds', label: t('farmBook.seeds'), placeholder: 'e.g. 4500' },
                        { key: 'fertilizer', label: t('farmBook.fertilizer'), placeholder: 'e.g. 7200' },
                        { key: 'water', label: t('farmBook.water'), placeholder: 'e.g. 2000' },
                        { key: 'medicine', label: t('farmBook.medicine'), placeholder: 'e.g. 3500' },
                        { key: 'labour', label: t('farmBook.labour'), placeholder: 'e.g. 8000' }
                      ].map(({ key, label, placeholder }) => (
                        <div key={key} className="space-y-1 bg-white p-3 rounded-2xl border border-forest-green/20 shadow-sm">
                          <label className="text-xs font-bold uppercase text-earth-brown">
                            {label}
                          </label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-forest-green text-xs">₹</span>
                            <input
                              type="number"
                              value={profile.expenses[key]}
                              onChange={(e) =>
                                setProfile({
                                  ...profile,
                                  expenses: { ...profile.expenses, [key]: e.target.value }
                                })
                              }
                              placeholder={placeholder}
                              className="w-full pl-6 pr-2 py-1 text-sm font-mono font-bold text-forest-green focus:outline-none focus:border-leaf-green"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-forest-green/10 mt-6">
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-forest-green/20 text-deep-forest font-semibold text-xs hover:bg-light-leaf/40 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('common.back')}</span>
                </button>
              ) : <div />}

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-forest-green to-leaf-green text-white font-bold text-sm shadow-md hover:scale-105 transition-transform"
              >
                <span>{t('common.next')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          /* Final Onboarding Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8 space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-light-leaf text-forest-green flex items-center justify-center mx-auto shadow-glow-green animate-bounce">
              <Sparkles className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-extrabold font-serif text-deep-forest">
                {t('onboarding.finishTitle')}
              </h2>
              <p className="text-lg text-earth-brown font-medium">
                {t('onboarding.finishSub')}
              </p>
            </div>

            <p className="text-xs text-forest-green font-semibold bg-light-leaf/60 py-3 px-5 rounded-full max-w-md mx-auto leading-relaxed">
              {t('onboarding.finishBadge')}
            </p>

            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-forest-green to-leaf-green text-white font-bold text-base px-9 py-4 rounded-2xl shadow-glow-green hover:scale-105 transition-all pt-3"
            >
              <span>{t('onboarding.enterDashboardBtn')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default OnboardingPage;

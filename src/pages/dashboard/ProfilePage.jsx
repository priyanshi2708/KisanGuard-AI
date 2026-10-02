import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import FarmProfileCard from '../../components/dashboard/FarmProfileCard';
import { User, Save, CheckCircle, Sprout, Droplets, History, ShieldAlert, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getFarmerProfile, saveFarmerProfile, getCropHistory, addCropHistoryRecord } from '../../services/farmerProfileService';
import { getCurrentAccount, updateAccount } from '../../services/authService';

export const ProfilePage = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user: authUser } = useAuth();
  const [account, setAccount] = useState(() => authUser || getCurrentAccount() || {});
  const [profile, setProfile] = useState({});
  const [history, setHistory] = useState([]);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    const current = authUser || getCurrentAccount() || {};
    setAccount(current);

    if (current.id) {
      const prof = getFarmerProfile(current.id);
      setProfile(prof || {});

      const hist = getCropHistory(current.id);
      setHistory(hist || []);
    }
  }, [authUser, language]);

  const handleSave = (e) => {
    e.preventDefault();
    const activeAcc = authUser || getCurrentAccount() || {};
    
    // Update active user account details (name and language)
    const newLang = account?.language || language;
    updateAccount({ name: account?.name || '', language: newLang });
    setLanguage(newLang);

    // Save farmer profile details
    const res = saveFarmerProfile(profile, activeAcc?.id);
    if (res.success) {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    }
  };

  const handleLanguageChange = (newLang) => {
    setAccount((prev) => ({ ...prev, language: newLang }));
    setLanguage(newLang);
    updateAccount({ language: newLang });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-deep-forest to-forest-green text-white shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-light-leaf text-xs font-bold uppercase tracking-wider">
            <User className="w-4 h-4 text-golden-wheat" />
            <span>Personalized Farmer Profile & History</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif">
            👤 My Farm Profile
          </h1>
          <p className="text-xs sm:text-sm text-light-leaf/90 max-w-2xl">
            Update your location, land size, water access, soil type, and preferred language to customize KisanGuard AI.
          </p>
        </div>

        {savedMsg && (
          <div className="p-4 rounded-2xl bg-light-leaf text-forest-green font-bold text-xs flex items-center gap-2 border border-leaf-green">
            <CheckCircle className="w-4 h-4" />
            <span>Profile details saved successfully!</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <FarmProfileCard
              farmerName={account?.name || ''}
              village={profile?.village || ''}
              district={profile?.district || ''}
              state={profile?.state || ''}
              landSize={profile?.landSize || ''}
              currentCrop={profile?.currentCrop || 'Cotton'}
              waterAvailability={profile?.waterAvailability || ''}
              soilType={profile?.soilType || ''}
            />

            {/* Farming History List */}
            <div className="bg-white p-6 rounded-3xl border border-forest-green/10 shadow-md space-y-3 font-sans">
              <div className="flex items-center gap-2 font-bold font-serif text-deep-forest text-base border-b border-forest-green/10 pb-2">
                <History className="w-4 h-4 text-forest-green" />
                <span>📚 Farming History Records</span>
              </div>
              <div className="space-y-2">
                {(!history || history.length === 0) ? (
                  <div className="p-4 text-center text-xs text-earth-brown bg-warm-cream/30 rounded-2xl">
                    No past season records yet.
                  </div>
                ) : (
                  history.map((rec) => (
                    <div key={rec.id} className="p-3 bg-warm-cream/50 rounded-2xl border border-forest-green/10 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-deep-forest">
                        <span>🌱 {rec.crop} ({rec.season} {rec.year})</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${rec.profitLoss === 'Profit' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {rec.profitLoss}
                        </span>
                      </div>
                      {rec.lossCause && rec.lossCause !== 'None' && (
                        <div className="text-[11px] text-amber-900 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          <span>Cause: {rec.lossCause}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-forest-green/10 shadow-md space-y-4">
            <h3 className="text-lg font-bold font-serif text-deep-forest border-b border-forest-green/10 pb-3">
              Edit Farm Information
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold text-deep-forest">
              
              {/* Preferred Language Setting */}
              <div className="p-4 rounded-2xl bg-warm-cream/60 border border-forest-green/20 space-y-2">
                <label className="text-earth-brown uppercase flex items-center gap-1.5 font-bold">
                  <Globe className="w-4 h-4 text-forest-green" />
                  <span>Preferred Language / પસંદગીની ભાષા / पसंदीदा भाषा</span>
                </label>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'gu', label: 'ગુજરાતી' },
                    { id: 'hi', label: 'हिन्दी' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleLanguageChange(item.id)}
                      className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold transition-all text-center ${
                        (account?.language || language) === item.id
                          ? 'bg-forest-green text-white border-forest-green shadow-md'
                          : 'bg-white text-deep-forest border-forest-green/20 hover:border-forest-green/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-earth-brown uppercase">Full Name</label>
                <input
                  type="text"
                  value={account?.name || ''}
                  onChange={(e) => setAccount({ ...account, name: e.target.value })}
                  className="w-full bg-warm-cream/50 border border-forest-green/20 rounded-xl px-3.5 py-2.5 text-xs text-deep-forest focus:outline-none focus:border-leaf-green"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-earth-brown uppercase">Village</label>
                  <input
                    type="text"
                    value={profile?.village || ''}
                    onChange={(e) => setProfile({ ...profile, village: e.target.value })}
                    className="w-full bg-warm-cream/50 border border-forest-green/20 rounded-xl px-3.5 py-2.5 text-xs text-deep-forest focus:outline-none focus:border-leaf-green"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-earth-brown uppercase">District</label>
                  <input
                    type="text"
                    value={profile?.district || ''}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    className="w-full bg-warm-cream/50 border border-forest-green/20 rounded-xl px-3.5 py-2.5 text-xs text-deep-forest focus:outline-none focus:border-leaf-green"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-earth-brown uppercase">State</label>
                  <input
                    type="text"
                    value={profile?.state || ''}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="w-full bg-warm-cream/50 border border-forest-green/20 rounded-xl px-3.5 py-2.5 text-xs text-deep-forest focus:outline-none focus:border-leaf-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-earth-brown uppercase">Land Size</label>
                  <input
                    type="text"
                    value={profile?.landSize || ''}
                    onChange={(e) => setProfile({ ...profile, landSize: e.target.value })}
                    className="w-full bg-warm-cream/50 border border-forest-green/20 rounded-xl px-3.5 py-2.5 text-xs text-deep-forest focus:outline-none focus:border-leaf-green"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-earth-brown uppercase">Soil Type</label>
                  <input
                    type="text"
                    value={profile?.soilType || ''}
                    onChange={(e) => setProfile({ ...profile, soilType: e.target.value })}
                    className="w-full bg-warm-cream/50 border border-forest-green/20 rounded-xl px-3.5 py-2.5 text-xs text-deep-forest focus:outline-none focus:border-leaf-green"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-earth-brown uppercase">Water Availability</label>
                  <input
                    type="text"
                    value={profile?.waterAvailability || ''}
                    onChange={(e) => setProfile({ ...profile, waterAvailability: e.target.value })}
                    className="w-full bg-warm-cream/50 border border-forest-green/20 rounded-xl px-3.5 py-2.5 text-xs text-deep-forest focus:outline-none focus:border-leaf-green"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-earth-brown uppercase">Current Crop</label>
                  <input
                    type="text"
                    value={profile?.currentCrop || ''}
                    onChange={(e) => setProfile({ ...profile, currentCrop: e.target.value })}
                    className="w-full bg-warm-cream/50 border border-forest-green/20 rounded-xl px-3.5 py-2.5 text-xs text-deep-forest focus:outline-none focus:border-leaf-green"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-forest-green text-white font-bold text-xs shadow hover:scale-105 transition-transform flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, LogOut, Mic, Camera } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

import CompactFarmerSummary from '../components/dashboard/CompactFarmerSummary';
import ImportantAlertsSection from '../components/dashboard/ImportantAlertsSection';
import CompactQuickActions from '../components/dashboard/CompactQuickActions';
import MarketPriceDashboardWidget from '../components/dashboard/MarketPriceDashboardWidget';
import GovernmentSchemeDashboardWidget from '../components/dashboard/GovernmentSchemeDashboardWidget';
import RecentActivitySection from '../components/dashboard/RecentActivitySection';
import AddExpenseModal from '../components/dashboard/AddExpenseModal';

import { getFarmerProfile } from '../services/farmerProfileService';
import { getCurrentAccount } from '../services/authService';

export const DashboardPage = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [account, setAccount] = useState(null);
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);

  useEffect(() => {
    try {
      const p = getFarmerProfile();
      const a = getCurrentAccount();
      setProfile(p);
      setAccount(a);
    } catch (e) {
      console.error('[DashboardPage] Error loading state:', e);
    }
  }, [language]);

  const handleLogout = () => {
    localStorage.removeItem('kisanguard_farmer_profile');
    localStorage.removeItem('kisanguard_account');
    navigate('/');
  };

  const farmerName = account?.name || profile?.name || 'Kisan';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-deep-forest font-sans flex flex-col select-none">
      
      {/* 1. TOP COMPACT GLASS NAVBAR */}
      <header className="h-14 bg-white/90 backdrop-blur-xl border-b border-emerald-900/10 px-4 sm:px-6 flex items-center justify-between shadow-sm shrink-0">
        
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Leaf className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <span className="font-extrabold text-lg font-serif text-emerald-950 tracking-tight flex items-center gap-1">
              KisanGuard AI
            </span>
          </div>
        </Link>

        {/* Action Shortcuts & Language Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/crop-health')}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{language === 'gu' ? 'પાક તપાસ' : 'Scan Leaf'}</span>
          </button>

          <button
            onClick={() => navigate('/assistant')}
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-600 hover:text-white font-bold text-xs transition-all cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5 text-amber-700" />
            <span>{language === 'gu' ? 'AI સહાયક' : 'AI Assistant'}</span>
          </button>



          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. COMPACT DASHBOARD CONTAINER */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full text-left">
        
        {/* 1. Farmer Welcome Summary */}
        <CompactFarmerSummary />

        {/* 2. Important Alerts */}
        <ImportantAlertsSection />

        {/* 3. Quick Actions */}
        <CompactQuickActions />

        {/* 4. Market & Schemes 2-Column Grid */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black font-serif text-deep-forest">
            {language === 'gu'
              ? '📊 આજની મહત્વપૂર્ણ માહિતી'
              : language === 'hi'
              ? '📊 आज की महत्वपूर्ण जानकारी'
              : '📊 Today’s Key Information'}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="h-full flex flex-col justify-between">
              <MarketPriceDashboardWidget />
            </div>
            <div className="h-full flex flex-col justify-between">
              <GovernmentSchemeDashboardWidget />
            </div>
          </div>
        </section>

        {/* 5. Recent Activity */}
        <RecentActivitySection />

      </main>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={addExpenseModalOpen}
        onClose={() => setAddExpenseModalOpen(false)}
        activeYear={2026}
        onExpenseAdded={() => {}}
      />
    </div>
  );
};

export default DashboardPage;

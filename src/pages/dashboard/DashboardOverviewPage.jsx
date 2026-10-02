import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CompactFarmerSummary from '../../components/dashboard/CompactFarmerSummary';
import ImportantAlertsSection from '../../components/dashboard/ImportantAlertsSection';
import CompactQuickActions from '../../components/dashboard/CompactQuickActions';
import MarketPriceDashboardWidget from '../../components/dashboard/MarketPriceDashboardWidget';
import GovernmentSchemeDashboardWidget from '../../components/dashboard/GovernmentSchemeDashboardWidget';
import RecentActivitySection from '../../components/dashboard/RecentActivitySection';
import AddExpenseModal from '../../components/dashboard/AddExpenseModal';

export const DashboardOverviewPage = () => {
  const { language } = useLanguage();
  const [addExpenseModalOpen, setAddExpenseModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans max-w-6xl mx-auto pb-12 text-left">
        
        {/* 1. COMPACT FARMER WELCOME & SUMMARY */}
        <CompactFarmerSummary />

        {/* 2. IMPORTANT ALERTS (2-3 Compact Equal-Height Cards) */}
        <ImportantAlertsSection />

        {/* 3. QUICK ACTIONS (4 Compact Action Shortcuts) */}
        <CompactQuickActions />

        {/* 4. TODAY'S KEY INFO: MARKET PRICES + GOVERNMENT SCHEMES (2-Column Desktop Grid) */}
        <section className="space-y-3 font-sans text-left">
          <h2 className="text-base sm:text-lg font-black font-serif text-deep-forest">
            {language === 'gu'
              ? '📊 આજની મહત્વપૂર્ણ માહિતી'
              : language === 'hi'
              ? '📊 आज की महत्वपूर्ण जानकारी'
              : '📊 Today’s Key Information'}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Market Prices */}
            <div className="h-full flex flex-col justify-between">
              <MarketPriceDashboardWidget />
            </div>

            {/* Right: Government Schemes */}
            <div className="h-full flex flex-col justify-between">
              <GovernmentSchemeDashboardWidget />
            </div>
          </div>
        </section>

        {/* 5. RECENT ACTIVITY & ADVISORY INSIGHTS */}
        <RecentActivitySection />

        {/* Add Expense Modal (Preserved for khata actions) */}
        <AddExpenseModal
          isOpen={addExpenseModalOpen}
          onClose={() => setAddExpenseModalOpen(false)}
          activeYear={2026}
          onExpenseAdded={() => {}}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardOverviewPage;

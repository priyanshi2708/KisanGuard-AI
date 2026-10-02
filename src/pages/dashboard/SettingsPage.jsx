import React from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { Settings, Globe, Bell, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const SettingsPage = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-6 font-sans max-w-4xl">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-deep-forest to-forest-green text-white shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-light-leaf text-xs font-bold uppercase tracking-wider">
            <Settings className="w-4 h-4 text-golden-wheat" />
            <span>KisanGuard AI Platform Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold font-serif">
            ⚙️ App Settings
          </h1>
          <p className="text-xs sm:text-sm text-light-leaf/90">
            Manage language preferences, SMS notifications, and weather alert frequency.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-forest-green/10 shadow-md space-y-6">
          <div className="space-y-3">
            <h3 className="text-base font-bold font-serif text-deep-forest flex items-center gap-2 border-b border-forest-green/10 pb-2">
              <Globe className="w-4 h-4 text-forest-green" />
              <span>Language Preference</span>
            </h3>
            <p className="text-xs text-earth-brown">
              Current active language: <span className="font-bold text-forest-green">{language === 'gu' ? 'ગુજરાતી' : language === 'hi' ? 'हिंदी' : 'English'}</span>
            </p>
            <p className="text-xs text-earth-brown/80">
              Language preference can be changed under your <a href="/profile" className="text-forest-green font-bold underline">Profile Page</a>.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-forest-green/10">
            <h3 className="text-base font-bold font-serif text-deep-forest flex items-center gap-2 border-b border-forest-green/10 pb-2">
              <Bell className="w-4 h-4 text-forest-green" />
              <span>Notification Preferences</span>
            </h3>
            <div className="space-y-2 text-xs font-semibold text-deep-forest">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-leaf-green" />
                <span>Daily monsoon weather SMS advisories</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-leaf-green" />
                <span>Satellite fire risk warning alerts</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

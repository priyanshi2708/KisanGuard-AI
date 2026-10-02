import React from 'react';
import { CloudSun, Bug, Flame, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { getFarmerProfile } from '../../services/farmerProfileService';

export const ImportantAlertsSection = () => {
  const { language } = useLanguage();
  const profile = getFarmerProfile();
  const defaultCrop = language === 'gu' ? 'કપાસ' : language === 'hi' ? 'कपास' : 'Cotton';
  const currentCrop = profile?.currentCrop || defaultCrop;

  // 2-3 Compact Alert Cards
  const alerts = [
    {
      id: 'weather',
      titleGu: '🌦️ હવામાન અપડેટ',
      titleHi: '🌦️ मौसम अपडेट',
      titleEn: 'Weather Status',
      descGu: 'આજે તાપમાન 29°C છે. સાંજે 10% હળવા વરસાદની શક્યતા છે.',
      descHi: 'आज तापमान 29°C है। शाम को 10% हल्की बारिश की संभावना है।',
      descEn: 'Temp 29°C today. Soft shower chance 10% in evening.',
      type: 'info',
      bgColor: 'bg-sky-50/80 border-sky-200 text-sky-900',
      icon: CloudSun
    },
    {
      id: 'health',
      titleGu: `🐛 ${currentCrop} પાક સુરક્ષા`,
      titleHi: `🐛 ${currentCrop} फसल सुरक्षा`,
      titleEn: `${currentCrop} Protection`,
      descGu: 'હાલના ભેજવાળા વાતાવરણમાં સફેદ માખી અને ઈયળનું નિરીક્ષણ રાખો.',
      descHi: 'वर्तमान आर्द्र मौसम में सफेद मक्खी और सुंडी की निगरानी रखें।',
      descEn: 'Monitor whitefly & worm infestation due to humidity.',
      type: 'warning',
      bgColor: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: Bug
    },
    {
      id: 'safety',
      titleGu: '🟢 સેટેલાઇટ સલામતી',
      titleHi: '🟢 सैटेलाइट सुरक्षा',
      titleEn: 'Safety Radar',
      descGu: 'આજુબાજુના 5 કિમી વિસ્તારમાં આગનું કોઈ જોખમ નથી.',
      descHi: 'आसपास के 5 किमी दायरे में आग का कोई खतरा नहीं है।',
      descEn: 'No fire risk detected within 5 km radius.',
      type: 'success',
      bgColor: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: Flame
    }
  ];

  return (
    <section className="space-y-3 font-sans text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black font-serif text-deep-forest flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <span>
            {language === 'gu'
              ? '⚠️ મહત્વપૂર્ણ ચેતવણીઓ'
              : language === 'hi'
              ? '⚠️ महत्वपूर्ण अलर्ट'
              : '⚠️ Important Alerts'}
          </span>
        </h2>
        <span className="text-[11px] font-bold text-forest-green bg-emerald-100 px-2.5 py-0.5 rounded-full">
          {language === 'gu' ? '૩ સક્રિય અપડેટ' : language === 'hi' ? '३ सक्रिय अपडेट' : '3 Active Updates'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch">
        {alerts.map((item) => {
          const Icon = item.icon;
          const title = language === 'gu' ? item.titleGu : language === 'hi' ? item.titleHi : item.titleEn;
          const desc = language === 'gu' ? item.descGu : language === 'hi' ? item.descHi : item.descEn;
          const statusText = language === 'gu' ? 'સ્થિતિ સામાન્ય' : language === 'hi' ? 'स्थिति सामान्य' : 'Status Monitored';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border ${item.bgColor} shadow-sm flex flex-col justify-between h-full transition-all`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 font-bold font-serif text-sm">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{title}</span>
                </div>
                <p className="text-xs font-medium leading-relaxed opacity-90">
                  {desc}
                </p>
              </div>

              <div className="pt-2 text-[10px] font-bold opacity-75 flex items-center gap-1 border-t border-current/10 mt-2">
                <CheckCircle2 className="w-3 h-3" />
                <span>{statusText}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ImportantAlertsSection;

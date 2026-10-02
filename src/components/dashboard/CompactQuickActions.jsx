import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, CloudRain, Bot, Camera, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const CompactQuickActions = () => {
  const { language } = useLanguage();

  const actions = [
    {
      id: 'plan',
      labelGu: '🌱 પાક આયોજન',
      labelHi: '🌱 फसल योजना',
      labelEn: '🌱 Crop Planner',
      descGu: 'તમારા ખેતર માટે શ્રેષ્ઠ પાક સીઝન આયોજન',
      descHi: 'आपके खेत के लिए सर्वोत्तम फसल योजना',
      descEn: 'Optimal crop recommendations',
      path: '/crops',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950',
      iconColor: 'text-emerald-700 bg-emerald-100',
      icon: Sprout
    },
    {
      id: 'weather',
      labelGu: '🌦️ હવામાન',
      labelHi: '🌦️ मौसम पूर्वानुमान',
      labelEn: '🌦️ Weather Forecast',
      descGu: 'સ્થાનિક વરસાદ અને તાપમાન આગાહી',
      descHi: 'स्थानीय वर्षा और तापमान पूर्वानुमान',
      descEn: 'Live rain & temp forecast',
      path: '/weather',
      bgColor: 'bg-sky-50 hover:bg-sky-100/80 border-sky-200 text-sky-950',
      iconColor: 'text-sky-700 bg-sky-100',
      icon: CloudRain
    },
    {
      id: 'assistant',
      labelGu: '🤖 કિસાનગાર્ડ AI',
      labelHi: '🤖 किसानगार्ड AI',
      labelEn: '🤖 KisanGuard AI',
      descGu: 'અવાજ અને લખાણ દ્વારા ખેતી પ્રશ્નોના જવાબો',
      descHi: 'आवाज और पाठ द्वारा कृषि प्रश्नों के उत्तर',
      descEn: 'Voice & text agri assistant',
      path: '/assistant',
      bgColor: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-950',
      iconColor: 'text-amber-700 bg-amber-100',
      icon: Bot
    },
    {
      id: 'crop-health',
      labelGu: '📷 પાક તપાસ',
      labelHi: '📷 फसल जांच',
      labelEn: '📷 Leaf Diagnostics',
      descGu: 'પાંદડાનો ફોટો પાડી રોગ નિદાન કરો',
      descHi: 'पत्ती की तस्वीर से रोग निदान करें',
      descEn: 'Scan leaf photos for pest advice',
      path: '/crop-health',
      bgColor: 'bg-teal-50 hover:bg-teal-100/80 border-teal-200 text-teal-950',
      iconColor: 'text-teal-700 bg-teal-100',
      icon: Camera
    }
  ];

  return (
    <section className="space-y-3 font-sans text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black font-serif text-deep-forest">
          {language === 'gu' ? '⚡ ઝડપી કામગીરી' : language === 'hi' ? '⚡ त्वरित कार्य' : '⚡ Quick Actions'}
        </h2>
        <span className="text-xs font-semibold text-earth-brown">
          {language === 'gu' ? 'મુખ્ય ૪ વિકલ્પો' : language === 'hi' ? 'मुख्य ४ विकल्प' : '4 Essential Tools'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map((item) => {
          const Icon = item.icon;
          const label = language === 'gu' ? item.labelGu : language === 'hi' ? item.labelHi : item.labelEn;
          const desc = language === 'gu' ? item.descGu : language === 'hi' ? item.descHi : item.descEn;

          return (
            <Link key={item.id} to={item.path} className="group">
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border ${item.bgColor} shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-full min-h-[110px]`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${item.iconColor} shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-black group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm font-serif text-deep-forest group-hover:text-forest-green">
                    {label}
                  </h3>
                </div>

                <p className="text-[11px] text-earth-brown font-medium line-clamp-1 opacity-80 pt-1 border-t border-current/10">
                  {desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CompactQuickActions;

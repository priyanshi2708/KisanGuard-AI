import React from 'react';
import { Link } from 'react-router-dom';
import { History, Bot, Sparkles, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const RecentActivitySection = () => {
  const { language } = useLanguage();

  const recentItems = [
    {
      id: '1',
      titleGu: 'કપાસ પાકમાં સફેદ માખી નિયંત્રણ સલાહ',
      titleHi: 'कपास फसल में सफेद मक्खी नियंत्रण सलाह',
      titleEn: 'Cotton Whitefly Advisory Retrieved',
      timeGu: 'આજે, સવારે ૯:૩૦',
      timeHi: 'आज, सुबह ९:३०',
      timeEn: 'Today, 9:30 AM',
      type: 'RAG',
      path: '/assistant'
    },
    {
      id: '2',
      titleGu: 'આણંદ APMC કપાસ ભાવ ચકાસ્યો (₹૧૫૮૦ / મણ)',
      titleHi: 'आनंद APMC कपास भाव देखा (₹१५८० / २०किग्रा)',
      titleEn: 'Checked Anand APMC Cotton Rate (₹1580/20kg)',
      timeGu: 'ગઈકાલે',
      timeHi: 'कल',
      timeEn: 'Yesterday',
      type: 'Mandi',
      path: '/crops'
    }
  ];

  return (
    <section className="space-y-3 font-sans text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-black font-serif text-deep-forest flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-700" />
          <span>
            {language === 'gu'
              ? '🕘 તાજેતરની પ્રવૃત્તિ'
              : language === 'hi'
              ? '🕘 हालिया गतिविधि'
              : '🕘 Recent Activity'}
          </span>
        </h2>
        <Link to="/assistant" className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1">
          <span>{language === 'gu' ? 'ઇતિહાસ જુઓ' : language === 'hi' ? 'इतिहास देखें' : 'View History'}</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-forest-green/10 divide-y divide-gray-100">
        {recentItems.map((item) => {
          const title = language === 'gu' ? item.titleGu : language === 'hi' ? item.titleHi : item.titleEn;
          const time = language === 'gu' ? item.timeGu : language === 'hi' ? item.timeHi : item.timeEn;

          return (
            <Link key={item.id} to={item.path} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-deep-forest group-hover:text-forest-green transition-colors">
                    {title}
                  </div>
                  <div className="text-[10px] text-earth-brown font-medium">
                    {time}
                  </div>
                </div>
              </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 group-hover:bg-emerald-100 group-hover:text-emerald-900 transition-colors">
              {item.type}
            </span>
          </Link>
          );
        })}
      </div>
    </section>
  );
};

export default RecentActivitySection;

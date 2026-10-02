import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sprout, CloudRain, Flame, BookOpen, Bot, Camera } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const QuickActionsGrid = ({ onOpenAddExpense }) => {
  const { t } = useLanguage();

  const actions = [
    {
      id: 'plan',
      label: `🌱 ${t('quickActions.planCrop')}`,
      desc: t('quickActions.planCropSub'),
      path: '/crops',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: Sprout
    },
    {
      id: 'weather',
      label: `🌦️ ${t('quickActions.checkWeather')}`,
      desc: t('quickActions.checkWeatherSub'),
      path: '/weather',
      color: 'bg-sky-50 border-sky-200 text-sky-800',
      icon: CloudRain
    },
    {
      id: 'fire',
      label: `🛰️ Satellite Fire Radar`,
      desc: `Monitor NASA MODIS thermal activity near your village`,
      path: '/fire-risk',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: Flame
    },
    {
      id: 'expense',
      label: `💰 Farm Khata & Book`,
      desc: `Track crop income, expenses and annual profit summary`,
      path: '/farm-book',
      color: 'bg-orange-50 border-orange-200 text-orange-900',
      icon: BookOpen
    },
    {
      id: 'assistant',
      label: `🤖 ${t('quickActions.askAssistant')}`,
      desc: t('quickActions.askAssistantSub'),
      path: '/assistant',
      color: 'bg-green-50 border-green-200 text-green-800',
      icon: Bot
    },
    {
      id: 'crop-health',
      label: `📷 Photo Diagnostic`,
      desc: `Scan leaf photos to detect pest infection or yellowing`,
      path: '/crop-health',
      color: 'bg-teal-50 border-teal-200 text-teal-900',
      icon: Camera
    }
  ];

  return (
    <section className="space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold font-serif text-deep-forest">
          {t('quickActions.heading')}
        </h2>
        <span className="text-xs font-semibold text-earth-brown">
          Select a tool to explore
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} to={item.path}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className={`p-5 rounded-3xl border ${item.color} shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 h-full flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="p-3 rounded-2xl bg-white w-fit text-forest-green shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base font-serif text-deep-forest">
                    {item.label}
                  </h3>
                  <p className="text-xs text-earth-brown font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="text-[11px] font-bold text-forest-green flex items-center gap-1 pt-2 border-t border-forest-green/10">
                  <span>Open Page →</span>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default QuickActionsGrid;

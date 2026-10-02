import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sprout, BookOpen, Bot, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const DashboardMobileNav = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const mobileItems = [
    { path: '/dashboard', label: t('sidebar.overview') || 'Home', icon: Home },
    { path: '/crops', label: t('sidebar.cropPlanner') || 'Crops', icon: Sprout },
    { path: '/farm-book', label: t('sidebar.farmBook') || 'Farm Book', icon: BookOpen },
    { path: '/assistant', label: t('sidebar.aiAssistant') || 'AI', icon: Bot },
    { path: '/profile', label: t('sidebar.myProfile') || 'Profile', icon: User },
  ];

  return (
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-50 bg-warm-cream/95 backdrop-blur-xl border-t border-forest-green/20 px-2 py-1.5 flex items-center justify-around md:hidden shadow-2xl safe-area-inset-bottom">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all active:scale-95 ${
              isActive ? 'text-forest-green font-bold scale-105' : 'text-earth-brown/80 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-leaf-green' : 'text-forest-green/70'}`} />
            <span className="text-[10px] tracking-tight truncate max-w-[64px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default DashboardMobileNav;

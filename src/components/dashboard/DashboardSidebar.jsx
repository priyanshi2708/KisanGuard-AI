import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, Home, Sprout, CloudRain, Flame, BookOpen, Bot, Camera, User, Settings, LogOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const DashboardSidebar = () => {
  const { language, t } = useLanguage();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: t('sidebar.overview'), icon: Home },
    { path: '/crops', label: t('sidebar.cropPlanner'), icon: Sprout },
    { path: '/weather', label: t('sidebar.weather'), icon: CloudRain },
    { path: '/fire-risk', label: t('sidebar.fireRisk'), icon: Flame },
    { path: '/farm-book', label: t('sidebar.farmBook'), icon: BookOpen },
    { path: '/assistant', label: t('sidebar.aiAssistant'), icon: Bot },
    { path: '/crop-health', label: t('sidebar.cropHealth'), icon: Camera },
    { path: '/profile', label: t('sidebar.myProfile'), icon: User },
  ];

  const handleLogout = async () => {
    // logout() calls backend /api/auth/logout + clears auth state
    await logout();
    // Always redirect to /login — never to landing page
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-warm-cream/95 backdrop-blur-xl border-r border-forest-green/15 flex flex-col justify-between p-5 min-h-screen text-deep-forest hidden lg:flex font-sans">

      {/* Top Brand Logo */}
      <div className="space-y-6">
        <Link to="/" className="flex items-center gap-2.5 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-leaf-green to-forest-green flex items-center justify-center text-white shadow-lg">
            <Leaf className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl font-serif text-deep-forest tracking-tight">
              KisanGuard <span className="text-leaf-green">AI</span>
            </span>
            <span className="text-[10px] text-forest-green uppercase font-bold tracking-wider">
              {t('nav.brand')}
            </span>
          </div>
        </Link>

        {/* Sidebar Nav Links */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-forest-green to-leaf-green text-white shadow-md font-bold'
                    : 'text-deep-forest hover:bg-light-leaf/40 hover:text-forest-green'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-forest-green'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-3 pt-4 border-t border-forest-green/10">

        {/* Settings */}
        <Link
          to="/settings"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-earth-brown hover:bg-light-leaf/40 transition-colors"
        >
          <Settings className="w-4 h-4 text-forest-green" />
          <span>{t('sidebar.settings')}</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>{t('sidebar.logout')}</span>
        </button>

      </div>

    </aside>
  );
};

export default DashboardSidebar;

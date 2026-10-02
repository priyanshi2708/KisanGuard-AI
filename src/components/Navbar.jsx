import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Globe, Menu, X, Leaf, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/onboarding';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || isAuthPage
          ? 'bg-warm-cream/90 backdrop-blur-md shadow-md py-3 border-b border-forest-green/10'
          : 'bg-gradient-to-b from-soil-dark/60 via-soil-dark/20 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-leaf-green to-forest-green flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className={`font-bold text-xl tracking-tight font-serif ${scrolled || isAuthPage ? 'text-deep-forest' : 'text-white'}`}>
              {t('nav.brand')}
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#home"
              className={`transition-colors duration-200 ${
                scrolled ? 'text-deep-forest hover:text-forest-green' : 'text-white/90 hover:text-white'
              }`}
            >
              {t('nav.home')}
            </a>
            <a
              href="#how-it-works"
              className={`transition-colors duration-200 ${
                scrolled ? 'text-deep-forest hover:text-forest-green' : 'text-white/90 hover:text-white'
              }`}
            >
              {t('nav.howItWorks')}
            </a>
            <a
              href="#made-for-farmers"
              className={`transition-colors duration-200 ${
                scrolled ? 'text-deep-forest hover:text-forest-green' : 'text-white/90 hover:text-white'
              }`}
            >
              {t('nav.forFarmers')}
            </a>
            <a
              href="#ai-assistant"
              className={`transition-colors duration-200 ${
                scrolled ? 'text-deep-forest hover:text-forest-green' : 'text-white/90 hover:text-white'
              }`}
            >
              {t('nav.aiAssistant')}
            </a>
            <a
              href="#farm-book"
              className={`transition-colors duration-200 ${
                scrolled ? 'text-deep-forest hover:text-forest-green' : 'text-white/90 hover:text-white'
              }`}
            >
              {t('nav.about')}
            </a>
          </nav>
        )}

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-4">
          {/* Login Button */}
          <Link
            to="/login"
            className={`text-sm font-semibold px-4 py-2 rounded-full transition-colors duration-200 ${
              scrolled || isAuthPage
                ? 'text-deep-forest hover:text-forest-green'
                : 'text-white hover:text-light-leaf'
            }`}
          >
            {t('nav.login')}
          </Link>

          {/* Get Started Button */}
          <Link
            to="/signup"
            className="flex items-center gap-1.5 bg-gradient-to-r from-forest-green to-leaf-green text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-lg hover:shadow-glow-green hover:scale-105 transition-all duration-300"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('nav.getStarted')}</span>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg ${scrolled || isAuthPage ? 'text-deep-forest' : 'text-white'}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-warm-cream/95 backdrop-blur-xl border-b border-forest-green/20 px-6 py-6 space-y-4 shadow-2xl animate-fadeIn">
          {!isAuthPage && (
            <div className="flex flex-col space-y-3 font-medium text-deep-forest border-b border-forest-green/10 pb-4">
              <a href="#home" onClick={() => setMobileMenuOpen(false)} className="hover:text-forest-green py-1">
                {t('nav.home')}
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-forest-green py-1">
                {t('nav.howItWorks')}
              </a>
              <a href="#made-for-farmers" onClick={() => setMobileMenuOpen(false)} className="hover:text-forest-green py-1">
                {t('nav.forFarmers')}
              </a>
              <a href="#ai-assistant" onClick={() => setMobileMenuOpen(false)} className="hover:text-forest-green py-1">
                {t('nav.aiAssistant')}
              </a>
              <a href="#farm-book" onClick={() => setMobileMenuOpen(false)} className="hover:text-forest-green py-1">
                {t('nav.about')}
              </a>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl border border-forest-green/20 text-deep-forest font-semibold"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-xl bg-forest-green text-white font-bold shadow-md"
            >
              {t('nav.getStarted')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

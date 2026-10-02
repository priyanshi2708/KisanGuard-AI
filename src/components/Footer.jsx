import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Heart, ShieldCheck, Mail, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <footer className="bg-deep-forest text-warm-cream pt-16 pb-12 relative overflow-hidden border-t border-forest-green/30 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-forest-green/20">
          
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-leaf-green flex items-center justify-center text-white shadow">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-bold text-2xl font-serif text-white tracking-tight">
                {t('nav.brand')}
              </span>
            </div>
            <p className="text-sm text-light-leaf/80 leading-relaxed font-sans">
              "{t('footer.tagline')}"
            </p>
            <div className="flex items-center gap-2 text-xs text-golden-wheat font-medium bg-forest-green/30 px-3 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4 text-leaf-green" />
              <span>{t('hero.trustLine')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-leaf-green font-sans">
              {t('footer.navTitle')}
            </h4>
            <ul className="space-y-2 text-sm text-light-leaf/80 font-medium">
              <li><a href="#home" className="hover:text-white transition-colors">{t('nav.home')}</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">{t('nav.howItWorks')}</a></li>
              <li><a href="#made-for-farmers" className="hover:text-white transition-colors">{t('nav.forFarmers')}</a></li>
              <li><a href="#ai-assistant" className="hover:text-white transition-colors">{t('nav.aiAssistant')}</a></li>
              <li><a href="#farm-book" className="hover:text-white transition-colors">{t('nav.about')}</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-leaf-green font-sans">
              Contact & Support
            </h4>
            <div className="pt-1 text-xs text-light-leaf/70 space-y-1.5">
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-leaf-green" /> support@kisanguard.ai</p>
              <p className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-leaf-green" /> WhatsApp Advisory Available</p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-leaf-green font-sans">
              {t('footer.startToday')}
            </h4>
            <p className="text-xs text-light-leaf/80">
              {t('footer.startTodaySub')}
            </p>
            <Link
              to="/signup"
              className="inline-block w-full text-center bg-gradient-to-r from-leaf-green to-forest-green text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg hover:brightness-110 transition-all"
            >
              {t('hero.btnStart')}
            </Link>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-light-leaf/60 gap-4">
          <p>{t('footer.rights')}</p>
          <div className="flex items-center gap-1 text-light-leaf/70">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>for Indian Farmers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FarmBookSection = () => {
  const { t } = useLanguage();

  const ledgerItems = [
    { label: t('farmBook.seeds'), amount: "₹4,500" },
    { label: t('farmBook.fertilizer'), amount: "₹7,200" },
    { label: t('farmBook.water'), amount: "₹2,000" },
    { label: t('farmBook.medicine'), amount: "₹3,500" },
    { label: t('farmBook.labour'), amount: "₹8,000" },
  ];

  return (
    <section id="farm-book" className="relative py-24 bg-warm-cream text-deep-forest overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-light-leaf/60 border border-leaf-green/30 text-forest-green text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-leaf-green" />
              <span>{t('farmBook.badge')}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-serif leading-tight text-deep-forest">
              {t('farmBook.heading')}
            </h2>

            <p className="text-base sm:text-lg text-earth-brown leading-relaxed font-sans font-medium">
              {t('farmBook.subtext')}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-forest-green font-semibold">
                <CheckCircle className="w-5 h-5 text-leaf-green flex-shrink-0" />
                <span>{t('farmBook.point1')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-forest-green font-semibold">
                <CheckCircle className="w-5 h-5 text-leaf-green flex-shrink-0" />
                <span>{t('farmBook.point2')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-forest-green font-semibold">
                <CheckCircle className="w-5 h-5 text-leaf-green flex-shrink-0" />
                <span>{t('farmBook.point3')}</span>
              </div>
            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-forest-green/20 space-y-6 relative overflow-hidden">
              
              <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest-green text-white flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg font-serif text-deep-forest">{t('farmBook.yearLabel')}</h3>
                    <p className="text-xs text-earth-brown font-medium">Anand District • Cotton & Groundnut</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-forest-green bg-light-leaf/60 px-3 py-1 rounded-full">
                  KisanGuard Ledger
                </span>
              </div>

              <div className="space-y-3 font-mono text-sm">
                {ledgerItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-dashed border-forest-green/10 pb-2">
                    <span className="text-earth-brown font-sans font-medium">{item.label}</span>
                    <span className="text-forest-green/40 px-2 font-sans text-xs hidden sm:inline">..............................</span>
                    <span className="font-bold text-deep-forest">{item.amount}</span>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2 text-base font-sans font-bold text-deep-forest border-t border-forest-green/20">
                  <span>{t('farmBook.revenue')}</span>
                  <span className="text-forest-green">₹55,000</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-forest-green to-leaf-green text-white flex items-center justify-between shadow-lg">
                <div>
                  <div className="text-xs uppercase font-bold text-light-leaf tracking-wider">{t('farmBook.profit')}</div>
                  <div className="text-2xl font-extrabold font-serif">₹29,800</div>
                </div>
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold">
                  <TrendingUp className="w-4 h-4 text-golden-wheat" />
                  <span>+54% Margin</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default FarmBookSection;

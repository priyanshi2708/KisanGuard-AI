import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Camera, Send, Bot, User, Sparkles, CheckCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AiAssistantSection = () => {
  const { t } = useLanguage();

  return (
    <section id="ai-assistant" className="relative py-24 bg-deep-forest text-warm-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-green/40 border border-leaf-green/40 text-light-leaf text-xs font-bold uppercase tracking-wider"
          >
            <Bot className="w-4 h-4 text-golden-wheat" />
            <span>{t('aiChat.badge')}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-bold font-serif text-warm-cream"
          >
            {t('aiChat.heading')}
          </motion.h2>

          <p className="text-light-leaf/80 text-base sm:text-lg">
            {t('aiChat.subtext')}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto rounded-3xl bg-warm-cream text-deep-forest p-4 sm:p-6 shadow-2xl border-4 border-forest-green/30 relative"
        >
          <div className="flex items-center justify-between border-b border-forest-green/10 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-leaf-green to-forest-green flex items-center justify-center text-white shadow">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base font-serif text-deep-forest">{t('aiChat.chatTitle')}</h3>
                <p className="text-xs text-forest-green flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-leaf-green animate-pulse" /> {t('aiChat.onlineStatus')}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 py-2 min-h-[220px]">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex justify-end gap-2"
            >
              <div className="max-w-[85%] bg-forest-green text-white p-4 rounded-2xl rounded-tr-none shadow-md space-y-1">
                <p className="text-sm font-medium font-serif leading-relaxed">
                  "{t('aiChat.farmerQuestion')}"
                </p>
                <div className="flex justify-end items-center gap-1 text-[10px] text-light-leaf/70 pt-1">
                  <span>10:42 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-leaf-green" />
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-golden-wheat/30 text-earth-brown flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex justify-start gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-leaf-green text-white flex items-center justify-center flex-shrink-0 shadow">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-[85%] bg-light-leaf/40 border border-forest-green/20 text-deep-forest p-4 rounded-2xl rounded-tl-none shadow-sm space-y-1">
                <p className="text-sm font-semibold font-serif leading-relaxed text-deep-forest">
                  "{t('aiChat.aiReply')}"
                </p>
                <div className="text-[10px] text-forest-green font-bold pt-1">
                  KisanGuard AI Assistant
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-4 pt-4 border-t border-forest-green/10 flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-forest-green/10 text-forest-green hover:bg-forest-green hover:text-white transition-colors text-xs font-bold">
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.speak')}</span>
            </button>

            <button className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-forest-green/10 text-forest-green hover:bg-forest-green hover:text-white transition-colors text-xs font-bold">
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.uploadPhoto')}</span>
            </button>

            <div className="flex-1 relative">
              <input
                type="text"
                readOnly
                placeholder={t('common.typeMessage')}
                className="w-full bg-white border border-forest-green/20 rounded-xl px-3.5 py-2.5 text-xs text-deep-forest focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-leaf-green text-white shadow hover:scale-105 transition-transform">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default AiAssistantSection;

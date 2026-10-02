import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, UserCheck, Briefcase, GraduationCap, X, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const rolesList = [
  {
    id: 'farmer',
    icon: '🌾',
    titleKey: 'auth.roleFarmerTitle',
    title: 'Farmer / Cultivator',
    descKey: 'auth.roleFarmerDesc',
    desc: 'Crop guidance, weather forecasts & farm ledger',
    color: 'from-emerald-600 to-forest-green'
  },
  {
    id: 'expert',
    icon: '🧪',
    titleKey: 'auth.roleExpertTitle',
    title: 'Agri Expert / Advisor',
    descKey: 'auth.roleExpertDesc',
    desc: 'Consulting, soil analysis & advisory tools',
    color: 'from-sky-600 to-sky-800'
  },
  {
    id: 'business',
    icon: '🛒',
    titleKey: 'auth.roleBusinessTitle',
    title: 'Agri-Trader / Business',
    descKey: 'auth.roleBusinessDesc',
    desc: 'Seed, fertilizer & market price monitoring',
    color: 'from-amber-600 to-amber-800'
  },
  {
    id: 'student',
    icon: '🎓',
    titleKey: 'auth.roleStudentTitle',
    title: 'Student / Researcher',
    descKey: 'auth.roleStudentDesc',
    desc: 'Climate research, data models & study insights',
    color: 'from-purple-600 to-purple-800'
  }
];

export const RoleSelectionModal = ({ isOpen, onClose, onSelectRoleAndContinue }) => {
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState('farmer');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onSelectRoleAndContinue(selectedRole);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-forest/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-forest-green/10 space-y-6 relative overflow-hidden font-sans"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-forest-green/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-light-leaf text-forest-green">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-deep-forest">
                  {t('auth.selectRoleTitle')}
                </h3>
                <p className="text-xs text-earth-brown font-medium">
                  {t('auth.selectRoleSub')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-warm-cream text-earth-brown transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {rolesList.map((r) => {
              const isSelected = selectedRole === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2 relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-forest-green bg-gradient-to-br from-light-leaf/40 to-warm-cream shadow-md ring-2 ring-forest-green/20'
                      : 'border-forest-green/10 bg-warm-cream/30 hover:border-forest-green/30 hover:bg-warm-cream/60'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-forest-green text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="text-2xl">{r.icon}</div>
                    <div className="text-sm font-extrabold font-serif text-deep-forest">
                      {t(r.titleKey) || r.title}
                    </div>
                    <p className="text-[11px] text-earth-brown font-medium leading-relaxed">
                      {t(r.descKey) || r.desc}
                    </p>
                  </div>

                  <div className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-forest-green font-extrabold' : 'text-earth-brown/70'}`}>
                    {isSelected ? '✓ Selected' : 'Tap to select'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Google Auth Disclaimer & Confirm Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-forest-green to-leaf-green text-white font-bold text-sm shadow-glow-green hover:opacity-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{t('auth.continueWithGoogle')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-earth-brown font-medium">
              Role selection ensures your dashboard tools are tailored to your needs.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RoleSelectionModal;

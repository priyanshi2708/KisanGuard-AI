import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, User, Phone, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import heroFarmerImg from '../assets/hero_farmer.png';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { registerAccount } from '../services/authService';

export const SignupPage = () => {
  const { language, setLanguage, t } = useLanguage();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    language: language || 'en',
    role: 'farmer'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Field Validation
    if (!form.language) {
      setErrorMsg(t('auth.valSelectLanguage') || 'Please select your preferred language.');
      return;
    }
    if (!form.name.trim()) {
      setErrorMsg(t('auth.valEmptyName') || 'Please enter your full name.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setErrorMsg(t('auth.valInvalidEmail') || 'Please enter a valid email address.');
      return;
    }
    const cleanPhone = form.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg(t('auth.valInvalidPhone') || 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg(t('auth.valPasswordShort') || 'Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg(t('auth.valPasswordMismatch') || 'Passwords do not match. Please check again.');
      return;
    }

    try {
      setLoading(true);
      // Ensure global language context is updated
      setLanguage(form.language);

      // Register account with duplicate check
      await registerAccount({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        password: form.password,
        language: form.language,
        role: form.role
      });

      // Sync auth context immediately
      refreshUser();

      // Navigate to onboarding for new registered user
      navigate('/onboarding');
    } catch (err) {
      if (err.message === 'ALREADY_REGISTERED' || err.message === 'EMAIL_ALREADY_EXISTS') {
        setErrorMsg(t('auth.valAlreadyRegistered') || 'An account with this email or phone already exists.');
      } else if (err.message === 'WEAK_PASSWORD') {
        setErrorMsg('Password must be at least 6 characters.');
      } else if (err.message === 'INVALID_EMAIL') {
        setErrorMsg('Invalid email format.');
      } else {
        setErrorMsg(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-warm-cream flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-forest-green/10 min-h-[660px]">
        
        {/* Left Column: Asymmetric Farmer Image */}
        <div className="lg:col-span-6 relative overflow-hidden bg-soil-dark text-white hidden lg:flex flex-col justify-between p-8">
          <img
            src={heroFarmerImg}
            alt="Indian farmer field"
            className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-forest via-deep-forest/40 to-transparent" />

          {/* Top Logo */}
          <Link to="/" className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-leaf-green flex items-center justify-center text-white shadow">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl font-serif text-white">
              {t('nav.brand')}
            </span>
          </Link>

          {/* Bottom Callout */}
          <div className="relative z-10 space-y-3 max-w-sm">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-leaf/20 backdrop-blur-md text-light-leaf text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-leaf-green" />
              <span>{t('hero.trustLine')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif leading-snug text-warm-cream">
              "{t('hero.subtext')}"
            </h2>
          </div>
        </div>

        {/* Right Column: Clean Form Panel */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between bg-warm-cream/50 overflow-y-auto">
          
          {/* Top Brand Link for Mobile */}
          <div className="flex items-center justify-between pb-2">
            <Link to="/" className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-leaf-green flex items-center justify-center text-white">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg font-serif text-deep-forest">{t('nav.brand')}</span>
            </Link>
          </div>

          {/* Form Area */}
          <div className="space-y-4 max-w-md mx-auto w-full py-2">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-deep-forest">
                {t('auth.signupTitle')}
              </h1>
              <p className="text-xs sm:text-sm text-earth-brown font-medium">
                {t('auth.signupSub')}
              </p>
            </div>



            {/* Validation Error Banner */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* Mandatory Preferred Language Selection */}
              <div className="space-y-1 bg-white/70 p-3 rounded-2xl border border-forest-green/15">
                <label className="text-[11px] font-bold text-deep-forest uppercase tracking-wider flex items-center justify-between">
                  <span>🌐 {t('auth.selectLanguageLabel') || 'Select your preferred language'}</span>
                  <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'en', label: 'English' },
                    { id: 'gu', label: 'ગુજરાતી' },
                    { id: 'hi', label: 'हिन्दी' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, language: item.id });
                        setLanguage(item.id);
                      }}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all text-center ${
                        form.language === item.id
                          ? 'bg-forest-green text-white border-forest-green shadow-md scale-[1.02]'
                          : 'bg-white text-deep-forest border-forest-green/20 hover:border-forest-green/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-deep-forest uppercase tracking-wider">
                  👤 {t('auth.fullName')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-forest-green absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t('auth.fullNamePlaceholder')}
                    className="w-full bg-white border border-forest-green/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-deep-forest focus:outline-none focus:border-leaf-green shadow-sm"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-deep-forest uppercase tracking-wider">
                  📱 {t('auth.phone')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-forest-green absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder={t('auth.phonePlaceholder')}
                    className="w-full bg-white border border-forest-green/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-deep-forest focus:outline-none focus:border-leaf-green shadow-sm"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-deep-forest uppercase tracking-wider">
                  📧 {t('auth.email')} <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-forest-green absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full bg-white border border-forest-green/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-deep-forest focus:outline-none focus:border-leaf-green shadow-sm"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-deep-forest uppercase tracking-wider">
                    🔒 {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-forest-green absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder={t('auth.passwordPlaceholder')}
                      className="w-full bg-white border border-forest-green/20 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-deep-forest focus:outline-none focus:border-leaf-green"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-forest-green hover:text-deep-forest"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-deep-forest uppercase tracking-wider">
                    🔒 {t('auth.confirmPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-forest-green absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder={t('auth.passwordPlaceholder')}
                      className="w-full bg-white border border-forest-green/20 rounded-2xl pl-9 pr-8 py-2.5 text-xs text-deep-forest focus:outline-none focus:border-leaf-green"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-forest-green hover:text-deep-forest"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-forest-green to-leaf-green text-white font-bold text-sm py-3.5 rounded-2xl shadow-lg hover:shadow-glow-green hover:scale-[1.01] transition-all flex items-center justify-center gap-2 pt-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'gu' ? 'ખાતું બની રહ્યું છે...' : language === 'hi' ? 'खाता बन रहा है...' : 'Creating account...'}</span>
                  </div>
                ) : (
                  <>
                    <span>{t('auth.createAccountBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Navigation Link */}
          <div className="pt-3 border-t border-forest-green/10 text-center text-xs text-earth-brown font-medium">
            <span>{t('auth.hasAccount')} </span>
            <Link to="/login" className="text-forest-green font-bold hover:underline">
              {t('auth.loginBtn')}
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SignupPage;

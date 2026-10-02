import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Leaf, Phone, Lock, ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import heroFarmerImg from '../assets/hero_farmer.png';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { loginAccount } from '../services/authService';
import { getFarmerProfile } from '../services/farmerProfileService';

export const LoginPage = () => {
  const { language, setLanguage, t } = useLanguage();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.identifier.trim()) {
      setErrorMsg(t('auth.valInvalidPhone') || 'Please enter your phone number or email.');
      return;
    }
    if (!form.password) {
      setErrorMsg(t('auth.valPasswordShort') || 'Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await loginAccount({
        identifier: form.identifier,
        password: form.password
      });

      if (loggedUser && loggedUser.language) {
        setLanguage(loggedUser.language);
      }

      // Sync auth context
      refreshUser();

      // Route based on onboarding completion
      const existingProfile = getFarmerProfile(loggedUser.id);
      if (existingProfile && existingProfile.onboardingCompleted) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      if (err.message === 'INVALID_CREDENTIALS' || err.message === 'INVALID_PASSWORD' || err.message === 'USER_NOT_FOUND') {
        setErrorMsg(t('auth.valLoginFailed') || 'Invalid email or password. Please try again.');
      } else {
        setErrorMsg(err.message || t('auth.valLoginFailed') || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-warm-cream flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-forest-green/10 min-h-[620px]">

        {/* Left Column: Asymmetric Farmer Image */}
        <div className="lg:col-span-6 relative overflow-hidden bg-soil-dark text-white hidden lg:flex flex-col justify-between p-8">
          <img
            src={heroFarmerImg}
            alt="Indian farmer field"
            className="absolute inset-0 w-full h-full object-cover opacity-80 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-forest via-deep-forest/40 to-transparent" />

          <Link to="/" className="relative z-10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-leaf-green flex items-center justify-center text-white shadow">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl font-serif text-white">
              {t('nav.brand')}
            </span>
          </Link>

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

          {/* Form Content */}
          <div className="space-y-5 max-w-md mx-auto w-full py-2">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold font-serif text-deep-forest">
                {t('auth.loginTitle')}
              </h1>
              <p className="text-sm text-earth-brown font-medium">
                {t('auth.loginSub')}
              </p>
            </div>



            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-xs font-semibold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-deep-forest uppercase tracking-wider">
                  📱 {t('auth.phone')} / 📧 {t('auth.email')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-forest-green absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-identifier"
                    type="text"
                    required
                    autoComplete="username"
                    value={form.identifier}
                    onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                    placeholder={t('auth.phonePlaceholder')}
                    className="w-full bg-white border border-forest-green/20 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-deep-forest focus:outline-none focus:border-leaf-green shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-deep-forest uppercase tracking-wider">
                    🔒 {t('auth.password')}
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-forest-green absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full bg-white border border-forest-green/20 rounded-2xl pl-10 pr-10 py-3.5 text-sm text-deep-forest focus:outline-none focus:border-leaf-green shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-green hover:text-deep-forest"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-forest-green to-leaf-green text-white font-bold text-base py-3.5 rounded-2xl shadow-lg hover:shadow-glow-green hover:scale-[1.01] transition-all flex items-center justify-center gap-2 pt-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{language === 'gu' ? 'લોગિન થઈ રહ્યું છે...' : language === 'hi' ? 'लॉगिन हो रहा है...' : 'Logging in...'}</span>
                  </div>
                ) : (
                  <>
                    <span>{t('auth.loginBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Switch to Signup */}
          <div className="pt-4 border-t border-forest-green/10 text-center text-xs text-earth-brown font-medium">
            <span>{t('auth.noAccount')} </span>
            <Link to="/signup" className="text-forest-green font-bold hover:underline">
              {t('auth.createAccountBtn')}
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default LoginPage;

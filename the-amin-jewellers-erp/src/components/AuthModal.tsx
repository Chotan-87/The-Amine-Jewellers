import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ShieldCheck, ArrowRight, KeyRound, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const { t } = useLanguage();
  const { loginWithEmail, registerWithEmail, loginWithGoogle, loginAsGuest, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Owner / মালিক');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        if (!name.trim()) {
          setError(t('অনুগ্রহ করে আপনার নাম লিখুন', 'Please enter your name'));
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, name, role);
        setMessage(t('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!', 'Account created successfully!'));
        setTimeout(() => onClose(), 1000);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setMessage(t('আপনার জিমেইল/ইমেইলে পাসওয়ার্ড রিকভারি লিংক পাঠানো হয়েছে।', 'Password reset link sent to your email.'));
      }
    } catch (err: any) {
      console.error('Auth submit error:', err);
      const code = err?.code || '';
      const msg = err?.message || String(err);
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password' || msg.includes('invalid-credential') || msg.includes('wrong-password')) {
        setError(t('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে', 'Invalid email or password'));
      } else if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use')) {
        setError(t('এই ইমেইলটি দিয়ে ইতোমধ্যে অ্যাকাউন্ট খোলা আছে', 'Email is already registered'));
      } else if (code === 'auth/weak-password' || msg.includes('weak-password')) {
        setError(t('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে', 'Password should be at least 6 characters'));
      } else if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
        setError(t('নেটওয়ার্ক সংযোগ বা ফায়ারওয়াল ব্লক হয়েছে (Network Request Failed)। ইন্টারনেট কানেকশন চেক করুন বা অফলাইন ডেমো মোডে লগইন করুন।', 'Network request failed. Please check internet connection or enter Demo Mode.'));
      } else {
        setError(err.message || t('কোনো সমস্যা হয়েছে, আবার চেষ্টা করুন', 'An error occurred, please try again'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      const msg = err?.message || String(err);
      if (msg.includes('popup-closed-by-user') || code === 'auth/popup-closed-by-user') {
        setError(t('গুগল সাইন-ইন উইন্ডো বন্ধ করা হয়েছে।', 'Google sign-in popup was closed.'));
      } else if (msg.includes('cancelled-popup-request') || code === 'auth/cancelled-popup-request') {
        // Silently handle
      } else if (msg.includes('network-request-failed') || code === 'auth/network-request-failed') {
        setError(t('নেটওয়ার্ক সংযোগ বিঘ্নিত হয়েছে (Network Request Failed)। ডেমো মোডে ব্যবহার করতে নিচে ক্লিক করুন।', 'Network error. Click below to continue in Demo Mode.'));
      } else if (msg.includes('popup-blocked') || code === 'auth/popup-blocked') {
        setError(t('ব্রাউজারে পপআপ ব্লক করা আছে। পপআপ এলাউ করুন অথবা ইমেইল দিয়ে চেষ্টা করুন।', 'Popup blocked by browser. Allow popups or use email login.'));
      } else {
        setError(t('গুগল লগইনে সমস্যা হয়েছে। ইমেইল ও পাসওয়ার্ড দিয়ে চেষ্টা করুন।', 'Failed to log in with Google. Please try email login.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden border border-amber-100"
      >
        {/* Top Header Decor */}
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-amber-200/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#c59b27] text-white flex items-center justify-center font-black text-sm shadow-md">
              A
            </div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              {t('দি আমিন জুয়েলার্স ERP', 'The Amin Jewellers ERP')}
            </span>
          </div>

          <h3 className="text-xl font-black text-white mt-2">
            {mode === 'login' && t('অ্যাকাউন্টে লগইন করুন', 'Login to Account')}
            {mode === 'register' && t('নতুন অ্যাকাউন্ট তৈরি করুন', 'Create New Account')}
            {mode === 'forgot' && t('পাসওয়ার্ড রিকভারি', 'Reset Password')}
          </h3>
          <p className="text-xs text-amber-200/80 mt-1 font-medium">
            {mode === 'login' && t('আপনার জিমেইল বা ইমেইল এবং পাসওয়ার্ড দিয়ে প্রবেশ করুন', 'Enter your email and password to log in')}
            {mode === 'register' && t('ক্লাউড সার্ভারে নিরাপদে ডেটা সংরক্ষণ করতে রেজিষ্ট্রেশন করুন', 'Register to safely sync data in Cloud Server 1')}
            {mode === 'forgot' && t('আপনার জিমেইল আইডি প্রদান করুন, আমরা রিসেট লিংক পাঠাবো', 'Provide your email ID to receive a reset link')}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {/* Quick Gmail / Google Sign In Button */}
          {mode !== 'forgot' && (
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {/* Official Google Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{t('জিমেইল (Gmail / Google) দিয়ে ১-ক্লিকে লগইন', '1-Click Login with Gmail / Google')}</span>
              </button>

              <div className="relative my-4 text-center">
                <hr className="border-gray-100" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t('অথবা ইমেইল ব্যবহার করুন', 'OR USE EMAIL')}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {t('আপনার নাম', 'Your Name')} *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('যেমন: মোঃ জহিরুল ইসলাম', 'e.g. Zahirul Islam')}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                {t('জিমেইল / ইমেইল অ্যাড্রেস', 'Gmail / Email Address')} *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-gray-600">
                    {t('পাসওয়ার্ড', 'Password')} *
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] text-amber-700 hover:underline font-bold"
                    >
                      {t('পাসওয়ার্ড ভুলে গেছেন?', 'Forgot Password?')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  {t('দোকানের পদবী / রোল', 'Shop Role')}
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all appearance-none"
                  >
                    <option value="Owner / মালিক">Owner / জুয়েলারি শপের মালিক</option>
                    <option value="Manager / ম্যানেজার">Manager / শপ ম্যানেজার</option>
                    <option value="Accountant / হিসাবরক্ষক">Accountant / ক্যাশিয়ার ও হিসাবরক্ষক</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#c59b27] to-[#a37d1a] hover:from-[#b0881f] hover:to-[#8a6813] text-white font-black py-3 rounded-2xl text-xs shadow-lg shadow-amber-200 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {mode === 'login' && t('প্রবেশ করুন (Login)', 'Log In')}
                    {mode === 'register' && t('রেজিস্ট্রেশন সম্পূর্ণ করুন', 'Complete Registration')}
                    {mode === 'forgot' && t('পাসওয়ার্ড রিসেট লিংক পাঠান', 'Send Reset Link')}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Modes Footer */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center text-xs text-gray-500 space-y-3">
            {mode === 'login' ? (
              <p>
                {t('নতুন অ্যাকাউন্ট তৈরি করতে চান?', "Don't have an account?")}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="font-extrabold text-amber-800 hover:underline"
                >
                  {t('রেজিস্টার বা অ্যাকাউন্ট খুলুন', 'Create Account')}
                </button>
              </p>
            ) : (
              <p>
                {t('ইতোমধ্যে অ্যাকাউন্ট আছে?', 'Already have an account?')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="font-extrabold text-amber-800 hover:underline"
                >
                  {t('লগইন করুন', 'Log In')}
                </button>
              </p>
            )}

            <div>
              <button
                type="button"
                onClick={() => {
                  loginAsGuest();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-600" />
                <span>{t('অফলাইন / ডেমো মোডে প্রবেশ করুন (Demo Access)', 'Continue in Offline / Demo Mode')}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

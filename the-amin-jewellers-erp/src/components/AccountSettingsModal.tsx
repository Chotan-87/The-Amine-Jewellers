import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, User, Mail, ShieldCheck, Store, LogOut, CheckCircle2, KeyRound, Sparkles, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { t } = useLanguage();
  const { user, userRole, shopName, logout, updateUserProfile, resetPassword } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [shop, setShop] = useState(shopName || 'দি আমিন জুয়েলার্স');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    try {
      await updateUserProfile(displayName, shop);
      setSuccessMsg(t('প্রোফাইল তথ্য সফলভাবে আপডেট হয়েছে!', 'Profile updated successfully!'));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      setSuccessMsg(t('পাসওয়ার্ড রিসেট লিংক আপনার জিমেইলে পাঠানো হয়েছে।', 'Password reset email sent.'));
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden border border-amber-100"
      >
        {/* Header Decor */}
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-amber-200/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#c59b27] to-[#e0b848] text-white flex items-center justify-center font-black text-xl shadow-lg border-2 border-white/20">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">
                {user?.displayName || 'ইউজার অ্যাকাউন্ট'}
              </h3>
              <p className="text-xs text-amber-200/80 font-medium">
                {user?.email || 'জি-মেইল সংযুক্ত নাই'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* User Details Card */}
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-amber-700" />
                {t('অ্যাকাউন্ট পদবী / রোল:', 'Account Role:')}
              </span>
              <span className="font-extrabold text-amber-950 bg-amber-200/60 px-2.5 py-0.5 rounded-full text-[11px]">
                {userRole}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium flex items-center gap-1.5">
                <Server size={14} className="text-emerald-600" />
                {t('ক্লাউড সার্ভার স্ট্যাটাস:', 'Cloud Server Status:')}
              </span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t('ফায়ারবেস সার্ভার ১ অনলাইন', 'Firebase Server 1 Online')}
              </span>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                {t('ব্যবহারকারীর নাম', 'User Name')}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                {t('প্রতিষ্ঠানের নাম', 'Jewelry Shop Name')}
              </label>
              <div className="relative">
                <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={shop}
                  onChange={(e) => setShop(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1614] hover:bg-black text-amber-300 font-black py-2.5 rounded-2xl text-xs shadow-md transition-all cursor-pointer"
            >
              {loading ? t('সেভ হচ্ছে...', 'Saving...') : t('তথ্য আপডেট সেভ করুন', 'Save Profile Updates')}
            </button>
          </form>

          {/* Additional Account Actions */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePasswordReset}
              className="text-xs font-bold text-gray-600 hover:text-amber-800 flex items-center gap-1.5 py-2 px-3 rounded-xl hover:bg-amber-50 transition-colors cursor-pointer"
            >
              <KeyRound size={15} />
              <span>{t('পাসওয়ার্ড রিসেট করুন', 'Reset Password')}</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5 py-2 px-3 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut size={15} />
              <span>{t('লগআউট (Sign Out)', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

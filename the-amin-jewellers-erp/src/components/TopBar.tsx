import { useState, useRef, useEffect } from 'react';
import { Plus, Globe, Bell, Menu, User as UserIcon, Zap, Receipt, Coins, HandCoins, FileEdit, X, Check, QrCode, CreditCard, LogOut, Settings, UserPlus, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import BkashPaymentModal from './BkashPaymentModal';
import BankCardPaymentModal from './BankCardPaymentModal';
import AuthModal from './AuthModal';
import AccountSettingsModal from './AccountSettingsModal';

export default function TopBar({ 
  onToggleSidebar, 
  onTabChange 
}: { 
  onToggleSidebar?: () => void;
  onTabChange?: (id: string) => void;
}) {
  const { lang, setLang, toggleLanguage, t } = useLanguage();
  const { user, userRole, logout } = useAuth();

  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showBkashModal, setShowBkashModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState<'login' | 'register'>('login');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actionItems = [
    { id: 'sales', label: t('নতুন বিক্রি ও ক্যাশ মেমো', 'New Sale & Cash Memo'), icon: Receipt, color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'stock', label: 'স্বর্ণ স্টক আইটেম যোগ', icon: Coins, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'loan', label: 'নতুন স্বর্ণ বন্ধক খাতা', icon: HandCoins, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'orders', label: 'নতুন বায়না অর্ডার খাতা', icon: FileEdit, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const stockAlerts = [
    { category: 'Ring', current: 0, limit: 5 },
    { category: 'Necklace', current: 0, limit: 2 },
    { category: 'Earring', current: 0, limit: 2 },
    { category: 'Earring Ring', current: 0, limit: 2 },
    { category: 'Bangle', current: 0, limit: 2 },
    { category: 'Bracelet', current: 0, limit: 2 },
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <Menu size={20} />
        </button>
        <div className="h-8 w-px bg-gray-200 mx-2" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-[#c59b27] font-bold">
            💎
          </div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-gray-900 leading-tight">
              {t('দি আমিন জুয়েলার্স', 'The Amin Jewelers')}
            </h2>
            <p className="text-[10px] text-gray-400 font-medium">
              {t('জুয়েলারি ইআরপি খাতা | চট্টগ্রাম', 'Jewelry ERP Ledger | Chattogram')}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center justify-center"
          >
            {showMenu ? <X size={20} /> : <Plus size={20} />}
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
                  <Zap size={14} className="text-gray-400" />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">
                    {t('দ্রুত অ্যাকশন মেনু', 'Quick Action Menu')}
                  </span>
                </div>
                <div className="p-2">
                  {actionItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange?.(item.id);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-all text-left group"
                    >
                      <div className={`p-2 rounded-lg ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                        <item.icon size={18} />
                      </div>
                      <span className="text-[13px] font-bold text-gray-700">{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language Switcher Button & Dropdown */}
        <div className="relative" ref={langRef}>
          <button 
            type="button"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100/60 hover:from-amber-100 hover:to-amber-200/80 text-amber-900 px-3.5 py-1.5 rounded-full text-xs font-black border border-amber-300/60 shadow-sm transition-all cursor-pointer group"
          >
            <Globe size={15} className="text-amber-700 group-hover:rotate-45 transition-transform duration-300" />
            <span>{lang === 'bn' ? '🇧🇩 বাংলা' : '🇬🇧 English'}</span>
            <span className="bg-amber-800 text-amber-100 text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase">
              {lang.toUpperCase()}
            </span>
          </button>

          <AnimatePresence>
            {showLangDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 p-1.5"
              >
                <div className="px-3 py-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1 flex items-center justify-between">
                  <span>{t('ভাষা নির্বাচন', 'Select Language')}</span>
                  <Globe size={12} className="text-gray-400" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLang('bn');
                    setShowLangDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${
                    lang === 'bn'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇧🇩</span>
                    <span>বাংলা (Bengali)</span>
                  </div>
                  {lang === 'bn' && <Check size={16} className="text-black" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLang('en');
                    setShowLangDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${
                    lang === 'en'
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">🇬🇧</span>
                    <span>English</span>
                  </div>
                  {lang === 'en' && <Check size={16} className="text-black" />}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Firebase Server 1 Live Sync Badge */}
        <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-[11px] font-bold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>{t('ফায়ারবেস সার্ভার ১ লাইভ', 'Firebase Server 1 Live')}</span>
        </div>





        <div className="relative" ref={notifRef}>
          <div 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative cursor-pointer hover:bg-gray-50 p-2 rounded-full transition-colors"
          >
            <Bell size={20} className="text-gray-400" />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">৬</span>
          </div>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 bg-white rounded-[24px] shadow-2xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-5 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#c59b27]">
                    <Bell size={18} />
                    <span className="text-sm font-bold text-gray-800">
                      {t('স্টক এলার্ট নোটিফিকেশন', 'Stock Alert Notifications')}
                    </span>
                  </div>
                  <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold border border-orange-100">
                    {t('৬ টি নোটিস', '6 Notices')}
                  </span>
                </div>
                
                <div className="max-h-[380px] overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
                  {stockAlerts.map((alert, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-orange-50/40 border border-orange-100/50 p-4 rounded-[20px] hover:bg-orange-50 transition-colors"
                    >
                      <h4 className="text-sm font-bold text-orange-950 mb-1">
                        {t('স্টক কম:', 'Low Stock:')} {alert.category}
                      </h4>
                      <p className="text-[11px] text-orange-800/70 font-medium">
                        {t('মজুদ:', 'Stock:')} <span className="font-bold text-orange-900">{alert.current} {t('টি', 'Pcs')}</span> ({t('সীমা:', 'Limit:')} {alert.limit})
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="p-3 bg-gray-50/50 border-t border-gray-50 text-center">
                  <button 
                    onClick={() => {
                      onTabChange?.('stock');
                      setShowNotifications(false);
                    }}
                    className="text-[11px] font-bold text-gray-400 hover:text-[#c59b27] transition-colors uppercase tracking-wider"
                  >
                    {t('সকল নোটিফিকেশন দেখুন', 'View All Notifications')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile & Account Settings Menu */}
        <div className="relative" ref={userDropdownRef}>
          {user ? (
            <div
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/80 px-2.5 py-1 rounded-full cursor-pointer transition-all shadow-2xs"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-7 h-7 rounded-full object-cover border border-amber-300" />
              ) : (
                <div className="w-7 h-7 bg-[#1a1614] rounded-full flex items-center justify-center text-[#c59b27] font-bold text-xs border border-[#c59b27]/30">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-black text-gray-900 leading-tight truncate max-w-[110px]">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <span className="text-[9px] font-bold text-amber-800 leading-none">
                  {userRole}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setAuthDefaultMode('login');
                  setShowAuthModal(true);
                }}
                className="bg-[#1a1614] hover:bg-black text-amber-300 px-3 py-1.5 rounded-full text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1"
              >
                <UserIcon size={14} />
                <span>{t('লগইন', 'Login')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthDefaultMode('register');
                  setShowAuthModal(true);
                }}
                className="hidden sm:flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-950 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer"
              >
                <UserPlus size={14} />
                <span>{t('রেজিস্টার', 'Register')}</span>
              </button>
            </div>
          )}

          {/* User Profile Dropdown */}
          <AnimatePresence>
            {showUserDropdown && user && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-64 bg-white rounded-[24px] shadow-2xl border border-amber-100 overflow-hidden z-50 p-2"
              >
                <div className="p-3 bg-amber-50/60 rounded-2xl mb-1 border border-amber-100">
                  <div className="text-xs font-black text-gray-900 truncate">
                    {user.displayName || 'আমিন জুয়েলার্স ইউজার'}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate font-medium mt-0.5">
                    {user.email}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded-md text-[10px] font-bold">
                    <ShieldCheck size={12} />
                    <span>{userRole}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      setShowSettingsModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Settings size={16} className="text-amber-700" />
                    <span>{t('অ্যাকাউন্ট সেটিংস', 'Account Settings')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>{t('লগআউট (Sign Out)', 'Sign Out')}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <BkashPaymentModal 
        isOpen={showBkashModal} 
        onClose={() => setShowBkashModal(false)} 
      />

      <BankCardPaymentModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authDefaultMode}
      />

      <AccountSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </header>
  );
}


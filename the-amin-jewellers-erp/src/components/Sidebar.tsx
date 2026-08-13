import { LayoutDashboard, Coins, Receipt, HandCoins, HardHat, FileEdit, Calculator, History, Trash2, Calendar, Code, ChevronRight, BarChart3, Users, Scale } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Sidebar({ activeTab, onTabChange, memoCount }: { activeTab: string, onTabChange: (id: string) => void, memoCount: number }) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', label: t('হোম ওভারভিউ', 'Home Overview'), icon: LayoutDashboard, badge: 'LIVE', badgeColor: 'bg-green-600' },
    { id: 'stock', label: t('স্বর্ণ স্টক খাতা', 'Gold Stock Ledger'), icon: Coins, hasDot: true },
    { id: 'sales', label: t('স্বর্ণ বিক্রয় ও মেমো', 'Gold Sales & Memo'), icon: Receipt, badge: memoCount > 0 ? memoCount.toString() : undefined, badgeColor: 'bg-[#c59b27]' },
    { id: 'oldgold', label: t('পুরাতন স্বর্ণ ক্রয় রশিদ', 'Old Gold Receipts'), icon: Scale, badge: 'NEW', badgeColor: 'bg-amber-600' },
    { id: 'loan', label: t('স্বর্ণ বন্ধক ও ঋণ খাতা', 'Gold Mortgage & Loan'), icon: HandCoins, badge: '১', badgeColor: 'bg-orange-500' },
    { id: 'wages', label: t('কারিগর মজুরি ও বিল', 'Artisan Wage & Bills'), icon: HardHat, badge: '১', badgeColor: 'bg-orange-500' },
    { id: 'orders', label: t('বায়না অর্ডার খাতা', 'Custom Order Ledger'), icon: FileEdit, badge: '০', badgeColor: 'bg-orange-500' },
    { id: 'customers', label: t('গ্রাহক খাতা ও লয়্যালটি', 'Customer CRM & Loyalty'), icon: Users, badge: 'VIP', badgeColor: 'bg-purple-600' },
    { id: 'reports', label: t('রিপোর্ট ও এনালিটিক্স', 'Reports & Analytics'), icon: BarChart3, badge: 'NEW', badgeColor: 'bg-blue-600' },
  ];

  const toolItems = [
    { id: 'rates', label: t('স্বর্ণের বাজারদর', 'Gold Market Rates'), icon: Coins, badge: '৳' },
    { id: 'calculator', label: t('ওজন ও মূল্য ক্যালকুলেটর', 'Weight & Price Calc'), icon: Calculator },
    { id: 'interest', label: t('সুদ হিসাব ক্যালকুলেটর', 'Interest Rate Calc'), icon: History, badge: '%' },
    { id: 'calendar', label: t('গুগল ক্যালেন্ডার সূচি', 'Google Calendar Sync'), icon: Calendar, badge: 'SYNC' },
    { id: 'trash', label: t('রিসাইকেল বিন', 'Recycle Bin'), icon: Trash2, badge: '৮' },
    { id: 'python', label: t('পাইথন ফ্লাস্ক কোড', 'Python Flask Code'), icon: Code, badge: 'DEV' },
  ];

  return (
    <aside className="w-[280px] bg-[#1a1614] text-gray-400 p-4 flex flex-col gap-6 h-screen overflow-y-auto shrink-0 border-r border-gray-800">
      <div className="flex flex-col gap-1 px-2 border-b border-gray-800 pb-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-[#c59b27] font-bold border border-white/10">
            💎
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-gray-100 leading-tight">
              {t('দি আমিন জুয়েলার্স', 'The Amin Jewelers')}
            </h2>
            <p className="text-[10px] text-gray-500 font-medium">
              {t('জুয়েলারি ইআরপি খাতা | চট্টগ্রাম', 'Jewelry ERP Ledger | Chattogram')}
            </p>
          </div>
        </div>
        <div className="text-[10px] text-gray-600 leading-relaxed font-medium">
          {t('ঠিকানা: বহদ্দারহাট, ই পি জেড, চট্টগ্রাম', 'Address: Bahaddarhat, EPZ, Chattogram')}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold px-2 mb-1">
          {t('ড্যাশবোর্ড লেজার মেনু', 'Dashboard Ledger Menu')}
        </span>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center justify-between p-2.5 rounded-xl text-[13px] transition-all text-left group ${
              activeTab === item.id ? 'bg-[#c59b27] text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className={activeTab === item.id ? 'text-black' : 'text-gray-500 group-hover:text-[#c59b27]'} />
              <span>{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.hasDot && <div className="w-1.5 h-1.5 rounded-full bg-[#c59b27]" />}
              {item.badge && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold ${activeTab === item.id ? 'bg-black/20 text-black' : `${item.badgeColor || 'bg-gray-800'} text-white`}`}>
                  {item.badge}
                </span>
              )}
              {activeTab === item.id && <ChevronRight size={14} />}
            </div>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold px-2 mb-1">
          {t('সহায়ক টুলস খাতা', 'Auxiliary Tools Ledger')}
        </span>
        {toolItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center justify-between p-2.5 rounded-xl text-[13px] transition-all text-left group ${
              activeTab === item.id ? 'bg-[#c59b27] text-black font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} className={activeTab === item.id ? 'text-black' : 'text-gray-500 group-hover:text-[#c59b27]'} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold ${activeTab === item.id ? 'bg-black/20 text-black' : 'bg-gray-800 text-gray-300'}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-auto bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
          {t('ওজন পরিমাপ ম্যাট্রিক্স', 'Weight Measurement Matrix')}
        </span>
        <div className="grid grid-cols-2 gap-y-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-300 font-bold">{t('১ ভরি', '1 Bhori')}</span>
            <span className="text-[9px] text-gray-600 font-medium">{t('= ১৬ আনা', '= 16 Ana')}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-300 font-bold">{t('১ আনা', '1 Ana')}</span>
            <span className="text-[9px] text-gray-600 font-medium">{t('= ৬ রতি', '= 6 Roti')}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-300 font-bold">{t('১ রতি', '1 Roti')}</span>
            <span className="text-[9px] text-gray-600 font-medium">{t('= ১০ পয়েন্ট', '= 10 Point')}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-300 font-bold">{t('১ ভরি', '1 Bhori')}</span>
            <span className="text-[9px] text-gray-600 font-medium">{t('= ১১.৬৬৪ গ্রাম', '= 11.664 Grams')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}


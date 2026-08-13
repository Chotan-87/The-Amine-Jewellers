import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, TrendingUp, Package, Users, Wallet, Coins, HardHat, Receipt, HandCoins, Scale } from 'lucide-react';
import { GoldRate, StockItem } from '../types';

const initialRates: GoldRate[] = [
  { karat: '22 ক্যারেট', rate: 125400 },
  { karat: '21 ক্যারেট', rate: 119700 },
  { karat: '18 ক্যারেট', rate: 102600 },
];

const lowStockItems: StockItem[] = [
  { id: '1', code: 'R1', nameBangla: 'আংটি', nameEnglish: 'Ring', category: 'Ring', karat: '22K', weight: 0, traditionalWeight: { vori: 0, ana: 0, roti: 0, point: 0 }, count: 0, minLimit: 5, makingCharge: 0 },
  { id: '2', code: 'N1', nameBangla: 'নেকলেস', nameEnglish: 'Necklace', category: 'Necklace', karat: '22K', weight: 0, traditionalWeight: { vori: 0, ana: 0, roti: 0, point: 0 }, count: 0, minLimit: 2, makingCharge: 0 },
  { id: '3', code: 'E1', nameBangla: 'দুল', nameEnglish: 'Earring', category: 'Earring', karat: '22K', weight: 0, traditionalWeight: { vori: 0, ana: 0, roti: 0, point: 0 }, count: 0, minLimit: 2, makingCharge: 0 },
  { id: '4', code: 'B1', nameBangla: 'চুড়ি', nameEnglish: 'Bangle', category: 'Bangle', karat: '22K', weight: 0, traditionalWeight: { vori: 0, ana: 0, roti: 0, point: 0 }, count: 0, minLimit: 2, makingCharge: 0 },
];

interface DashboardProps {
  rates?: GoldRate[];
  onUpdateRates?: (rates: GoldRate[]) => void;
  onTabChange?: (tab: string) => void;
}

export default function Dashboard({ rates: globalRates, onUpdateRates, onTabChange }: DashboardProps) {
  const displayRates = globalRates && globalRates.length > 0 ? globalRates : initialRates;

  const handleRateChange = (index: number, newRate: number) => {
    if (onUpdateRates && globalRates) {
      const updated = [...globalRates];
      updated[index] = { ...updated[index], rate: newRate };
      onUpdateRates(updated);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Hero Banner */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#2c221e] to-[#1f1b18] text-white p-8 rounded-2xl border border-[#c59b27] flex justify-between items-center shadow-xl"
      >
        <div>
          <h1 className="text-3xl font-bold text-[#c59b27] mb-2">স্বাগতম ড্যাশবোর্ড হাব!</h1>
          <p className="text-sm text-gray-400 max-w-xl">
            আপনার দোকানের লাইভ মজুদ খতিয়ান, স্বর্ণের আজকের বাজারদর, ক্রেতাদের বায়না অর্ডার এবং মেকার খাতা পরিচালনা করার সেন্ট্রাল হাব।
          </p>
        </div>
        <div className="bg-white/5 p-4 rounded-xl text-right border border-white/10">
          <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">SYSTEM DATE</div>
          <div className="text-xl font-bold">{new Date().toLocaleDateString('bn-BD')}</div>
          <div className="text-[10px] text-[#c59b27] mt-1">11:24 AM Active</div>
        </div>
      </motion.section>

      {/* Alert Box */}
      <section className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-4">
          <AlertTriangle size={18} />
          <span>⚠️ কম মজুদ সতর্কতা! (LOW STOCK ALERT)</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {lowStockItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => onTabChange && onTabChange('stock')}
              className="bg-white border border-red-200 text-red-800 text-xs px-3 py-1.5 rounded-full shadow-sm hover:bg-red-100 transition-colors"
            >
              {item.nameBangla} (মজুদ: {item.count} / সীমা: {item.minLimit})
            </button>
          ))}
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'স্বর্ণের ২২ক ক্যারেট দর', value: `BDT ${displayRates[0]?.rate ? displayRates[0].rate.toLocaleString('bn-BD') : '১২৫,৪০০'}`, sub: 'প্রতি ভরি ১১.৬৬৪ গ্রাম', icon: TrendingUp, tab: 'rates', color: 'text-amber-600' },
          { label: 'মজুদ অলঙ্কার সংখ্যা', value: '১২ টি', sub: 'মোট স্টক খতিয়ান', icon: Package, tab: 'stock', color: 'text-blue-600' },
          { label: 'সক্রিয় বন্ধকি ঋণ', value: '০৫ টি', sub: 'মোট বকেয়া পাওনা', icon: Wallet, tab: 'loan', color: 'text-red-600' },
          { label: 'কারিগর রানিং কাজ', value: '০৩ টি', sub: 'মজুরি ও সোনা ব্যালেন্স', icon: HardHat, tab: 'wages', color: 'text-green-600' },
        ].map((metric, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            onClick={() => onTabChange && onTabChange(metric.tab)}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2 cursor-pointer hover:border-[#c59b27]/50 transition-all group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{metric.label}</span>
              <metric.icon size={16} className={`${metric.color} group-hover:scale-110 transition-transform`} />
            </div>
            <div className="text-xl font-black text-gray-900">{metric.value}</div>
            <div className="text-[10px] text-gray-400 font-medium">{metric.sub}</div>
          </motion.div>
        ))}
      </section>

      {/* Unified Operations Quick Access */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-[#c59b27]" />
              সমন্বিত অপারেশন কুইক লিংক (Unified Operations)
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { id: 'stock', label: 'নতুন স্টক এন্ট্রি', icon: Package },
              { id: 'sales', label: 'সেলস মেমো তৈরি', icon: Receipt },
              { id: 'oldgold', label: 'পুরাতন স্বর্ণ ক্রয়', icon: Scale },
              { id: 'loan', label: 'বন্ধকি ঋণ এন্ট্রি', icon: HandCoins },
              { id: 'wages', label: 'মেকার চালান এন্ট্রি', icon: HardHat },
            ].map((action) => (
              <button
                key={action.id}
                onClick={() => onTabChange && onTabChange(action.id)}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-50 hover:border-[#c59b27]/30 hover:bg-[#c59b27]/5 transition-all group"
              >
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:text-[#c59b27] group-hover:bg-white transition-all">
                  <action.icon size={20} />
                </div>
                <span className="text-[11px] font-bold text-gray-600">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-600" />
              আজকের সারসংক্ষেপ
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">মোট বিক্রয় (আজ)</span>
                <span className="font-bold text-gray-900">BDT ০</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">সংগৃহীত বন্ধকি সুদ</span>
                <span className="font-bold text-gray-900">BDT ১,২০০</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">নতুন বায়না অর্ডার</span>
                <span className="font-bold text-gray-900">০২ টি</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onTabChange && onTabChange('reports')}
            className="w-full mt-6 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-[11px] font-bold rounded-xl transition-all"
          >
            বিস্তারিত রিপোর্ট দেখুন
          </button>
        </div>
      </section>

      {/* Gold Rates Editor */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Coins size={18} className="text-[#c59b27]" />
          কুইক স্বর্ণের মূল্য পরিবর্তন
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayRates.slice(0, 3).map((rate, i) => (
            <div key={i} className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600">{rate.karat} স্বর্ণ (BDT)</label>
              <input
                type="number"
                value={rate.rate}
                onChange={(e) => handleRateChange(i, Number(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#c59b27]/20 focus:border-[#c59b27] transition-all"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

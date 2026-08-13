import { useState } from 'react';
import { Coins, TrendingUp, Clock, AlertCircle, RefreshCw, Trash2, Edit3, Check, Zap } from 'lucide-react';
import { GoldRate } from '../types';

export default function MarketRates({ rates, onUpdateRates }: { rates: GoldRate[], onUpdateRates: (rates: GoldRate[]) => void }) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempRate, setTempRate] = useState<number>(0);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setTempRate(rates[index].rate);
  };

  const handleSave = (index: number) => {
    const updated = [...rates];
    updated[index] = { ...updated[index], rate: tempRate };
    
    // Auto-update logic if 22K is changed
    if (autoUpdateEnabled && rates[index].karat === '22 Carat Gold') {
      const k22 = tempRate;
      updated.forEach((r, i) => {
        if (r.karat === '21 Carat Gold') updated[i].rate = Math.round(k22 * 0.9545);
        if (r.karat === '18 Carat Gold') updated[i].rate = Math.round(k22 * 0.8181);
        if (r.karat === 'Traditional Gold') updated[i].rate = Math.round(k22 * 0.6818);
      });
    }
    
    onUpdateRates(updated);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const newRates = rates.filter((_, i) => i !== index);
    onUpdateRates(newRates);
  };

  const handleQuickUpdate = (newRate: number) => {
    const k22Index = rates.findIndex(r => r.karat === '22 Carat Gold');
    if (k22Index === -1) return;

    const updated = [...rates];
    updated[k22Index] = { ...updated[k22Index], rate: newRate };
    
    // Always apply auto-update for quick presets if enabled
    if (autoUpdateEnabled) {
      updated.forEach((r, i) => {
        if (r.karat === '21 Carat Gold') updated[i].rate = Math.round(newRate * 0.9545);
        if (r.karat === '18 Carat Gold') updated[i].rate = Math.round(newRate * 0.8181);
        if (r.karat === 'Traditional Gold') updated[i].rate = Math.round(newRate * 0.6818);
      });
    }
    
    onUpdateRates(updated);
  };

  const quickPresets = [115000, 118500, 120000, 122500, 125000];

  return (
    <div className="p-4 md:p-8 bg-[#fcfaf7] min-h-screen">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={24} className="text-[#c59b27]" />
              স্বর্ণ ও রৌপ্যের আজকের লাইভ বাজারমূল্য
            </h1>
            <span className="bg-green-50 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              BAJUS LIVE STREAM
            </span>
          </div>
          <p className="text-[11px] text-gray-500 font-medium">প্রতি ভরি স্বর্ণ ও রুপার বর্তমান বাজারমূল্য এবং বাজুস (BAJUS) নির্ধারিত সর্বশেষ আপডেট।</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <Clock size={14} className="text-gray-400" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">সর্বশেষ আপডেট: ০৯:২৬ PM</span>
          </div>
          <button className="bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all">
            ডিফল্ট দর
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Rates Card */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Auto-Update Sync Banner */}
          <div className="bg-[#fff9e6] border border-[#ffecb3] p-5 rounded-3xl flex flex-col gap-5 shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/60 rounded-2xl flex items-center justify-center text-[#c59b27] shadow-sm">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-900">স্বয়ংক্রিয় দর পরিবর্তন ম্যাজিক টুল (Auto-Sync)</h3>
                  <p className="text-[10px] text-amber-800/70 font-medium max-w-md">২২ ক্যারেটের দর পরিবর্তন করলে বিশুদ্ধতা অনুপাতে ২১, ১৮ ও সনাতন দরে স্বয়ংক্রিয়ভাবে পরিবর্তন হবে।</p>
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-sm hover:border-[#c59b27] transition-all">
                <input 
                  type="checkbox" 
                  checked={autoUpdateEnabled}
                  onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#c59b27] cursor-pointer"
                />
                <span className="text-[11px] font-bold text-amber-900">অটো পরিবর্তন চালু</span>
              </label>
            </div>

            <div className="pt-4 border-t border-amber-200/50 flex flex-col gap-3">
              <span className="text-[10px] font-black text-amber-800/60 uppercase tracking-widest">কুইক স্বর্ণের মূল্য পরিবর্তন (Quick 22K Update)</span>
              <div className="flex flex-wrap gap-2">
                {quickPresets.map(preset => (
                  <button
                    key={preset}
                    onClick={() => handleQuickUpdate(preset)}
                    className="flex-1 min-w-[100px] bg-white hover:bg-amber-100 text-amber-900 border border-amber-200 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    ৳ {preset.toLocaleString('bn-BD')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#c59b27] rounded-full" />
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">বর্তমান বাজারদর তালিকা</h3>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="flex flex-col">
              {rates.map((rate, i) => (
                <div key={i} className="flex items-center justify-between p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-[#1a1614] rounded-2xl flex items-center justify-center text-[#c59b27] text-xl font-bold border border-white/5 shadow-inner">
                      {rate.karat.includes('Silver') ? 'S' : 'G'}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-gray-900 mb-0.5">{rate.karat}</div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Status:</span>
                        <span className="bg-green-50 text-green-600 text-[8px] font-bold px-1.5 py-0.5 rounded border border-green-100">অ্যাক্টিভ</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    {editingIndex === i ? (
                      <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-xl border border-[#c59b27]/30">
                        <input 
                          type="number" 
                          value={tempRate}
                          onChange={(e) => setTempRate(Number(e.target.value))}
                          autoFocus
                          className="bg-transparent text-lg font-bold text-gray-900 w-32 focus:outline-none px-2"
                        />
                        <button 
                          onClick={() => handleSave(i)}
                          className="bg-[#c59b27] text-black w-8 h-8 flex items-center justify-center rounded-lg shadow-sm hover:scale-105 active:scale-95 transition-all"
                        >
                          <Check size={16} strokeWidth={3} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 tracking-tight">৳ {rate.rate.toLocaleString('bn-BD')}</div>
                        <div className="text-[10px] text-gray-400 font-medium">টাকা প্রতি ভরি</div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => handleEdit(i)}
                        className="w-9 h-9 bg-gray-50 text-gray-400 hover:bg-[#c59b27]/10 hover:text-[#c59b27] flex items-center justify-center rounded-xl transition-all border border-transparent hover:border-[#c59b27]/20"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(i)}
                        className="w-9 h-9 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center rounded-xl transition-all border border-transparent hover:border-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl flex items-start gap-5 shadow-sm">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm shrink-0">
              <AlertCircle size={24} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-orange-900 uppercase tracking-widest">লাইভ মার্কেট সতর্কতা (Price Volatility Alert):</span>
              <p className="text-[11px] text-orange-700/80 leading-relaxed font-medium">
                বাজারের উর্ধ্বগতির কারণে স্বর্ণের দাম যেকোনো সময় পরিবর্তন হতে পারে। বিক্রয় করার পূর্বে অবশ্যই বাজুস (BAJUS) এর অফিসিয়াল দরের সাথে মিলিয়ে নিন। কোনো ভুল হিসাবের জন্য আমিন জুয়েলার্স ইআরপি দায়ী থাকবে না।
              </p>
            </div>
          </div>
        </div>

        {/* Info Box Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#1a1614] text-white p-8 rounded-[32px] border border-white/5 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 text-[#c59b27]">
              <TrendingUp size={100} />
            </div>
            
            <h3 className="text-sm font-bold text-gray-400 border-b border-white/5 pb-4 uppercase tracking-widest">ব্যবহার নির্দেশিকা</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-[#c59b27] text-black text-[10px] font-bold flex items-center justify-center rounded-full shrink-0">১</div>
                <p className="text-[11px] text-gray-400 leading-relaxed">ম্যানুয়াল এডিট বাটনে ক্লিক করে আপনি সরাসরি আজকের বাজার দর আপডেট করতে পারেন।</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-[#c59b27] text-black text-[10px] font-bold flex items-center justify-center rounded-full shrink-0">২</div>
                <p className="text-[11px] text-gray-400 leading-relaxed">অটো পরিবর্তন টুলটি চালু থাকলে শুধুমাত্র ২২ ক্যারেটের দর পরিবর্তন করলেই বাকি সব অটোমেটিক আপডেট হবে।</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-[#c59b27] text-black text-[10px] font-bold flex items-center justify-center rounded-full shrink-0">৩</div>
                <p className="text-[11px] text-gray-400 leading-relaxed">রুপা বা অন্যান্য মেটালের ক্ষেত্রে ম্যানুয়াল আপডেট প্রযোজ্য হবে।</p>
              </div>
            </div>

            <div className="mt-4 pt-6 border-t border-white/5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">বর্তমান প্রবণতা</span>
                <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                  <TrendingUp size={12} /> +১.৫% উর্ধ্বমুখী
                </span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-[#c59b27] h-full w-[70%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { History, Search, RefreshCcw, TrendingUp, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface MonthlyBreakdown {
  month: number;
  principal: number;
  interest: number;
  cumulativeInterest: number;
  totalDue: number;
}

interface InterestCalculatorProps {
  onNavigateToLoan?: () => void;
}

export default function InterestCalculator({ onNavigateToLoan }: InterestCalculatorProps) {
  const [principal, setPrincipal] = useState<number>(50000);
  const [rate, setRate] = useState<number>(2);
  const [rateType, setRateType] = useState<'monthly' | 'annual'>('monthly');
  const [months, setMonths] = useState<number>(6);
  const [extraDays, setExtraDays] = useState<number>(0);
  const [method, setMethod] = useState<'simple' | 'compound'>('simple');
  
  const [results, setResults] = useState({
    earnedInterest: 0,
    totalPayable: 0,
    dailyInterest: 0,
    monthlyInterest: 0,
    breakdown: [] as MonthlyBreakdown[]
  });

  const calculate = () => {
    const totalMonths = months + (extraDays / 30);
    let earnedInterest = 0;
    const breakdown: MonthlyBreakdown[] = [];

    const monthlyRate = rateType === 'monthly' ? rate : rate / 12;

    if (method === 'simple') {
      earnedInterest = principal * (monthlyRate / 100) * totalMonths;
      
      let cumulative = 0;
      for (let i = 1; i <= Math.ceil(totalMonths); i++) {
        const monthInterest = principal * (monthlyRate / 100);
        cumulative += monthInterest;
        breakdown.push({
          month: i,
          principal: principal,
          interest: monthInterest,
          cumulativeInterest: cumulative,
          totalDue: principal + cumulative
        });
      }
    } else {
      const totalAmount = principal * Math.pow((1 + (monthlyRate / 100)), totalMonths);
      earnedInterest = totalAmount - principal;

      let currentPrincipal = principal;
      let cumulative = 0;
      for (let i = 1; i <= Math.ceil(totalMonths); i++) {
        const monthInterest = currentPrincipal * (monthlyRate / 100);
        cumulative += monthInterest;
        currentPrincipal += monthInterest;
        breakdown.push({
          month: i,
          principal: principal,
          interest: monthInterest,
          cumulativeInterest: cumulative,
          totalDue: principal + cumulative
        });
      }
    }

    const monthlyInterestVal = principal * (monthlyRate / 100);
    const dailyInterestVal = monthlyInterestVal / 30;

    setResults({
      earnedInterest,
      totalPayable: principal + earnedInterest,
      dailyInterest: dailyInterestVal,
      monthlyInterest: monthlyInterestVal,
      breakdown
    });
  };

  useEffect(() => {
    calculate();
  }, [principal, rate, rateType, months, extraDays, method]);

  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 bg-[#fcfaf7] min-h-full">
      {/* Header Banner */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#2c1a10] text-white p-6 rounded-2xl border border-[#c59b27]/30 flex items-center gap-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 text-[#c59b27]">
          <History size={120} />
        </div>
        <div className="bg-[#c59b27]/10 p-4 rounded-xl border border-[#c59b27]/20">
          <History className="text-[#c59b27]" size={32} />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#c59b27]">সহায়ক টুলস: সুদ হিসাব ক্যালকুলেটর</h1>
          <p className="text-xs text-gray-400">স্বর্ণ বন্ধকী ঋণ, মহাজনী বা সাধারণ ঋণের জন্য মাসিক বা বার্ষিক সুদের হিসাব সহজে নির্ভুলভাবে করুন।</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { label: '২.০% মাসিক বন্ধকী সুদ', r: 2, t: 'monthly' },
              { label: '১.৫% ব্যাংকিং লোন', r: 1.5, t: 'monthly' },
              { label: '১২% বার্ষিক সুদ', r: 12, t: 'annual' },
              { label: '২.৫% চক্রবৃদ্ধি সুদ', r: 2.5, t: 'monthly', m: 'compound' },
            ].map((p, i) => (
              <button 
                key={i} 
                onClick={() => {
                  setRate(p.r);
                  setRateType(p.t as any);
                  if (p.m) setMethod(p.m as any);
                }}
                className="bg-[#c59b27] text-black text-[10px] font-bold px-3 py-1 rounded-md hover:bg-[#a68221] transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-6 relative">
            <button className="absolute top-6 right-6 text-orange-500 opacity-50 hover:opacity-100 transition-all">
              <RefreshCcw size={16} />
            </button>

            <div className="bg-orange-50/30 border border-orange-100 rounded-2xl p-4 flex flex-col gap-2">
              <label className="text-[10px] font-bold text-orange-700 flex justify-between uppercase tracking-wider">
                রসিদ নম্বর / নাম সার্চ বক্স: <span className="text-[8px] bg-orange-100 px-1 rounded">লাইভ খুঁজুন</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input 
                  type="text" 
                  placeholder="রসিদ নং (যেমন: LN-2026-002) বা গ্রাহকের নাম লিখুন..."
                  className="w-full bg-white border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-orange-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">মূলধন / ঋণের পরিমাণ (টাকা ৳):</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">৳</span>
                <input 
                  type="number" 
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-8 pr-4 font-bold text-lg focus:outline-none focus:border-[#c59b27]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">সুদের হার (%):</label>
                <input 
                  type="number" 
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 font-bold focus:outline-none focus:border-[#c59b27]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">সুদের ধরন (সময়কাল):</label>
                <select 
                  value={rateType}
                  onChange={(e) => setRateType(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 font-bold focus:outline-none"
                >
                  <option value="monthly">মাসিক (%)</option>
                  <option value="annual">বার্ষিক (%)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">সময়কাল (মাস):</label>
                <input 
                  type="number" 
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 font-bold focus:outline-none focus:border-[#c59b27]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">অতিরিক্ত দিন:</label>
                <input 
                  type="number" 
                  value={extraDays}
                  onChange={(e) => setExtraDays(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 font-bold focus:outline-none focus:border-[#c59b27]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">হিসাব পদ্ধতি:</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setMethod('simple')}
                  className={`py-3 rounded-xl font-bold transition-all ${method === 'simple' ? 'bg-[#e67e22] text-white shadow-lg shadow-orange-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}
                >
                  সরল সুদ (Simple)
                </button>
                <button 
                  onClick={() => setMethod('compound')}
                  className={`py-3 rounded-xl font-bold transition-all ${method === 'compound' ? 'bg-[#e67e22] text-white shadow-lg shadow-orange-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}
                >
                  চক্রবৃদ্ধি (Compound)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1a1614] text-white p-8 rounded-[32px] border border-white/5 shadow-2xl flex flex-col gap-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 text-[#c59b27]">
              <TrendingUp size={100} />
            </div>

            <h3 className="text-sm font-bold text-gray-400 border-b border-white/5 pb-4 uppercase tracking-widest">সুদ ও মোট হিসাব সারসংক্ষেপ</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <div className="text-[10px] text-gray-500 mb-1">মূলধন (ঋণ):</div>
                <div className="text-xl font-bold">৳ {principal.toLocaleString('bn-BD')}</div>
              </div>
              <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                <div className="text-[10px] text-yellow-600 mb-1">মোট অর্জিত সুদ:</div>
                <div className="text-xl font-bold text-yellow-600">৳ {Math.round(results.earnedInterest).toLocaleString('bn-BD')}</div>
              </div>
            </div>

            <div className="bg-[#d35400] p-6 rounded-2xl flex justify-between items-center relative overflow-hidden">
              <div className="flex flex-col gap-1 relative z-10">
                <div className="text-[11px] text-white/70 font-bold uppercase tracking-tight">সর্বমোট পরিশোধযোগ্য (মূলধন + সুদ):</div>
                <div className="text-3xl font-bold">৳ {Math.round(results.totalPayable).toLocaleString('bn-BD')}</div>
              </div>
              <TrendingUp className="text-black/10 absolute right-4 top-1/2 -translate-y-1/2" size={60} />
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-bold">দৈনিক সুদ:</span>
                <span className="text-xs font-bold">৳ {Math.round(results.dailyInterest).toLocaleString('bn-BD')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-bold">মাসিক সুদ:</span>
                <span className="text-xs font-bold">৳ {Math.round(results.monthlyInterest).toLocaleString('bn-BD')}</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigateToLoan?.()}
              className="w-full bg-[#3d2b1f] hover:bg-[#4d3b2f] text-[#c59b27] font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all border border-[#c59b27]/20 uppercase tracking-widest text-xs"
            >
              <ArrowRight size={18} />
              স্বর্ণ বন্ধক ও ঋণ খাতায় যান
            </button>
          </motion.div>
        </div>
      </div>

      {/* Breakdown Table */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-[#c59b27]" />
            মাসিক সুদের ক্রমিক সারণী (পরিশোধ প্রাক্কলন)
          </h3>
          <span className="bg-gray-50 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full">{months} মাস হিসাব</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfaf7] text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">মাস</th>
                <th className="px-6 py-4">মূলধন</th>
                <th className="px-6 py-4">মাসের সুদ</th>
                <th className="px-6 py-4">সর্বমোট জমানো সুদ</th>
                <th className="px-6 py-4 text-right">মোট দেনা (টাকা)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.breakdown.map((row) => (
                <tr key={row.month} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{row.month}ম মাস</td>
                  <td className="px-6 py-4 text-gray-500">৳ {row.principal.toLocaleString('bn-BD')}</td>
                  <td className="px-6 py-4 text-orange-600 font-medium">৳ {Math.round(row.interest).toLocaleString('bn-BD')}</td>
                  <td className="px-6 py-4 text-gray-500">৳ {Math.round(row.cumulativeInterest).toLocaleString('bn-BD')}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">৳ {Math.round(row.totalDue).toLocaleString('bn-BD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

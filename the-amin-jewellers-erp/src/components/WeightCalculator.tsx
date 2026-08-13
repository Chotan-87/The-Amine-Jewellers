import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calculator, Zap, Info, Plus, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { GoldRate, SalesItem } from '../types';

const VORI_TO_GRAM = 11.664;
const ANA_TO_VORI = 1 / 16;
const ROTI_TO_ANA = 1 / 6;
const POINT_TO_ROTI = 1 / 10;

interface WeightCalculatorProps {
  onAddToMemo?: (item: SalesItem) => void;
  goldRates: GoldRate[];
}

export default function WeightCalculator({ onAddToMemo, goldRates: initialRates }: WeightCalculatorProps) {
  const [itemName, setItemName] = useState('');
  const [localRates, setLocalRates] = useState<GoldRate[]>(initialRates);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  
  const [selectedKarat, setSelectedKarat] = useState<string>('22 Carat Gold');
  
  // Weight states
  const [grams, setGrams] = useState<number>(11.664);
  const [vori, setVori] = useState<number>(1);
  const [ana, setAna] = useState<number>(0);
  const [roti, setRoti] = useState<number>(0);
  const [point, setPoint] = useState<number>(0);

  // Charges states
  const [wastagePercent, setWastagePercent] = useState<number>(5);
  const [makingCharge, setMakingCharge] = useState<number>(3000);
  const [discount, setDiscount] = useState<number>(0);

  const currentRateObj = useMemo(() => {
    return localRates.find(r => r.karat === selectedKarat) || localRates[0];
  }, [localRates, selectedKarat]);

  // Sync Traditional -> Grams
  const updateGramsFromTraditional = useCallback(() => {
    const totalVori = vori + (ana * ANA_TO_VORI) + (roti * ROTI_TO_ANA * ANA_TO_VORI) + (point * POINT_TO_ROTI * ROTI_TO_ANA * ANA_TO_VORI);
    const calculatedGrams = totalVori * VORI_TO_GRAM;
    setGrams(Number(calculatedGrams.toFixed(3)));
  }, [vori, ana, roti, point]);

  // Sync Grams -> Traditional
  const updateTraditionalFromGrams = (g: number) => {
    const voriDecimal = g / VORI_TO_GRAM;
    const vori = Math.floor(voriDecimal);
    const remainingGramAfterVori = g - (vori * VORI_TO_GRAM);
    const totalAnaDecimal = (remainingGramAfterVori / VORI_TO_GRAM) * 16;
    const ana = Math.floor(totalAnaDecimal);
    const remainingAna = totalAnaDecimal - ana;
    const totalRotiDecimal = remainingAna * 6;
    const roti = Math.floor(totalRotiDecimal);
    const remainingRoti = totalRotiDecimal - roti;
    const pointValue = Math.round(remainingRoti * 10);

    setVori(vori);
    setAna(ana);
    setRoti(roti);
    setPoint(pointValue);
  };

  const handleGramChange = (val: number) => {
    setGrams(val);
    updateTraditionalFromGrams(val);
  };

  useEffect(() => {
    updateGramsFromTraditional();
  }, [vori, ana, roti, point, updateGramsFromTraditional]);

  // Calculations
  const totalVoriVal = grams / VORI_TO_GRAM;
  const goldValue = totalVoriVal * currentRateObj.rate;
  const wastageValue = (goldValue * wastagePercent) / 100;
  const subTotal = goldValue + wastageValue + makingCharge;
  const vatValue = (subTotal * 5) / 100; 
  const grandTotal = subTotal + vatValue - discount;

  const handleAdd = () => {
    if (!onAddToMemo) return;
    const newItem: SalesItem = {
      id: Date.now().toString(),
      name: itemName || 'অজ্ঞাত অলঙ্কার',
      karat: currentRateObj.karat,
      weight: grams,
      traditionalWeight: { vori, ana, roti, point },
      goldValue,
      wastageValue,
      makingCharge,
      vatValue,
      discount,
      total: grandTotal
    };
    onAddToMemo(newItem);
    setItemName('');
  };

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
          <p className="text-[11px] text-gray-500 font-medium">আপনার মেমো জেনারেটর এবং মূল্য ক্যালকুলেটরের জন্য সোনার ও রুপার আজকের দর ক্যারেট অনুযায়ী ঠিক করুন।</p>
        </div>
        <button className="bg-white border border-gray-100 shadow-sm px-4 py-2 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all">
          ডিফল্ট দর
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Section: Input Form */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Auto-Update Banner */}
          <div className="bg-[#fff9e6] border border-[#ffecb3] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/50 rounded-xl flex items-center justify-center text-[#c59b27]">
                <Zap size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-900">২২ ক্যারেটের দর পরিবর্তন করলে অটো ২১, ১৮ ক্যারেট ও সনাতন হিসাব:</h3>
                <p className="text-[9px] text-amber-800/70 font-medium">২২ ক্যারেট ইনপুট দিলে নির্দিষ্ট বিশুদ্ধতা অনুপাতে ২১K (৯২.৪%), ১৮K (৮১.৮%) ও সনাতন (৬৭.৭%) সক্রিয়ভাবে পরিবর্তন হবে।</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-amber-200">
              <input 
                type="checkbox" 
                checked={autoUpdateEnabled}
                onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                className="accent-[#c59b27]"
              />
              <span className="text-[10px] font-bold text-amber-900">অটো পরিবর্তন চালু</span>
            </label>
          </div>

          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">অলঙ্কার / পণ্যের বিবরণ (ITEM NAME)</label>
              <input
                type="text"
                placeholder="যেমন: সোনার ২২ ক্যারেট গলার হার, কানের দুল, আংটি..."
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c59b27]/10 transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">স্বর্ণের ধরন (ক্যারেট)</label>
              <select
                value={selectedKarat}
                onChange={(e) => setSelectedKarat(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-sm font-bold text-gray-700 focus:outline-none transition-all"
              >
                {localRates.map(r => (
                  <option key={r.karat} value={r.karat}>{r.karat} (৳{r.rate.toLocaleString('bn-BD')})</option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50/30 p-6 rounded-2xl border border-gray-50 flex flex-col gap-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ঐতিহ্যবাহী ওজন হিসাব (ভরি - আনা - রতি - পয়েন্ট)</label>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'ভরি (Bhori)', value: vori, setter: setVori },
                  { label: 'আনা (Ana)', value: ana, setter: setAna },
                  { label: 'রতি (Roti)', value: roti, setter: setRoti },
                  { label: 'পয়েন্ট (Pt)', value: point, setter: setPoint },
                ].map((f, i) => (
                  <div key={i} className="flex flex-col gap-2 text-center">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">{f.label}</span>
                    <input 
                      type="number"
                      value={f.value}
                      onChange={(e) => f.setter(Number(e.target.value))}
                      className="w-full bg-white border border-gray-100 rounded-lg p-2.5 text-center font-bold text-gray-800"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">সরাসরি গ্রাম হিসাব (GRAMS)</label>
              <div className="relative">
                <input 
                  type="number"
                  value={grams}
                  onChange={(e) => handleGramChange(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 font-bold text-sm"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300 uppercase">Grams (G)</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ওয়েস্টেজ % (WASTAGE)</label>
                <input 
                  type="number"
                  value={wastagePercent}
                  onChange={(e) => setWastagePercent(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-center font-bold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">মজুরি (MAKING BDT)</label>
                <input 
                  type="number"
                  value={makingCharge}
                  onChange={(e) => setMakingCharge(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-center font-bold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ডিসকাউন্ট (৳)</label>
                <input 
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Rules / Info Box */}
          <div className="bg-[#fffcf0] border border-[#f5efd5] p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-xs font-bold text-amber-900 flex items-center gap-2">
              <Info size={16} className="text-[#c59b27]" />
              লাইভ বাজার দর ব্যবহারের নিয়মাবলী
            </h3>
            <div className="space-y-3 text-[11px] font-medium text-amber-800/80 leading-relaxed">
              <p>১. ম্যানুয়াল টাকা ইনপুট ব্যবহার করে যেকোনো ক্যারেটের লাইভ বাজার দর সরাসরি পরিবর্তন করতে পারেন।</p>
              <p>২. প্রয়োজন না থাকলে কোনো গ্রেডের ডানদিকের "ডিলিট" (Trash icon) বাটনে ক্লিক করে দর তালিকা থেকে মুছে দেওয়া যাবে।</p>
              <p>৩. ২২ ক্যারেটের দর পরিবর্তন করলে অটো পরিবর্তন চালুর মাধ্যমে ২১, ১৮ ক্যারেট ও সনাতন স্বর্ণের দর স্বয়ংক্রিয়ভাবে পরিবর্তন হয়।</p>
            </div>
            
            <div className="flex items-center justify-between border-t border-amber-200/50 pt-4 mt-2">
              <div className="flex gap-4 text-[11px] font-bold text-amber-900">
                <span>১ ভরি (Bhori) =</span>
                <span className="text-amber-600">১৬ আনা = ৯৬ রতি = ১১.৬৬৪ গ্রাম</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                সর্বশেষ রিয়েল-টাইম আপডেট: 
                <span className="flex items-center gap-1 text-green-600">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  ০৯:২৬ PM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Calculation Summary */}
        <div className="lg:col-span-4 sticky top-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#fffdfa] border border-[#c59b27]/20 rounded-[32px] p-8 shadow-xl flex flex-col gap-8"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-sm font-bold text-gray-800">মূল্য হিসাব সারসংক্ষেপ</h3>
              <Calculator size={18} className="text-[#c59b27]" />
            </div>

            <div className="space-y-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-bold uppercase text-[10px]">ওজন:</span>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{vori} ভরি</div>
                  <div className="text-[10px] text-gray-400 font-medium italic">({grams}g)</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-bold uppercase text-[10px]">স্বর্ণের ক্যারেট দর:</span>
                <div className="text-right">
                  <div className="font-bold text-gray-900">BDT {currentRateObj.rate.toLocaleString('bn-BD')}</div>
                  <div className="text-[10px] text-gray-400 font-medium">Taka / ভরি</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-bold uppercase text-[10px]">মূল স্বর্ণের দাম:</span>
                <div className="text-right">
                  <div className="font-bold text-gray-900">BDT {Math.round(goldValue).toLocaleString('bn-BD')}</div>
                  <div className="text-[10px] text-gray-400 font-medium">Taka</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#c59b27] font-bold uppercase text-[10px]">অপচয় / ওয়েস্টেজ ({wastagePercent}%):</span>
                <div className="text-right">
                  <div className="font-bold text-[#c59b27]">BDT {Math.round(wastageValue).toLocaleString('bn-BD')}</div>
                  <div className="text-[10px] text-[#c59b27]/70 font-medium">Taka</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-bold uppercase text-[10px]">গহনা বানানোর মজুরি:</span>
                <div className="text-right">
                  <div className="font-bold text-gray-900">BDT {makingCharge.toLocaleString('bn-BD')}</div>
                  <div className="text-[10px] text-gray-400 font-medium">Taka</div>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1614] p-6 rounded-[24px] text-[#c59b27] mt-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-[#c59b27]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">সর্বমোট প্রদেয় মূল্য</div>
                <div className="text-3xl font-bold">৳ {Math.round(grandTotal).toLocaleString('bn-BD')}</div>
              </div>
            </div>

            <button 
              onClick={handleAdd}
              className="w-full bg-[#c59b27] hover:bg-black hover:text-[#c59b27] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              ক্যাশ মেমোতে যুক্ত করুন
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

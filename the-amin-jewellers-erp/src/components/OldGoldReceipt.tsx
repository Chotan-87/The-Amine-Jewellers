import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Receipt, Plus, Search, Printer, Trash2, Edit3, Eye, FileText, 
  Coins, User, Phone, MapPin, CreditCard, Scale, CheckCircle2, 
  Sparkles, RefreshCw, X, Download, ShieldCheck, ArrowRight,
  ChevronDown, Check
} from 'lucide-react';
import { OldGoldPurchase, TraditionalWeight, GoldRate } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { initialOldGoldPurchases } from '../initialData';
import { 
  subscribeOldGoldPurchases, 
  saveOldGoldPurchaseToFirestore, 
  deleteOldGoldPurchaseFromFirestore 
} from '../lib/firestoreSync';

// Weight helper utilities
export function gramsToTraditional(grams: number): TraditionalWeight {
  const totalPoints = Math.round((grams / 11.664) * 16 * 6 * 10);
  const vori = Math.floor(totalPoints / (16 * 6 * 10));
  let rem = totalPoints % (16 * 6 * 10);
  const ana = Math.floor(rem / (6 * 10));
  rem = rem % (6 * 10);
  const roti = Math.floor(rem / 10);
  const point = rem % 10;

  return { vori, ana, roti, point };
}

export function traditionalToGrams(tw: TraditionalWeight): number {
  const totalPoints = (tw.vori * 16 * 6 * 10) + (tw.ana * 6 * 10) + (tw.roti * 10) + tw.point;
  return Number(((totalPoints / (16 * 6 * 10)) * 11.664).toFixed(3));
}

// Number to Bangla words converter helper for BDT
function numberToBanglaWords(num: number): string {
  if (isNaN(num) || num === 0) return 'শূণ্য টাকা';
  
  const units = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ', 
                 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', '১৮', '১৯', 'বিশ'];
  
  // Simple integer formatter fallback for large numbers
  const formatted = Math.round(num).toLocaleString('bn-BD');
  return `${formatted} টাকা মাত্র`;
}

export interface KaratOption {
  key: string;
  label: string;
  purityPct: number;
  purityText: string;
  badgeBg: string;
  description: string;
}

export const KARAT_OPTIONS: KaratOption[] = [
  {
    key: '22',
    label: '22 ক্যারেট',
    purityPct: 91.67,
    purityText: '91.67% বিশুদ্ধ',
    badgeBg: 'bg-[#c59b27] text-black font-extrabold',
    description: 'বাংলাদেশ জুয়েলার্স সমিতি (BAJUS) স্ট্যান্ডার্ডে সর্বাধিক প্রচলিত ২২ ক্যারেট সোনা।'
  },
  {
    key: '21',
    label: '21 ক্যারেট',
    purityPct: 87.50,
    purityText: '87.50% বিশুদ্ধ',
    badgeBg: 'bg-amber-600 text-white font-bold',
    description: 'ঐতিহ্যবাহী ও ব্রাইডাল জুয়েলারি গহনায় ব্যবহৃত ২১ ক্যারেট সোনা।'
  },
  {
    key: '18',
    label: '18 ক্যারেট',
    purityPct: 75.00,
    purityText: '75.00% বিশুদ্ধ',
    badgeBg: 'bg-amber-700 text-white font-bold',
    description: 'ডায়মন্ড ও আধুনিক লাইটওয়েট অলঙ্কারে ব্যবহৃত ১৮ ক্যারেট সোনা।'
  },
  {
    key: '24',
    label: '24 ক্যারেট (পাকা সোনা)',
    purityPct: 99.50,
    purityText: '99.50% ফাইন',
    badgeBg: 'bg-yellow-400 text-yellow-950 font-black',
    description: '৯৯.৫% বিশুদ্ধ পাকা সোনার বার বা গিনি পাত্তি।'
  },
  {
    key: '14',
    label: '14 ক্যারেট',
    purityPct: 58.33,
    purityText: '58.33% বিশুদ্ধ',
    badgeBg: 'bg-amber-800 text-amber-100 font-semibold',
    description: 'ইউরোপীয় ও এক্সপোর্ট কোয়ালিটির ১৪ ক্যারেট গোল্ড।'
  },
  {
    key: 'সনাতন',
    label: 'সনাতন সোনা',
    purityPct: 65.00,
    purityText: '65.00% গড়',
    badgeBg: 'bg-orange-800 text-orange-100 font-semibold',
    description: 'পুরাতন হাতে তৈরি অলঙ্কার বা কষ্টিপাথরে মাপা সনাতন সোনা।'
  },
  {
    key: 'রূপা',
    label: 'রুপালি রূপা',
    purityPct: 92.50,
    purityText: '92.50% ফাইন',
    badgeBg: 'bg-slate-200 text-slate-800 font-bold',
    description: '৯২৫ স্টার্লিং বা দেশীয় রৌপ্য/রূপালি গহনা।'
  }
];

export function getNormalizedKaratKey(val: string): string {
  if (!val) return '22';
  const str = val.toString().toLowerCase();
  if (str.includes('24')) return '24';
  if (str.includes('22')) return '22';
  if (str.includes('21')) return '21';
  if (str.includes('18')) return '18';
  if (str.includes('14')) return '14';
  if (str.includes('সনাতন') || str.includes('traditional')) return 'সনাতন';
  if (str.includes('রূপা') || str.includes('রুপা') || str.includes('silver')) return 'রূপা';
  return '22';
}

interface KaratSelectorComboboxProps {
  value: string;
  onChange: (key: string, option: KaratOption) => void;
  labelTitle?: string;
  compact?: boolean;
}

export function KaratSelectorCombobox({ value, onChange, labelTitle, compact = false }: KaratSelectorComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const comboboxRef = useRef<HTMLDivElement>(null);

  const currentKey = getNormalizedKaratKey(value);
  const currentOption = KARAT_OPTIONS.find(o => o.key === currentKey) || KARAT_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = KARAT_OPTIONS.filter(opt => 
    opt.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
    opt.purityText.toLowerCase().includes(filterQuery.toLowerCase()) ||
    opt.description.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-3" ref={comboboxRef}>
      {labelTitle && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-800 uppercase tracking-wider block">
            {labelTitle}
          </label>
          <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
            {currentOption.label} ({currentOption.purityText})
          </span>
        </div>
      )}

      {/* Combobox Dropdown Trigger Box */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border-2 border-amber-200/80 hover:border-[#c59b27] rounded-2xl p-3 flex items-center justify-between text-left transition-all shadow-sm focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className={`px-2.5 py-1 rounded-xl text-xs ${currentOption.badgeBg}`}>
              {currentOption.purityText}
            </div>
            <div>
              <span className="text-sm font-black text-gray-900 block">{currentOption.label}</span>
              <span className="text-[11px] text-gray-500 font-medium line-clamp-1">{currentOption.description}</span>
            </div>
          </div>
          <ChevronDown size={18} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Animated Dropdown Menu List */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-amber-200 shadow-2xl z-50 overflow-hidden"
            >
              {/* Search filter inside combobox */}
              <div className="p-2.5 border-b border-gray-100 bg-amber-50/50 flex items-center gap-2">
                <Search size={15} className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="ক্যারেটের নাম বা মান দিয়ে খুঁজুন..."
                  className="w-full bg-transparent text-xs font-semibold text-gray-800 focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Options List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => {
                    const isSelected = option.key === currentKey;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => {
                          onChange(option.key, option);
                          setIsOpen(false);
                          setFilterQuery('');
                        }}
                        className={`w-full p-3 text-left transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected ? 'bg-amber-100/60 font-bold' : 'hover:bg-amber-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] ${option.badgeBg}`}>
                            {option.purityText}
                          </span>
                          <div>
                            <div className="text-xs font-extrabold text-gray-900">{option.label}</div>
                            <div className="text-[10px] text-gray-500">{option.description}</div>
                          </div>
                        </div>

                        {isSelected && <Check size={16} className="text-[#c59b27] shrink-0" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-gray-400 font-medium">
                    কোনো মিল পাওয়া যায়নি
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Action Buttons Grid */}
      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 pt-1">
          {KARAT_OPTIONS.map((item) => {
            const isSelected = item.key === currentKey;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onChange(item.key, item)}
                className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#2b231d] to-[#1a1512] text-white border-[#c59b27] shadow-md ring-2 ring-[#c59b27]/40 scale-[1.02]'
                    : 'bg-white hover:bg-gray-100 text-gray-800 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">{item.label}</span>
                  {isSelected && <Check size={12} className="text-[#c59b27]" />}
                </div>
                <span className={`text-[10px] mt-1 font-semibold ${isSelected ? 'text-amber-300' : 'text-gray-500'}`}>
                  {item.purityText}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface OldGoldReceiptProps {
  goldRates?: GoldRate[];
}

export default function OldGoldReceipt({ goldRates }: OldGoldReceiptProps) {
  const { t } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  // States
  const [purchases, setPurchases] = useState<OldGoldPurchase[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'calc'>('calc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKarats, setSelectedKarats] = useState<string>('all');
  
  // Dedicated Karat Calculator State
  const [calcKarat, setCalcKarat] = useState<string>('22');
  const [calcGrossGrams, setCalcGrossGrams] = useState<number>(11.664); // 1 vori default
  const [calcWastagePct, setCalcWastagePct] = useState<number>(10); // 10% cut
  const [calcMarketRate, setCalcMarketRate] = useState<number>(
    goldRates && goldRates[0]?.rate ? goldRates[0].rate : 125400
  );
  const [calcDiscountPct, setCalcDiscountPct] = useState<number>(7); // 7% buying margin below selling market rate

  // Purity ratios
  const karatPurityMap: Record<string, number> = {
    '24': 99.50,
    '22': 91.67,
    '21': 87.50,
    '18': 75.00,
    '14': 58.33,
    'সনাতন': 65.00,
    'রূপা': 92.50
  };

  const selectedPurityPct = karatPurityMap[calcKarat] || 91.67;
  const calcWastageGrams = Number(((calcGrossGrams * calcWastagePct) / 100).toFixed(3));
  const calcNetPureGrams = Math.max(0, Number((calcGrossGrams - calcWastageGrams).toFixed(3)));
  const calcEffectiveBuyRate = Math.round(calcMarketRate * (1 - calcDiscountPct / 100));
  const calcTotalPayable = Math.round((calcNetPureGrams / 11.664) * calcEffectiveBuyRate);

  const calcGrossTraditional = gramsToTraditional(calcGrossGrams);
  const calcNetTraditional = gramsToTraditional(calcNetPureGrams);
  
  // Modal / Print preview state
  const [previewPurchase, setPreviewPurchase] = useState<OldGoldPurchase | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<OldGoldPurchase | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    voucherNo: `OG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerMobile: '',
    customerAddress: '',
    nidNo: '',
    itemName: 'পুরাতন সোনার গহনা (চেইন / আংটি)',
    karat: '22 ক্যারেট',
    grossWeightGrams: 11.664,
    wastageGrams: 1.166, // ~10% standard wastage/cut
    ratePerVori: goldRates && goldRates[0]?.rate ? goldRates[0].rate - 8000 : 117400, // old gold purchase rate discount
    paymentMethod: 'cash' as 'cash' | 'bank' | 'bkash',
    remarks: 'গ্রাহক থেকে নিয়মমাফিক যাচাইপূর্বক ক্রয়কৃত পুরাতন অলঙ্কার।',
    itemPhoto: ''
  });

  // Derived Form Weight Calculations
  const grossGrams = Number(formData.grossWeightGrams) || 0;
  const wastageGrams = Number(formData.wastageGrams) || 0;
  const netPureGrams = Math.max(0, Number((grossGrams - wastageGrams).toFixed(3)));
  
  const grossTraditional = gramsToTraditional(grossGrams);
  const netTraditional = gramsToTraditional(netPureGrams);
  
  const totalAmount = Math.round((netPureGrams / 11.664) * (Number(formData.ratePerVori) || 0));

  // Sync with Firestore or fallback
  useEffect(() => {
    let isMounted = true;
    const unsub = subscribeOldGoldPurchases((data) => {
      if (isMounted) {
        if (data && data.length > 0) {
          setPurchases(data as OldGoldPurchase[]);
        } else {
          setPurchases(initialOldGoldPurchases);
        }
      }
    }, () => {
      if (isMounted) {
        setPurchases(initialOldGoldPurchases);
      }
    });

    return () => {
      isMounted = false;
      if (unsub) unsub();
    };
  }, []);

  // Set default purchase rate based on selected karat
  useEffect(() => {
    if (!goldRates || goldRates.length === 0) return;
    const rateObj = goldRates.find(r => r.karat.includes(formData.karat.replace(' ক্যারেট', '')));
    if (rateObj) {
      // Old gold buying rate is typically ~5-8% less than selling market rate
      const buyRate = Math.round(rateObj.rate * 0.93);
      setFormData(prev => ({ ...prev, ratePerVori: buyRate }));
    }
  }, [formData.karat, goldRates]);

  const handleSaveReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.itemName || grossGrams <= 0) {
      alert(t('অনুগ্রহ করে গ্রাহকের নাম, অলঙ্কারের নাম এবং সঠিক ওজন প্রদান করুন।', 'Please enter customer name, item name and valid weight.'));
      return;
    }

    const newReceipt: OldGoldPurchase = {
      id: editingPurchase ? editingPurchase.id : `OG-${Date.now()}`,
      voucherNo: formData.voucherNo,
      date: formData.date,
      customerName: formData.customerName,
      customerMobile: formData.customerMobile || 'N/A',
      customerAddress: formData.customerAddress || 'চট্টগ্রাম',
      nidNo: formData.nidNo || 'N/A',
      itemName: formData.itemName,
      karat: formData.karat,
      grossWeight: grossGrams,
      traditionalGrossWeight: grossTraditional,
      wastageDeduction: wastageGrams,
      netPureWeight: netPureGrams,
      traditionalNetWeight: netTraditional,
      ratePerVori: Number(formData.ratePerVori),
      totalAmount: totalAmount,
      paymentMethod: formData.paymentMethod,
      remarks: formData.remarks,
      itemPhoto: formData.itemPhoto || undefined,
      createdAt: new Date().toISOString()
    };

    // Save to state & Firestore
    const updated = editingPurchase 
      ? purchases.map(p => p.id === editingPurchase.id ? newReceipt : p)
      : [newReceipt, ...purchases];

    setPurchases(updated);
    saveOldGoldPurchaseToFirestore(newReceipt);

    // Open Print Preview automatically
    setPreviewPurchase(newReceipt);
    
    // Reset form
    setEditingPurchase(null);
    setFormData({
      voucherNo: `OG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      customerName: '',
      customerMobile: '',
      customerAddress: '',
      nidNo: '',
      itemName: 'পুরাতন সোনার গহনা (চেইন / আংটি)',
      karat: '22 ক্যারেট',
      grossWeightGrams: 11.664,
      wastageGrams: 1.166,
      ratePerVori: goldRates && goldRates[0]?.rate ? Math.round(goldRates[0].rate * 0.93) : 116500,
      paymentMethod: 'cash',
      remarks: 'গ্রাহক থেকে নিয়মমাফিক যাচাইপূর্বক ক্রয়কৃত পুরাতন অলঙ্কার।',
      itemPhoto: ''
    });

    setActiveTab('list');
  };

  const handleDelete = (id: string) => {
    if (confirm(t('আপনি কি নিশ্চিত যে এই রসিদটি মুছে ফেলতে চান?', 'Are you sure you want to delete this receipt?'))) {
      const filtered = purchases.filter(p => p.id !== id);
      setPurchases(filtered);
      deleteOldGoldPurchaseFromFirestore(id);
    }
  };

  const handleEdit = (p: OldGoldPurchase) => {
    setEditingPurchase(p);
    setFormData({
      voucherNo: p.voucherNo,
      date: p.date,
      customerName: p.customerName,
      customerMobile: p.customerMobile,
      customerAddress: p.customerAddress || '',
      nidNo: p.nidNo || '',
      itemName: p.itemName,
      karat: p.karat,
      grossWeightGrams: p.grossWeight,
      wastageGrams: p.wastageDeduction,
      ratePerVori: p.ratePerVori,
      paymentMethod: p.paymentMethod,
      remarks: p.remarks || '',
      itemPhoto: p.itemPhoto || ''
    });
    setActiveTab('create');
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered List
  const filteredPurchases = purchases.filter(p => {
    const custName = p.customerName || p.sellerName || '';
    const custMobile = p.customerMobile || p.sellerMobile || '';
    const voucher = p.voucherNo || '';
    const item = p.itemName || '';
    const karat = p.karat || '';

    const matchesSearch = 
      custName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      custMobile.includes(searchQuery) ||
      voucher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKarat = selectedKarats === 'all' || karat.includes(selectedKarats);

    return matchesSearch && matchesKarat;
  });

  // Calculate totals
  const totalPureGramsPurchased = purchases.reduce((acc, curr) => acc + (curr.netPureWeight || 0), 0);
  const totalPureTraditional = gramsToTraditional(totalPureGramsPurchased);
  const totalAmountSpent = purchases.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  return (
    <div className="p-4 md:p-8 flex flex-col gap-6 max-w-[1500px] mx-auto">
      {/* Top Banner / Stats Header */}
      <div className="bg-gradient-to-r from-[#1c1815] via-[#2d241e] to-[#1c1815] p-6 md:p-8 rounded-3xl border border-[#c59b27]/40 shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#c59b27]/20 border border-[#c59b27]/50 flex items-center justify-center text-[#c59b27]">
            <Receipt size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#c59b27] text-black text-[10px] font-black uppercase tracking-wider">
                PURCHASE VOUCHER
              </span>
              <span className="text-xs text-amber-200/70">দি আমিন জুয়েলার্স</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-amber-100 mt-1">
              {t('পুরাতন স্বর্ণ ক্রয় রশিদ ও খতিয়ান', 'Old Gold Purchase Receipts & Ledger')}
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              {t('গ্রাহকের থেকে পুরাতন অলঙ্কার ক্রয়, খাদ ও পাকা ওজন হিসাব এবং ডিজিটাল ক্রয় রশিদ প্রিন্ট ব্যবস্থা।', 'Register old gold purchases, wastage deduction, pure weight calculation and printable vouchers.')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
              activeTab === 'calc'
                ? 'bg-[#c59b27] text-black ring-2 ring-amber-300/50'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <Sparkles size={16} />
            <span>{t('ক্যারেট অনুযায়ী ক্যালকুলেটর', 'Karat Purity Calc')}</span>
          </button>

          <button
            onClick={() => {
              setEditingPurchase(null);
              setActiveTab('create');
            }}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
              activeTab === 'create'
                ? 'bg-[#c59b27] text-black ring-2 ring-amber-300/50'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <Plus size={16} />
            <span>{t('নতুন ক্রয় রশিদ তৈরি', 'Create New Receipt')}</span>
          </button>

          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
              activeTab === 'list'
                ? 'bg-[#c59b27] text-black ring-2 ring-amber-300/50'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <FileText size={16} />
            <span>{t('ক্রয় খতিয়ান তালিকা', 'Purchases List')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              {t('মোট ক্রয় রশিদ সংখ্যা', 'Total Receipts')}
            </span>
            <div className="text-2xl font-black text-gray-900 mt-1">
              {purchases.length} {t('টি', 'Items')}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>{t('সকল ভাউচার ডিজিটাল সিঙ্কড', 'All vouchers synced')}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#c59b27] flex items-center justify-center">
            <Receipt size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              {t('মোট সংগৃহীত পাকা সোনা', 'Total Net Pure Gold')}
            </span>
            <div className="text-xl font-black text-amber-700 mt-1">
              {totalPureTraditional.vori} {t('ভরি', 'Vori')} {totalPureTraditional.ana} {t('আনা', 'Ana')} {totalPureTraditional.roti} {t('রতি', 'Roti')}
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-1">
              ({totalPureGramsPurchased.toFixed(3)} {t('গ্রাম বিশুদ্ধ সোনা', 'Grams Pure Gold')})
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100/50 text-amber-800 flex items-center justify-center">
            <Coins size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              {t('মোট পরিশোধিত ক্রয়মূল্য', 'Total Spent Amount')}
            </span>
            <div className="text-2xl font-black text-gray-900 mt-1">
              BDT {totalAmountSpent.toLocaleString('bn-BD')}
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">
              {t('নগদ/বিকাশ/ব্যাংক ট্র্যান্সফার', 'Cash/bKash/Bank Transfer')}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'calc' ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-md space-y-6"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 pb-5 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shadow-sm">
                <Sparkles size={22} className="text-[#c59b27]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  {t('ক্যারেট মান অনুযায়ী পুরাতন সোনা ক্যালকুলেটর', 'Karat Purity Old Gold Calculator')}
                </h2>
                <p className="text-xs text-gray-500">
                  {t('ক্যারেট পিউরিটি %, নিখাদ ওজন, খাদ বাদ এবং সরাসরি ক্রয়মূল্য হিসাবের আধুনিক অনলাইন টুল।', 'Instantly calculate gold purity, wastage deduction and cash payout by karat grade.')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-200">
              <Coins size={16} className="text-amber-800" />
              <span className="text-xs font-bold text-amber-950">
                {calcKarat} ক্যারেট পিউরিটি: <span className="font-mono font-black text-[#c59b27]">{selectedPurityPct}%</span>
              </span>
            </div>
          </div>

          {/* Karat Grade Selector Combobox & Quick Buttons */}
          <KaratSelectorCombobox
            labelTitle={t('১. ক্যারেট বা সোনার মান সিলেক্ট করুন', '1. Select Karat / Gold Grade')}
            value={calcKarat}
            onChange={(key) => setCalcKarat(key)}
          />

          {/* Input Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-amber-50/30 p-6 rounded-2xl border border-amber-200/60">
            {/* Gross Weight Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-800">
                {t('অলঙ্কারের মোট গ্রস ওজন (গ্রাম)', 'Gross Weight (Grams)')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.001"
                  value={calcGrossGrams}
                  onChange={(e) => setCalcGrossGrams(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-white border border-gray-300 rounded-2xl p-3 text-base font-black text-gray-900 focus:ring-2 focus:ring-[#c59b27]/30 outline-none"
                />
                <span className="absolute right-3 top-3.5 text-xs font-bold text-gray-400">Grams</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-xs font-bold text-amber-900">
                = {calcGrossTraditional.vori} ভরি {calcGrossTraditional.ana} আনা {calcGrossTraditional.roti} রতি {calcGrossTraditional.point} পয়েন্ট
              </div>
            </div>

            {/* Wastage / Cut Deduction % */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold text-red-700">
                  {t('খাদ / কাট কর্তন %', 'Wastage / Cut Deduction %')}
                </label>
                <span className="text-xs font-black text-red-800">{calcWastagePct}% বাদ ({calcWastageGrams} গ্রাম)</span>
              </div>
              <input
                type="range"
                min="0"
                max="25"
                step="0.5"
                value={calcWastagePct}
                onChange={(e) => setCalcWastagePct(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
              />
              <div className="flex gap-1.5 pt-1">
                {[5, 7, 10, 12, 15].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setCalcWastagePct(pct)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                      calcWastagePct === pct
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Market Rate & Buying Margin % */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-800">
                {t('বাজার বিক্রয় দর (প্রতি ভরি BDT)', 'Market Selling Rate / Vori')}
              </label>
              <input
                type="number"
                value={calcMarketRate}
                onChange={(e) => setCalcMarketRate(Number(e.target.value))}
                className="w-full bg-white border border-gray-300 rounded-2xl p-2.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#c59b27]/30 outline-none"
              />

              <div className="pt-1">
                <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                  <span>ক্রয় ছাড় / মার্জিন:</span>
                  <span className="text-amber-800">{calcDiscountPct}% ছাড় ({calcEffectiveBuyRate.toLocaleString('bn-BD')} ৳/ভরি)</span>
                </div>
                <div className="flex gap-1.5">
                  {[5, 7, 10, 12].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setCalcDiscountPct(d)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                        calcDiscountPct === d
                          ? 'bg-[#c59b27] text-black border-[#c59b27]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {d}% ছাড়
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pure Gold Yield */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-emerald-100 p-5 rounded-2xl border border-emerald-700/50 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  {t('নিখাদ পাকা সোনা আউটপুট', 'Pure Gold Yield')}
                </span>
                <div className="text-3xl font-black text-white mt-2">
                  {calcNetPureGrams} <span className="text-sm font-semibold">গ্রাম</span>
                </div>
                <div className="text-xs font-bold text-emerald-300 mt-2 bg-white/10 p-2 rounded-xl border border-white/10">
                  = {calcNetTraditional.vori} ভরি {calcNetTraditional.ana} আনা {calcNetTraditional.roti} রতি {calcNetTraditional.point} পয়েন্ট
                </div>
              </div>
              <p className="text-[10px] text-emerald-400/80 mt-3 italic">
                * খাদ বাদ দেওয়ার পর প্রকৃত খাঁটি সোনা
              </p>
            </div>

            {/* Effective Buying Rate */}
            <div className="bg-gradient-to-br from-amber-900 to-amber-950 text-amber-100 p-5 rounded-2xl border border-amber-700/50 shadow-md flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  {t('কার্যকরী ক্রয় দর (প্রতি ভরি)', 'Effective Buying Rate')}
                </span>
                <div className="text-2xl font-black text-amber-200 mt-2">
                  BDT {calcEffectiveBuyRate.toLocaleString('bn-BD')}
                </div>
                <div className="text-xs font-semibold text-amber-300/80 mt-2">
                  বাজার দর BDT {calcMarketRate.toLocaleString('bn-BD')} থেকে {calcDiscountPct}% মার্জিন কর্তন করা হয়েছে।
                </div>
              </div>
              <div className="text-[10px] text-amber-400/80 mt-3">
                {calcKarat} ক্যারেটের মানদণ্ডে নির্ধারিত
              </div>
            </div>

            {/* Final Payable Amount & Transfer CTA */}
            <div className="bg-gradient-to-br from-[#201a16] to-[#120f0d] text-white p-5 rounded-2xl border border-[#c59b27] shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#c59b27] tracking-wider">
                  {t('মোট ক্যাশ পরিশোধযোগ্য টাকা', 'Total Cash Payable')}
                </span>
                <div className="text-3xl font-black text-amber-400 mt-2">
                  BDT {calcTotalPayable.toLocaleString('bn-BD')}
                </div>
                <p className="text-[11px] text-gray-300 mt-2">
                  {numberToBanglaWords(calcTotalPayable)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    karat: `${calcKarat} ক্যারেট`,
                    grossWeightGrams: calcGrossGrams,
                    wastageGrams: calcWastageGrams,
                    ratePerVori: calcEffectiveBuyRate
                  }));
                  setActiveTab('create');
                }}
                className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-[#c59b27] hover:bg-amber-500 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <span>{t('এই হিসাব দিয়ে ক্রয় রশিদ তৈরি করুন', 'Use Calculation in Purchase Receipt')}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      ) : activeTab === 'create' ? (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-md"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Plus size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingPurchase ? t('পুরাতন সোনা ক্রয় রশিদ সম্পাদনা', 'Edit Old Gold Purchase Receipt') : t('নতুন পুরাতন স্বর্ণ ক্রয় রশিদ তৈরি', 'Create New Old Gold Purchase Receipt')}
                </h2>
                <p className="text-xs text-gray-500">
                  {t('গ্রাহকের বিস্তারিত তথ্য এবং অলঙ্কারের ওজন ও কর্তন দিয়ে ভাউচার এন্ট্রি করুন।', 'Fill in customer details, weight and deductions to generate purchase voucher.')}
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg">
              {formData.voucherNo}
            </span>
          </div>

          <form onSubmit={handleSaveReceipt} className="space-y-6">
            {/* Customer Details Section */}
            <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <User size={15} className="text-[#c59b27]" />
                <span>{t('১. বিক্রেতা / গ্রাহকের তথ্য (Customer Info)', '1. Seller / Customer Info')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {t('গ্রাহকের নাম *', 'Customer Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder={t('যেমন: মো: রফিকুল ইসলাম', 'e.g. Rafiqul Islam')}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#c59b27]/30 focus:border-[#c59b27] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {t('মোবাইল নম্বর', 'Mobile Number')}
                  </label>
                  <input
                    type="text"
                    value={formData.customerMobile}
                    onChange={(e) => setFormData({ ...formData, customerMobile: e.target.value })}
                    placeholder={t('০১৮XXXXXXXX', '018XXXXXXXX')}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#c59b27]/30 focus:border-[#c59b27] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {t('জাতীয় পরিচয়পত্র (NID)', 'NID Card No')}
                  </label>
                  <input
                    type="text"
                    value={formData.nidNo}
                    onChange={(e) => setFormData({ ...formData, nidNo: e.target.value })}
                    placeholder={t('১৯৯০১৫৯১২২২৩৩', 'NID Number')}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#c59b27]/30 focus:border-[#c59b27] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    {t('ক্রয় তারিখ', 'Purchase Date')}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#c59b27]/30 focus:border-[#c59b27] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {t('ঠিকানা', 'Address')}
                </label>
                <input
                  type="text"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  placeholder={t('বহদ্দারহাট / ই পি জেড, চট্টগ্রাম', 'Chattogram')}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#c59b27]/30 focus:border-[#c59b27] outline-none"
                />
              </div>
            </div>

            {/* Item & Weight Measurement Section */}
            <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-200/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <Scale size={15} className="text-[#c59b27]" />
                  <span>{t('২. অলঙ্কার ওজনের বিবরণী (Item & Weight Calculations)', '2. Item & Weight Calculations')}</span>
                </div>
                <span className="text-[11px] text-amber-800 font-medium">১ ভরি = ১৬ আনা = ৯৬ রতি = ১১.৬৬৪ গ্রাম</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('অলঙ্কারের নাম ও বিবরণ *', 'Item Description *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    placeholder={t('যেমন: পুরাতন চেইন, বালা ও আংটি', 'e.g. Old Gold Chain & Ring')}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#c59b27]/30 focus:border-[#c59b27] outline-none"
                  />
                </div>

                <div>
                  <KaratSelectorCombobox
                    labelTitle={t('ক্যারেট / মানের ধরণ', 'Gold Karat / Quality')}
                    value={formData.karat}
                    compact={true}
                    onChange={(_key, opt) => setFormData({ ...formData, karat: opt.label })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('ক্রয় দর (প্রতি ভরি BDT) *', 'Purchase Rate per Vori (BDT) *')}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.ratePerVori}
                    onChange={(e) => setFormData({ ...formData, ratePerVori: Number(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-amber-900 focus:ring-2 focus:ring-[#c59b27]/30 focus:border-[#c59b27] outline-none"
                  />
                </div>
              </div>

              {/* Weight Breakdown Inputs & Output Display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-amber-200/80">
                {/* Gross Weight */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-700">
                    {t('গ্রস মোট ওজন (গ্রাম)', 'Gross Weight (Grams)')}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={formData.grossWeightGrams}
                    onChange={(e) => setFormData({ ...formData, grossWeightGrams: Number(e.target.value) })}
                    className="w-full bg-amber-50/50 border border-amber-300 rounded-xl p-2.5 text-sm font-black text-gray-900 outline-none"
                  />
                  <div className="text-[11px] font-semibold text-amber-900 bg-amber-100/60 p-2 rounded-lg mt-1">
                    = {grossTraditional.vori} ভরি {grossTraditional.ana} আনা {grossTraditional.roti} রতি {grossTraditional.point} পয়েন্ট
                  </div>
                </div>

                {/* Deduction / Cut / Wastage */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-red-700">
                    {t('কাট / খাদ / ঝালাই বাদ (গ্রাম)', 'Wastage / Cut Deduction (Grams)')}
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.wastageGrams}
                    onChange={(e) => setFormData({ ...formData, wastageGrams: Number(e.target.value) })}
                    className="w-full bg-red-50/50 border border-red-200 rounded-xl p-2.5 text-sm font-black text-red-900 outline-none"
                  />
                  <div className="text-[11px] font-semibold text-red-800 bg-red-100/60 p-2 rounded-lg mt-1">
                    খাদ কর্তন: {((wastageGrams / (grossGrams || 1)) * 100).toFixed(1)}% বাদ
                  </div>
                </div>

                {/* Net Pure Gold Output */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-emerald-800">
                    {t('নিট পাকা সোনা (পাকা ওজন)', 'Net Pure Gold Weight')}
                  </label>
                  <div className="w-full bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 text-sm font-black text-emerald-900">
                    {netPureGrams} গ্রাম
                  </div>
                  <div className="text-[11px] font-bold text-emerald-900 bg-emerald-100/80 p-2 rounded-lg mt-1">
                    = {netTraditional.vori} ভরি {netTraditional.ana} আনা {netTraditional.roti} রতি {netTraditional.point} পয়েন্ট
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & Remarks Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('মূল্য পরিশোধের মাধ্যম', 'Payment Method')}
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:ring-2 focus:ring-[#c59b27]/30 outline-none"
                >
                  <option value="cash">নগদ ক্যাশ (Cash Payment)</option>
                  <option value="bkash">বিকাশ / মোবাইল ব্যাংকিং (bKash/Nagad)</option>
                  <option value="bank">ব্যাংক ট্র্যান্সফার (Bank Account)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('মন্তব্য / বিশেষ নোট', 'Remarks / Special Note')}
                </label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder={t('কোনো বিশেষ দ্রষ্টব্য থাকলে লিখুন', 'Special note')}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#c59b27]/30 outline-none"
                />
              </div>

              {/* Total Calculation Display Card */}
              <div className="bg-gradient-to-br from-[#2b231d] to-[#1f1a16] text-white p-4 rounded-xl border border-[#c59b27]/50 flex flex-col justify-between shadow-md">
                <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  {t('মোট পরিশোধযোগ্য মূল্য', 'Total Payable Amount')}
                </span>
                <div className="text-2xl font-black text-amber-400 my-1">
                  BDT {totalAmount.toLocaleString('bn-BD')}
                </div>
                <span className="text-[10px] text-gray-300">
                  {numberToBanglaWords(totalAmount)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
              >
                {t('বাতিল করুন', 'Cancel')}
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-[#c59b27] hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <Printer size={16} />
                <span>{t('রশিদ সংরক্ষণ ও প্রিন্ট দেখুন', 'Save & Preview Receipt')}</span>
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        /* Receipts History List View */
        <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-md space-y-5">
          {/* Search & Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-gray-100 pb-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('গ্রাহকের নাম, মোবাইল বা রশিদ নং দিয়ে খুঁজুন...', 'Search by name, mobile or voucher no...')}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#c59b27]/30"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
              <span className="text-xs font-bold text-gray-500 whitespace-nowrap">ক্যারেট ফিল্টার:</span>
              {['all', '24', '22', '21', '18', '14', 'সনাতন', 'রূপা'].map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedKarats(k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedKarats === k
                      ? 'bg-[#c59b27] text-black shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {k === 'all' ? t('সব ক্যারেট', 'All Karats') : k}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-100/80 text-gray-700 font-bold border-b border-gray-200">
                  <th className="p-3.5 rounded-l-xl">তারিখ ও রশিদ নং</th>
                  <th className="p-3.5">গ্রাহক ও মোবাইল</th>
                  <th className="p-3.5">অলঙ্কার ও ক্যারেট</th>
                  <th className="p-3.5">গ্রস ওজন</th>
                  <th className="p-3.5">খাদ বাদ</th>
                  <th className="p-3.5">নিট সোনা</th>
                  <th className="p-3.5">পরিশোধিত টাকা</th>
                  <th className="p-3.5">মাধ্যম</th>
                  <th className="p-3.5 text-center rounded-r-xl">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      {t('কোনো পুরাতন সোনা ক্রয় রশিদ পাওয়া যায়নি।', 'No old gold purchase receipts found.')}
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((p) => {
                    const netTw = gramsToTraditional(p.netPureWeight);
                    return (
                      <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-gray-900">{p.voucherNo}</div>
                          <div className="text-[10px] text-gray-500">{p.date}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-gray-900">{p.customerName}</div>
                          <div className="text-[10px] text-gray-500">{p.customerMobile}</div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-gray-800">{p.itemName}</div>
                          <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                            {p.karat}
                          </span>
                        </td>

                        <td className="p-3.5 font-semibold text-gray-700">
                          {p.grossWeight} গ্রাম
                        </td>

                        <td className="p-3.5 text-red-600 font-semibold">
                          -{p.wastageDeduction} গ্রাম
                        </td>

                        <td className="p-3.5 font-bold text-emerald-800 bg-emerald-50/50 rounded-lg">
                          <div>{p.netPureWeight} গ্রাম</div>
                          <div className="text-[10px] text-emerald-700">
                            {netTw.vori}ভ {netTw.ana}আ {netTw.roti}র
                          </div>
                        </td>

                        <td className="p-3.5 font-black text-gray-900">
                          BDT {p.totalAmount.toLocaleString('bn-BD')}
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">
                            {p.paymentMethod}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setPreviewPurchase(p)}
                              title={t('প্রিন্ট রশিদ দেখুন', 'View Receipt')}
                              className="p-2 rounded-lg bg-amber-50 text-amber-900 hover:bg-amber-100 transition-all cursor-pointer"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              onClick={() => handleEdit(p)}
                              title={t('সম্পাদনা', 'Edit')}
                              className="p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all cursor-pointer"
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              onClick={() => handleDelete(p.id)}
                              title={t('মুছে ফেলুন', 'Delete')}
                              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all cursor-pointer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT PREVIEW / VOUCHER MODAL */}
      <AnimatePresence>
        {previewPurchase && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Top Actions */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-200 print:hidden">
                <div className="flex items-center gap-2">
                  <Printer size={18} className="text-[#c59b27]" />
                  <span className="font-bold text-sm text-gray-800">পুরাতন সোনা ক্রয় ভাউচার মেমো (Print Voucher)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c59b27] hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Printer size={15} />
                    <span>প্রিন্ট করুন</span>
                  </button>
                  <button
                    onClick={() => setPreviewPurchase(null)}
                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* PRINTABLE VOUCHER MEMO BODY */}
              <div ref={printRef} className="p-6 md:p-8 bg-white text-gray-900 border border-gray-200 rounded-2xl shadow-inner mt-4 print:p-0 print:border-none print:shadow-none">
                {/* Header Pad */}
                <div className="text-center border-b-2 border-amber-800/80 pb-4 mb-5">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-2xl">💎</span>
                    <h1 className="text-2xl font-black tracking-wide text-amber-900 uppercase">
                      দি আমিন জুয়েলার্স
                    </h1>
                  </div>
                  <p className="text-xs font-bold text-gray-700">
                    উন্নতমানের সোনা ও রূপার অলঙ্কার বিক্রেতা এবং পুরাতন স্বর্ণ ক্রয় কেন্দ্র
                  </p>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    ঠিকানা: প্রধান সড়ক, বহদ্দারহাট / ই পি জেড, চট্টগ্রাম। মোবাইল: ০১৮১X-XXXXXX
                  </p>

                  <div className="mt-3 inline-block bg-amber-900 text-amber-100 px-6 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-amber-700">
                    পুরাতন স্বর্ণ ক্রয় রশিদ / ভাউচার
                  </div>
                </div>

                {/* Voucher Meta & Customer Info */}
                <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
                  <div>
                    <p className="mb-1"><span className="font-bold text-gray-700">রশিদ নং:</span> <span className="font-mono font-bold text-amber-900">{previewPurchase.voucherNo}</span></p>
                    <p className="mb-1"><span className="font-bold text-gray-700">বিক্রেতা/গ্রাহক:</span> <span className="font-bold text-gray-900">{previewPurchase.customerName}</span></p>
                    <p className="mb-1"><span className="font-bold text-gray-700">মোবাইল:</span> {previewPurchase.customerMobile}</p>
                    <p><span className="font-bold text-gray-700">ঠিকানা:</span> {previewPurchase.customerAddress || 'চট্টগ্রাম'}</p>
                  </div>
                  <div className="text-right">
                    <p className="mb-1"><span className="font-bold text-gray-700">তারিখ:</span> {previewPurchase.date}</p>
                    <p className="mb-1"><span className="font-bold text-gray-700">NID কার্ড:</span> {previewPurchase.nidNo || 'N/A'}</p>
                    <p className="mb-1"><span className="font-bold text-gray-700">পরিশোধ মাধ্যম:</span> <span className="uppercase font-bold text-amber-900">{previewPurchase.paymentMethod}</span></p>
                  </div>
                </div>

                {/* Item & Weight Breakdown Table */}
                <table className="w-full text-left border-collapse text-xs mb-6 border border-gray-300">
                  <thead>
                    <tr className="bg-amber-100/70 text-amber-950 font-bold border-b border-gray-300">
                      <th className="p-2.5 border-r border-gray-300">বিবরণ</th>
                      <th className="p-2.5 border-r border-gray-300">ক্যারেট</th>
                      <th className="p-2.5 border-r border-gray-300">গ্রস ওজন</th>
                      <th className="p-2.5 border-r border-gray-300">খাদ বাদ</th>
                      <th className="p-2.5 border-r border-gray-300">নিট পাকা সোনা</th>
                      <th className="p-2.5 border-r border-gray-300">প্রতি ভরি দর</th>
                      <th className="p-2.5 text-right">মোট টাকা BDT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-900 font-medium">
                    <tr>
                      <td className="p-2.5 border-r border-gray-300 font-bold">{previewPurchase.itemName}</td>
                      <td className="p-2.5 border-r border-gray-300 font-semibold">{previewPurchase.karat}</td>
                      <td className="p-2.5 border-r border-gray-300">{previewPurchase.grossWeight} গ্রাম</td>
                      <td className="p-2.5 border-r border-gray-300 text-red-600">-{previewPurchase.wastageDeduction} গ্রাম</td>
                      <td className="p-2.5 border-r border-gray-300 font-bold text-emerald-900">
                        {previewPurchase.netPureWeight} গ্রাম
                        <div className="text-[10px] text-gray-600 font-normal">
                          ({gramsToTraditional(previewPurchase.netPureWeight).vori}ভ {gramsToTraditional(previewPurchase.netPureWeight).ana}আ {gramsToTraditional(previewPurchase.netPureWeight).roti}র)
                        </div>
                      </td>
                      <td className="p-2.5 border-r border-gray-300">BDT {previewPurchase.ratePerVori.toLocaleString('bn-BD')}</td>
                      <td className="p-2.5 text-right font-black text-amber-950 text-sm">
                        BDT {previewPurchase.totalAmount.toLocaleString('bn-BD')}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Amount in words & Terms */}
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 mb-8 space-y-2">
                  <p className="text-xs font-bold text-gray-900">
                    কথায় (In Words): <span className="text-amber-900 font-black">{numberToBanglaWords(previewPurchase.totalAmount)}</span>
                  </p>
                  <p className="text-[10px] text-gray-500 leading-relaxed italic">
                    * শর্তাবলী: ১. ক্রয়কৃত পুরাতন স্বর্ণের সঠিক মালিকানা গ্রাহক কর্তৃক ঘোষিত। ২. টাকা নগদে/বিকাশে প্রাপ্তি স্বীকার করা হইল।
                  </p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 gap-8 pt-12 mt-8 text-xs font-bold border-t border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="border-t border-gray-800 w-48 mx-auto pt-1"></div>
                    <span>বিক্রেতা / গ্রাহকের স্বাক্ষর</span>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-800 w-48 mx-auto pt-1"></div>
                    <span>কর্তৃপক্ষের স্বাক্ষর (দি আমিন জুয়েলার্স)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

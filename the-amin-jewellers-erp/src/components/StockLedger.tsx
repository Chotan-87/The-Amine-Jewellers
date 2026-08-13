import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Plus, Minus, Zap, Trash2, ShoppingCart, Search, PackageCheck, Scale, Barcode as BarcodeIcon, Printer, X, Calendar, Camera } from 'lucide-react';
import { StockItem, SalesItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import Barcode from 'react-barcode';
import { subscribeCollection, saveDocumentToFirestore, deleteDocumentFromFirestore } from '../lib/firestoreSync';

const initialCategories = [
  { id: 'ring', nameBangla: 'আংটি', nameEnglish: 'Ring', minLimit: 5 },
  { id: 'necklace', nameBangla: 'নেকলেস', nameEnglish: 'Necklace', minLimit: 2 },
  { id: 'earring', nameBangla: 'দুল', nameEnglish: 'Earring', minLimit: 2 },
  { id: 'earring-ring', nameBangla: 'কানের রিং', nameEnglish: 'Earring Ring', minLimit: 2 },
  { id: 'bangle', nameBangla: 'চুড়ি', nameEnglish: 'Bangle', minLimit: 2 },
  { id: 'chain', nameBangla: 'চেইন', nameEnglish: 'Chain', minLimit: 2 },
];

const initialStock: StockItem[] = [
  {
    id: 's1',
    code: 'AM-RG-101',
    nameBangla: '২২ক সোনার ডায়মন্ড কাট আংটি',
    nameEnglish: '22K Gold Ring',
    category: 'ring',
    karat: '22 Carat Gold',
    weight: 11.664,
    traditionalWeight: { vori: 1, ana: 0, roti: 0, point: 0 },
    count: 1,
    minLimit: 5,
    makingCharge: 2500,
    status: 'available'
  },
  {
    id: 's2',
    code: 'AM-NK-202',
    nameBangla: '২১ক গোল্ডেন ব্রাইডাল নেকলেস',
    nameEnglish: '21K Bridal Necklace',
    category: 'necklace',
    karat: '21 Carat Gold',
    weight: 23.328,
    traditionalWeight: { vori: 2, ana: 0, roti: 0, point: 0 },
    count: 1,
    minLimit: 2,
    makingCharge: 5000,
    status: 'available'
  }
];

interface StockLedgerProps {
  onAddToMemo?: (item: SalesItem) => void;
}

export default function StockLedger({ onAddToMemo }: StockLedgerProps) {
  const { t } = useLanguage();
  const [stock, setStock] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [thresholds, setThresholds] = useState(initialCategories);

  // Sync with Firestore
  useEffect(() => {
    const unsubscribe = subscribeCollection('stock', (data) => {
      setStock(data as StockItem[]);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPrintReport, setShowPrintReport] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatBangla, setNewCatBangla] = useState('');
  const [newCatEnglish, setNewCatEnglish] = useState('');

  // Form State
  const [code, setCode] = useState('AM-ST-' + Math.floor(100 + Math.random() * 900));
  const [nameBangla, setNameBangla] = useState('');
  const [nameEnglish, setNameEnglish] = useState('');
  const [category, setCategory] = useState('ring');
  const [karat, setKarat] = useState('22 Carat Gold');
  const [gramWeight, setGramWeight] = useState<number | ''>('');
  const [vori, setVori] = useState<number>(0);
  const [ana, setAna] = useState<number>(0);
  const [roti, setRoti] = useState<number>(0);
  const [point, setPoint] = useState<number>(0);
  const [makingCharge, setMakingCharge] = useState<number>(2000);
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [image, setImage] = useState<string | null>(null);
  
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [printingItem, setPrintingItem] = useState<StockItem | null>(null);
  const [barcodeQty, setBarcodeQty] = useState<number>(1);

  // Convert Vori, Ana, Roti, Point to Grams
  const syncGramsFromTraditional = (v: number, a: number, r: number, p: number) => {
    const totalGrams = (v * 11.664) + (a * (11.664 / 16)) + (r * (11.664 / 96)) + (p * (11.664 / 960));
    setGramWeight(totalGrams > 0 ? parseFloat(totalGrams.toFixed(3)) : '');
  };

  // Convert Grams to Vori, Ana, Roti, Point
  const handleGramsInputChange = (val: string) => {
    if (val === '') {
      setGramWeight('');
      setVori(0);
      setAna(0);
      setRoti(0);
      setPoint(0);
      return;
    }
    const g = parseFloat(val);
    setGramWeight(g);
    if (!isNaN(g) && g > 0) {
      const v = Math.floor(g / 11.664);
      let rem = g - (v * 11.664);
      const a = Math.floor(rem / (11.664 / 16));
      rem -= (a * (11.664 / 16));
      const r = Math.floor(rem / (11.664 / 96));
      rem -= (r * (11.664 / 96));
      const p = Math.round(rem / (11.664 / 960));
      setVori(v);
      setAna(a);
      setRoti(r);
      setPoint(p);
    }
  };

  const handleVoriChange = (v: number) => {
    setVori(v);
    syncGramsFromTraditional(v, ana, roti, point);
  };

  const handleAnaChange = (a: number) => {
    setAna(a);
    syncGramsFromTraditional(vori, a, roti, point);
  };

  const handleRotiChange = (r: number) => {
    setRoti(r);
    syncGramsFromTraditional(vori, ana, r, point);
  };

  const handlePointChange = (p: number) => {
    setPoint(p);
    syncGramsFromTraditional(vori, ana, roti, p);
  };

  const updateThreshold = (id: string, delta: number) => {
    setThresholds(prev => prev.map(cat => 
      cat.id === id ? { ...cat, minLimit: Math.max(0, cat.minLimit + delta) } : cat
    ));
  };

  const handleAddCategory = () => {
    if (!newCatBangla.trim()) return;
    const newId = newCatBangla.toLowerCase().replace(/\s+/g, '-');
    setThresholds([...thresholds, { id: newId, nameBangla: newCatBangla, nameEnglish: newCatEnglish || newCatBangla, minLimit: 2 }]);
    setCategory(newId);
    setNewCatBangla('');
    setNewCatEnglish('');
    setShowAddCatModal(false);
  };

  const handleAddStock = (e: any) => {
    e.preventDefault();
    if (!nameBangla.trim()) return;

    // Weight calculation in grams
    const grams = typeof gramWeight === 'number' && gramWeight > 0 
      ? gramWeight 
      : (vori * 11.664) + (ana * (11.664 / 16)) + (roti * (11.664 / 96)) + (point * (11.664 / 960));

    const newItem: StockItem = {
      id: Date.now().toString(),
      code: code || 'AM-ST-' + Math.floor(100 + Math.random() * 900),
      nameBangla,
      nameEnglish: nameEnglish || nameBangla,
      category,
      karat,
      weight: parseFloat(grams.toFixed(3)),
      traditionalWeight: { vori, ana, roti, point },
      count: 1,
      minLimit: 2,
      makingCharge,
      status: 'available',
      date: entryDate,
      image: image || undefined
    };

    // Save to Firestore
    saveDocumentToFirestore('stock', newItem.id, newItem);

    // Reset Form
    setCode('AM-ST-' + Math.floor(100 + Math.random() * 900));
    setNameBangla('');
    setNameEnglish('');
    setGramWeight('');
    setVori(0);
    setAna(0);
    setRoti(0);
    setPoint(0);
    setImage(null);
    setEntryDate(new Date().toISOString().split('T')[0]);
  };

  const handleDeleteItem = (id: string) => {
    deleteDocumentFromFirestore('stock', id);
  };

  const handleSendToMemo = (item: StockItem) => {
    if (!onAddToMemo) return;
    // Estimate rate based on Karat
    const ratePerVori = item.karat.includes('22') ? 125400 : item.karat.includes('21') ? 119700 : 102600;
    const goldVal = (item.weight / 11.664) * ratePerVori;
    const wastageVal = goldVal * 0.05;

    const salesItem: SalesItem = {
      id: Date.now().toString(),
      name: item.nameBangla,
      karat: item.karat,
      weight: item.weight,
      traditionalWeight: item.traditionalWeight,
      ratePerVori,
      goldValue: Math.round(goldVal),
      wastageValue: Math.round(wastageVal),
      makingCharge: item.makingCharge,
      total: Math.round(goldVal + wastageVal + item.makingCharge)
    };

    onAddToMemo(salesItem);
  };

  const filteredStock = stock.filter(item => {
    const matchesSearch = (item.nameBangla || '').includes(searchQuery) ||
      (item.code || '').includes(searchQuery) ||
      (item.nameEnglish || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const itemDate = item.date || '';
    const matchesStartDate = startDate ? itemDate >= startDate : true;
    const matchesEndDate = endDate ? itemDate <= endDate : true;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const getCategoryCount = (catId: string) => {
    return stock.filter(item => item.category === catId && item.status === 'available').length;
  };

  return (
    <div className="flex flex-col min-h-full bg-[#fcfaf7]">
      <div className="p-6 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Low Stock Warning Banner */}
        <section className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
            <AlertTriangle size={18} />
            <span>⚠️ কম স্টক সতর্কতা! (LOW STOCK WARNING)</span>
          </div>
          <p className="text-[10px] text-red-400 font-medium -mt-1">নিচের ক্যাটাগরিগুলোর অলঙ্কার মজুদ আপনার সেট করা নূন্যতম সীমা বা থ্রেশহোল্ডের নিচে নেমে গেছে।</p>
          <div className="flex flex-wrap gap-2">
            {thresholds.map(cat => {
              const currentCount = getCategoryCount(cat.id);
              const isLow = currentCount < cat.minLimit;
              return (
                <span 
                  key={cat.id} 
                  className={`border text-[10px] px-3 py-1.5 rounded-full shadow-sm font-medium transition-all ${
                    isLow ? 'bg-red-100 text-red-800 border-red-200 font-bold' : 'bg-white text-gray-600 border-gray-100'
                  }`}
                >
                  {cat.nameBangla} (মজুদ: {currentCount} / সীমা: {cat.minLimit})
                </span>
              );
            })}
          </div>
        </section>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">মোট মজুদ অলঙ্কার (TOTAL ITEMS)</span>
            <div className="text-2xl font-bold text-gray-900">{stock.length} টি</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">বিক্রয়যোগ্য মজুদ (AVAILABLE)</span>
            <div className="text-2xl font-bold text-green-600">{stock.filter(s => s.status === 'available').length} টি</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">মোট ওজন (TOTAL WEIGHT)</span>
            <div className="text-2xl font-bold text-orange-500">{stock.reduce((a, b) => a + b.weight, 0).toFixed(2)} Grams</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Entry Form */}
          <form onSubmit={handleAddStock} className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col gap-8">
            <h3 className="text-lg font-bold text-gray-800">অলঙ্কার স্টক খাতা - নতুন স্টক এন্ট্রি</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">অলঙ্কার কোড (Item Code)</label>
                  <span className="bg-yellow-50 text-yellow-700 text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Zap size={8} /> QS টোকেন
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  <input 
                    type="text" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. AM-RG-105" 
                    className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#c59b27]/20" 
                  />
                  {code && (
                    <div className="bg-white border border-gray-100 rounded-xl p-2 flex flex-col items-center justify-center shadow-sm">
                      <Barcode 
                        value={code} 
                        width={1.2} 
                        height={30} 
                        fontSize={10} 
                        background="#ffffff"
                        lineColor="#000000"
                        margin={0}
                      />
                      <span className="text-[8px] text-gray-400 font-bold mt-1">BARCODE PREVIEW</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">অলঙ্কার নাম - বাংলা *</label>
                <input 
                  type="text" 
                  required
                  value={nameBangla}
                  onChange={(e) => setNameBangla(e.target.value)}
                  placeholder="যেমন: ডায়মন্ড কাট আংটি" 
                  className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c59b27]/20" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">অলঙ্কার নাম - ইংরেজী</label>
                <input 
                  type="text" 
                  value={nameEnglish}
                  onChange={(e) => setNameEnglish(e.target.value)}
                  placeholder="e.g. Diamond Cut Ring" 
                  className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#c59b27]/20" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">ক্যাটাগরি</label>
                  <button 
                    type="button"
                    onClick={() => setShowAddCatModal(true)}
                    className="bg-yellow-50 text-yellow-700 text-[8px] font-bold px-1.5 py-0.5 rounded hover:bg-yellow-100 transition-colors"
                  >
                    + নতুন
                  </button>
                </div>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm focus:outline-none"
                >
                  {thresholds.map(cat => <option key={cat.id} value={cat.id}>{cat.nameBangla} ({cat.nameEnglish})</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">ক্যারেট মান</label>
                <select 
                  value={karat}
                  onChange={(e) => setKarat(e.target.value)}
                  className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm focus:outline-none"
                >
                  <option value="22 Carat Gold">22 Carat Gold</option>
                  <option value="21 Carat Gold">21 Carat Gold</option>
                  <option value="18 Carat Gold">18 Carat Gold</option>
                  <option value="Traditional Gold">Traditional Gold</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">অলঙ্কার ছবি (Image - Camera/Upload)</label>
                <div className="flex flex-col gap-2">
                  {image ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setImage(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Camera size={24} className="text-gray-400 mb-2" />
                        <p className="text-[10px] text-gray-500 font-bold uppercase">ক্লিক করে ছবি তুলুন বা আপলোড করুন</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        capture="environment"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">এন্ট্রি তারিখ (Entry Date)</label>
                <input 
                  type="date" 
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#c59b27]/20" 
                />
              </div>

              {/* Weight Measurement & Gram Entry Card */}
              <div className="md:col-span-3 bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale size={16} className="text-amber-700" />
                    <span className="text-xs font-black text-amber-900 uppercase tracking-tight">
                      {t('ওজন পরিমাপ ও গ্রাম হিসাব (Weight & Gram Entry)', 'Weight Measurement & Gram Entry')}
                    </span>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-black border border-amber-300/50">
                    {t('১ ভরি = ১১.৬৬৪ গ্রাম', '1 Bhori = 11.664 Grams')}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {/* Gram Input */}
                  <div className="col-span-2 md:col-span-1 flex flex-col gap-1">
                    <label className="text-[10px] font-black text-amber-900 uppercase flex items-center gap-1">
                      <span>{t('ওজন (গ্রাম / Grams)', 'Weight (Grams)')}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.001"
                        min="0"
                        placeholder="0.000"
                        value={gramWeight} 
                        onChange={(e) => handleGramsInputChange(e.target.value)}
                        className="w-full bg-white border-2 border-amber-400 rounded-xl p-2.5 text-sm font-black text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500/30 text-center shadow-sm" 
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-700 pointer-events-none">g</span>
                    </div>
                  </div>

                  {/* Vori Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase">{t('ভরি (Bhori)', 'Bhori')}</label>
                    <input 
                      type="number" 
                      min="0"
                      value={vori} 
                      onChange={(e) => handleVoriChange(Number(e.target.value))}
                      className="bg-white border border-gray-200 rounded-xl p-2.5 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20" 
                    />
                  </div>

                  {/* Ana Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase">{t('আনা (Ana)', 'Ana')}</label>
                    <input 
                      type="number" 
                      min="0"
                      max="15"
                      value={ana} 
                      onChange={(e) => handleAnaChange(Number(e.target.value))}
                      className="bg-white border border-gray-200 rounded-xl p-2.5 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20" 
                    />
                  </div>

                  {/* Roti Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase">{t('রতি (Roti)', 'Roti')}</label>
                    <input 
                      type="number" 
                      min="0"
                      max="5"
                      value={roti} 
                      onChange={(e) => handleRotiChange(Number(e.target.value))}
                      className="bg-white border border-gray-200 rounded-xl p-2.5 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20" 
                    />
                  </div>

                  {/* Point Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-600 uppercase">{t('পয়েন্ট (Point)', 'Point')}</label>
                    <input 
                      type="number" 
                      min="0"
                      max="9"
                      value={point} 
                      onChange={(e) => handlePointChange(Number(e.target.value))}
                      className="bg-white border border-gray-200 rounded-xl p-2.5 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-amber-500/20" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{t('মজুরি (Making Charge ৳)', 'Making Charge (৳)')}</label>
                <input 
                  type="number" 
                  value={makingCharge} 
                  onChange={(e) => setMakingCharge(Number(e.target.value))}
                  className="bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#c59b27]/20" 
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-orange-100 transition-all flex items-center gap-2"
              >
                <PackageCheck size={18} />
                স্টকে যুক্ত করুন
              </button>
            </div>
          </form>

          {/* Threshold Settings Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-2">স্টক থ্রেশহোল্ড সেটিং:</h3>
                <p className="text-[10px] text-gray-400 font-medium">প্রতিটি ক্যাটাগরির জন্য নূন্যতম পরিমাণ সেট করুন।</p>
              </div>

              <div className="flex flex-col gap-3">
                {thresholds.map(cat => (
                  <div key={cat.id} className="bg-red-50/50 border border-red-100/50 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-gray-800">{cat.nameBangla} ({cat.nameEnglish})</div>
                      <div className="text-[10px] text-red-500 font-medium">মজুদ: {getCategoryCount(cat.id)} টি (সীমা: {cat.minLimit})</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCategory(cat.id)}
                        className="bg-yellow-50 text-yellow-700 text-[8px] font-bold px-2 py-1 rounded flex items-center gap-1 border border-yellow-100 hover:bg-yellow-100"
                      >
                        <Zap size={8} /> সিলেক্ট
                      </button>
                      <div className="flex items-center bg-white border border-gray-100 rounded-md">
                        <button type="button" onClick={() => updateThreshold(cat.id, -1)} className="p-1 hover:bg-gray-50 text-gray-400"><Minus size={12} /></button>
                        <span className="w-6 text-center text-xs font-bold text-gray-700">{cat.minLimit}</span>
                        <button type="button" onClick={() => updateThreshold(cat.id, 1)} className="p-1 hover:bg-gray-50 text-gray-400"><Plus size={12} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stock List Table */}
        <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold text-gray-800">মজুদ অলঙ্কার খতিয়ান তালিকা</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Stock Inventory Ledger</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => setShowPrintReport(true)}
                className="bg-[#1a1614] hover:bg-black text-amber-400 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-amber-900/10 cursor-pointer"
              >
                <Printer size={16} />
                রিপোর্ট প্রিন্ট
              </button>

              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5">
                <Calendar size={14} className="text-gray-400" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-[10px] font-bold focus:outline-none py-[3px] px-[4px]"
                />
                <span className="text-gray-300 font-bold">থেকে</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-[10px] font-bold focus:outline-none py-[3px] px-[3px]"
                />
                {(startDate || endDate) && (
                  <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-gray-400 hover:text-red-500">
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="relative flex-1 md:flex-none md:w-[400px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="text" 
                  placeholder="কোড বা নাম দিয়ে সার্চ..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[35px] bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-4 text-[12px] focus:outline-none focus:ring-2 focus:ring-[#c59b27]/20"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <tr>
                  <th className="p-3">কোড</th>
                  <th className="p-3">ছবি</th>
                  <th className="p-3">অলঙ্কার নাম</th>
                  <th className="p-3">ক্যারেট</th>
                  <th className="p-3">ওজন (ভরি-আনা-রতি)</th>
                  <th className="p-3">মজুরি</th>
                  <th className="p-3">অবস্থা</th>
                  <th className="p-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStock.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-[#c59b27]">{item.code}</span>
                        <div className="scale-75 origin-left -ml-2">
                          <Barcode 
                            value={item.code} 
                            width={1} 
                            height={25} 
                            fontSize={10} 
                            margin={0}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {item.image ? (
                        <img src={item.image} alt={item.nameBangla} className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                          <PackageCheck size={14} className="text-gray-300" />
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-gray-800">{item.nameBangla}</div>
                      <div className="text-[10px] text-gray-400">{item.nameEnglish}</div>
                    </td>
                    <td className="p-3 font-bold">{item.karat}</td>
                    <td className="p-3 font-bold">
                      {item.traditionalWeight.vori}ভ {item.traditionalWeight.ana}আ {item.traditionalWeight.roti}র ({item.weight}g)
                    </td>
                    <td className="p-3 font-bold text-green-600">৳ {item.makingCharge.toLocaleString('bn-BD')}</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">এভেইলেবল</span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {onAddToMemo && (
                          <button 
                            onClick={() => handleSendToMemo(item)}
                            className="bg-[#c59b27] hover:bg-[#a68221] text-black text-[10px] font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition-all"
                          >
                            <ShoppingCart size={12} /> মেমোতে যোগ
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setPrintingItem(item);
                            setBarcodeQty(1);
                            setShowBarcodeModal(true);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded-lg transition-colors"
                          title="প্রিন্ট বারকোড"
                        >
                          <Printer size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-500 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStock.length === 0 && (
              <div className="text-center py-10 opacity-40 font-bold">কোনো স্টক আইটেম পাওয়া যায়নি</div>
            )}
          </div>
        </section>

      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCatModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl">
              <h3 className="font-bold text-gray-800 text-base">নতুন ক্যাটাগরি যুক্ত করুন</h3>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-bold">বাংলা নাম (যেমন: নূপুর)</label>
                <input 
                  type="text" 
                  value={newCatBangla}
                  onChange={(e) => setNewCatBangla(e.target.value)}
                  className="border p-2 rounded-xl text-sm" 
                  placeholder="নূপুর"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-500 font-bold">ইংরেজি নাম (e.g. Anklet)</label>
                <input 
                  type="text" 
                  value={newCatEnglish}
                  onChange={(e) => setNewCatEnglish(e.target.value)}
                  className="border p-2 rounded-xl text-sm" 
                  placeholder="Anklet"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowAddCatModal(false)} className="px-4 py-2 text-xs font-bold text-gray-400">বাতিল</button>
                <button onClick={handleAddCategory} className="px-4 py-2 text-xs font-bold bg-[#c59b27] text-black rounded-xl">সেভ করুন</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barcode Print Modal */}
      <AnimatePresence>
        {showBarcodeModal && printingItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-8 w-full max-w-sm flex flex-col gap-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                    <BarcodeIcon size={20} />
                  </div>
                  <h3 className="font-black text-gray-900 text-lg">বারকোড প্রিন্ট</h3>
                </div>
                <button 
                  onClick={() => setShowBarcodeModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">প্রিন্ট সংখ্যা (Quantity)</label>
                  <div className="flex flex-wrap gap-2">
                    {[10, 20, 50, 100].map(q => (
                      <button
                        key={q}
                        onClick={() => setBarcodeQty(q)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${barcodeQty === q ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {q} টি
                      </button>
                    ))}
                    <input 
                      type="number"
                      value={barcodeQty}
                      onChange={(e) => setBarcodeQty(parseInt(e.target.value) || 1)}
                      className="w-16 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1 text-xs font-bold text-center"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-4" id="barcode-print-area">
                  {/* For single preview in UI */}
                  <div className="flex flex-col items-center gap-4 print:hidden">
                    <div className="text-center">
                      <div className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-1">THE AMIN JEWELLERS</div>
                      <div className="text-xs font-bold text-gray-800">{printingItem.nameBangla}</div>
                    </div>
                    
                    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                      <Barcode 
                        value={printingItem.code} 
                        width={1.5} 
                        height={50} 
                        fontSize={14}
                        margin={0}
                      />
                    </div>

                    <div className="flex flex-col items-center text-[10px] font-black text-gray-600 gap-0.5">
                      <span>ওজন: {printingItem.traditionalWeight.vori}ভ {printingItem.traditionalWeight.ana}আ {printingItem.traditionalWeight.roti}র</span>
                      <span>ক্যারেট: {printingItem.karat}</span>
                    </div>
                  </div>

                  {/* Batch Container for Print Only */}
                  <div className="hidden print:grid print:grid-cols-3 print:gap-4 w-full">
                    {Array.from({ length: barcodeQty }).map((_, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 border border-gray-200 p-3 rounded-lg page-break-inside-avoid mb-4">
                        <div className="text-center">
                          <div className="text-[8px] font-black text-gray-900 uppercase tracking-widest leading-tight">THE AMIN JEWELLERS</div>
                          <div className="text-[9px] font-bold text-gray-800 leading-tight">{printingItem.nameBangla}</div>
                        </div>
                        <Barcode 
                          value={printingItem.code} 
                          width={1} 
                          height={30} 
                          fontSize={10}
                          margin={0}
                        />
                        <div className="flex flex-col items-center text-[8px] font-black text-gray-500 gap-0">
                          <span>W: {printingItem.traditionalWeight.vori}V {printingItem.traditionalWeight.ana}A {printingItem.traditionalWeight.roti}R</span>
                          <span>K: {printingItem.karat}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => window.print()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Printer size={18} />
                  প্রিন্ট করুন (Print Now)
                </button>
                <button 
                  onClick={() => setShowBarcodeModal(false)} 
                  className="w-full border border-gray-200 text-gray-500 font-bold py-3 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stock Report Print Modal */}
      <AnimatePresence>
        {showPrintReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="bg-[#1a1614] text-white p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500 text-black rounded-2xl">
                    <Printer size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">মজুদ অলঙ্কার রিপোর্ট</h3>
                    <p className="text-xs text-amber-300 font-bold">
                      {startDate || endDate ? `${startDate} থেকে ${endDate} পর্যন্ত` : 'সম্পূর্ণ মজুদ তালিকা'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowPrintReport(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8" id="stock-report-area">
                <div className="flex flex-col gap-8 print:p-0">
                  <div className="hidden print:flex flex-col items-center text-center border-b-2 border-black pb-6 mb-4">
                    <h1 className="text-3xl font-black text-gray-900">দি আমিন জুয়েলার্স</h1>
                    <p className="text-sm font-bold text-gray-600">উন্নত মানের স্বর্ণ ও রৌপ্য অলঙ্কার বিক্রেতা</p>
                    <div className="mt-4 bg-black text-white px-6 py-1 rounded-full text-lg font-bold uppercase tracking-widest">মজুদ অলঙ্কার খতিয়ান রিপোর্ট</div>
                    <p className="text-[10px] font-bold text-gray-400 mt-2">প্রিন্ট সময়: {new Date().toLocaleString('bn-BD')}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-2 print:grid-cols-3">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">মোট আইটেম</p>
                      <p className="text-2xl font-black text-gray-900">{filteredStock.length} টি</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                      <p className="text-[10px] font-black text-amber-700 uppercase mb-1">মোট ওজন (গ্রাম)</p>
                      <p className="text-2xl font-black text-amber-900">{filteredStock.reduce((a, b) => a + b.weight, 0).toFixed(2)} g</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                      <p className="text-[10px] font-black text-emerald-700 uppercase mb-1">মোট মজুরি</p>
                      <p className="text-2xl font-black text-emerald-900">৳ {filteredStock.reduce((a, b) => a + b.makingCharge, 0).toLocaleString('bn-BD')}</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-3xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 font-black text-gray-600 uppercase tracking-tighter border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-4">কোড</th>
                          <th className="px-4 py-4">তারিখ</th>
                          <th className="px-4 py-4">অলঙ্কার নাম</th>
                          <th className="px-4 py-4">ক্যারেট</th>
                          <th className="px-4 py-4">ওজন (ভরি)</th>
                          <th className="px-4 py-4 text-right">মজুরি</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredStock.map((item) => (
                          <tr key={item.id} className="text-gray-800 font-bold">
                            <td className="px-4 py-4 text-amber-700">{item.code}</td>
                            <td className="px-4 py-4">{item.date}</td>
                            <td className="px-4 py-4">
                              <div>{item.nameBangla}</div>
                              <div className="text-[9px] text-gray-400">{item.nameEnglish}</div>
                            </td>
                            <td className="px-4 py-4">{item.karat}</td>
                            <td className="px-4 py-4">
                              {item.traditionalWeight.vori}ভ {item.traditionalWeight.ana}আ {item.traditionalWeight.roti}র
                            </td>
                            <td className="px-4 py-4 text-right">৳{item.makingCharge.toLocaleString('bn-BD')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="hidden print:flex justify-between items-center mt-12 pt-8 border-t border-dashed border-gray-300">
                    <div className="flex flex-col items-center">
                      <div className="w-32 border-t border-black mb-1" />
                      <span className="text-[10px] font-bold">ম্যানেজার স্বাক্ষর</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-32 border-t border-black mb-1" />
                      <span className="text-[10px] font-bold">মালিক স্বাক্ষর</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 print:hidden">
                <button onClick={() => setShowPrintReport(false)} className="px-6 py-3 bg-white border border-gray-200 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all">বাতিল</button>
                <button onClick={() => window.print()} className="px-8 py-3 bg-amber-500 text-black font-black rounded-2xl hover:bg-amber-400 shadow-lg shadow-amber-200 flex items-center gap-2">
                  <Printer size={18} /> রিপোর্ট প্রিন্ট করুন
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #barcode-print-area, #barcode-print-area *,
          #stock-report-area, #stock-report-area * {
            visibility: visible;
          }
          #barcode-print-area, #stock-report-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            transform: none !important;
            border: none !important;
            background: white !important;
            padding: 20px !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:flex {
            display: flex !important;
          }
          .print\\:grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
      `}} />
    </div>
  );
}

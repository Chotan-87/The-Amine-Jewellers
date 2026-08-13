import React, { useState, useEffect, useMemo } from 'react';
import { Users, Search, Plus, Phone, Mail, MapPin, Star, History, TrendingUp, ExternalLink, UserPlus, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeCollection, saveDocumentToFirestore } from '../lib/firestoreSync';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  totalPurchases: number;
  totalSpent: number;
  loyaltyPoints: number;
  lastVisit: string;
  category: 'Gold' | 'Silver' | 'Platinum' | 'Regular';
}

export default function CustomerCRM() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Firestore
  useEffect(() => {
    const unsubscribe = subscribeCollection('customers', (data) => {
      setCustomers(data as Customer[]);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<Customer | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<'Gold' | 'Silver' | 'Platinum' | 'Regular'>('Regular');

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newCustomer: Customer = {
      id: 'C-' + Date.now(),
      name,
      phone,
      email,
      address: address || 'চট্টগ্রাম',
      totalPurchases: 1,
      totalSpent: 0,
      loyaltyPoints: 50,
      lastVisit: new Date().toISOString().split('T')[0],
      category
    };

    saveDocumentToFirestore('customers', newCustomer.id, newCustomer);
    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  const handleDownloadCSV = () => {
    const headers = ['Name,Phone,Address,Category,LoyaltyPoints,TotalSpent\n'];
    const rows = customers.map(c => `"${c.name}",${c.phone},"${c.address}",${c.category},${c.loyaltyPoints},${c.totalSpent}`).join('\n');
    const blob = new Blob([...headers, rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_crm_directory.csv';
    a.click();
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = (c.name || '').includes(search) || (c.phone || '').includes(search);
      const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [customers, search, categoryFilter]);

  const stats = useMemo(() => {
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgSpent = customers.length ? totalSpent / customers.length : 0;
    return {
      total: customers.length,
      totalSpent,
      avgSpent: Math.round(avgSpent)
    };
  }, [customers]);

  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 bg-[#fcfaf7] min-h-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="text-[#c59b27]" size={28} />
            গ্রাহক খাতা ও লয়্যালটি (Customer CRM)
          </h1>
          <p className="text-xs text-gray-500 font-medium">আপনার নিয়মিত গ্রাহকদের তথ্য, ক্রয় ইতিহাস এবং লয়্যালটি পয়েন্ট পরিচালনা করুন।</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#1a1614] hover:bg-black text-[#c59b27] font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl transition-all text-sm group"
        >
          <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
          নতুন গ্রাহক যুক্ত করুন
        </button>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase">মোট নিবন্ধিত গ্রাহক</span>
            <span className="text-xl font-bold text-gray-800">{stats.total} জন</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#c59b27]/10 rounded-2xl flex items-center justify-center text-[#c59b27]">
            <TrendingUp size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase">মোট বিক্রয় (গ্রাহক ভিত্তিক)</span>
            <span className="text-xl font-bold text-gray-800">৳ {stats.totalSpent.toLocaleString('bn-BD')}</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <Star size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase">গড় ক্রয় ভ্যালু</span>
            <span className="text-xl font-bold text-gray-800">৳ {stats.avgSpent.toLocaleString('bn-BD')}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#c59b27]/20 transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['All', 'Platinum', 'Gold', 'Silver', 'Regular'].map(cat => (
            <button 
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                categoryFilter === cat 
                  ? 'bg-[#1a1614] text-[#c59b27]' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {cat === 'All' ? 'সকল' : cat}
            </button>
          ))}
          <button onClick={handleDownloadCSV} className="p-2 bg-gray-50 text-gray-600 hover:bg-[#c59b27] hover:text-black rounded-xl transition-all" title="সিএসভি ডাউনলোড">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCustomers.map((c) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={c.id}
              className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[10px] font-bold uppercase tracking-wider ${
                c.category === 'Platinum' ? 'bg-purple-600 text-white' :
                c.category === 'Gold' ? 'bg-[#c59b27] text-black' :
                c.category === 'Silver' ? 'bg-gray-400 text-white' :
                'bg-gray-100 text-gray-600'
              }`}>
                {c.category} Member
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 font-bold text-xl uppercase border-2 border-white shadow-inner">
                  {c.name[0]}
                </div>
                <div className="flex flex-col gap-0.5">
                  <h3 className="font-bold text-gray-900 group-hover:text-[#c59b27] transition-colors">{c.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={12} className="text-[#c59b27]" />
                    {c.phone}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <div className="text-[9px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                    <Star size={10} className="text-[#c59b27]" /> লয়্যালটি পয়েন্ট
                  </div>
                  <div className="text-sm font-bold text-gray-800">{c.loyaltyPoints} PTS</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <div className="text-[9px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                    <History size={10} className="text-blue-500" /> মোট অর্ডার
                  </div>
                  <div className="text-sm font-bold text-gray-800">{c.totalPurchases} টি</div>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                  <MapPin size={12} className="text-gray-400" />
                  {c.address}
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <button 
                  onClick={() => setSelectedHistory(c)}
                  className="flex-1 bg-gray-50 text-gray-600 hover:bg-[#c59b27]/10 hover:text-[#c59b27] py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <History size={14} /> ইতিহাস দেখুন
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Customer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <form onSubmit={handleAddCustomer} className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl relative">
              <button type="button" onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-gray-400"><X size={20} /></button>
              <h3 className="font-bold text-gray-800 text-lg border-b pb-2">নতুন গ্রাহক যুক্ত করুন</h3>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">গ্রাহকের নাম *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="যেমন: রহিম উল্লাহ" className="bg-gray-50 border p-2.5 rounded-xl text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">মোবাইল নম্বর *</label>
                <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="018XXXXXXXX" className="bg-gray-50 border p-2.5 rounded-xl text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">ঠিকানা</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="যেমন: আন্দরকিল্লা, চট্টগ্রাম" className="bg-gray-50 border p-2.5 rounded-xl text-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">ক্যাটাগরি</label>
                <select value={category} onChange={e => setCategory(e.target.value as any)} className="bg-gray-50 border p-2.5 rounded-xl text-sm">
                  <option value="Regular">Regular</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500">বাতিল</button>
                <button type="submit" className="px-6 py-2.5 text-xs font-bold bg-[#c59b27] text-black rounded-xl">সংরক্ষণ করুন</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {selectedHistory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl relative">
              <button onClick={() => setSelectedHistory(null)} className="absolute top-4 right-4 text-gray-400"><X size={20} /></button>
              <h3 className="font-bold text-gray-800 text-lg border-b pb-2">{selectedHistory.name} - ক্রয় ইতিহাস</h3>
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span>সর্বমোট লেনদেন:</span>
                  <span className="font-bold">৳ {selectedHistory.totalSpent.toLocaleString('bn-BD')}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span>মোট অর্ডার সংখ্যা:</span>
                  <span className="font-bold">{selectedHistory.totalPurchases} টি</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
                  <span>লয়্যালটি পয়েন্ট অর্জিত:</span>
                  <span className="font-bold text-[#c59b27]">{selectedHistory.loyaltyPoints} PTS</span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => setSelectedHistory(null)} className="px-6 py-2 text-xs font-bold bg-[#1a1614] text-[#c59b27] rounded-xl">বন্ধ করুন</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

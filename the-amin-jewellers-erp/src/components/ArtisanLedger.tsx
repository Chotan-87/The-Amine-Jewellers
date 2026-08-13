import React, { useState, useEffect } from 'react';
import { HardHat, Plus, Search, User, Phone, Briefcase, Zap, Banknote, Scale, CheckCircle, Clock, X, Printer, FileText, Sparkles, AlertCircle, MessageSquare, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Artisan, ArtisanJob } from '../types';
import { subscribeCollection, saveDocumentToFirestore, deleteDocumentFromFirestore } from '../lib/firestoreSync';

// Utility helper to convert grams to Traditional Bangladeshi units (Vori, Ana, Roti, Point)
function convertGramsToTraditional(grams: number) {
  if (!grams || isNaN(grams) || grams <= 0) {
    return { vori: 0, ana: 0, roti: 0, point: 0, text: '০ ভরি ০ আনা ০ রতি ০ পয়েন্ট' };
  }
  const totalPoints = Math.round(grams / 0.01215);
  const vori = Math.floor(totalPoints / 960);
  const remVori = totalPoints % 960;
  const ana = Math.floor(remVori / 60);
  const remAna = remVori % 60;
  const roti = Math.floor(remAna / 10);
  const point = remAna % 10;

  const toBn = (n: number) => n.toLocaleString('bn-BD');
  const text = `${toBn(vori)} ভরি ${toBn(ana)} আনা ${toBn(roti)} রতি ${toBn(point)} পয়েন্ট`;
  return { vori, ana, roti, point, text };
}

export default function ArtisanLedger() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [jobs, setJobs] = useState<ArtisanJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Firestore
  useEffect(() => {
    const unsubscribeArtisans = subscribeCollection('artisans', (data) => {
      setArtisans(data as Artisan[]);
    });
    const unsubscribeJobs = subscribeCollection('artisan_jobs', (data) => {
      setJobs(data as ArtisanJob[]);
      setIsLoading(false);
    });
    return () => {
      unsubscribeArtisans();
      unsubscribeJobs();
    };
  }, []);

  const [search, setSearch] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);

  // Modal States
  const [showAddArtisanModal, setShowAddArtisanModal] = useState(false);
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);

  const [selectedArtisanId, setSelectedArtisanId] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<ArtisanJob | null>(null);

  // New Artisan Form State
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [specialty, setSpecialty] = useState('');

  // New Job Form State
  const [jobItemName, setJobItemName] = useState('');
  const [jobKarat, setJobKarat] = useState('২২ ক্যারেট');
  const [jobWeight, setJobWeight] = useState<number>(11.664);
  const [jobWage, setJobWage] = useState<number>(3000);

  // Receive Job Form State (স্বর্ণের ওজন বিবরণী)
  const [receiveWeight, setReceiveWeight] = useState<number>(11.000);
  const [receiveWastage, setReceiveWastage] = useState<number>(0.664);
  const [receivePaidWage, setReceivePaidWage] = useState<number>(3000);
  const [receiveRemarks, setReceiveRemarks] = useState('');

  // Active Voucher Data
  const [activeVoucherJob, setActiveVoucherJob] = useState<ArtisanJob | null>(null);
  const [activeVoucherArtisan, setActiveVoucherArtisan] = useState<Artisan | null>(null);

  // Add Artisan Handler
  const handleAddArtisan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;

    const newArtisan: Artisan = {
      id: 'A-' + Date.now(),
      name,
      mobile,
      specialty: specialty || 'সাধারণ গয়না',
      goldBalance: 0,
      wageBalance: 0
    };

    saveDocumentToFirestore('artisans', newArtisan.id, newArtisan);
    setShowAddArtisanModal(false);
    setName('');
    setMobile('');
    setSpecialty('');
  };

  // Add Job Handler
  const handleAddJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobItemName || !selectedArtisanId) return;

    const newJob: ArtisanJob = {
      id: 'J-' + Date.now(),
      artisanId: selectedArtisanId,
      itemName: jobItemName,
      karat: jobKarat,
      givenWeight: jobWeight,
      wage: jobWage,
      date: new Date().toLocaleDateString('bn-BD'),
      status: 'pending'
    };

    saveDocumentToFirestore('artisan_jobs', newJob.id, newJob);
    
    // Update artisan gold balance and wage balance
    const artisan = artisans.find(a => a.id === selectedArtisanId);
    if (artisan) {
      saveDocumentToFirestore('artisans', artisan.id, {
        ...artisan,
        goldBalance: artisan.goldBalance + jobWeight,
        wageBalance: artisan.wageBalance + jobWage
      });
    }

    setShowAddJobModal(false);
    setJobItemName('');
  };

  // Open Receive Modal
  const openReceiveModal = (job: ArtisanJob) => {
    setSelectedJob(job);
    setReceiveWeight(job.givenWeight ? Number((job.givenWeight * 0.95).toFixed(3)) : 10.000);
    setReceiveWastage(job.givenWeight ? Number((job.givenWeight * 0.05).toFixed(3)) : 0.500);
    setReceivePaidWage(job.wage || 0);
    setReceiveRemarks('অলঙ্কার নিখুঁতভাবে বুজে পাওয়া গেল।');
    setShowReceiveModal(true);
  };

  // Submit Receive Work Form & Generate Voucher
  const handleConfirmReceiveWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    const artisan = artisans.find(a => a.id === selectedJob.artisanId);
    if (!artisan) return;

    const voucherNo = `ARV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const completedDate = new Date().toLocaleDateString('bn-BD');

    const updatedJob: ArtisanJob = {
      ...selectedJob,
      returnedWeight: receiveWeight,
      wastage: receiveWastage,
      paidWage: receivePaidWage,
      voucherNo,
      completedDate,
      status: 'completed',
      remarks: receiveRemarks
    };

    // Update Jobs in Firestore
    saveDocumentToFirestore('artisan_jobs', updatedJob.id, updatedJob);

    // Update Artisan Balances in Firestore
    const goldDeduction = receiveWeight + receiveWastage;
    saveDocumentToFirestore('artisans', artisan.id, {
      ...artisan,
      goldBalance: Math.max(0, artisan.goldBalance - goldDeduction),
      wageBalance: Math.max(0, artisan.wageBalance - receivePaidWage)
    });

    // Close Receive Modal and Open Voucher Modal
    setShowReceiveModal(false);
    setActiveVoucherJob(updatedJob);
    setActiveVoucherArtisan(artisan);
    setShowVoucherModal(true);
  };

  // View Existing Job Voucher
  const handleViewVoucher = (job: ArtisanJob) => {
    const artisan = artisans.find(a => a.id === job.artisanId);
    if (artisan) {
      setActiveVoucherJob(job);
      setActiveVoucherArtisan(artisan);
      setShowVoucherModal(true);
    }
  };

  const handlePayWage = (artisanId: string) => {
    const artisan = artisans.find(a => a.id === artisanId);
    if (artisan) {
      saveDocumentToFirestore('artisans', artisanId, { ...artisan, wageBalance: 0 });
    }
  };

  const filteredArtisans = artisans.filter(a => {
    const matchesSearch = (a.name || '').includes(search) || (a.mobile || '').includes(search);
    const matchesDue = filterDueOnly ? a.wageBalance > 0 : true;
    return matchesSearch && matchesDue;
  });

  const handleWhatsAppShare = (job: ArtisanJob, artisan: Artisan) => {
    const text = `আসসালামু আলাইকুম ${artisan.name} ভাই, দি আমিন জুয়েলার্স থেকে আপনার কারিগর ভাউচার (${job.voucherNo}) এর বিবরণ:
অলঙ্কার: ${job.itemName} (${job.karat})
প্রদত্ত স্বর্ণ: ${job.givenWeight}g
বুঝে পাওয়া: ${job.returnedWeight}g
ওয়েস্টেজ: ${job.wastage}g
মজুরি: ৳ ${job.wage}
পরিশোধিত: ৳ ${job.paidWage}
ধন্যবাদ!`;
    const url = `https://wa.me/88${artisan.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSMSShare = (job: ArtisanJob, artisan: Artisan) => {
    const text = `আমিন জুয়েলার্স: ভাউচার #${job.voucherNo}. অলঙ্কার: ${job.itemName}. ওজন: ${job.returnedWeight}g. মজুরি: ${job.paidWage}tk. ধন্যবাদ!`;
    const url = `sms:${artisan.mobile.replace(/\D/g, '')}?body=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 bg-[#fcfaf7] min-h-full">
      
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <HardHat className="text-[#c59b27]" size={28} />
            কারিগর মজুরি ও চালানি খাতা (আর্টিসান ওয়ার্কশপ)
          </h1>
          <p className="text-xs text-gray-500 font-medium">গহনা প্রস্তুতকারক স্বর্ণকার (কারিগরদের) সোনা প্রদান, তৈরি অলঙ্কার প্রাপ্তি, খাদ ও অপচয় হিসাব এবং বানানি মজুরি চালান খাতা।</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilterDueOnly(!filterDueOnly)}
            className={`font-bold px-4 py-2.5 rounded-xl text-xs transition-all ${
              filterDueOnly ? 'bg-red-600 text-white' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {filterDueOnly ? 'সকল রেকর্ড' : 'চলতি কাজ'}
          </button>
          <button 
            onClick={() => setShowAddArtisanModal(true)}
            className="bg-[#c59b27] hover:bg-[#a68221] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#c59b27]/10 transition-all text-xs"
          >
            <Plus size={18} />
            নতুন কারিগর
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="flex justify-end gap-6">
        <div className="bg-white p-4 px-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase">কারিগরদের কাছে সোনা বকেয়া</span>
            <span className="text-lg font-bold text-amber-700">{artisans.reduce((sum, a) => sum + a.goldBalance, 0).toFixed(3)} ভরি</span>
          </div>
        </div>

        <div className="bg-white p-4 px-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase">বকেয়া মজুরি বিল</span>
            <span className="text-lg font-bold text-red-600">BDT {artisans.reduce((sum, a) => sum + a.wageBalance, 0).toLocaleString('bn-BD')} Taka</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="কারিগর নাম বা চালান নং দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#c59b27]/10"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredArtisans.map((artisan) => (
            <motion.div 
              layout
              key={artisan.id}
              className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-6"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100 font-bold">
                    <User size={28} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-gray-900 text-lg">{artisan.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Phone size={12} /> {artisan.mobile}</span>
                      <span className="flex items-center gap-1 font-bold text-[#c59b27]"><Briefcase size={12} /> {artisan.specialty}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedArtisanId(artisan.id);
                    setShowAddJobModal(true);
                  }}
                  className="bg-[#c59b27]/10 text-[#7a0a0a] hover:bg-[#c59b27]/20 text-xs font-bold px-3 py-2 rounded-xl border border-[#c59b27]/20 flex items-center gap-1 transition-all"
                >
                  <Zap size={14} /> নতুন কাজ প্রদান
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-50/50 border border-amber-100/50 p-4 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-amber-700 uppercase">কারিগর সোনা জিমা (Gold)</span>
                  <div className="text-lg font-bold text-amber-900">{artisan.goldBalance.toFixed(3)} গ্রাম</div>
                  <div className="text-[10px] text-amber-800 font-medium">({convertGramsToTraditional(artisan.goldBalance).text})</div>
                </div>
                
                <div className="bg-red-50/50 border border-red-100/50 p-4 rounded-2xl flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-red-600 uppercase">বকেয়া মজুরি (Wage)</span>
                    {artisan.wageBalance > 0 && (
                      <button 
                        onClick={() => handlePayWage(artisan.id)}
                        className="bg-green-600 text-white text-[8px] px-1.5 py-0.5 rounded font-bold hover:bg-green-700"
                      >
                        পরিশোধ করুন
                      </button>
                    )}
                  </div>
                  <div className="text-lg font-bold text-red-900">৳ {artisan.wageBalance.toLocaleString('bn-BD')}</div>
                </div>
              </div>

              {/* Jobs List for this Artisan */}
              <div className="flex flex-col gap-3">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b border-gray-50 pb-2 flex justify-between items-center">
                  <span>চলমান ও সম্প্রতি রিসিভ করা কাজ</span>
                  <span>স্বর্ণ বিবরণ ও ভাউচার</span>
                </div>
                <div className="flex flex-col gap-2">
                  {jobs.filter(j => j.artisanId === artisan.id).map(job => (
                    <div key={job.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-50/70 rounded-2xl border border-gray-100 gap-3">
                      <div className="flex items-start gap-3">
                        {job.status === 'pending' ? (
                          <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="text-xs font-bold text-gray-800">{job.itemName} ({job.karat || '২২ ক্যারেট'})</div>
                          <div className="text-[10px] text-gray-500 mt-0.5 flex flex-wrap gap-x-3">
                            <span>তারিখ: {job.date}</span>
                            <span>দিয়েছিল: <strong className="text-gray-700">{job.givenWeight}g</strong> ({convertGramsToTraditional(job.givenWeight).text})</span>
                          </div>
                          {job.status === 'completed' && (
                            <div className="text-[10px] text-green-700 font-bold mt-1 bg-green-50 px-2 py-0.5 rounded border border-green-100 inline-block">
                              বুঝে পাওয়া: {job.returnedWeight}g | ওয়েস্টেজ: {job.wastage}g | ভাউচার: {job.voucherNo}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="text-right">
                          <div className="text-xs font-bold text-gray-900">৳ {job.wage.toLocaleString('bn-BD')}</div>
                          <div className={`text-[9px] font-bold uppercase ${job.status === 'pending' ? 'text-amber-600' : 'text-green-600'}`}>
                            {job.status === 'pending' ? 'প্রক্রিয়াধীন' : 'রিসিভড'}
                          </div>
                        </div>

                        {job.status === 'pending' ? (
                          <button 
                            onClick={() => openReceiveModal(job)}
                            className="bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow-sm transition-all"
                          >
                            <FileText size={14} />
                            কাজ রিসিভড ও ভাউচার
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleViewVoucher(job)}
                            className="bg-gray-800 hover:bg-black text-[#c59b27] text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
                          >
                            <Printer size={12} />
                            ভাউচার দেখুন
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Artisan Modal */}
      <AnimatePresence>
        {showAddArtisanModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <form onSubmit={handleAddArtisan} className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl relative">
              <button type="button" onClick={() => setShowAddArtisanModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
              <h3 className="font-bold text-gray-800 text-lg border-b pb-2">নতুন কারিগর নিবন্ধন</h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">কারিগর নাম *</label>
                <input 
                  type="text" required value={name} onChange={e => setName(e.target.value)}
                  placeholder="যেমন: জহির আলম" className="bg-gray-50 border p-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">মোবাইল নম্বর *</label>
                <input 
                  type="text" required value={mobile} onChange={e => setMobile(e.target.value)}
                  placeholder="018XXXXXXXX" className="bg-gray-50 border p-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">বিশেষত্ব (Specialty)</label>
                <input 
                  type="text" value={specialty} onChange={e => setSpecialty(e.target.value)}
                  placeholder="যেমন: সীতাহার ও নেকলেস" className="bg-gray-50 border p-2.5 rounded-xl text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddArtisanModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500">বাতিল</button>
                <button type="submit" className="px-6 py-2.5 text-xs font-bold bg-[#c59b27] text-black rounded-xl">নিবন্ধন করুন</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Job Modal */}
      <AnimatePresence>
        {showAddJobModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <form onSubmit={handleAddJob} className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl relative">
              <button type="button" onClick={() => setShowAddJobModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
              <h3 className="font-bold text-gray-800 text-lg border-b pb-2">নতুন কাজ ও স্বর্ণ প্রদান</h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">অলঙ্কারের নাম *</label>
                <input 
                  type="text" required value={jobItemName} onChange={e => setJobItemName(e.target.value)}
                  placeholder="যেমন: ২২ক সোনার সীতাহার" className="bg-gray-50 border p-2.5 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">ক্যারেট (Karat)</label>
                <select 
                  value={jobKarat} onChange={e => setJobKarat(e.target.value)}
                  className="bg-gray-50 border p-2.5 rounded-xl text-sm font-bold"
                >
                  <option value="২২ ক্যারেট">২২ ক্যারেট (22K)</option>
                  <option value="২১ ক্যারেট">২১ ক্যারেট (21K)</option>
                  <option value="১৮ ক্যারেট">১৮ ক্যারেট (18K)</option>
                  <option value="সনাতন">সনাতন (Traditional)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">প্রদত্ত স্বর্ণ (গ্রাম)</label>
                  <input 
                    type="number" step="0.001" value={jobWeight} onChange={e => setJobWeight(Number(e.target.value))}
                    className="bg-gray-50 border p-2 rounded-xl text-sm font-bold text-center"
                  />
                  <span className="text-[10px] text-gray-400 font-medium text-center">
                    ({convertGramsToTraditional(jobWeight).text})
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">নির্ধারিত মজুরি (৳)</label>
                  <input 
                    type="number" value={jobWage} onChange={e => setJobWage(Number(e.target.value))}
                    className="bg-gray-50 border p-2 rounded-xl text-sm font-bold text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddJobModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500">বাতিল</button>
                <button type="submit" className="px-6 py-2.5 text-xs font-bold bg-[#c59b27] text-black rounded-xl">কাজ নিশ্চিত করুন</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Receive Work & Gold Weight Breakdown Form Modal */}
      <AnimatePresence>
        {showReceiveModal && selectedJob && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <form onSubmit={handleConfirmReceiveWork} className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl flex flex-col gap-6 shadow-2xl relative my-8">
              <button type="button" onClick={() => setShowReceiveModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>

              <div className="border-b border-gray-100 pb-4">
                <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
                  <FileText className="text-[#c59b27]" size={24} />
                  কারিগর থেকে কাজ গ্রহণ ও স্বর্ণের ওজন বিবরণী
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  প্রদত্ত কাঁচা সোনা এবং তৈরিকৃত গহনার ওজন নিখুঁতভাবে ইনপুট দিয়ে ভাউচার জেনারেট করুন।
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold text-amber-900">
                <div>
                  <span className="text-[10px] text-amber-700 block uppercase">গহনার নাম</span>
                  <span>{selectedJob.itemName} ({selectedJob.karat || '২২ ক্যারেট'})</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block uppercase">প্রদত্ত স্বর্ণের ওজন</span>
                  <span>{selectedJob.givenWeight}g ({convertGramsToTraditional(selectedJob.givenWeight).text})</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 block uppercase">নির্ধারিত মোট মজুরি</span>
                  <span>৳ {selectedJob.wage.toLocaleString('bn-BD')}</span>
                </div>
              </div>

              {/* Detailed Gold Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Received Gold Weight */}
                <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-700 flex justify-between">
                    <span>১. বুঝে পাওয়া গহনার ওজন (গ্রাম) *</span>
                    <span className="text-[#c59b27]">Received Gold</span>
                  </label>
                  <input 
                    type="number" step="0.001" required
                    value={receiveWeight} 
                    onChange={e => setReceiveWeight(parseFloat(e.target.value) || 0)}
                    className="bg-white border border-gray-200 p-3 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
                  />
                  <div className="text-[11px] font-bold text-[#7a0a0a] bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                    ঐতিহ্যবাহী ওজন: {convertGramsToTraditional(receiveWeight).text}
                  </div>
                </div>

                {/* 2. Wastage */}
                <div className="flex flex-col gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <label className="text-xs font-bold text-gray-700 flex justify-between">
                    <span>২. ওয়েস্টেজ / ছাট / খাদ (গ্রাম) *</span>
                    <span className="text-red-600">Allowed Wastage</span>
                  </label>
                  <input 
                    type="number" step="0.001" required
                    value={receiveWastage} 
                    onChange={e => setReceiveWastage(parseFloat(e.target.value) || 0)}
                    className="bg-white border border-gray-200 p-3 rounded-xl text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <div className="text-[11px] font-bold text-red-800 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                    ওয়েস্টেজ ওজন: {convertGramsToTraditional(receiveWastage).text}
                  </div>
                </div>

              </div>

              {/* Total Calculation Row */}
              <div className="bg-gray-900 text-white p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold">
                <div className="flex flex-col">
                  <span className="text-gray-400 uppercase text-[10px]">মোট সমন্বয়কৃত স্বর্ণ (গহনা + ওয়েস্টেজ)</span>
                  <span className="text-base text-[#c59b27]">{(receiveWeight + receiveWastage).toFixed(3)} gram</span>
                  <span className="text-[10px] text-gray-300">({convertGramsToTraditional(receiveWeight + receiveWastage).text})</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 uppercase text-[10px]">স্বর্ণ উদ্বৃত্ত / ঘাটতি হিসাব</span>
                  <div className="text-sm font-black">
                    {Math.abs(selectedJob.givenWeight - (receiveWeight + receiveWastage)) < 0.001 ? (
                      <span className="text-green-400">✓ সম্পূর্ণ হিসাব মিল পাওয়া গেছে (০.০০০g)</span>
                    ) : (
                      <span className="text-amber-400">
                        পার্থক্য: {(selectedJob.givenWeight - (receiveWeight + receiveWastage)).toFixed(3)}g
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Wage Payment & Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">পরিশোধিত মজুরি (৳)</label>
                  <input 
                    type="number" 
                    value={receivePaidWage} 
                    onChange={e => setReceivePaidWage(parseFloat(e.target.value) || 0)}
                    className="bg-gray-50 border p-2.5 rounded-xl text-sm font-bold text-green-700"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700">ভাউচার মন্তব্য / নোট</label>
                  <input 
                    type="text" 
                    value={receiveRemarks} 
                    onChange={e => setReceiveRemarks(e.target.value)}
                    placeholder="যেমন: ফিনিশিং ভালো হয়েছে।" 
                    className="bg-gray-50 border p-2.5 rounded-xl text-sm font-medium"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowReceiveModal(false)} className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl">
                  বাতিল
                </button>
                <button type="submit" className="px-8 py-3 text-xs font-bold bg-[#7a0a0a] hover:bg-[#5a0707] text-white rounded-xl shadow-lg flex items-center gap-2">
                  <CheckCircle size={16} />
                  কাজ জমা গ্রহণ ও ভাউচার জেনারেট করুন
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Printable Artisan Work Receive Voucher Modal */}
      <AnimatePresence>
        {showVoucherModal && activeVoucherJob && activeVoucherArtisan && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-4xl flex flex-col gap-6 shadow-2xl relative my-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
              
              {/* Modal Top Controls (No-Print) */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 no-print">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[#c59b27]" size={20} />
                  <span className="font-bold text-gray-800 text-sm">কারিগর কাজ গ্রহণ ও সোনা ওজন রসিদ (Printable Voucher)</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleWhatsAppShare(activeVoucherJob, activeVoucherArtisan)}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all"
                  >
                    <PhoneCall size={16} />
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => handleSMSShare(activeVoucherJob, activeVoucherArtisan)}
                    className="bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all"
                  >
                    <MessageSquare size={16} />
                    SMS
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="bg-[#1a1614] hover:bg-black text-[#c59b27] text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all"
                  >
                    <Printer size={16} />
                    প্রিন্ট / সেভ করুন (Ctrl+P)
                  </button>
                  <button onClick={() => setShowVoucherModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Printable Voucher Paper Content */}
              <div 
                id="printable-artisan-voucher" 
                className="bg-white border-[6px] border-[#7a0a0a] p-8 md:p-10 font-serif text-[#7a0a0a] relative shadow-lg"
              >
                {/* Header */}
                <div className="text-center mb-6">

                  <div className="flex justify-between items-center mb-1">
                    <div className="text-[9px] border border-[#7a0a0a] px-2 py-0.5 rounded font-bold uppercase">
                      কারিগর কপি (Artisan Copy)
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-[#7a0a0a] tracking-tight">দি আমিন জুয়েলার্স</h1>
                    <div className="text-[9px] border border-[#7a0a0a] px-2 py-0.5 rounded font-bold uppercase">
                      অফিস কপি (Office Copy)
                    </div>
                  </div>
                  <div className="text-[#7a0a0a] text-[10px] font-bold border-b-2 border-[#7a0a0a] pb-1 inline-block mb-2 px-6">
                    বন্দরটিলা, ইপিজেড, চট্টগ্রাম | মোবাইল: 01612424802 / 01812424802
                  </div>
                  <div className="text-center mt-2">
                    <span className="bg-[#7a0a0a] text-white px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                      কারিগর তৈরিকৃত অলঙ্কার গ্রহণ ও স্বর্ণের ওজন বিবরণী ভাউচার
                    </span>
                  </div>
                </div>

                {/* Voucher Meta Info */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6 text-[11px] font-bold border-y border-[#7a0a0a]/30 py-3">
                  <div className="flex gap-2">
                    <span className="shrink-0 text-gray-700">ভাউচার নম্বর:</span>
                    <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold">{activeVoucherJob.voucherNo || 'ARV-2026-102'}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 text-gray-700">রিসিভ তারিখ:</span>
                    <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold">{activeVoucherJob.completedDate || activeVoucherJob.date}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 text-gray-700">কারিগরের নাম:</span>
                    <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold">{activeVoucherArtisan.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 text-gray-700">মোবাইল নম্বর:</span>
                    <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold">{activeVoucherArtisan.mobile}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 text-gray-700">গহনার অলঙ্কার বিবরণ:</span>
                    <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold">{activeVoucherJob.itemName} ({activeVoucherJob.karat || '২২ ক্যারেট'})</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="shrink-0 text-gray-700">বিশেষত্ব:</span>
                    <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold">{activeVoucherArtisan.specialty}</span>
                  </div>
                </div>

                {/* Detailed Gold Weight Breakdown Table */}
                <div className="mb-6">
                  <h4 className="text-[11px] font-black underline mb-2 uppercase">১. স্বর্ণের ওজন বিস্তারিত বিবরণী (Gold Weight Statement):</h4>
                  <table className="w-full border-collapse text-[10px] font-bold border border-[#7a0a0a]">
                    <thead>
                      <tr className="bg-[#7a0a0a]/10 border-b border-[#7a0a0a]">
                        <th className="border-r border-[#7a0a0a] py-2 px-3 text-left">খাত / বিবরণ (Description)</th>
                        <th className="border-r border-[#7a0a0a] py-2 px-3 text-center w-32">ওজন (গ্রাম / Grams)</th>
                        <th className="py-2 px-3 text-left">ঐতিহ্যবাহী বাংলাদেশ স্কেল (ভরি-আনা-রতি-পয়েন্ট)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#7a0a0a]/30">
                      <tr>
                        <td className="border-r border-[#7a0a0a] py-2.5 px-3">প্রদত্ত কাঁচা সোনা (Given Gold Weight)</td>
                        <td className="border-r border-[#7a0a0a] py-2.5 px-3 text-center font-black">{activeVoucherJob.givenWeight.toFixed(3)} g</td>
                        <td className="py-2.5 px-3 font-bold">{convertGramsToTraditional(activeVoucherJob.givenWeight).text}</td>
                      </tr>
                      <tr>
                        <td className="border-r border-[#7a0a0a] py-2.5 px-3 font-black text-[#7a0a0a]">বুঝে পাওয়া তৈরিকৃত গহনা (Finished Gold Received)</td>
                        <td className="border-r border-[#7a0a0a] py-2.5 px-3 text-center font-black">{activeVoucherJob.returnedWeight ? activeVoucherJob.returnedWeight.toFixed(3) : activeVoucherJob.givenWeight.toFixed(3)} g</td>
                        <td className="py-2.5 px-3 font-bold">{convertGramsToTraditional(activeVoucherJob.returnedWeight || activeVoucherJob.givenWeight).text}</td>
                      </tr>
                      <tr>
                        <td className="border-r border-[#7a0a0a] py-2.5 px-3">অনুমোদিত ওয়েস্টেজ / ছাট (Allowed Wastage/Loss)</td>
                        <td className="border-r border-[#7a0a0a] py-2.5 px-3 text-center font-black">{activeVoucherJob.wastage ? activeVoucherJob.wastage.toFixed(3) : '0.000'} g</td>
                        <td className="py-2.5 px-3 font-bold">{convertGramsToTraditional(activeVoucherJob.wastage || 0).text}</td>
                      </tr>
                      <tr className="bg-[#7a0a0a]/5 font-black">
                        <td className="border-r border-[#7a0a0a] py-2.5 px-3">মোট হিসাবকৃত স্বর্ণ (Total Accounted = Received + Wastage)</td>
                        <td className="border-r border-[#7a0a0a] py-2.5 px-3 text-center">
                          {((activeVoucherJob.returnedWeight || activeVoucherJob.givenWeight) + (activeVoucherJob.wastage || 0)).toFixed(3)} g
                        </td>
                        <td className="py-2.5 px-3">
                          {convertGramsToTraditional((activeVoucherJob.returnedWeight || activeVoucherJob.givenWeight) + (activeVoucherJob.wastage || 0)).text}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Wage Breakdown Table */}
                <div className="mb-6 grid grid-cols-2 gap-6">
                  <div className="border border-[#7a0a0a]/30 p-3 rounded-lg text-[10px] space-y-1 bg-amber-50/20">
                    <p className="font-bold underline mb-1">কারিগর মন্তব্য / বিবরণ:</p>
                    <p className="italic text-gray-700">{activeVoucherJob.remarks || 'অলঙ্কার নিখুঁতভাবে পরীক্ষা করে বুঝে নেয়া হইল।'}</p>
                  </div>

                  <div className="space-y-1 text-[11px] font-bold text-[#7a0a0a]">
                    <div className="flex justify-between border-b border-dotted border-[#7a0a0a]">
                      <span>নির্ধারিত মোট মজুরি:</span>
                      <span>৳ {activeVoucherJob.wage.toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="flex justify-between border-b border-dotted border-[#7a0a0a]">
                      <span>পরিশোধিত মজুরি (Paid Wage):</span>
                      <span>৳ {(activeVoucherJob.paidWage || activeVoucherJob.wage).toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="flex justify-between text-[13px] border-b-2 border-[#7a0a0a] pt-1 font-black">
                      <span>অবশিষ্ট বকেয়া মজুরি (Due Wage):</span>
                      <span>৳ {Math.max(0, activeVoucherJob.wage - (activeVoucherJob.paidWage || activeVoucherJob.wage)).toLocaleString('bn-BD')}</span>
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="flex justify-between text-[10px] font-bold text-[#7a0a0a] pt-12 pb-2">
                  <div className="text-center border-t border-dashed border-[#7a0a0a] w-40">কারিগরের স্বাক্ষর</div>
                  <div className="text-center border-t border-dashed border-[#7a0a0a] w-40">ওজন পরীক্ষকের স্বাক্ষর</div>
                  <div className="text-center border-t border-dashed border-[#7a0a0a] w-48">আমিন জুয়েলার্স অথরাইজড স্বাক্ষর</div>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { 
  HandCoins, Search, Plus, Calendar, User, Phone, Scale, Banknote, Clock, AlertCircle, 
  FileText, ChevronRight, TrendingUp, Mic, Zap, Camera, X, Download, Trash2, 
  MessageSquare, PhoneCall, Printer, Edit, CheckCircle, Share2, Sparkles, Send, MapPin,
  Percent, Check, Copy, QrCode, CreditCard, CheckSquare, Square, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Mortgage } from '../types';
import BkashPaymentModal from './BkashPaymentModal';
import BankCardPaymentModal from './BankCardPaymentModal';
import { subscribeCollection, saveDocumentToFirestore, deleteDocumentFromFirestore } from '../lib/firestoreSync';

// Conversion helpers for Gold Weight (Grams <-> Vori, Ana, Roti, Point)
function gramsToTraditional(grams: number) {
  if (!grams || isNaN(grams) || grams <= 0) {
    return { vori: 0, ana: 0, roti: 0, point: 0 };
  }
  const totalPoints = Math.round(grams / 0.01215);
  const vori = Math.floor(totalPoints / 960);
  const remVori = totalPoints % 960;
  const ana = Math.floor(remVori / 60);
  const remAna = remVori % 60;
  const roti = Math.floor(remAna / 10);
  const point = remAna % 10;
  return { vori, ana, roti, point };
}

function traditionalToGrams(vori: number, ana: number, roti: number, point: number) {
  const g = ((vori || 0) * 11.664) + 
            ((ana || 0) * (11.664 / 16)) + 
            ((roti || 0) * (11.664 / 96)) + 
            ((point || 0) * (11.664 / 960));
  return parseFloat(g.toFixed(3));
}

const defaultJewelryImage = "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=300&auto=format&fit=crop&q=80";

const mockMortgages: Mortgage[] = [
  {
    id: '850',
    receiptNo: '850',
    customerName: 'সুমাইয়া আক্তার',
    customerMobile: '০১৮০৪৬৮৯৪৮৮',
    customerAddress: 'বন্দরটিলা',
    karat: '21',
    itemName: 'দুল এক জোড়া',
    weight: 13.851,
    traditionalWeight: { vori: 1, ana: 3, roti: 0, point: 0 },
    principalAmount: 12000,
    interestRate: 3,
    collectedInterest: 0,
    monthsCount: 1,
    itemPhoto: defaultJewelryImage,
    startDate: '2026-08-11',
    expiryDate: '2027-02-11',
    status: 'active'
  },
  {
    id: '852',
    receiptNo: 'LN-2026-852',
    customerName: 'হাছিনা বেগম',
    customerMobile: '01700000000',
    customerAddress: 'N/A',
    karat: '22K',
    itemName: 'দুল রিং এক জোড়া',
    weight: 13.486,
    traditionalWeight: { vori: 1, ana: 2, roti: 3, point: 0 },
    principalAmount: 6000,
    interestRate: 2,
    collectedInterest: 0,
    monthsCount: 1,
    itemPhoto: defaultJewelryImage,
    startDate: '2026-08-12',
    expiryDate: '2027-02-12',
    status: 'active'
  },
  {
    id: '853',
    receiptNo: 'LN-2026-853',
    customerName: 'নাজমা আক্তার',
    customerMobile: '০১৮২৪১৫৫২৪২',
    customerAddress: 'N/A',
    karat: '22K',
    itemName: 'আংটি একটি',
    weight: 13.486,
    traditionalWeight: { vori: 1, ana: 2, roti: 3, point: 0 },
    principalAmount: 13000,
    interestRate: 2,
    collectedInterest: 0,
    monthsCount: 1,
    itemPhoto: defaultJewelryImage,
    startDate: '2026-08-12',
    expiryDate: '2027-02-12',
    status: 'active'
  },
  {
    id: '854',
    receiptNo: '854',
    customerName: 'শিরিন আক্তার',
    customerMobile: '০১৮৭৯৯৪২৭০৬',
    customerAddress: 'N/A',
    karat: '22K',
    itemName: 'সুই সুতা এক জোড়া',
    weight: 13.122,
    traditionalWeight: { vori: 1, ana: 2, roti: 0, point: 0 },
    principalAmount: 3000,
    interestRate: 2,
    collectedInterest: 0,
    monthsCount: 1,
    itemPhoto: defaultJewelryImage,
    startDate: '2026-08-12',
    expiryDate: '2027-02-12',
    status: 'active'
  },
  {
    id: '778',
    receiptNo: '৭৭৮',
    customerName: 'জিনু আপা',
    customerMobile: '01700000000',
    customerAddress: 'N/A',
    karat: '22K',
    itemName: 'চেইন ১টি',
    weight: 11.664,
    traditionalWeight: { vori: 1, ana: 0, roti: 0, point: 0 },
    principalAmount: 30,
    interestRate: 2,
    collectedInterest: 0,
    monthsCount: 1,
    itemPhoto: defaultJewelryImage,
    startDate: '2026-08-14',
    expiryDate: '2027-02-12',
    status: 'active'
  }
];

export default function MortgageLedger() {
  const [mortgages, setMortgages] = useState<Mortgage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with Firestore
  useEffect(() => {
    const unsubscribe = subscribeCollection('mortgages', (data) => {
      setMortgages(data as Mortgage[]);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'redeemed' | 'expired'>('all');

  // Modal States
  const [activeVoucher, setActiveVoucher] = useState<Mortgage | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [showBkashModal, setShowBkashModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'interest' | 'principal' | 'combined'>('interest');
  const [interestInput, setInterestInput] = useState<number>(360);
  const [principalInput, setPrincipalInput] = useState<number>(0);
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Express SMS & WhatsApp Panel States
  const [showExpressSmsModal, setShowExpressSmsModal] = useState(false);
  const [smsTargetGroup, setSmsTargetGroup] = useState<'single' | 'active' | 'expired' | 'all'>('single');
  const [smsSelectedCustomer, setSmsSelectedCustomer] = useState<Mortgage | null>(mockMortgages[0]);
  const [smsTemplate, setSmsTemplate] = useState<'due' | 'redeem' | 'greeting' | 'custom'>('due');
  const [smsText, setSmsText] = useState<string>('');
  const [dispatchedLogs, setDispatchedLogs] = useState<Array<{
    id: string;
    time: string;
    receiptNo: string;
    customerName: string;
    customerMobile: string;
    status: string;
  }>>([]);

  // Form State for New Entry
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [customerAddress, setCustomerAddress] = useState('বন্দরটিলা');
  const [receiptNo, setReceiptNo] = useState('' + Math.floor(852 + Math.random() * 50));
  const [itemName, setItemName] = useState('');
  const [karat, setKarat] = useState('21');
  const [gramWeight, setGramWeight] = useState<number>(13.851);
  const [vori, setVori] = useState<number>(1);
  const [ana, setAna] = useState<number>(3);
  const [roti, setRoti] = useState<number>(0);
  const [point, setPoint] = useState<number>(0);
  const [principalAmount, setPrincipalAmount] = useState<number>(12000);
  const [interestRate, setInterestRate] = useState<number>(3);
  const [startDate, setStartDate] = useState('2026-08-11');
  const [expiryDate, setExpiryDate] = useState('2027-02-11');
  const [itemPhoto, setItemPhoto] = useState<string>(defaultJewelryImage);

  // Synchronized Weight Handlers (Grams <-> Traditional)
  const handleGramWeightChange = (val: number) => {
    setGramWeight(val);
    if (!isNaN(val) && val >= 0) {
      const trad = gramsToTraditional(val);
      setVori(trad.vori);
      setAna(trad.ana);
      setRoti(trad.roti);
      setPoint(trad.point);
    }
  };

  const handleTraditionalWeightChange = (v: number, a: number, r: number, p: number) => {
    setVori(v);
    setAna(a);
    setRoti(r);
    setPoint(p);
    const calculatedGrams = traditionalToGrams(v, a, r, p);
    setGramWeight(calculatedGrams);
  };

  // Edit Modal Form State
  const [editItem, setEditItem] = useState<Mortgage | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const calculateInterest = (m: Mortgage) => {
    const start = new Date(m.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const months = m.monthsCount || Math.max(1, Math.ceil(diffDays / 30));

    const currentPrincipal = m.principalAmount;
    const originalPrincipal = m.originalPrincipal || m.principalAmount;
    const paidPrincipal = m.paidPrincipal || Math.max(0, originalPrincipal - currentPrincipal);

    const monthlyRate = (currentPrincipal * m.interestRate) / 100;
    const totalInterestAccrued = Math.round(monthlyRate * months);
    const collected = m.collectedInterest || 0;
    const dueInterest = Math.max(0, totalInterestAccrued - collected);
    const totalRedemption = currentPrincipal + dueInterest;

    return {
      originalPrincipal,
      paidPrincipal,
      currentPrincipal,
      monthlyRate,
      months,
      totalInterestAccrued,
      collectedInterest: collected,
      dueInterest,
      totalRedemption
    };
  };

  const handleCreateMortgage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !itemName) return;

    const grams = gramWeight > 0 ? gramWeight : traditionalToGrams(vori, ana, roti, point);

    const newMortgage: Mortgage = {
      id: Date.now().toString(),
      receiptNo,
      customerName,
      customerMobile: customerMobile || '০১৮০৪৬৮৯৪৮৮',
      customerAddress: customerAddress || 'বন্দরটিলা',
      karat,
      itemName,
      weight: parseFloat(grams.toFixed(3)),
      traditionalWeight: { vori, ana, roti, point },
      principalAmount,
      originalPrincipal: principalAmount,
      paidPrincipal: 0,
      interestRate,
      collectedInterest: 0,
      monthsCount: 1,
      itemPhoto: itemPhoto || defaultJewelryImage,
      startDate,
      expiryDate,
      status: 'active',
      payments: []
    };

    // Save to Firestore
    saveDocumentToFirestore('mortgages', newMortgage.id, newMortgage);
    setActiveVoucher(newMortgage);
    showToast(`রসিদ নাম্বার #${receiptNo} বন্ধকি ঋণপত্র তৈরি হয়েছে।`);

    // Reset Form
    setCustomerName('');
    setCustomerMobile('');
    setItemName('');
    setReceiptNo('' + Math.floor(860 + Math.random() * 50));
  };

  const handleCollectInterestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVoucher) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newPayments = [...(activeVoucher.payments || [])];

    let newCollectedInterest = activeVoucher.collectedInterest || 0;
    let newPrincipal = activeVoucher.principalAmount;
    const origPrincipal = activeVoucher.originalPrincipal || activeVoucher.principalAmount;
    let newPaidPrincipal = activeVoucher.paidPrincipal || Math.max(0, origPrincipal - newPrincipal);

    let toastText = '';

    if (paymentMode === 'interest' || paymentMode === 'combined') {
      if (interestInput > 0) {
        newCollectedInterest += interestInput;
        newPayments.push({
          id: Date.now().toString() + '-int',
          date: todayStr,
          type: 'interest',
          amount: interestInput,
          note: paymentNote || 'সুদের কিস্তি জমা'
        });
        toastText += `সুদ ৳ ${interestInput.toLocaleString('bn-BD')} জমা সম্পন্ন। `;
      }
    }

    if (paymentMode === 'principal' || paymentMode === 'combined') {
      if (principalInput > 0) {
        newPrincipal = Math.max(0, activeVoucher.principalAmount - principalInput);
        newPaidPrincipal += principalInput;
        newPayments.push({
          id: Date.now().toString() + '-prnc',
          date: todayStr,
          type: 'principal',
          amount: principalInput,
          note: paymentNote || 'আসল কিস্তি / সমন্বয়'
        });
        toastText += `আসল ৳ ${principalInput.toLocaleString('bn-BD')} জমা সমন্বয় করা হয়েছে (অবশিষ্ট আসল: ৳ ${newPrincipal.toLocaleString('bn-BD')})।`;
      }
    }

    const newStatus = (newPrincipal === 0) ? 'redeemed' : activeVoucher.status;

    const updated: Mortgage = {
      ...activeVoucher,
      principalAmount: newPrincipal,
      originalPrincipal: origPrincipal,
      paidPrincipal: newPaidPrincipal,
      collectedInterest: newCollectedInterest,
      payments: newPayments,
      status: newStatus
    };

    // Save update to Firestore
    saveDocumentToFirestore('mortgages', updated.id, updated);
    setActiveVoucher(updated);
    setShowInterestModal(false);
    setPaymentNote('');
    setPrincipalInput(0);
    showToast(toastText || 'জমা সমন্বয় সম্পন্ন হয়েছে!');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    saveDocumentToFirestore('mortgages', editItem.id, editItem);
    setActiveVoucher(editItem);
    setShowEditModal(false);
    showToast(`বন্ধকি তথ্য সফলভাবে হালনাগাদ করা হয়েছে।`);
  };

  // Express SMS Helper & Handlers
  const generateSmsTemplateText = (m: Mortgage | null, template: 'due' | 'redeem' | 'greeting' | 'custom') => {
    if (!m) return '';
    const calc = calculateInterest(m);
    if (template === 'due') {
      return `আসসালামু আলাইকুম ${m.customerName} স্যার/ম্যাডাম, দি আমিন জুয়েলার্স থেকে জানানো যাচ্ছে যে আপনার বন্ধকি রসিদ নং #${m.receiptNo} এর বিপরীতে বকেয়া সুদ: ৳ ${calc.dueInterest.toLocaleString('bn-BD')} এবং সর্বমোট প্রদেয়: ৳ ${calc.totalRedemption.toLocaleString('bn-BD')}। ধন্যবাদ!`;
    } else if (template === 'redeem') {
      return `আসসালামু আলাইকুম ${m.customerName} স্যার/ম্যাডাম, আপনার বন্ধকি রসিদ নং #${m.receiptNo} এর ৬ মাসের মেয়াদ শেষ পর্যায়ে। অনুগ্রহ করে আপনার বন্ধকি অলংকার খালাস বা সুদের হিসাব পরিশোধ করুন। মোট প্রদেয়: ৳ ${calc.totalRedemption.toLocaleString('bn-BD')}। আমিন জুয়েলার্স।`;
    } else if (template === 'greeting') {
      return `সম্মানিত ${m.customerName} স্যার/ম্যাডাম, আমিন জুয়েলার্সের পক্ষ থেকে আপনাকে প্রীতি ও শুভেচ্ছা! আমাদের শোরুমে নতুন গহনা কালেকশন দেখতে ও আকর্ষণীয় ছাড়ে কেনাকাটা করতে সাদর আমন্ত্রণ।`;
    }
    return smsText;
  };

  useEffect(() => {
    if (smsTemplate !== 'custom' && smsSelectedCustomer) {
      setSmsText(generateSmsTemplateText(smsSelectedCustomer, smsTemplate));
    }
  }, [smsSelectedCustomer, smsTemplate]);

  const handleOpenExpressSms = (m?: Mortgage | null) => {
    const target = m || activeVoucher || mortgages[0] || null;
    if (target) {
      setSmsSelectedCustomer(target);
      setSmsTargetGroup('single');
      setSmsTemplate('due');
      setSmsText(generateSmsTemplateText(target, 'due'));
    }
    setShowExpressSmsModal(true);
  };

  const getRecipients = (): Mortgage[] => {
    if (smsTargetGroup === 'single') {
      return smsSelectedCustomer ? [smsSelectedCustomer] : [];
    } else if (smsTargetGroup === 'active') {
      return mortgages.filter(m => m.status === 'active');
    } else if (smsTargetGroup === 'expired') {
      return mortgages.filter(m => m.status === 'expired');
    }
    return mortgages;
  };

  const addDispatchedLog = (m: Mortgage, statusStr: string) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setDispatchedLogs(prev => [
      {
        id: Date.now().toString() + Math.random().toString(),
        time: timeStr,
        receiptNo: m.receiptNo,
        customerName: m.customerName,
        customerMobile: m.customerMobile,
        status: statusStr
      },
      ...prev
    ]);
  };

  const handleWhatsAppDirect = () => {
    const recipients = getRecipients();
    if (recipients.length === 0) return;
    const target = recipients[0];
    const mobile = target.customerMobile.replace(/\D/g, '');
    const url = `https://wa.me/88${mobile}?text=${encodeURIComponent(smsText)}`;
    window.open(url, '_blank');
    addDispatchedLog(target, '✓ WhatsApp Direct');
    showToast(`WhatsApp এ ${target.customerName} এর মেসেজ উইন্ডো ওপেন হয়েছে!`);
  };

  const handleWhatsAppWeb = () => {
    const recipients = getRecipients();
    if (recipients.length === 0) return;
    const target = recipients[0];
    const mobile = target.customerMobile.replace(/\D/g, '');
    const url = `https://web.whatsapp.com/send?phone=88${mobile}&text=${encodeURIComponent(smsText)}`;
    window.open(url, '_blank');
    addDispatchedLog(target, '✓ WhatsApp Web');
    showToast(`WhatsApp Web এ ${target.customerName} এর মেসেজ ওপেন হয়েছে!`);
  };

  const handlePhoneSMS = () => {
    const recipients = getRecipients();
    if (recipients.length === 0) return;
    const target = recipients[0];
    const mobile = target.customerMobile.replace(/\D/g, '');
    const url = `sms:${mobile}?body=${encodeURIComponent(smsText)}`;
    window.open(url, '_blank');
    addDispatchedLog(target, '✓ Phone SMS');
    showToast(`ফোন মেসেজ অ্যাপে বার্তা ওপেন হয়েছে!`);
  };

  const handleCopySMS = () => {
    navigator.clipboard.writeText(smsText);
    showToast('বার্তা টেক্সট ক্লিপবোর্ডে কপি করা হয়েছে!');
  };

  const handleServerDispatch = () => {
    const recipients = getRecipients();
    if (recipients.length === 0) return;
    recipients.forEach(r => {
      addDispatchedLog(r, '✓ সার্ভার এক্সপ্রেস ডিসপ্যাচড');
    });
    showToast(`⚡ সফলভাবে ${recipients.length}টি নম্বরে বার্তা ডিসপ্যাচ করা হয়েছে!`);
  };

  const handleSendSMS = (m: Mortgage) => {
    handleOpenExpressSms(m);
  };

  const handleWhatsApp = (m: Mortgage) => {
    handleOpenExpressSms(m);
  };

  const handleRedeem = (id: string) => {
    const mortgage = mortgages.find(m => m.id === id);
    if (mortgage) {
      saveDocumentToFirestore('mortgages', id, { ...mortgage, status: 'redeemed' });
    }
    showToast('বন্ধকি পণ্য খালাস হিসেবে মার্ক করা হয়েছে!');
  };

  const handleDelete = (id: string) => {
    deleteDocumentFromFirestore('mortgages', id);
    if (activeVoucher?.id === id) setActiveVoucher(null);
    showToast('রেকর্ড মুছে ফেলা হয়েছে।');
  };

  const handleDownloadCSV = () => {
    const headers = ['Receipt No,Customer Name,Mobile,Item,Karat,Principal Amount,Status\n'];
    const rows = mortgages.map(m => `${m.receiptNo},"${m.customerName}",${m.customerMobile},"${m.itemName}",${m.karat},${m.principalAmount},${m.status}`).join('\n');
    const blob = new Blob([...headers, rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mortgage_ledger.csv';
    a.click();
  };

  const filteredMortgages = mortgages.filter(m => {
    const matchesSearch = (m.customerName || '').includes(search) || 
      (m.customerMobile || '').includes(search) || 
      (m.receiptNo || '').includes(search);
    const matchesStatus = statusFilter === 'all' ? true : m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalActiveLoan = useMemo(() => {
    return mortgages.filter(m => m.status === 'active').reduce((acc, curr) => acc + curr.principalAmount, 0);
  }, [mortgages]);

  // Multi-Selection Checkbox & Combined Bill State
  const [selectedReceiptIds, setSelectedReceiptIds] = useState<string[]>([]);
  const [showBatchPrintModal, setShowBatchPrintModal] = useState(false);

  const handleToggleSelectAll = () => {
    if (selectedReceiptIds.length === filteredMortgages.length && filteredMortgages.length > 0) {
      setSelectedReceiptIds([]);
    } else {
      setSelectedReceiptIds(filteredMortgages.map(m => m.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedReceiptIds.includes(id)) {
      setSelectedReceiptIds(selectedReceiptIds.filter(i => i !== id));
    } else {
      setSelectedReceiptIds([...selectedReceiptIds, id]);
    }
  };

  const selectedMortgages = useMemo(() => {
    return mortgages.filter(m => selectedReceiptIds.includes(m.id));
  }, [mortgages, selectedReceiptIds]);

  const selectedTotalPrincipal = useMemo(() => {
    return selectedMortgages.reduce((sum, m) => sum + m.principalAmount, 0);
  }, [selectedMortgages]);

  const selectedTotalInterest = useMemo(() => {
    return selectedMortgages.reduce((sum, m) => sum + calculateInterest(m).dueInterest, 0);
  }, [selectedMortgages]);

  const selectedGrandTotal = selectedTotalPrincipal + selectedTotalInterest;

  return (
    <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 bg-[#fcfaf7] min-h-full font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-amber-500/30"
          >
            <Sparkles className="text-amber-400 shrink-0" size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header & Metrics */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <HandCoins className="text-[#c59b27]" size={28} />
            স্বর্ণ বন্ধক ও অগ্রিম ঋণ পত্র (Gold Mortgage Voucher Ledger)
          </h1>
          <p className="text-xs text-gray-500 font-medium max-w-xl">
            গ্রাহকের বন্ধকি স্বর্ণের অলঙ্কার বিবরণী, সুদের হিসাব, হোয়াটসঅ্যাপ/এসএমএস তাগাদা ও বন্ধক ঋণপত্র জেনারেটর।
          </p>
        </div>

        <div className="flex gap-3">
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold uppercase">মোট একটিভ বন্ধক ঋণ</span>
            <span className="text-base font-black text-amber-600">BDT {totalActiveLoan.toLocaleString('bn-BD')}</span>
          </div>
          <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold uppercase">মোট সংগৃহীত রেকর্ড</span>
            <span className="text-base font-black text-green-600">{mortgages.length} টি</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input 
            type="text" 
            placeholder="গ্রাহকের নাম, মোবাইল বা রসিদ নাম্বার দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-12 pr-10 text-xs focus:outline-none focus:ring-1 focus:ring-[#c59b27]"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto">
          <button onClick={() => setStatusFilter('all')} className={`whitespace-nowrap px-4 py-2 text-[11px] font-bold rounded-xl ${statusFilter === 'all' ? 'bg-[#c59b27] text-black' : 'bg-gray-50 text-gray-600'}`}>সব রসিদ</button>
          <button onClick={() => setStatusFilter('active')} className={`whitespace-nowrap px-4 py-2 text-[11px] font-bold rounded-xl ${statusFilter === 'active' ? 'bg-[#c59b27] text-black' : 'bg-gray-50 text-gray-600'}`}>চলতি বন্ধক</button>
          <button onClick={() => setStatusFilter('redeemed')} className={`whitespace-nowrap px-4 py-2 text-[11px] font-bold rounded-xl ${statusFilter === 'redeemed' ? 'bg-[#c59b27] text-black' : 'bg-gray-50 text-gray-600'}`}>খালাসকৃত</button>
          <button onClick={() => handleOpenExpressSms(activeVoucher || mortgages[0])} className="whitespace-nowrap px-4 py-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white text-[11px] font-black rounded-xl flex items-center gap-1.5 shadow-sm hover:opacity-95 transition-all">
            <Zap size={14} className="text-amber-300 animate-pulse" />
            এসএমএস ও হোয়াটসঅ্যাপ প্যানেল
          </button>
          <button onClick={handleDownloadCSV} className="whitespace-nowrap px-4 py-2 bg-green-800 text-white text-[11px] font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
            <Download size={14} />
            সিএসভি সেভ
          </button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form: New Mortgage Record */}
        <form onSubmit={handleCreateMortgage} className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <Plus className="text-[#c59b27]" size={18} />
              নতুন বন্ধকি ঋণ পত্র তৈরি
            </h2>
            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
              রসিদ নং: #{receiptNo}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center justify-between">
                গ্রাহকের নাম *
                <button 
                  type="button"
                  onClick={() => {
                    const recognition = new (window as any).webkitSpeechRecognition();
                    recognition.lang = 'bn-BD';
                    recognition.onresult = (event: any) => {
                      setCustomerName(event.results[0][0].transcript);
                    };
                    recognition.start();
                  }}
                  className="p-1 hover:bg-amber-100 rounded-full transition-colors text-amber-600"
                  title="Voice Input"
                >
                  <Mic size={12} />
                </button>
              </label>
              <input 
                type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} 
                placeholder="যেমন: সুমাইয়া আক্তার" className="bg-gray-50 border p-2.5 rounded-xl text-xs font-bold w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">মোবাইল নম্বর</label>
              <input 
                type="text" value={customerMobile} onChange={e => setCustomerMobile(e.target.value)} 
                placeholder="০১৮০৪৬৮৯৪৮৮" className="bg-gray-50 border p-2.5 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center justify-between">
                ঠিকানা
                <button 
                  type="button"
                  onClick={() => {
                    const recognition = new (window as any).webkitSpeechRecognition();
                    recognition.lang = 'bn-BD';
                    recognition.onresult = (event: any) => {
                      setCustomerAddress(event.results[0][0].transcript);
                    };
                    recognition.start();
                  }}
                  className="p-1 hover:bg-amber-100 rounded-full transition-colors text-amber-600"
                  title="Voice Input"
                >
                  <Mic size={12} />
                </button>
              </label>
              <input 
                type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} 
                placeholder="যেমন: বন্দরটিলা" className="bg-gray-50 border p-2.5 rounded-xl text-xs font-bold w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">রসিদ নাম্বার</label>
              <input 
                type="text" value={receiptNo} onChange={e => setReceiptNo(e.target.value)} 
                className="bg-gray-50 border p-2.5 rounded-xl text-xs font-bold text-center text-amber-800"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center justify-between">
              বন্ধকি স্বর্ণের নাম/বিবরণ *
              <button 
                type="button"
                onClick={() => {
                  const recognition = new (window as any).webkitSpeechRecognition();
                  recognition.lang = 'bn-BD';
                  recognition.onresult = (event: any) => {
                    setItemName(event.results[0][0].transcript);
                  };
                  recognition.start();
                }}
                className="p-1 hover:bg-amber-100 rounded-full transition-colors text-amber-600"
                title="Voice Input"
              >
                <Mic size={12} />
              </button>
            </label>
            <input 
              type="text" required value={itemName} onChange={e => setItemName(e.target.value)} 
              placeholder="যেমন: দুল এক জোড়া" className="bg-gray-50 border p-2.5 rounded-xl text-xs font-bold w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">স্বর্ণের ক্যারেট</label>
              <select value={karat} onChange={e => setKarat(e.target.value)} className="bg-gray-50 border p-2.5 rounded-xl text-xs font-bold">
                <option value="21">21 ক্যারেট</option>
                <option value="22">22 ক্যারেট</option>
                <option value="18">18 ক্যারেট</option>
                <option value="সনাতন">সনাতন</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">ঋণ পরিমাণ (BDT) *</label>
              <input 
                type="number" required value={principalAmount} onChange={e => setPrincipalAmount(Number(e.target.value))} 
                className="bg-gray-50 border p-2.5 rounded-xl text-sm font-black text-red-600 text-center"
              />
            </div>
          </div>

          {/* Weight Section with Auto Conversion (Grams <-> Vori, Ana, Roti, Point) */}
          <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 flex flex-col gap-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-tight flex items-center gap-1">
                <Scale size={13} className="text-amber-700" />
                স্বর্ণের ওজন (গ্রাম ও ভরি-আনা-রতি)
              </span>
              <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                ✨ অটো ক্যালকুলেটর
              </span>
            </div>

            {/* Grams Input Field */}
            <div className="bg-white p-2.5 rounded-xl border border-amber-300 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold text-amber-900">ওজন গ্রামে (Grams) *</label>
                <span className="text-[9px] font-medium text-amber-700">গ্রাম লিখলে ভরি, আনা, রতি ও পয়েন্ট অটো হিসাব হবে</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <input 
                  type="number" 
                  step="0.001" 
                  value={gramWeight || ''} 
                  onChange={e => handleGramWeightChange(parseFloat(e.target.value) || 0)} 
                  placeholder="0.000"
                  className="w-24 bg-amber-50 border border-amber-300 p-1.5 rounded-lg text-center text-sm font-black text-amber-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-xs font-black text-amber-800">গ্রাম</span>
              </div>
            </div>

            {/* Traditional Breakdown (Vori, Ana, Roti, Point) */}
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-amber-100">
                <span className="text-[9px] text-gray-500 font-bold">ভরি</span>
                <input 
                  type="number" 
                  value={vori} 
                  onChange={e => handleTraditionalWeightChange(Number(e.target.value), ana, roti, point)} 
                  className="w-full bg-gray-50 border border-gray-200 p-1 rounded-lg text-center text-xs font-black text-gray-800 focus:bg-white focus:outline-none" 
                />
              </div>
              <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-amber-100">
                <span className="text-[9px] text-gray-500 font-bold">আনা</span>
                <input 
                  type="number" 
                  value={ana} 
                  onChange={e => handleTraditionalWeightChange(vori, Number(e.target.value), roti, point)} 
                  className="w-full bg-gray-50 border border-gray-200 p-1 rounded-lg text-center text-xs font-black text-gray-800 focus:bg-white focus:outline-none" 
                />
              </div>
              <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-amber-100">
                <span className="text-[9px] text-gray-500 font-bold">রতি</span>
                <input 
                  type="number" 
                  value={roti} 
                  onChange={e => handleTraditionalWeightChange(vori, ana, Number(e.target.value), point)} 
                  className="w-full bg-gray-50 border border-gray-200 p-1 rounded-lg text-center text-xs font-black text-gray-800 focus:bg-white focus:outline-none" 
                />
              </div>
              <div className="flex flex-col items-center bg-white p-1.5 rounded-xl border border-amber-100">
                <span className="text-[9px] text-gray-500 font-bold">পয়েন্ট</span>
                <input 
                  type="number" 
                  value={point} 
                  onChange={e => handleTraditionalWeightChange(vori, ana, roti, Number(e.target.value))} 
                  className="w-full bg-gray-50 border border-gray-200 p-1 rounded-lg text-center text-xs font-black text-gray-800 focus:bg-white focus:outline-none" 
                />
              </div>
            </div>

            {/* Interest Rate Field */}
            <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-amber-100 mt-0.5">
              <span className="text-[10px] font-bold text-amber-900">মাসিক সুদের হার (%)</span>
              <input 
                type="number" 
                step="0.5" 
                value={interestRate} 
                onChange={e => setInterestRate(Number(e.target.value))} 
                className="w-20 bg-amber-50 border border-amber-200 p-1 rounded-lg text-center text-xs font-black text-amber-800 focus:bg-white focus:outline-none" 
              />
            </div>
          </div>

          {/* Image Choice */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">অলঙ্কারের ছবি (Camera/Upload)</label>
            <div className="flex flex-col gap-2">
              {itemPhoto && itemPhoto !== defaultJewelryImage ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
                  <img src={itemPhoto} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setItemPhoto(defaultJewelryImage)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center py-2">
                    <Camera size={20} className="text-gray-400 mb-1" />
                    <p className="text-[9px] text-gray-500 font-bold uppercase text-center px-2">ক্লিক করে ছবি তুলুন বা আপলোড করুন</p>
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
                          setItemPhoto(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <button type="submit" className="bg-[#18181b] hover:bg-black text-[#c59b27] font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-lg transition-all mt-1">
            <FileText size={16} />
            বন্ধকি ঋণ রসিদ পত্র তৈরি ও প্রিভিউ
          </button>
        </form>

        {/* Right List: Records Table */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[480px]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-tight">সংগৃহীত বন্ধকি ঋণ রসিদ সমূহ</h2>
                {selectedReceiptIds.length > 0 && (
                  <span className="text-[10px] font-extrabold bg-amber-500 text-black px-2.5 py-0.5 rounded-full">
                    {selectedReceiptIds.length} টি সিলেক্টেড
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold text-gray-400">{filteredMortgages.length} টি এন্ট্রি</span>
            </div>

            {/* Batch Selection Banner */}
            <AnimatePresence>
              {selectedReceiptIds.length > 0 && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white p-3.5 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shadow-inner"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-[#c59b27] text-black font-black px-2.5 py-1 rounded-xl text-[11px] flex items-center gap-1 shadow-sm">
                      <CheckCircle2 size={14} />
                      <span>{selectedReceiptIds.length} জন কাস্টমার</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold">
                      <span className="text-gray-300">মূল ঋণ: <strong className="text-white">৳{selectedTotalPrincipal.toLocaleString('bn-BD')}</strong></span>
                      <span className="text-amber-300">+সুদ: <strong>৳{selectedTotalInterest.toLocaleString('bn-BD')}</strong></span>
                      <span className="text-amber-300 font-black text-xs bg-amber-900/80 px-2.5 py-1 rounded-lg border border-amber-400/30">
                        মোট: ৳{selectedGrandTotal.toLocaleString('bn-BD')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowBatchPrintModal(true)}
                      className="bg-[#c59b27] hover:bg-amber-400 text-black font-black px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      <Printer size={14} />
                      <span>বিল ইনভয়েস প্রিন্ট ({selectedReceiptIds.length})</span>
                    </button>
                    <button
                      onClick={() => setSelectedReceiptIds([])}
                      className="text-gray-400 hover:text-white px-2 py-1 text-xs font-bold"
                    >
                      ক্লিয়ার
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[9px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-3 py-3 text-center w-10">
                      <input 
                        type="checkbox" 
                        checked={filteredMortgages.length > 0 && selectedReceiptIds.length === filteredMortgages.length}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                        title="সব সিলেক্ট / আনসিলেক্ট করুন"
                      />
                    </th>
                    <th className="px-3 py-3">রসিদ #</th>
                    <th className="px-4 py-3">গ্রাহক</th>
                    <th className="px-4 py-3">অলঙ্কার</th>
                    <th className="px-4 py-3">ঋণ ও সুদ</th>
                    <th className="px-4 py-3">অবস্থা</th>
                    <th className="px-4 py-3 text-center">ভাউচার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredMortgages.map((m) => {
                    const calc = calculateInterest(m);
                    const isSelected = selectedReceiptIds.includes(m.id);
                    return (
                      <tr key={m.id} className={`transition-colors ${isSelected ? 'bg-amber-50/70' : 'hover:bg-amber-50/30'}`}>
                        <td className="px-3 py-4 text-center">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleToggleSelectOne(m.id)}
                            className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500 cursor-pointer accent-amber-600"
                          />
                        </td>
                        <td className="px-3 py-4 font-black text-amber-700 text-xs">#{m.receiptNo}</td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-900">{m.customerName}</span>
                            <span className="text-[10px] text-gray-400">{m.customerMobile}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <img src={m.itemPhoto || defaultJewelryImage} alt={m.itemName} className="w-9 h-9 rounded-lg object-cover border shrink-0" />
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-gray-800">{m.itemName}</span>
                              <span className="text-[9px] text-amber-800 font-medium">
                                {m.traditionalWeight.vori}ভ {m.traditionalWeight.ana}আ ({m.weight}g)
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-red-600">৳ {m.principalAmount.toLocaleString('bn-BD')}</span>
                            <span className="text-[9px] text-amber-700 font-bold">+সুদ ৳ {calc.dueInterest.toLocaleString('bn-BD')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.status === 'active' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                            {m.status === 'active' ? 'চলতি' : 'খালাসকৃত'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => setActiveVoucher(m)}
                              className="bg-gray-900 hover:bg-black text-[#c59b27] text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm transition-all"
                            >
                              <FileText size={12} />
                              পত্র খুলুন
                            </button>
                            <button onClick={() => handleDelete(m.id)} className="text-gray-300 hover:text-red-500 p-1">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredMortgages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-300 py-16">
                <HandCoins size={50} />
                <p className="text-xs font-bold mt-2">কোন বন্ধকি রেকর্ড পাওয়া যায়নি</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MATCHING POPUP VOUCHER MODAL (AS IN USER SCREENSHOT) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {activeVoucher && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 no-print overflow-hidden cursor-pointer"
            onClick={() => setActiveVoucher(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative border border-amber-200/80 overflow-hidden cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Sticky Top Bar for Modal Controls */}
              <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 px-5 py-3 border-b border-amber-200/80 flex items-center justify-between shrink-0 no-print">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-[#7a0a0a] flex items-center justify-center font-bold shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#7a0a0a] tracking-tight">স্বর্ণ বন্ধক ও ঋণ ভাউচার</h3>
                    <p className="text-[10px] text-gray-500 font-bold">রসিদ নং: <span className="font-mono text-[#a63100] font-black">{activeVoucher.receiptNo}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 bg-[#7a0a0a] hover:bg-[#5a0707] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Printer size={14} />
                    <span className="hidden sm:inline">প্রিন্ট রসিদ</span>
                  </button>
                  <button 
                    onClick={() => setActiveVoucher(null)} 
                    className="w-8 h-8 rounded-xl bg-gray-200/80 hover:bg-gray-300 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                    title="বন্ধ করুন"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Scrollable Voucher Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 custom-scrollbar bg-white">
                <div id="printable-mortgage-voucher">
                  
                  {/* 1. Header Section */}
                  <div className="text-center flex flex-col items-center gap-1 mb-4">
                    {/* Brand Title */}
                    <div className="flex items-center justify-center gap-2 mt-0.5">
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 text-[#c59b27] flex items-center justify-center font-black shrink-0">
                        <Sparkles size={16} />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black text-[#7a0a0a] tracking-tight font-serif">
                        দি আমিন জুয়েলার্স
                      </h2>
                    </div>

                    <p className="text-[10px] sm:text-xs text-gray-500 font-semibold max-w-md">
                      ঠিকানা: রূপালী চত্বর, চকবাজার, চট্টগ্রাম। ফোন: 01612424802 / 01812424802
                    </p>

                    {/* Badge Button */}
                    <div className="mt-2">
                      <div className="bg-[#e68a00] text-white px-5 py-1.5 rounded-full text-xs font-black shadow-sm inline-block uppercase tracking-wider">
                        স্বর্ণ বন্ধক ও অগ্রিম ঋণ পত্র
                      </div>
                    </div>
                  </div>

                  {/* 2. Metadata Gray Card */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col gap-2.5 my-3 shadow-xs">
                    <div className="flex justify-between items-center text-xs border-b border-slate-200/80 pb-2.5">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">রসিদ নাম্বার</span>
                        <span className="text-xl sm:text-2xl font-black text-[#a63100] font-mono">{activeVoucher.receiptNo}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">তারিখ</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-800 font-mono">{activeVoucher.startDate}</span>
                      </div>
                    </div>

                    <div className="flex flex-col text-xs font-bold text-slate-900 pt-0.5 space-y-0.5">
                      <span className="text-sm sm:text-base font-black text-slate-900">{activeVoucher.customerName}</span>
                      <span className="text-slate-600 text-xs font-semibold">মোবাইল : <span className="font-mono text-slate-800 font-bold">{activeVoucher.customerMobile}</span></span>
                      <span className="text-slate-500 text-xs">ঠিকানা: {activeVoucher.customerAddress || 'বন্দরটিলা, চট্টগ্রাম'}</span>
                    </div>
                  </div>

                  {/* 3. Mortgage Item Card (Cream/Yellow Box with Thumbnail) */}
                  <div className="bg-[#fffdf2] border border-amber-200/90 rounded-2xl p-4 flex flex-col gap-2.5 my-3 shadow-xs">
                    <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">
                      বন্ধকি স্বর্ণের অলঙ্কার বিবরণী
                    </span>

                    <div className="flex items-center gap-3.5">
                      <img 
                        src={activeVoucher.itemPhoto || defaultJewelryImage} 
                        alt={activeVoucher.itemName} 
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-300 shadow-sm shrink-0" 
                      />
                      <div className="flex-1 flex justify-between items-center flex-wrap gap-2">
                        <div className="flex flex-col">
                          <h4 className="text-base sm:text-lg font-black text-slate-900">{activeVoucher.itemName}</h4>
                          <span className="text-[10px] font-bold text-slate-400 mt-0.5">স্বর্ণের ক্যারেট ও ঐতিহ্যগত ওজন</span>
                          <span className="text-xs sm:text-sm font-extrabold text-amber-900">
                            {activeVoucher.traditionalWeight.vori} ভরি {activeVoucher.traditionalWeight.ana} আনা ({activeVoucher.karat})
                          </span>
                        </div>

                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-[10px] font-bold text-slate-400">গ্রাম ওজন</span>
                          <span className="text-sm sm:text-base font-black text-slate-900 font-mono">{activeVoucher.weight} gm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Financial Calculations Breakdown */}
                  {(() => {
                    const calc = calculateInterest(activeVoucher);
                    return (
                      <div className="flex flex-col gap-2 my-4 text-xs sm:text-sm font-bold text-slate-800 px-1">
                        <div className="flex justify-between items-center py-1 border-b border-slate-100">
                          <span className="text-slate-600">আদি ঋণ প্রদানকৃত অর্থ (Original Loan):</span>
                          <span className="font-extrabold text-slate-900 font-mono">BDT {calc.originalPrincipal.toLocaleString('bn-BD')} Taka</span>
                        </div>

                        {calc.paidPrincipal > 0 && (
                          <div className="flex justify-between items-center py-1 text-emerald-700 border-b border-slate-100">
                            <span>পরিশোধিত আসল কিস্তি (Principal Paid):</span>
                            <span className="font-extrabold font-mono">-BDT {calc.paidPrincipal.toLocaleString('bn-BD')} Taka</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center my-1 bg-amber-50/90 px-3 py-2 rounded-xl border border-amber-200/80">
                          <span className="text-amber-900 font-extrabold">বর্তমান অবশিষ্ট আসল (Active Loan Principal):</span>
                          <span className="font-black text-amber-900 text-sm sm:text-base font-mono">BDT {calc.currentPrincipal.toLocaleString('bn-BD')} Taka</span>
                        </div>

                        <div className="flex justify-between items-center py-1 text-amber-800">
                          <span>মাসিক সুদ ({activeVoucher.interestRate}%) × {calc.months} মাস:</span>
                          <span className="font-extrabold font-mono">+BDT {calc.totalInterestAccrued.toLocaleString('bn-BD')} Taka</span>
                        </div>

                        <div className="flex justify-between items-center py-1 text-emerald-600 border-t border-dashed border-slate-200 pt-2">
                          <span>সংগৃহীত মোট সুদ (Interest Collected):</span>
                          <span className="font-extrabold font-mono">-BDT {calc.collectedInterest.toLocaleString('bn-BD')} Taka</span>
                        </div>

                        <div className="flex justify-between items-center py-1 text-[#800000]">
                          <span>বকেয়া অবশিষ্ট সুদ (Interest Due Balance):</span>
                          <span className="font-extrabold font-mono">+BDT {calc.dueInterest.toLocaleString('bn-BD')} Taka</span>
                        </div>

                        {/* 5. Total Redemption Highlight Bar */}
                        <div className="bg-slate-900 text-white p-4 rounded-2xl flex justify-between items-center my-3 shadow-md border border-slate-800">
                          <span className="text-xs sm:text-sm font-bold text-slate-200">সর্বমোট প্রদেয় অর্থ (Total Redemption):</span>
                          <span className="text-base sm:text-xl font-black text-[#facc15] font-mono tracking-tight">BDT {calc.totalRedemption.toLocaleString('bn-BD')} Taka</span>
                        </div>

                        {/* Payment History Log if exists */}
                        {activeVoucher.payments && activeVoucher.payments.length > 0 && (
                          <div className="mt-2 bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex flex-col gap-2">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                              জমা সমন্বয় ও খতিয়ান হিস্ট্রি (Payment Ledger History)
                            </span>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-[11px]">
                                <thead>
                                  <tr className="border-b border-slate-200 text-slate-400 font-bold">
                                    <th className="pb-1">তারিখ</th>
                                    <th className="pb-1">ধরণ</th>
                                    <th className="pb-1 text-right">পরিমাণ (৳)</th>
                                    <th className="pb-1 text-right">মন্তব্য</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                  {activeVoucher.payments.map((p, idx) => (
                                    <tr key={p.id || idx}>
                                      <td className="py-1.5 text-slate-500 font-mono">{p.date}</td>
                                      <td className="py-1.5 font-bold">
                                        {p.type === 'interest' ? (
                                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[10px]">সুদ জমা</span>
                                        ) : (
                                          <span className="text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md text-[10px]">আসল সমন্বয়</span>
                                        )}
                                      </td>
                                      <td className="py-1.5 text-right font-black text-slate-900 font-mono">
                                        ৳ {p.amount.toLocaleString('bn-BD')}
                                      </td>
                                      <td className="py-1.5 text-right text-slate-400 text-[10px]">
                                        {p.note || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* 6. Terms Box */}
                  <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-[10px] text-slate-600 space-y-1 my-3">
                    <p className="font-extrabold text-slate-800">বন্ধকি শর্তাবলী:</p>
                    <p>১. বন্ধকি ঋণ গ্রহণের মেয়াদ সর্বোচ্চ ৬ মাস। মেয়াদ উত্তীর্নের পর স্বর্ণ নিলাম করার অধিকার জুয়েলার্স কর্তৃপক্ষের থাকিবে।</p>
                    <p>২. বন্ধক চলাকালীন অলঙ্কারাদি সম্পূর্ণ নিরাপদ ব্যাংক ভল্ট লকারে সংরক্ষিত থাকিবে এবং কোনো ক্ষতিসাধন হইলে আমিন জুয়েলার্স দায়বদ্ধ থাকিবে।</p>
                  </div>

                  {/* 7. Signatures Row */}
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 pt-8 pb-3">
                    <div className="text-center border-t border-dashed border-slate-400 w-36 pt-1">গ্রাহকের স্বাক্ষর</div>
                    <div className="text-center border-t border-dashed border-slate-400 w-44 pt-1">আমিন জুয়েলার্স স্বাক্ষর</div>
                  </div>

                </div>
              </div>

              {/* Bottom Action Buttons Sticky Row */}
              <div className="bg-slate-50 border-t border-slate-200/80 p-3 sm:p-4 shrink-0 no-print">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  
                  {/* 1. Collect Interest / Principal Button */}
                  <button 
                    onClick={() => {
                      const calc = calculateInterest(activeVoucher);
                      setPaymentMode('interest');
                      setInterestInput(calc.dueInterest || calc.monthlyRate);
                      setPrincipalInput(0);
                      setShowInterestModal(true);
                    }}
                    className="bg-[#059669] hover:bg-[#047857] text-white py-2.5 px-2 rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Banknote size={16} />
                    <span>সুদ/আসল জমা</span>
                  </button>

                  {/* 2. SMS Button */}
                  <button 
                    onClick={() => handleSendSMS(activeVoucher)}
                    className="bg-[#6366f1] hover:bg-[#4f46e5] text-white py-2.5 px-2 rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <MessageSquare size={16} />
                    <span>এসএমএস</span>
                  </button>

                  {/* 3. WhatsApp Button */}
                  <button 
                    onClick={() => handleWhatsApp(activeVoucher)}
                    className="bg-[#10b981] hover:bg-[#059669] text-white py-2.5 px-2 rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <PhoneCall size={16} />
                    <span>হোয়াটসঅ্যাপ</span>
                  </button>

                  {/* 4. Edit Button */}
                  <button 
                    onClick={() => {
                      setEditItem(activeVoucher);
                      setShowEditModal(true);
                    }}
                    className="bg-[#d97706] hover:bg-[#b45309] text-white py-2.5 px-2 rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Edit size={16} />
                    <span>সম্পাদনা</span>
                  </button>

                  {/* 5. Print Button */}
                  <button 
                    onClick={() => window.print()}
                    className="bg-[#eab308] hover:bg-[#ca8a04] text-slate-950 py-2.5 px-2 rounded-xl text-[11px] font-black flex flex-col items-center justify-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Printer size={16} />
                    <span>প্রিন্ট রসিদ</span>
                  </button>

                  {/* 6. Close Button */}
                  <button 
                    onClick={() => setActiveVoucher(null)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 py-2.5 px-2 rounded-xl text-[11px] font-extrabold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95"
                  >
                    <X size={16} />
                    <span>বন্ধ করুন</span>
                  </button>

                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collect Interest & Principal Payment Modal */}
      <AnimatePresence>
        {showInterestModal && activeVoucher && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden"
          >
            {(() => {
              const calc = calculateInterest(activeVoucher);
              const remainingAfterPrincipal = Math.max(0, calc.currentPrincipal - (principalInput || 0));
              const newMonthlyInterest = (remainingAfterPrincipal * activeVoucher.interestRate) / 100;

              return (
                <form 
                  onSubmit={handleCollectInterestSubmit} 
                  className="bg-white rounded-3xl p-5 md:p-8 w-full max-w-md max-h-[92vh] overflow-y-auto flex flex-col gap-6 shadow-2xl relative border border-emerald-100/80 custom-scrollbar"
                >
                  {/* Close X Button */}
                  <button 
                    type="button" 
                    onClick={() => setShowInterestModal(false)} 
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 flex items-center justify-center transition-all z-10"
                  >
                    <X size={18} />
                  </button>

                  {/* Header Row */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                      <Banknote size={20} />
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                        জমা ও আসল সমন্বয় ফরম
                      </h3>
                      <span className="text-xs font-bold text-gray-500">
                        রসিদ নং: #{activeVoucher.receiptNo} • {activeVoucher.customerName}
                      </span>
                    </div>
                  </div>

                  {/* Payment Mode Selector Tabs */}
                  <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-2xl text-xs font-extrabold">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('interest')}
                      className={`py-2 px-1 rounded-xl transition-all ${
                        paymentMode === 'interest' 
                          ? 'bg-white text-emerald-800 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      সুদের কিস্তি
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('principal')}
                      className={`py-2 px-1 rounded-xl transition-all ${
                        paymentMode === 'principal' 
                          ? 'bg-white text-indigo-800 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      আসল সমন্বয়
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode('combined')}
                      className={`py-2 px-1 rounded-xl transition-all ${
                        paymentMode === 'combined' 
                          ? 'bg-white text-amber-800 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      সুদ+আসল একত্রে
                    </button>
                  </div>

                  {/* Information Card (Grey Card as in Screenshot) */}
                  <div className="bg-gray-50/90 rounded-2xl p-3.5 border border-gray-100 flex flex-col gap-2 text-xs font-bold text-gray-800">
                    <div className="flex justify-between items-center pb-1 border-b border-gray-200/50">
                      <span className="text-gray-500">গ্রাহক মোবাইল:</span>
                      <span className="text-gray-900 font-extrabold">{activeVoucher.customerMobile}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">আদি মূলধন (Original Principal):</span>
                      <span className="font-bold text-gray-600">৳ {calc.originalPrincipal.toLocaleString('en-US')}</span>
                    </div>

                    <div className="flex justify-between items-center text-indigo-900 bg-indigo-50/70 px-2 py-1 rounded-xl">
                      <span>বর্তমান অবশিষ্ট মূলধন (Current Loan):</span>
                      <span className="font-black text-sm">৳ {calc.currentPrincipal.toLocaleString('en-US')}</span>
                    </div>

                    <div className="flex justify-between items-center text-amber-800">
                      <span className="text-gray-500">মাসিক সুদের হার ({activeVoucher.interestRate}%):</span>
                      <span className="font-extrabold">৳ {calc.monthlyRate.toLocaleString('en-US')} / মাস</span>
                    </div>

                    <div className="flex justify-between items-center text-emerald-600 pt-1 border-t border-gray-200/50">
                      <span className="text-gray-500">পূর্বে জমার্ঘ সংগৃহীত সুদ:</span>
                      <span className="font-extrabold">৳ {calc.collectedInterest.toLocaleString('en-US')}</span>
                    </div>

                    <div className="flex justify-between items-center text-[#800000] font-black pt-1">
                      <span>বর্তমান বকেয়া সুদ:</span>
                      <span className="text-sm">৳ {calc.dueInterest.toLocaleString('en-US')}</span>
                    </div>
                  </div>

                  {/* MODE 1: INTEREST ONLY */}
                  {(paymentMode === 'interest' || paymentMode === 'combined') && (
                    <div className="flex flex-col gap-3 pt-1 border-t border-dashed border-gray-200">
                      {paymentMode === 'interest' && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-extrabold text-gray-600">দ্রুত সুদের পরিমাণ বাছাই:</span>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setInterestInput(calc.monthlyRate)}
                              className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all border ${
                                interestInput === calc.monthlyRate 
                                  ? 'bg-[#059669] text-white border-[#059669] shadow-sm' 
                                  : 'bg-emerald-50/60 text-emerald-800 border-emerald-100 hover:bg-emerald-100'
                              }`}
                            >
                              ১ মাস (৳{calc.monthlyRate})
                            </button>
                            <button
                              type="button"
                              onClick={() => setInterestInput(calc.monthlyRate * 2)}
                              className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all border ${
                                interestInput === calc.monthlyRate * 2 
                                  ? 'bg-[#059669] text-white border-[#059669] shadow-sm' 
                                  : 'bg-emerald-50/60 text-emerald-800 border-emerald-100 hover:bg-emerald-100'
                              }`}
                            >
                              ২ মাস (৳{calc.monthlyRate * 2})
                            </button>
                            <button
                              type="button"
                              onClick={() => setInterestInput(calc.dueInterest)}
                              className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all border ${
                                interestInput === calc.dueInterest 
                                  ? 'bg-[#059669] text-white border-[#059669] shadow-sm' 
                                  : 'bg-emerald-50/60 text-emerald-800 border-emerald-100 hover:bg-emerald-100'
                              }`}
                            >
                              বকেয়া (৳{calc.dueInterest})
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-extrabold text-gray-700">আদায়কৃত সুদের পরিমাণ (টাকা ৳):</label>
                        <div className="relative bg-gray-50 border-2 border-emerald-500 rounded-2xl p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-400">
                          <span className="text-lg font-black text-gray-400">৳</span>
                          <input 
                            type="number" 
                            value={interestInput || ''} 
                            onChange={e => setInterestInput(Number(e.target.value))}
                            placeholder="0"
                            className="bg-transparent text-xl font-black text-gray-900 w-full focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MODE 2: PRINCIPAL REPAYMENT / ADJUSTMENT */}
                  {(paymentMode === 'principal' || paymentMode === 'combined') && (
                    <div className="flex flex-col gap-3 pt-1 border-t border-dashed border-gray-200">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] font-extrabold text-indigo-900 flex items-center justify-between">
                          <span>দ্রুত আসল জমা নির্বাচন:</span>
                          <span className="text-[10px] text-gray-400">বর্তমানের থেকে কমবে</span>
                        </span>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[1000, 2000, 5000, 10000].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setPrincipalInput(amt)}
                              className={`py-1.5 px-1 rounded-xl text-[11px] font-extrabold transition-all border ${
                                principalInput === amt 
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                  : 'bg-indigo-50/60 text-indigo-900 border-indigo-100 hover:bg-indigo-100'
                              }`}
                            >
                              ৳{amt.toLocaleString('bn-BD')}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setPrincipalInput(calc.currentPrincipal)}
                          className={`py-1.5 px-2 rounded-xl text-xs font-extrabold transition-all border text-center ${
                            principalInput === calc.currentPrincipal 
                              ? 'bg-red-600 text-white border-red-600 shadow-sm' 
                              : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                          }`}
                        >
                          সম্পূর্ণ আসল পরিশোধ (৳{calc.currentPrincipal.toLocaleString('bn-BD')})
                        </button>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-extrabold text-indigo-900">পরিশোধিত আসলের পরিমাণ (টাকা ৳):</label>
                        <div className="relative bg-gray-50 border-2 border-indigo-500 rounded-2xl p-2.5 flex items-center gap-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-400">
                          <span className="text-lg font-black text-gray-400">৳</span>
                          <input 
                            type="number" 
                            value={principalInput || ''} 
                            onChange={e => setPrincipalInput(Number(e.target.value))}
                            placeholder="0"
                            className="bg-transparent text-xl font-black text-gray-900 w-full focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Live Computation Preview Box */}
                      {principalInput > 0 && (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex flex-col gap-1 text-xs font-bold text-amber-900">
                          <div className="flex justify-between items-center">
                            <span>সমন্বয় পরবর্তী অবশিষ্ট মূলধন:</span>
                            <span className="font-black text-indigo-900 text-sm">৳ {remainingAfterPrincipal.toLocaleString('bn-BD')}</span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-800">
                            <span>নতুন পরিবর্তিত মাসিক সুদ:</span>
                            <span className="font-extrabold">৳ {newMonthlyInterest.toLocaleString('bn-BD')} / মাস</span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">
                            * আসল কিস্তি জমা দিলে পরবর্তী মাস থেকে পরিবর্তিত অবশিষ্ট আসলের উপর {activeVoucher.interestRate}% সুদের হিসাব প্রযোজ্য হবে।
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Note Input */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-gray-600">মন্তব্য / নোট (ঐচ্ছিক):</label>
                    <input 
                      type="text" 
                      value={paymentNote} 
                      onChange={e => setPaymentNote(e.target.value)} 
                      placeholder="যেমন: ১/২ কিস্তি, নগদ বা ব্যাংক ট্রান্সফার"
                      className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-800 focus:outline-none focus:bg-white"
                    />
                  </div>

                  {/* Total Summary Bar for Combined */}
                  {paymentMode === 'combined' && (
                    <div className="bg-gray-900 text-white p-3 rounded-2xl flex justify-between items-center text-xs font-bold">
                      <span>সর্বমোট আদায় (সুদ+আসল):</span>
                      <span className="text-amber-400 font-black text-sm">৳ {((interestInput || 0) + (principalInput || 0)).toLocaleString('bn-BD')}</span>
                    </div>
                  )}

                  {/* Modal Action Buttons */}
                  <div className="flex flex-col gap-2 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBkashModal(true)}
                        className="w-full bg-[#e2136e] hover:bg-[#c20d5d] text-white font-black py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <QrCode size={15} />
                        <span>বিকাশ QR পেমেন্ট</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCardModal(true)}
                        className="w-full bg-blue-900 hover:bg-blue-950 text-white font-black py-2.5 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                      >
                        <CreditCard size={15} className="text-yellow-400" />
                        <span>ব্যাংক কার্ড / POS</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowInterestModal(false)} 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold px-5 py-3 rounded-2xl text-xs transition-all"
                      >
                        বাতিল
                      </button>
                      <button 
                        type="submit" 
                        className="bg-[#059669] hover:bg-[#047857] text-white font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md flex-1 transition-all"
                      >
                        <Check size={16} />
                        {paymentMode === 'interest' ? 'সুদ জমা সম্পন্ন করুন' : paymentMode === 'principal' ? 'আসল সমন্বয় সম্পন্ন করুন' : 'সুদ ও আসল জমা সমন্বয় করুন'}
                      </button>
                    </div>
                  </div>

                </form>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Record Modal */}
      <AnimatePresence>
        {showEditModal && editItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <form onSubmit={handleEditSubmit} className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl relative">
              <button type="button" onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-400">
                <X size={20} />
              </button>
              <h3 className="font-bold text-gray-900 text-base border-b pb-2">বন্ধকি তথ্য সম্পাদনা (Edit Record)</h3>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">গ্রাহকের নাম</label>
                <input 
                  type="text" value={editItem.customerName} 
                  onChange={e => setEditItem({ ...editItem, customerName: e.target.value })} 
                  className="bg-gray-50 border p-2.5 rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">মোবাইল</label>
                  <input 
                    type="text" value={editItem.customerMobile} 
                    onChange={e => setEditItem({ ...editItem, customerMobile: e.target.value })} 
                    className="bg-gray-50 border p-2.5 rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">ঠিকানা</label>
                  <input 
                    type="text" value={editItem.customerAddress || ''} 
                    onChange={e => setEditItem({ ...editItem, customerAddress: e.target.value })} 
                    className="bg-gray-50 border p-2.5 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">ঋণ টাকা (BDT)</label>
                  <input 
                    type="number" value={editItem.principalAmount} 
                    onChange={e => setEditItem({ ...editItem, principalAmount: Number(e.target.value) })} 
                    className="bg-gray-50 border p-2.5 rounded-xl text-xs font-bold text-red-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">মাসিক সুদের %</label>
                  <input 
                    type="number" step="0.5" value={editItem.interestRate} 
                    onChange={e => setEditItem({ ...editItem, interestRate: Number(e.target.value) })} 
                    className="bg-gray-50 border p-2.5 rounded-xl text-xs font-bold text-amber-700"
                  />
                </div>
              </div>

              {/* Weight Section in Edit Modal */}
              <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-amber-900 uppercase flex items-center gap-1">
                  <Scale size={12} className="text-amber-700" />
                  স্বর্ণের ওজন সম্পাদনা (গ্রাম ও ভরি-আনা-রতি)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-600">ওজন গ্রামে (Grams)</label>
                    <input 
                      type="number" 
                      step="0.001" 
                      value={editItem.weight || ''} 
                      onChange={e => {
                        const g = parseFloat(e.target.value) || 0;
                        const trad = gramsToTraditional(g);
                        setEditItem({ ...editItem, weight: g, traditionalWeight: trad });
                      }} 
                      className="bg-white border border-amber-300 p-2 rounded-xl text-xs font-black text-amber-900 text-center"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-600">ভরি-আনা-রতি হিসাব</label>
                    <div className="bg-white border border-amber-200 p-2 rounded-xl text-xs font-bold text-gray-800 text-center">
                      {editItem.traditionalWeight.vori}ভ {editItem.traditionalWeight.ana}আ {editItem.traditionalWeight.roti}র {editItem.traditionalWeight.point}প
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-xs font-bold text-gray-500">বাতিল</button>
                <button type="submit" className="px-6 py-2.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-md">
                  হালনাগাদ করুন
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Express SMS & WhatsApp Modal (Matching Screenshot) */}
      <AnimatePresence>
        {showExpressSmsModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden"
          >
            <div className="bg-white rounded-3xl p-5 md:p-8 w-full max-w-2xl max-h-[92vh] overflow-y-auto flex flex-col gap-6 shadow-2xl relative border border-emerald-100/80 custom-scrollbar">
              
              {/* Top Header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Zap size={22} className="text-amber-300" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-gray-900 text-base md:text-lg leading-tight">
                        আমিন জুয়েলার্স - অতি দ্রুত এসএমএস ও হোয়াটসঅ্যাপ প্যানেল
                      </h3>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        EXPRESS SYSTEM ONLINE
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium mt-0.5">
                      ১-ক্লিকে হোয়াটসঅ্যাপ ওয়েব, মোবাইল অ্যাপ, ফোন মেসেজিং কিংবা সার্ভার গেটওয়ে দিয়ে মুহূর্তেই বার্তা পাঠান।
                    </span>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => setShowExpressSmsModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-all shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* SECTION 1: Target Group Selection */}
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-black text-gray-800 uppercase tracking-wide">
                  ১. বার্তা প্রাপক বাছাই করুন (TARGET GROUP):
                </span>

                {/* 4 Card Filter Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSmsTargetGroup('single');
                      if (!smsSelectedCustomer && mortgages.length > 0) {
                        setSmsSelectedCustomer(mortgages[0]);
                      }
                    }}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      smsTargetGroup === 'single'
                        ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 shadow-sm'
                        : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xs font-extrabold flex items-center gap-1">
                      🎯 নির্দিষ্ট গ্রাহক
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 mt-1">
                      {smsSelectedCustomer ? smsSelectedCustomer.receiptNo : 'নির্বাচন করুন'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSmsTargetGroup('active')}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      smsTargetGroup === 'active'
                        ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 shadow-sm'
                        : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xs font-extrabold flex items-center gap-1">
                      🚩 চলতি বন্ধকি ঋণ
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 mt-1">
                      {mortgages.filter(m => m.status === 'active').length} জন গ্রাহক
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSmsTargetGroup('expired')}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      smsTargetGroup === 'expired'
                        ? 'bg-amber-50/90 border-amber-500 text-amber-950 ring-2 ring-amber-400 shadow-sm'
                        : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xs font-extrabold flex items-center gap-1">
                      ⚠️ মেয়াদোত্তীর্ণ ঋণ
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 mt-1">
                      {mortgages.filter(m => m.status === 'expired').length} জন গ্রাহক
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSmsTargetGroup('all')}
                    className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      smsTargetGroup === 'all'
                        ? 'bg-emerald-50/90 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 shadow-sm'
                        : 'bg-gray-50/80 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xs font-extrabold flex items-center gap-1">
                      👥 সকল ঋণ খাতা
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 mt-1">
                      {mortgages.length} জন মোট
                    </span>
                  </button>
                </div>

                {/* Dropdown Customer Selector */}
                <div className="flex flex-col gap-1 mt-1">
                  <label className="text-[11px] font-bold text-gray-600">
                    গ্রাহক বা বন্ধকি রসিদ নির্বাচন করুন:
                  </label>
                  <select
                    value={smsSelectedCustomer?.id || ''}
                    onChange={(e) => {
                      const found = mortgages.find(m => m.id === e.target.value);
                      if (found) {
                        setSmsSelectedCustomer(found);
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:bg-white"
                  >
                    {mortgages.map(m => {
                      return (
                        <option key={m.id} value={m.id}>
                          {m.receiptNo} — {m.customerName} ({m.customerMobile}) — ৳{m.principalAmount.toLocaleString('en-US')}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Selected Customer Details Box (matching screenshot green container) */}
                {smsSelectedCustomer && (() => {
                  const calc = calculateInterest(smsSelectedCustomer);
                  return (
                    <div className="bg-[#f0fdf4] border border-emerald-200 rounded-2xl p-3.5 flex flex-col gap-1.5 text-xs font-bold">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">গ্রাহকের নাম:</span>
                          <span className="text-emerald-950 font-extrabold">{smsSelectedCustomer.customerName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">মোবাইল নম্বর:</span>
                          <span className="text-emerald-950 font-extrabold">{smsSelectedCustomer.customerMobile}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">মূলধন ঋণ:</span>
                          <span className="text-gray-900 font-black">৳ {smsSelectedCustomer.principalAmount.toLocaleString('bn-BD')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">মাসিক সুদ:</span>
                          <span className="text-amber-800 font-extrabold">৳ {calc.monthlyRate.toLocaleString('bn-BD')}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 border-t border-emerald-200/60 text-red-600 font-black">
                        <span>বর্তমান বকেয়া সুদ:</span>
                        <span className="text-sm">৳ {calc.dueInterest.toLocaleString('bn-BD')}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* SECTION 2: Message Template Selection */}
              <div className="flex flex-col gap-2.5 pt-2 border-t border-gray-100">
                <span className="text-xs font-black text-gray-800 uppercase tracking-wide">
                  ২. বার্তা টেমপ্লেট নির্বাচন করুন:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSmsTemplate('due')}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all border ${
                      smsTemplate === 'due'
                        ? 'bg-[#059669] text-white border-[#059669] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    💬 সুদের বকেয়া নোটিশ
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmsTemplate('redeem')}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all border ${
                      smsTemplate === 'redeem'
                        ? 'bg-[#059669] text-white border-[#059669] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ⏳ খালাস তাগাদা
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmsTemplate('greeting')}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all border ${
                      smsTemplate === 'greeting'
                        ? 'bg-[#059669] text-white border-[#059669] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    🌸 শুভেচ্ছা ও ছাড়
                  </button>
                  <button
                    type="button"
                    onClick={() => setSmsTemplate('custom')}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold transition-all border ${
                      smsTemplate === 'custom'
                        ? 'bg-[#059669] text-white border-[#059669] shadow-sm'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    ✍️ কাস্টম বার্তা
                  </button>
                </div>

                {/* Textarea Area */}
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-gray-600">
                    <span>বার্তা টেক্সট (Bangla Message Content):</span>
                    <span className="text-gray-400 font-mono">
                      {smsText.length} Chars ({Math.ceil(smsText.length / 160) || 1} SMS / recipient)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={smsText}
                    onChange={(e) => {
                      setSmsText(e.target.value);
                      if (smsTemplate !== 'custom') setSmsTemplate('custom');
                    }}
                    placeholder="বার্তা লিখুন..."
                    className="bg-white border-2 border-emerald-400 rounded-2xl p-3 text-xs md:text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all custom-scrollbar"
                  />
                </div>
              </div>

              {/* SECTION 3: 1-Click Fast Sending Options */}
              <div className="bg-gray-50/90 border border-gray-200 rounded-2xl p-3.5 flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-800 flex items-center gap-1">
                    ⚡ ৩. ১-ক্লিক দ্রুত সেন্ডিং অপশন:
                  </span>
                  <span className="text-[11px] font-extrabold text-emerald-700">
                    {getRecipients().length}টি নম্বর নির্বাচিত
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {/* 1. WhatsApp Direct */}
                  <button
                    type="button"
                    onClick={handleWhatsAppDirect}
                    className="bg-[#059669] hover:bg-[#047857] text-white py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageSquare size={16} />
                    WhatsApp Direct
                  </button>

                  {/* 2. WhatsApp Web */}
                  <button
                    type="button"
                    onClick={handleWhatsAppWeb}
                    className="bg-[#0d9488] hover:bg-[#0f766e] text-white py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <PhoneCall size={16} />
                    WhatsApp Web
                  </button>

                  {/* 3. Phone SMS */}
                  <button
                    type="button"
                    onClick={handlePhoneSMS}
                    className="bg-[#6366f1] hover:bg-[#4f46e5] text-white py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Send size={16} />
                    Phone SMS
                  </button>

                  {/* 4. Copy Text */}
                  <button
                    type="button"
                    onClick={handleCopySMS}
                    className="bg-[#18181b] hover:bg-black text-white py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Copy size={16} />
                    কপি করুন
                  </button>
                </div>
              </div>

              {/* Bottom Main Dispatch Button */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpressSmsModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold px-5 py-3 rounded-2xl text-xs transition-all"
                >
                  বন্ধ করুন
                </button>

                <button
                  type="button"
                  onClick={handleServerDispatch}
                  className="bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-black px-5 py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg flex-1 transition-all"
                >
                  <Zap size={18} className="text-amber-300" />
                  সকল {getRecipients().length}টি নম্বরে সার্ভার এক্সপ্রেস ডিসপ্যাচ করুন
                </button>
              </div>

              {/* SECTION 5: Recent Dispatched Log */}
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-gray-800">
                    সাম্প্রতিক এক্সপ্রেস বার্তা প্রেরণ রেজিস্ট্রি:
                  </span>
                  <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold">
                    {dispatchedLogs.length} Messages Dispatched
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-gray-100 border-b border-gray-200 text-gray-600 font-extrabold">
                      <tr>
                        <th className="py-2 px-3">সময়</th>
                        <th className="py-2 px-3">রসিদ/কোড</th>
                        <th className="py-2 px-3">গ্রাহক ও ফোন</th>
                        <th className="py-2 px-3 text-right">অবস্থা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60 font-medium">
                      {dispatchedLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-3 px-3 text-center text-gray-400">
                            এখনো কোনো বার্তা পাঠানো হয়নি।
                          </td>
                        </tr>
                      ) : (
                        dispatchedLogs.map(log => (
                          <tr key={log.id} className="hover:bg-white transition-all">
                            <td className="py-2 px-3 text-gray-500 font-mono">{log.time}</td>
                            <td className="py-2 px-3 font-bold text-gray-900">#{log.receiptNo}</td>
                            <td className="py-2 px-3 font-bold text-gray-800">
                              {log.customerName} ({log.customerMobile})
                            </td>
                            <td className="py-2 px-3 text-right">
                              <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md text-[10px] font-black inline-block">
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* bKash Online Payment Modal for Mortgage */}
      <BkashPaymentModal
        isOpen={showBkashModal}
        onClose={() => setShowBkashModal(false)}
        defaultAmount={(interestInput || 0) + (principalInput || 0)}
        invoiceId={activeVoucher ? `MORT-${activeVoucher.receiptNo}` : undefined}
        customerName={activeVoucher?.customerName}
        customerPhone={activeVoucher?.customerMobile}
        onPaymentSuccess={(trxId, amt) => {
          setPaymentNote(`bKash Online Payment (TrxID: ${trxId})`);
          setToastMessage(`বিকাশ পেমেন্ট ৳${amt} সফল হয়েছে! TrxID: ${trxId}`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Bank Card & POS Payment Modal for Mortgage */}
      <BankCardPaymentModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        defaultAmount={(interestInput || 0) + (principalInput || 0)}
        invoiceId={activeVoucher ? `MORT-${activeVoucher.receiptNo}` : undefined}
        customerName={activeVoucher?.customerName}
        customerPhone={activeVoucher?.customerMobile}
        onPaymentSuccess={(authCode, amt, brand, emiMonths) => {
          setPaymentNote(`Bank Card Payment (${brand} - Auth: ${authCode}${emiMonths ? `, ${emiMonths}M EMI` : ''})`);
          setToastMessage(`কার্ড পেমেন্ট ৳${amt} সফল হয়েছে! Auth Code: ${authCode}`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* Batch Print Modal for Multiple Bills */}
      <AnimatePresence>
        {showBatchPrintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:hidden"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-[#1a1614] text-white p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500 rounded-2xl text-black">
                    <Printer size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">একত্রিত বিল ইনভয়েস প্রিন্ট</h3>
                    <p className="text-xs text-amber-300 font-bold">{selectedMortgages.length} জন কাস্টমারের একত্রিত হিসাব</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBatchPrintModal(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Printable Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-8" id="batch-print-area">
                <div className="flex flex-col gap-8 print:p-0">
                  
                  {/* Shop Header (Print Only) */}
                  <div className="hidden print:flex flex-col items-center text-center mb-6">
                    <h1 className="text-3xl font-black text-gray-900">দি আমিন জুয়েলার্স</h1>
                    <p className="text-sm font-bold text-gray-600">উন্নত মানের স্বর্ণ ও রৌপ্য অলঙ্কার বিক্রেতা</p>
                    <div className="w-full border-b-2 border-black my-4" />
                    <h2 className="text-xl font-bold uppercase tracking-widest bg-black text-white px-6 py-1 rounded-full">একত্রিত সংগৃহীত ঋণ রিপোর্ট</h2>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:grid-cols-3">
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase mb-1">মোট কাস্টমার</span>
                      <span className="text-2xl font-black text-gray-900">{selectedMortgages.length} জন</span>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-black text-amber-700 uppercase mb-1">মোট মূল ঋণ</span>
                      <span className="text-2xl font-black text-amber-900">৳{selectedTotalPrincipal.toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] font-black text-emerald-700 uppercase mb-1">মোট টাকা (ঋণ+সুদ)</span>
                      <span className="text-2xl font-black text-emerald-900">৳{selectedGrandTotal.toLocaleString('bn-BD')}</span>
                    </div>
                  </div>

                  {/* Detailed Table */}
                  <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 text-[11px] font-black text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-4">রসিদ #</th>
                          <th className="px-4 py-4">গ্রাহকের নাম ও ফোন</th>
                          <th className="px-4 py-4">অলঙ্কার</th>
                          <th className="px-4 py-4 text-right">মূল ঋণ</th>
                          <th className="px-4 py-4 text-right">সুদ</th>
                          <th className="px-4 py-4 text-right">মোট</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedMortgages.map((m) => {
                          const calc = calculateInterest(m);
                          return (
                            <tr key={m.id} className="text-xs font-bold text-gray-800">
                              <td className="px-4 py-4 text-amber-700">#{m.receiptNo}</td>
                              <td className="px-4 py-4">
                                <div className="flex flex-col">
                                  <span className="text-gray-900 font-black">{m.customerName}</span>
                                  <span className="text-[10px] text-gray-500">{m.customerMobile}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4">{m.itemName}</td>
                              <td className="px-4 py-4 text-right">৳{m.principalAmount.toLocaleString('bn-BD')}</td>
                              <td className="px-4 py-4 text-right text-amber-600">৳{calc.dueInterest.toLocaleString('bn-BD')}</td>
                              <td className="px-4 py-4 text-right font-black">৳{(m.principalAmount + calc.dueInterest).toLocaleString('bn-BD')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                        <tr className="font-black text-sm">
                          <td colSpan={3} className="px-4 py-5 text-right uppercase tracking-widest text-gray-500">সর্বমোট (Grand Total):</td>
                          <td className="px-4 py-5 text-right">৳{selectedTotalPrincipal.toLocaleString('bn-BD')}</td>
                          <td className="px-4 py-5 text-right text-amber-700">৳{selectedTotalInterest.toLocaleString('bn-BD')}</td>
                          <td className="px-4 py-5 text-right bg-amber-100 text-amber-950 text-base">৳{selectedGrandTotal.toLocaleString('bn-BD')}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Print Footer */}
                  <div className="hidden print:flex justify-between items-center mt-12 pt-8 border-t border-dashed border-gray-300">
                    <div className="flex flex-col items-center">
                      <div className="w-40 border-t border-black mb-1" />
                      <span className="text-xs font-bold">কাস্টমার স্বাক্ষর</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] text-gray-400 mb-2">প্রিন্ট সময়: {new Date().toLocaleString('bn-BD')}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-40 border-t border-black mb-1" />
                      <span className="text-xs font-bold">কর্তৃপক্ষের স্বাক্ষর</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 print:hidden">
                <button
                  onClick={() => setShowBatchPrintModal(false)}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-extrabold rounded-2xl hover:bg-gray-50 transition-all cursor-pointer"
                >
                  বাতিল করুন
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-8 py-3 bg-[#c59b27] text-black font-black rounded-2xl hover:bg-amber-400 shadow-lg shadow-amber-200 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Printer size={18} />
                  ইনভয়েস প্রিন্ট করুন
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
          #batch-print-area, #batch-print-area * {
            visibility: visible;
          }
          #batch-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
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

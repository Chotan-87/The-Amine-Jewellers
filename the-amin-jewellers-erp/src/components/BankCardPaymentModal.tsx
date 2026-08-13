import React, { useState } from 'react';
import { X, CheckCircle2, CreditCard, ShieldCheck, Lock, RefreshCw, ArrowRight, Building, Percent, Check, Receipt, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface BankCardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
  invoiceId?: string;
  customerName?: string;
  customerPhone?: string;
  onPaymentSuccess?: (approvalCode: string, amount: number, cardBrand: string, emiMonths?: number) => void;
}

const supportedBanks = [
  { id: 'city', name: 'City Bank (AMEX / Visa / Master)', icon: '🏦', color: 'bg-blue-900', pos: 'City POS' },
  { id: 'ebl', name: 'Eastern Bank (EBL Visa / Master)', icon: '🏛️', color: 'bg-red-800', pos: 'EBL POS' },
  { id: 'brac', name: 'BRAC Bank (Visa / Master / TakaPay)', icon: '🏦', color: 'bg-blue-600', pos: 'BRAC POS' },
  { id: 'dbbl', name: 'Dutch-Bangla Bank (Nexus / Rocket)', icon: '💳', color: 'bg-emerald-700', pos: 'DBBL Nexus POS' },
  { id: 'islami', name: 'Islami Bank (Khidmah Credit Card)', icon: '🌙', color: 'bg-green-800', pos: 'IBBL POS' },
  { id: 'scb', name: 'Standard Chartered Bank', icon: '💎', color: 'bg-cyan-900', pos: 'SCB POS' },
  { id: 'ucb', name: 'UCB / Prime Bank / Others', icon: '🏪', color: 'bg-[#c59b27]', pos: 'Universal POS' },
];

const emiOptions = [
  { months: 0, label: 'No EMI (Full Payment / এককালীন)', extraChargePct: 0 },
  { months: 3, label: '3 Months 0% EMI (৩ মাস ইএমআই)', extraChargePct: 0 },
  { months: 6, label: '6 Months 0% EMI (৬ মাস ইএমআই)', extraChargePct: 0 },
  { months: 12, label: '12 Months 0% EMI (১২ মাস ইএমআই)', extraChargePct: 2.5 },
  { months: 18, label: '18 Months Special EMI (১৮ মাস)', extraChargePct: 4.0 },
];

export default function BankCardPaymentModal({
  isOpen,
  onClose,
  defaultAmount = 0,
  invoiceId,
  customerName = '',
  customerPhone = '',
  onPaymentSuccess
}: BankCardPaymentModalProps) {
  const { t } = useLanguage();
  const [paymentMode, setPaymentMode] = useState<'pos' | 'online' | 'emi'>('pos');
  
  // Common Form States
  const [selectedBank, setSelectedBank] = useState('city');
  const [amount, setAmount] = useState<number | string>(defaultAmount > 0 ? defaultAmount : '');
  const [selectedEmi, setSelectedEmi] = useState(0); // 0 = Full Payment

  // Card Details (Online or POS Swipe)
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // POS Specific
  const [approvalCode, setApprovalCode] = useState('');
  const [posBatchNo, setPosBatchNo] = useState('');

  // Online Checkout Flow State
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Card info, 2: Bank 3D OTP, 3: Success
  const [otp, setOtp] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState<{
    authCode: string;
    paidAmount: number;
    bankName: string;
    cardLast4: string;
    cardBrand: string;
    emiMonths: number;
    date: string;
  } | null>(null);

  if (!isOpen) return null;

  // Auto detect card type
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return { name: 'VISA', logo: '💳', bg: 'bg-blue-600' };
    if (/^5[1-5]/.test(clean)) return { name: 'MasterCard', logo: '🔴🟡', bg: 'bg-red-600' };
    if (/^3[47]/.test(clean)) return { name: 'American Express', logo: '💙', bg: 'bg-cyan-700' };
    if (/^62/.test(clean)) return { name: 'NexusPay DBBL', logo: '❇️', bg: 'bg-emerald-700' };
    return { name: 'Bank Card', logo: '💳', bg: 'bg-gray-800' };
  };

  const currentBrand = getCardBrand(cardNumber);

  // Calculate total with optional EMI fee
  const currentEmi = emiOptions.find(e => e.months === selectedEmi) || emiOptions[0];
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount as string) || 0;
  const extraFee = Math.round((numAmount * currentEmi.extraChargePct) / 100);
  const totalAmountToCharge = numAmount + extraFee;
  const monthlyInstalment = selectedEmi > 0 ? Math.round(totalAmountToCharge / selectedEmi) : 0;

  const generateApprovalCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handlePOSSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) return;
    
    setIsProcessing(true);
    setTimeout(() => {
      const generatedAuth = approvalCode.trim() || generateApprovalCode();
      const last4 = cardNumber.replace(/\s+/g, '').slice(-4) || '8812';
      const bankObj = supportedBanks.find(b => b.id === selectedBank) || supportedBanks[0];

      const receipt = {
        authCode: generatedAuth,
        paidAmount: totalAmountToCharge,
        bankName: bankObj.name,
        cardLast4: last4,
        cardBrand: currentBrand.name,
        emiMonths: selectedEmi,
        date: new Date().toLocaleString('bn-BD'),
      };

      setPaymentReceipt(receipt);
      setIsProcessing(false);
      setStep(3);

      if (onPaymentSuccess) {
        onPaymentSuccess(generatedAuth, totalAmountToCharge, currentBrand.name, selectedEmi);
      }
    }, 1000);
  };

  const handleOnlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0 || !cardNumber) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
      setOtp('882910'); // Helper pre-fill
    }, 1000);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setIsProcessing(true);
    setTimeout(() => {
      const generatedAuth = generateApprovalCode();
      const last4 = cardNumber.replace(/\s+/g, '').slice(-4) || '4321';
      const bankObj = supportedBanks.find(b => b.id === selectedBank) || supportedBanks[0];

      const receipt = {
        authCode: generatedAuth,
        paidAmount: totalAmountToCharge,
        bankName: bankObj.name,
        cardLast4: last4,
        cardBrand: currentBrand.name,
        emiMonths: selectedEmi,
        date: new Date().toLocaleString('bn-BD'),
      };

      setPaymentReceipt(receipt);
      setIsProcessing(false);
      setStep(3);

      if (onPaymentSuccess) {
        onPaymentSuccess(generatedAuth, totalAmountToCharge, currentBrand.name, selectedEmi);
      }
    }, 1200);
  };

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
              <CreditCard size={22} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight flex items-center gap-2">
                <span>{t('ব্যাংক কার্ড পেমেন্ট ও ইএমআই', 'Bank Card Payment & EMI')}</span>
                <span className="text-[10px] bg-yellow-400 text-black font-extrabold px-2 py-0.5 rounded-full uppercase">
                  POS & 3D Secure
                </span>
              </h3>
              <p className="text-[11px] text-blue-200 font-medium">
                {t('Visa, MasterCard, AMEX, Nexus & 0% EMI Supported', 'Visa, MasterCard, AMEX, Nexus & 0% EMI Supported')}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/80 p-1.5 gap-1">
          <button
            onClick={() => { setPaymentMode('pos'); setStep(1); }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              paymentMode === 'pos'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-200'
                : 'text-gray-600 hover:bg-white'
            }`}
          >
            <Building size={14} />
            <span>{t('পিওএস সোয়াইপ (POS Terminal)', 'POS Machine Swipe')}</span>
          </button>

          <button
            onClick={() => { setPaymentMode('online'); setStep(1); }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              paymentMode === 'online'
                ? 'bg-blue-900 text-white shadow-md shadow-blue-200'
                : 'text-gray-600 hover:bg-white'
            }`}
          >
            <Lock size={14} />
            <span>{t('অনলাইন কার্ড (3D Gateway)', 'Online 3D Gateway')}</span>
          </button>

          <button
            onClick={() => { setPaymentMode('emi'); setStep(1); }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              paymentMode === 'emi'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-200'
                : 'text-gray-600 hover:bg-white'
            }`}
          >
            <Percent size={14} />
            <span>{t('০% ইএমআই (0% EMI)', '0% EMI Facility')}</span>
          </button>
        </div>

        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {step === 3 && paymentReceipt ? (
            /* SUCCESS RECEIPT */
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle2 size={38} />
              </div>

              <div>
                <h4 className="text-lg font-black text-gray-900">
                  {t('কার্ড পেমেন্ট সফল হয়েছে!', 'Card Payment Successful!')}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {t('ব্যাংক ট্রানজেকশন অনুমোদন লাভ করেছে।', 'Bank transaction approved successfully.')}
                </p>
              </div>

              {/* Receipt Voucher */}
              <div className="w-full bg-blue-50/60 border border-blue-200 rounded-2xl p-4 text-xs space-y-2.5 text-left">
                <div className="flex justify-between border-b border-blue-200/60 pb-2">
                  <span className="text-gray-500 font-bold">{t('অনুমোদন কোড (Auth Code):', 'Approval / Auth Code:')}</span>
                  <span className="font-mono font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                    {paymentReceipt.authCode}
                  </span>
                </div>

                <div className="flex justify-between border-b border-blue-200/60 pb-2">
                  <span className="text-gray-500 font-bold">{t('মোট পরিশোধিত টাকা:', 'Amount Paid:')}</span>
                  <span className="font-black text-gray-900 text-sm">৳{paymentReceipt.paidAmount.toLocaleString('bn-BD')}</span>
                </div>

                <div className="flex justify-between border-b border-blue-200/60 pb-2">
                  <span className="text-gray-500 font-bold">{t('ব্যাংক ও কার্ড:', 'Bank & Card Brand:')}</span>
                  <span className="font-bold text-gray-800">
                    {paymentReceipt.cardBrand} (•••• {paymentReceipt.cardLast4})
                  </span>
                </div>

                {paymentReceipt.emiMonths > 0 && (
                  <div className="flex justify-between border-b border-blue-200/60 pb-2 text-amber-900 font-bold bg-amber-50 p-2 rounded-xl border border-amber-200">
                    <span>{t('ইএমআই স্কিম:', 'EMI Tenure:')}</span>
                    <span>{paymentReceipt.emiMonths} {t('মাস ইএমআই (0% EMI)', 'Months 0% EMI')}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 font-medium text-[11px]">
                  <span>{t('তারিখ ও সময়:', 'Date & Time:')}</span>
                  <span>{paymentReceipt.date}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-blue-900 text-white rounded-2xl text-xs font-black hover:bg-blue-950 transition-colors cursor-pointer shadow-lg shadow-blue-200"
              >
                {t('পেমেন্ট রসিদ বন্ধ করুন', 'Close & Return')}
              </button>
            </div>
          ) : (
            /* PAYMENT FORM */
            <form onSubmit={paymentMode === 'online' && step === 1 ? handleOnlineSubmit : paymentMode === 'online' && step === 2 ? handleOtpVerify : handlePOSSubmit} className="space-y-4">
              
              {/* Card Visual Header */}
              <div className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white p-4 rounded-2xl border border-gray-700 shadow-xl relative overflow-hidden">
                <div className="absolute right-3 top-3 opacity-20 text-4xl pointer-events-none">💳</div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                    {currentBrand.name}
                  </span>
                  <span className="text-xs font-bold bg-white/10 px-2.5 py-0.5 rounded-full border border-white/20">
                    {paymentMode === 'pos' ? 'POS SWIPE' : paymentMode === 'emi' ? '0% EMI' : 'SECURE 3D'}
                  </span>
                </div>

                <div className="text-lg font-mono font-black tracking-widest my-2">
                  {cardNumber ? cardNumber : '••••  ••••  ••••  ••••'}
                </div>

                <div className="flex justify-between items-end text-[10px] font-mono text-gray-300 pt-2 border-t border-white/10">
                  <div>
                    <span className="block text-[8px] text-gray-400 uppercase">CARD HOLDER</span>
                    <span className="font-bold uppercase text-white truncate max-w-[150px] block">
                      {cardHolder || 'VALUED CUSTOMER'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-gray-400 uppercase">EXPIRY</span>
                    <span className="font-bold text-white">{expiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>

              {/* Bank POS Machine Selection */}
              <div className="space-y-1">
                <label className="text-xs font-black text-gray-700 flex items-center justify-between">
                  <span>{t('ব্যাংক পিওএস টার্মিনাল নির্বাচন করুন', 'Select Bank POS Terminal')}</span>
                  <span className="text-[10px] text-blue-600 font-bold">{supportedBanks.length} Banks Active</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-gray-50 border border-gray-200 rounded-2xl">
                  {supportedBanks.map((b) => (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => setSelectedBank(b.id)}
                      className={`p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                        selectedBank === b.id
                          ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                          : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-base">{b.icon}</span>
                      <div className="truncate">
                        <span className="block truncate font-black">{b.pos}</span>
                        <span className={`text-[9px] block truncate ${selectedBank === b.id ? 'text-blue-200' : 'text-gray-500'}`}>{b.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount & EMI Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-700 block">
                    {t('পেমেন্ট পরিমাণ (৳)', 'Payment Amount (৳)')}
                  </label>
                  <input 
                    type="number"
                    required
                    placeholder="10000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-gray-50 border-2 border-blue-200 focus:border-blue-900 rounded-xl p-2.5 text-base font-black text-gray-900 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-700 block">
                    {t('ইএমআই কিস্তি সুবিধা (EMI)', 'EMI Tenure Option')}
                  </label>
                  <select
                    value={selectedEmi}
                    onChange={(e) => setSelectedEmi(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-blue-900 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:outline-none cursor-pointer"
                  >
                    {emiOptions.map((opt) => (
                      <option key={opt.months} value={opt.months}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* EMI Calculation Breakdown Card */}
              {selectedEmi > 0 && (
                <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-2xl text-xs space-y-1.5 text-amber-950">
                  <div className="flex justify-between font-black text-amber-900 border-b border-amber-200 pb-1">
                    <span>{t('ইএমআই সমপরিমাণ হিসাব:', 'EMI Calculation Breakdown:')}</span>
                    <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded text-[10px]">0% Interest EMI</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>{t('মাসিক কিস্তি (Monthly Installment):', 'Monthly Installment:')}</span>
                    <span className="font-black text-amber-900 text-sm">৳{monthlyInstalment.toLocaleString('bn-BD')} / মাস</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-amber-800">
                    <span>{t('মেয়াদ:', 'Tenure:')} {selectedEmi} মাস</span>
                    <span>{t('সর্বমোট চার্জযোগ্য মূল্য:', 'Total Charge:')} ৳{totalAmountToCharge.toLocaleString('bn-BD')}</span>
                  </div>
                </div>
              )}

              {/* Card Input Fields */}
              <div className="space-y-3 pt-1 border-t border-gray-100">
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-700 block">
                    {t('কার্ড নম্বর (Card Number)', 'Card Number')}
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      maxLength={19}
                      placeholder="4000 1234 5678 9010"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-blue-900 rounded-xl p-2.5 text-sm font-mono font-bold text-gray-900 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                      {currentBrand.logo}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1">
                    <label className="text-xs font-black text-gray-700 block">
                      {t('কার্ডধাতীর নাম (Holder)', 'Cardholder Name')}
                    </label>
                    <input 
                      type="text"
                      placeholder="e.g. RAHIM KHAN"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-blue-900 rounded-xl p-2.5 text-xs font-bold text-gray-900 focus:outline-none uppercase"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-700 block">
                      {t('মেয়াদ (Expiry)', 'Expiry')}
                    </label>
                    <input 
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-blue-900 rounded-xl p-2.5 text-xs font-mono font-bold text-center text-gray-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Mode Specific Extras */}
                {paymentMode === 'pos' && (
                  <div className="grid grid-cols-2 gap-2 bg-blue-50/60 p-3 rounded-2xl border border-blue-100">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-blue-900 block">
                        {t('POS Approval/Auth Code', 'POS Approval Code')}
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. 782910"
                        value={approvalCode}
                        onChange={(e) => setApprovalCode(e.target.value)}
                        className="w-full bg-white border border-blue-200 rounded-xl p-2 text-xs font-mono font-bold text-blue-900 text-center"
                      />
                      <span className="text-[9px] text-blue-600 block">ফাঁকা রাখলে অটো জেনারেট হবে</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-blue-900 block">
                        {t('POS Batch No.', 'Batch Number')}
                      </label>
                      <input 
                        type="text"
                        placeholder="e.g. 000142"
                        value={posBatchNo}
                        onChange={(e) => setPosBatchNo(e.target.value)}
                        className="w-full bg-white border border-blue-200 rounded-xl p-2 text-xs font-mono font-bold text-blue-900 text-center"
                      />
                    </div>
                  </div>
                )}

                {paymentMode === 'online' && step === 2 && (
                  <div className="bg-pink-50 p-3.5 rounded-2xl border border-pink-200 space-y-2 text-center">
                    <p className="text-xs font-bold text-pink-950">
                      {t('ব্যাংক ৩ডি সিকিউর ওটিপি পিন (3D Secure OTP Code):', 'Bank 3D Secure OTP Code:')}
                    </p>
                    <input 
                      type="text"
                      maxLength={6}
                      placeholder="882910"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-white border-2 border-pink-400 rounded-xl p-3 text-center text-xl font-mono font-black text-pink-950 focus:outline-none tracking-widest"
                    />
                    <span className="text-[10px] text-pink-700 block font-mono">ডেমো OTP: 882910</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isProcessing ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={18} className="text-yellow-400" />
                    <span>
                      {paymentMode === 'online' && step === 1
                        ? t('ওটিপি পাঠান (Proceed to 3D Secure)', 'Proceed to 3D Secure OTP')
                        : paymentMode === 'online' && step === 2
                        ? t('ওটিপি কনফার্ম করুন', 'Verify OTP & Charge')
                        : t(`৳${totalAmountToCharge.toLocaleString('bn-BD')} টাকা কার্ড চার্জ করুন`, `Charge ৳${totalAmountToCharge} via POS Terminal`)}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

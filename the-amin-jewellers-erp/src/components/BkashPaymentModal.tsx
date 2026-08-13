import React, { useState } from 'react';
import { X, CheckCircle2, Copy, Check, ArrowRight, ShieldCheck, QrCode, Smartphone, RefreshCw, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface BkashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultAmount?: number;
  invoiceId?: string;
  customerName?: string;
  customerPhone?: string;
  onPaymentSuccess?: (trxId: string, amount: number) => void;
}

export default function BkashPaymentModal({
  isOpen,
  onClose,
  defaultAmount = 0,
  invoiceId,
  customerName = '',
  customerPhone = '',
  onPaymentSuccess
}: BkashPaymentModalProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'qr' | 'online' | 'verify'>('qr');
  
  // QR state
  const [copied, setCopied] = useState(false);

  // Online Gateway state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Amount & Phone, 2: OTP, 3: PIN, 4: Success
  const [amount, setAmount] = useState<number | string>(defaultAmount > 0 ? defaultAmount : '');
  const [phone, setPhone] = useState(customerPhone || '');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Verify state
  const [verifyTrxId, setVerifyTrxId] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);

  const merchantNumber = '01612424802';

  if (!isOpen) return null;

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(merchantNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateTrxId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'BKASH';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !amount) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
      setOtp('123456'); // pre-fill helper
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 600);
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;
    setIsProcessing(true);
    setTimeout(() => {
      const generated = generateTrxId();
      setTrxId(generated);
      setIsProcessing(false);
      setStep(4);
      if (onPaymentSuccess && typeof amount === 'number') {
        onPaymentSuccess(generated, amount);
      }
    }, 1200);
  };

  const handleVerifyTrx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyTrxId.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setVerifySuccess(true);
      if (onPaymentSuccess) {
        onPaymentSuccess(verifyTrxId, typeof amount === 'number' ? amount : 0);
      }
    }, 1000);
  };

  const resetOnlineForm = () => {
    setStep(1);
    setOtp('');
    setPin('');
    setTrxId('');
    setVerifySuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-pink-100"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#e2136e] via-[#c20d5d] to-[#e2136e] text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl p-1.5 flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path fill="#e2136e" d="M20 15 h30 l20 20 v50 h-50 z" />
                <path fill="#ffffff" d="M35 30 l15 15 l15 -15" />
                <polygon points="50,20 75,50 50,80 25,50" fill="#e2136e" />
                <path d="M10,20 L35,50 L10,80 Z" fill="#e2136e" />
                <path d="M90,20 L65,50 L90,80 Z" fill="#e2136e" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                {t('বিকাশ অনলাইন পেমেন্ট', 'bKash Online Payment')}
              </h3>
              <p className="text-[11px] text-pink-100 font-medium">
                {t('মার্চেন্ট নম্বর:', 'Merchant No:')} <span className="font-mono font-bold">{merchantNumber}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 bg-pink-50/40 p-1.5 gap-1">
          <button
            onClick={() => { setActiveTab('qr'); resetOnlineForm(); }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'qr'
                ? 'bg-[#e2136e] text-white shadow-md shadow-pink-200'
                : 'text-gray-600 hover:bg-white'
            }`}
          >
            <QrCode size={14} />
            <span>{t('বাংলা QR স্ক্যান', 'Bangla QR Scan')}</span>
          </button>

          <button
            onClick={() => { setActiveTab('online'); resetOnlineForm(); }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'online'
                ? 'bg-[#e2136e] text-white shadow-md shadow-pink-200'
                : 'text-gray-600 hover:bg-white'
            }`}
          >
            <Smartphone size={14} />
            <span>{t('অনলাইন পেমেন্ট', 'Online Checkout')}</span>
          </button>

          <button
            onClick={() => { setActiveTab('verify'); resetOnlineForm(); }}
            className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'verify'
                ? 'bg-[#e2136e] text-white shadow-md shadow-pink-200'
                : 'text-gray-600 hover:bg-white'
            }`}
          >
            <Receipt size={14} />
            <span>{t('TrxID যাচাই', 'Verify TrxID')}</span>
          </button>
        </div>

        <div className="p-5 max-h-[80vh] overflow-y-auto">
          {/* TAB 1: BANGLA QR DISPLAY */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center gap-4">
              {/* Outer bKash Bangla QR Card Frame */}
              <div className="w-full max-w-[280px] bg-white border-2 border-gray-200 rounded-3xl p-3 shadow-xl relative overflow-hidden">
                {/* Header with bKash logo */}
                <div className="flex flex-col items-center mb-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black text-[#e2136e]">বিকাশ</span>
                    <span className="text-xs font-black text-gray-800 tracking-wider">BANGLA QR</span>
                  </div>
                  <span className="text-[9px] text-red-600 font-bold uppercase tracking-widest">
                    {t('দি আমিন জুয়েলার্স | মার্চেন্ট', 'The Amin Jewelers | Merchant')}
                  </span>
                </div>

                {/* Pink Inner Box with QR Code */}
                <div className="bg-[#e2136e] p-3 rounded-2xl shadow-inner flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl w-full flex flex-col items-center shadow-md">
                    {/* SVG Bangla QR Representation */}
                    <div className="w-48 h-48 bg-white p-1 rounded-lg flex items-center justify-center border border-gray-100">
                      <svg viewBox="0 0 200 200" className="w-full h-full">
                        {/* Outer QR Corner Squares */}
                        <rect x="10" y="10" width="45" height="45" fill="#000000" rx="4" />
                        <rect x="18" y="18" width="29" height="29" fill="#ffffff" rx="2" />
                        <rect x="24" y="24" width="17" height="17" fill="#e2136e" rx="1" />

                        <rect x="145" y="10" width="45" height="45" fill="#000000" rx="4" />
                        <rect x="153" y="18" width="29" height="29" fill="#ffffff" rx="2" />
                        <rect x="159" y="24" width="17" height="17" fill="#e2136e" rx="1" />

                        <rect x="10" y="145" width="45" height="45" fill="#000000" rx="4" />
                        <rect x="18" y="153" width="29" height="29" fill="#ffffff" rx="2" />
                        <rect x="24" y="159" width="17" height="17" fill="#e2136e" rx="1" />

                        {/* Random Data Pattern Grid for Authentic Look */}
                        <rect x="65" y="15" width="12" height="12" fill="#000000" />
                        <rect x="85" y="15" width="20" height="8" fill="#e2136e" />
                        <rect x="115" y="15" width="15" height="15" fill="#000000" />

                        <rect x="65" y="35" width="25" height="10" fill="#000000" />
                        <rect x="100" y="35" width="10" height="20" fill="#e2136e" />
                        <rect x="120" y="35" width="15" height="10" fill="#000000" />

                        <rect x="15" y="65" width="15" height="15" fill="#e2136e" />
                        <rect x="35" y="65" width="18" height="10" fill="#000000" />
                        <rect x="60" y="60" width="25" height="25" fill="#000000" />
                        <rect x="90" y="65" width="15" height="15" fill="#e2136e" />
                        <rect x="110" y="60" width="20" height="20" fill="#000000" />
                        <rect x="140" y="65" width="15" height="25" fill="#000000" />
                        <rect x="165" y="65" width="20" height="15" fill="#e2136e" />

                        <rect x="15" y="90" width="20" height="15" fill="#000000" />
                        <rect x="40" y="90" width="15" height="20" fill="#e2136e" />
                        <rect x="65" y="95" width="20" height="15" fill="#000000" />
                        
                        {/* Center bKash Logo Icon */}
                        <rect x="80" y="80" width="40" height="40" fill="#ffffff" rx="8" />
                        <rect x="83" y="83" width="34" height="34" fill="#e2136e" rx="6" />
                        <path d="M90 92 l10 10 l10 -10" stroke="#ffffff" strokeWidth="3" fill="none" />
                        <polygon points="100,88 112,100 100,112 88,100" fill="#ffffff" />

                        <rect x="130" y="90" width="25" height="15" fill="#000000" />
                        <rect x="160" y="90" width="25" height="20" fill="#000000" />

                        <rect x="15" y="115" width="25" height="15" fill="#e2136e" />
                        <rect x="45" y="120" width="15" height="15" fill="#000000" />
                        <rect x="65" y="120" width="30" height="10" fill="#000000" />
                        <rect x="105" y="120" width="15" height="20" fill="#e2136e" />
                        <rect x="130" y="115" width="20" height="20" fill="#000000" />
                        <rect x="160" y="120" width="20" height="15" fill="#000000" />

                        <rect x="65" y="145" width="20" height="20" fill="#000000" />
                        <rect x="95" y="145" width="15" height="15" fill="#e2136e" />
                        <rect x="120" y="150" width="25" height="10" fill="#000000" />
                        <rect x="155" y="145" width="25" height="25" fill="#000000" />

                        <rect x="65" y="170" width="25" height="15" fill="#e2136e" />
                        <rect x="100" y="170" width="20" height="15" fill="#000000" />
                        <rect x="130" y="170" width="15" height="15" fill="#000000" />
                      </svg>
                    </div>

                    {/* Merchant Number Display matching uploaded image */}
                    <div className="mt-2.5 pt-2 border-t border-gray-100 text-center w-full">
                      <span className="text-xl font-black tracking-[0.2em] text-gray-900 font-mono block">
                        0161 2424 802
                      </span>
                      <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-widest">
                        bKash Merchant Account
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2.5 pt-1">
                <button
                  onClick={handleCopyNumber}
                  className="w-full py-2.5 px-4 bg-pink-50 border border-pink-200 text-[#e2136e] rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-pink-100 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                  <span>{copied ? t('নম্বর কপি করা হয়েছে!', 'Number Copied!') : t('মার্চেন্ট নম্বর কপি করুন (01612424802)', 'Copy Merchant Number')}</span>
                </button>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 text-left space-y-1 text-xs">
                  <p className="font-bold text-gray-800 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-[#e2136e]" />
                    <span>{t('পেমেন্ট করার নিয়ম:', 'Payment Instructions:')}</span>
                  </p>
                  <ol className="list-decimal list-inside text-[11px] text-gray-600 space-y-0.5 pl-1">
                    <li>bKash অ্যাপ খুলে <strong className="text-[#e2136e]">'Make Payment'</strong> অপশনে যান।</li>
                    <li>QR কোড স্ক্যান করুন বা <strong className="text-gray-900 font-mono">01612424802</strong> নম্বর লিখুন।</li>
                    <li>টাকার পরিমাণ লিখে পিন দিয়ে কনফার্ম করুন।</li>
                  </ol>
                </div>

                {defaultAmount > 0 && (
                  <button
                    onClick={() => setActiveTab('online')}
                    className="w-full py-3 bg-[#e2136e] text-white rounded-xl text-xs font-black shadow-lg shadow-pink-200 hover:bg-[#c20d5d] transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t(`অনলাইনে ৳${defaultAmount.toLocaleString('bn-BD')} পেমেন্ট করুন`, `Pay ৳${defaultAmount} Online Now`)}</span>
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ONLINE GATEWAY SIMULATOR */}
          {activeTab === 'online' && (
            <div>
              {/* Step 1: Amount & Phone Number */}
              {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  {invoiceId && (
                    <div className="bg-pink-50 border border-pink-100 p-3 rounded-xl flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-600">{t('ইনভয়েস / মেমো আইডি:', 'Invoice / Memo ID:')}</span>
                      <span className="font-mono font-black text-[#e2136e]">{invoiceId}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-700 block">
                      {t('পেমেন্ট পরিমাণ (৳)', 'Payment Amount (৳)')}
                    </label>
                    <input 
                      type="number"
                      required
                      placeholder="5000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-gray-50 border-2 border-pink-200 focus:border-[#e2136e] rounded-xl p-3 text-lg font-black text-gray-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-700 block">
                      {t('গ্রাহকের বিকাশ মোবাইল নম্বর', 'Customer bKash Mobile No.')}
                    </label>
                    <input 
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#e2136e] rounded-xl p-3 text-sm font-bold text-gray-900 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium leading-relaxed">
                    💡 বিকাশ অনলাইন পেমেন্ট গেটওয়ে সিমুলেটর। সম্পূর্ণ নিরাপদ টেস্ট পেমেন্ট।
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-[#e2136e] hover:bg-[#c20d5d] text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-pink-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <>
                        <span>{t('ওটিপি পাঠান (Send OTP)', 'Send Verification Code')}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
                  <div className="bg-pink-50 p-3 rounded-2xl border border-pink-100">
                    <p className="text-xs text-gray-600 font-medium">
                      {t('আপনার বিকাশ নম্বরে ৬ ডিজিটের ওটিপি কোড পাঠানো হয়েছে:', '6-digit OTP sent to your bKash number:')}
                    </p>
                    <p className="font-mono font-black text-base text-[#e2136e]">{phone}</p>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-black text-gray-700 block">
                      {t('৬ ডিজিটের যাচাইকরণ কোড (OTP)', '6-Digit Verification Code (OTP)')}
                    </label>
                    <input 
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-pink-300 focus:border-[#e2136e] rounded-xl p-3 text-center text-xl font-mono font-black tracking-widest text-gray-900 focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-400 block text-right font-mono">ডেমো OTP: 123456</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                    >
                      {t('পেছনে', 'Back')}
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-2/3 py-3 bg-[#e2136e] text-white rounded-xl text-xs font-black shadow-md hover:bg-[#c20d5d] flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : t('কোড সাবমিট করুন', 'Submit Code')}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: bKash PIN Entry */}
              {step === 3 && (
                <form onSubmit={handleConfirmPin} className="space-y-4 text-center">
                  <div className="bg-pink-50 p-3 rounded-2xl border border-pink-100">
                    <p className="text-xs font-bold text-gray-700">
                      {t('পেমেন্ট নিশ্চিত করতে আপনার ৫ ডিজিটের বিকাশ পিন লিখুন:', 'Enter 5-digit bKash PIN to confirm payment:')}
                    </p>
                    <p className="text-lg font-black text-[#e2136e] mt-1">৳{Number(amount).toLocaleString('bn-BD')}</p>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-black text-gray-700 block">
                      {t('৫ ডিজিটের পিন (bKash PIN)', '5-Digit bKash PIN')}
                    </label>
                    <input 
                      type="password"
                      maxLength={5}
                      required
                      placeholder="•••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-pink-300 focus:border-[#e2136e] rounded-xl p-3 text-center text-2xl font-mono font-black tracking-widest text-gray-900 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-1/3 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50"
                    >
                      {t('পেছনে', 'Back')}
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-2/3 py-3 bg-[#e2136e] text-white rounded-xl text-xs font-black shadow-md hover:bg-[#c20d5d] flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : t('পেমেন্ট কনফার্ম করুন', 'Confirm Payment')}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 4: Success Receipt */}
              {step === 4 && (
                <div className="flex flex-col items-center text-center gap-4 py-2">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                    <CheckCircle2 size={38} />
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-gray-900">
                      {t('পেমেন্ট সফল হয়েছে!', 'Payment Successful!')}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium">
                      {t('দি আমিন জুয়েলার্স মার্চেন্ট একাউন্টে টাকা জমা হয়েছে।', 'Amount received at The Amin Jewelers bKash Merchant Account.')}
                    </p>
                  </div>

                  {/* Payment Receipt Voucher */}
                  <div className="w-full bg-pink-50/60 border border-pink-200 rounded-2xl p-4 text-xs space-y-2 text-left">
                    <div className="flex justify-between border-b border-pink-200/60 pb-1.5">
                      <span className="text-gray-500 font-bold">{t('ট্রানজেকশন আইডি (TrxID):', 'Transaction ID:')}</span>
                      <span className="font-mono font-black text-[#e2136e]">{trxId}</span>
                    </div>

                    <div className="flex justify-between border-b border-pink-200/60 pb-1.5">
                      <span className="text-gray-500 font-bold">{t('পেমেন্ট পরিমাণ:', 'Amount Paid:')}</span>
                      <span className="font-black text-gray-900">৳{Number(amount).toLocaleString('bn-BD')}</span>
                    </div>

                    <div className="flex justify-between border-b border-pink-200/60 pb-1.5">
                      <span className="text-gray-500 font-bold">{t('মার্চেন্ট নম্বর:', 'Merchant No:')}</span>
                      <span className="font-mono font-bold text-gray-800">{merchantNumber}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500 font-bold">{t('তারিখ ও সময়:', 'Date & Time:')}</span>
                      <span className="font-medium text-gray-700">{new Date().toLocaleString('bn-BD')}</span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-[#e2136e] text-white rounded-xl text-xs font-black hover:bg-[#c20d5d] transition-colors"
                  >
                    {t('পেমেন্ট রসিদ সম্পন্ন করুন', 'Done')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VERIFY MANUAL TRANSACTIONS */}
          {activeTab === 'verify' && (
            <div>
              {verifySuccess ? (
                <div className="flex flex-col items-center text-center gap-3 py-3">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="text-base font-black text-gray-900">
                    {t('ট্রানজেকশন যাচাইকৃত!', 'Transaction Verified!')}
                  </h4>
                  <p className="text-xs text-gray-600">
                    TrxID <strong className="font-mono text-[#e2136e]">{verifyTrxId}</strong> সফলভাবে সিস্টেমে যুক্ত হয়েছে।
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full mt-2 py-3 bg-[#e2136e] text-white rounded-xl font-bold text-xs"
                  >
                    {t('মেমোতে ফিরে যান', 'Return to Memo')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyTrx} className="space-y-4">
                  <p className="text-xs text-gray-600 font-medium">
                    {t('গ্রাহক বিকাশ অ্যাপ থেকে ম্যানুয়ালি টাকা পাঠিয়ে থাকলে উক্ত ট্রানজেকশন আইডি (TrxID) দিয়ে যাচাই করুন:', 'If customer sent payment manually, enter the Transaction ID (TrxID) to verify:')}
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-gray-700 block">
                      {t('বিকাশ ট্রানজেকশন আইডি (TrxID)', 'bKash Transaction ID (TrxID)')}
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. BLM89324X"
                      value={verifyTrxId}
                      onChange={(e) => setVerifyTrxId(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50 border-2 border-pink-200 focus:border-[#e2136e] rounded-xl p-3 text-sm font-mono font-black uppercase text-gray-900 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 bg-[#e2136e] hover:bg-[#c20d5d] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {isProcessing ? <RefreshCw size={16} className="animate-spin" /> : t('ট্রানজেকশন আইডি যাচাই করুন', 'Verify Transaction ID')}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

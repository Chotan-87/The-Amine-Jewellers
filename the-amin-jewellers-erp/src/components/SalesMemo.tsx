import { useState } from 'react';
import { Trash2, Printer, Download, User, Phone, MapPin, Calendar, FileText, CheckCircle2, Scissors, CreditCard, Sparkles, Building2, QrCode, MessageSquare, PhoneCall, Eye, Maximize2 } from 'lucide-react';
import { SalesItem } from '../types';
import BkashPaymentModal from './BkashPaymentModal';
import BankCardPaymentModal from './BankCardPaymentModal';
import PrintPreviewModal from './PrintPreviewModal';

interface SalesMemoProps {
  items: SalesItem[];
  onRemoveItem: (id: string) => void;
  onClearMemo: () => void;
}

export default function SalesMemo({ items, onRemoveItem, onClearMemo }: SalesMemoProps) {
  const [paperSize, setPaperSize] = useState<'a4-full' | 'a4-dual' | 'a4-half'>('a4-full');
  const [showBkashModal, setShowBkashModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showPrintPreviewModal, setShowPrintPreviewModal] = useState(false);
  
  const [customer, setCustomer] = useState({
    name: 'আব্দুর রহিম',
    phone: '01812345678',
    address: 'বন্দরটিলা, চট্টগ্রাম',
    memoNo: 'AM-2026-805',
    date: '2026-08-12',
    paymentMethod: 'নগদ (Cash)',
    discount: 500,
    paidAmount: 50000
  });

  const [shopDetails, setShopDetails] = useState({
    name: 'দি আমিন জুয়েলার্স',
    slogan: 'এখানে দেশী-বিদেশী আকর্ষণীয় আধুনিক ও রুচিশীল ২২/২১/১৮ ক্যারেটের গ্যারান্টিযুক্ত স্বর্ণের অলঙ্কার তৈরি ও বিক্রয় করা হয়।',
    address: 'বন্দরটিলা, ইপিজেড, চট্টগ্রাম',
    phones: '01612424802 / 01812424802',
    vatRegNo: 'VAT Reg # 001298471-0203'
  });

  const subTotal = items.reduce((acc, item) => acc + item.goldValue + item.wastageValue + item.makingCharge, 0);
  const vatTotal = subTotal * 0.05; // 5% VAT
  const totalBeforeDiscount = subTotal + vatTotal;
  const grandTotal = Math.max(0, totalBeforeDiscount - (customer.discount || 0));
  const dueAmount = Math.max(0, grandTotal - (customer.paidAmount || 0));

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `আসসালামু আলাইকুম ${customer.name} স্যার/ম্যাডাম, দি আমিন জুয়েলার্স থেকে আপনার মেমো (#${customer.memoNo}) এর বিবরণ:
মোট টাকা: ৳ ${Math.round(grandTotal).toLocaleString('bn-BD')}
জমা: ৳ ${Math.round(customer.paidAmount).toLocaleString('bn-BD')}
বকেয়া: ৳ ${Math.round(dueAmount).toLocaleString('bn-BD')}
ধন্যবাদ!`;
    const url = `https://wa.me/88${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleSMSShare = () => {
    const text = `আমিন জুয়েলার্স: মেমো #${customer.memoNo}. মোট: ${Math.round(grandTotal)}tk. বকেয়া: ${Math.round(dueAmount)}tk. ধন্যবাদ!`;
    const url = `sms:${customer.phone.replace(/\D/g, '')}?body=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const renderReceiptContent = (copyType?: string) => (
    <div className="flex flex-col h-full justify-between font-serif text-[#7a0a0a]">
      {/* Header */}
      <div>
        <div className="text-center mb-6">

          <div className="flex justify-between items-center mb-1">
            <div className="text-[9px] border border-[#7a0a0a] px-2 py-0.5 rounded font-bold uppercase no-print-border">
              {copyType || 'মূল কাস্টমার কপি'}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#7a0a0a] tracking-tight">{shopDetails.name}</h1>
            <div className="text-[9px] border border-[#7a0a0a] px-2 py-0.5 rounded font-bold uppercase">
              A4 SIZE
            </div>
          </div>
          <div className="text-[#7a0a0a] text-[10px] font-bold border-b-2 border-[#7a0a0a] pb-1 inline-block mb-2 px-6">
            {shopDetails.address} | মোবাইল: {shopDetails.phones}
          </div>
          <p className="text-[8px] text-[#7a0a0a] opacity-80 leading-tight max-w-xl mx-auto">{shopDetails.slogan}</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-6 text-[11px] font-bold border-y border-[#7a0a0a]/30 py-3">
          <div className="flex gap-2">
            <span className="shrink-0 text-gray-600">ক্রেতার নাম:</span>
            <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold">{customer.name || '................................'}</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 text-gray-600">মেমো নম্বর:</span>
            <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold">{customer.memoNo}</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 text-gray-600">মোবাইল নম্বর:</span>
            <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold">{customer.phone || '................................'}</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 text-gray-600">তারিখ:</span>
            <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold">{customer.date}</span>
          </div>
          <div className="flex gap-2 col-span-2">
            <span className="shrink-0 text-gray-600">ঠিকানা:</span>
            <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold">{customer.address || '................................'}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 min-h-[180px]">
          <table className="w-full border-collapse text-[10px] font-bold text-[#7a0a0a]">
            <thead>
              <tr className="border-y-2 border-[#7a0a0a] bg-[#7a0a0a]/5">
                <th className="border-x border-[#7a0a0a] py-1.5 px-2 w-10 text-center">ক্রমিক</th>
                <th className="border-x border-[#7a0a0a] py-1.5 px-2 text-left">অলঙ্কার ও ক্যারেটের বিবরণ</th>
                <th className="border-x border-[#7a0a0a] py-1.5 px-2 w-28 text-center">ওজন (ভরি-আনা-রতি)</th>
                <th className="border-x border-[#7a0a0a] py-1.5 px-2 w-20 text-center">ওয়েস্টেজ (৳)</th>
                <th className="border-x border-[#7a0a0a] py-1.5 px-2 w-20 text-center">মজুরি (৳)</th>
                <th className="border-x border-[#7a0a0a] py-1.5 px-2 w-24 text-right">মোট টাকা (৳)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-[#7a0a0a]/30">
                  <td className="border-x border-[#7a0a0a] py-2 px-2 text-center">{idx + 1}</td>
                  <td className="border-x border-[#7a0a0a] py-2 px-2 font-black">{item.name} ({item.karat})</td>
                  <td className="border-x border-[#7a0a0a] py-2 px-2 text-center font-mono">{item.traditionalWeight.vori}-{item.traditionalWeight.ana}-{item.traditionalWeight.roti}</td>
                  <td className="border-x border-[#7a0a0a] py-2 px-2 text-center">{Math.round(item.wastageValue).toLocaleString('bn-BD')}</td>
                  <td className="border-x border-[#7a0a0a] py-2 px-2 text-center">{Math.round(item.makingCharge).toLocaleString('bn-BD')}</td>
                  <td className="border-x border-[#7a0a0a] py-2 px-2 text-right font-black">{Math.round(item.total).toLocaleString('bn-BD')}</td>
                </tr>
              ))}
              {[...Array(Math.max(0, (paperSize === 'a4-dual' ? 4 : 6) - items.length))].map((_, i) => (
                <tr key={i} className="h-7 border-b border-[#7a0a0a]/10">
                  <td className="border-x border-[#7a0a0a]"></td>
                  <td className="border-x border-[#7a0a0a]"></td>
                  <td className="border-x border-[#7a0a0a]"></td>
                  <td className="border-x border-[#7a0a0a]"></td>
                  <td className="border-x border-[#7a0a0a]"></td>
                  <td className="border-x border-[#7a0a0a]"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations & Payment Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-[#7a0a0a]/30 p-3 rounded-lg text-[9px] space-y-1 bg-amber-50/30">
            <p className="font-bold border-b border-[#7a0a0a]/20 pb-1">পেমেন্ট মেথড: <span className="font-black text-[#7a0a0a]">{customer.paymentMethod}</span></p>
            <p className="text-gray-600">ভ্যাট রেজিস্ট্রেশন নম্বর: {shopDetails.vatRegNo}</p>
            <p className="text-gray-600">বিশেষ দ্রষ্টব্য: যেকোনো লেনদেনে এই ক্যাশ মেমোটি প্রদর্শন করুন।</p>
          </div>

          <div className="space-y-1 text-[11px] font-bold text-[#7a0a0a]">
            <div className="flex justify-between border-b border-dotted border-[#7a0a0a]">
              <span>উপ-মোট (Subtotal):</span>
              <span>{Math.round(subTotal).toLocaleString('bn-BD')} ৳</span>
            </div>
            <div className="flex justify-between border-b border-dotted border-[#7a0a0a]">
              <span>ভ্যাট (৫% VAT):</span>
              <span>{Math.round(vatTotal).toLocaleString('bn-BD')} ৳</span>
            </div>
            {customer.discount > 0 && (
              <div className="flex justify-between border-b border-dotted border-[#7a0a0a] text-green-800">
                <span>ডিসকাউন্ট (Discount):</span>
                <span>- {Math.round(customer.discount).toLocaleString('bn-BD')} ৳</span>
              </div>
            )}
            <div className="flex justify-between text-[14px] border-b-2 border-[#7a0a0a] pt-1 font-black">
              <span>সর্বমোট (Grand Total):</span>
              <span>{Math.round(grandTotal).toLocaleString('bn-BD')} ৳</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1 text-gray-700">
              <span>জমা প্রদান (Paid):</span>
              <span>{Math.round(customer.paidAmount).toLocaleString('bn-BD')} ৳</span>
            </div>
            <div className="flex justify-between text-[12px] font-black text-red-700">
              <span>অবশিষ্ট বকেয়া (Due):</span>
              <span>{Math.round(dueAmount).toLocaleString('bn-BD')} ৳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Signatures */}
      <div>
        <div className="grid grid-cols-2 gap-8 text-[#7a0a0a] border-t border-[#7a0a0a]/30 pt-3">
          <div>
            <h5 className="text-[9px] font-black underline mb-1">বিক্রয় ও ফেরত শর্তাবলী:</h5>
            <ol className="text-[8px] font-bold space-y-0.5 list-decimal pl-3 leading-tight opacity-90">
              <li>বিক্রিত অলঙ্কার পরিবর্তনের সময় ২০% এবং নগদ ফেরত নেয়ার ক্ষেত্রে ৩০% বাদ দেওয়া হইবে।</li>
              <li>ক্যাশ মেমো ব্যতিরেক কোনো ফেরত বা এক্সচেঞ্জ গ্রহণযোগ্য নহে।</li>
            </ol>
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className="text-[9px] font-bold italic opacity-80">সুনাম ও সততাই আমাদের একমাত্র মূলধন।</p>
          </div>
        </div>

        <div className="flex justify-between text-[10px] font-bold text-[#7a0a0a] pt-10 pb-2">
          <div className="text-center border-t border-dashed border-[#7a0a0a] w-40">ক্রেতার স্বাক্ষর</div>
          <div className="text-center border-t border-dashed border-[#7a0a0a] w-48">ক্যাশিয়ার / অথরাইজড স্বাক্ষর</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-[#fcfaf7] min-h-screen">
      
      {/* Top Banner introducing A4 Format */}
      <div className="max-w-7xl mx-auto mb-6 bg-gradient-to-r from-[#3d2b1f] to-[#1a1614] text-white p-6 rounded-3xl shadow-lg border border-[#c59b27]/30 flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#c59b27]/20 border border-[#c59b27] rounded-2xl flex items-center justify-center text-[#c59b27]">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              A4 স্ট্যান্ডার্ড জুয়েলারি ক্যাশ ভাউচার (A4 Invoice Voucher)
            </h1>
            <p className="text-xs text-gray-300">
              A4 পেপার সাইজ (210mm × 297mm) অনুযায়ী নিখুঁত প্রিন্টিং ফরম্যাট। ১ পাতায় ফুল মেমো বা ২ টি কপি সাপোর্ট করে।
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-white/10 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setShowPrintPreviewModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-black bg-[#c59b27] text-slate-950 hover:bg-[#d4a82a] shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Eye size={15} />
            <span>প্রিন্ট প্রিভিউ মোডাল</span>
          </button>
          <button
            onClick={() => setPaperSize('a4-full')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              paperSize === 'a4-full' ? 'bg-white/20 text-white shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            A4 ফুল
          </button>
          <button
            onClick={() => setPaperSize('a4-dual')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              paperSize === 'a4-dual' ? 'bg-white/20 text-white shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            A4 ডুয়েল
          </button>
          <button
            onClick={() => setPaperSize('a4-half')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              paperSize === 'a4-half' ? 'bg-white/20 text-white shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            A4 হাফ
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-5 flex flex-col gap-6 no-print">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
              <User size={20} className="text-[#c59b27]" />
              ক্রেতা ও ভাউচার পেমেন্ট বিবরণী
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    মেমো নম্বর (MEMO NO)
                  </label>
                  <input 
                    type="text" 
                    value={customer.memoNo}
                    onChange={(e) => setCustomer({...customer, memoNo: e.target.value})}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    তারিখ (DATE)
                  </label>
                  <input 
                    type="date" 
                    value={customer.date}
                    onChange={(e) => setCustomer({...customer, date: e.target.value})}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  ক্রেতার নাম (CUSTOMER NAME)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="ক্রেতার নাম লিখুন..."
                    value={customer.name}
                    onChange={(e) => setCustomer({...customer, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#c59b27]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    মোবাইল (MOBILE)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="মোবাইল..."
                      value={customer.phone}
                      onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-3 text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      পেমেন্ট মেথড
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBkashModal(true)}
                        className="text-[10px] text-[#e2136e] font-black hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <QrCode size={11} />
                        <span>bKash</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCardModal(true)}
                        className="text-[10px] text-blue-800 font-black hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <CreditCard size={11} />
                        <span>কার্ড / EMI</span>
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select
                      value={customer.paymentMethod}
                      onChange={(e) => setCustomer({...customer, paymentMethod: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-3 text-xs font-bold focus:outline-none"
                    >
                      <option value="নগদ (Cash)">নগদ (Cash)</option>
                      <option value="বিকাশ (bKash)">বিকাশ (bKash)</option>
                      <option value="কার্ড (Card / POS)">কার্ড (Card / POS)</option>
                      <option value="০% ইএমআই (0% EMI Card)">০% ইএমআই (0% EMI Card)</option>
                      <option value="ব্যাংক ট্রান্সফার">ব্যাংক ট্রান্সফার</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Digital Payment Banners */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* bKash Banner */}
                <div className="bg-gradient-to-r from-pink-50 to-pink-100/60 border border-pink-200/80 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#e2136e] text-white rounded-lg flex items-center justify-center font-black text-[11px] shadow-sm">
                      bK
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-gray-900 leading-tight">
                        বিকাশ অনলাইন QR
                      </h5>
                      <p className="text-[9px] text-pink-800 font-medium">
                        মার্চেন্ট: 01612424802
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBkashModal(true)}
                    className="bg-[#e2136e] hover:bg-[#c20d5d] text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  >
                    QR দেখুন
                  </button>
                </div>

                {/* Card / POS Banner */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100/60 border border-blue-200/80 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-900 text-yellow-400 rounded-lg flex items-center justify-center font-black text-xs shadow-sm">
                      💳
                    </div>
                    <div>
                      <h5 className="text-[11px] font-black text-gray-900 leading-tight">
                        ব্যাংক কার্ড ও ০% EMI
                      </h5>
                      <p className="text-[9px] text-blue-800 font-medium">
                        Visa, Master, AMEX, POS
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCardModal(true)}
                    className="bg-blue-900 hover:bg-blue-950 text-white px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm transition-all cursor-pointer whitespace-nowrap"
                  >
                    কার্ড সোয়াইপ
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  ঠিকানা (ADDRESS)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="ঠিকানা..."
                    value={customer.address}
                    onChange={(e) => setCustomer({...customer, address: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    ডিসকাউন্ট / ছাড় (৳)
                  </label>
                  <input 
                    type="number" 
                    value={customer.discount}
                    onChange={(e) => setCustomer({...customer, discount: parseFloat(e.target.value) || 0})}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-green-700"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    জমা প্রাপ্ত টাকা (৳)
                  </label>
                  <input 
                    type="number" 
                    value={customer.paidAmount}
                    onChange={(e) => setCustomer({...customer, paidAmount: parseFloat(e.target.value) || 0})}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800"
                  />
                </div>
              </div>

              {/* Shop info settings */}
              <div className="pt-4 border-t border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  জুয়েলার্স শপ হেডার এডিট
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <input 
                    type="text" 
                    value={shopDetails.name}
                    onChange={(e) => setShopDetails({...shopDetails, name: e.target.value})}
                    placeholder="দোকানের নাম"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold"
                  />
                  <input 
                    type="text" 
                    value={shopDetails.address}
                    onChange={(e) => setShopDetails({...shopDetails, address: e.target.value})}
                    placeholder="ঠিকানা"
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Attached items list */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold text-gray-600 uppercase">মেমোতে যুক্ত অলঙ্কার ({items.length})</span>
                  {items.length > 0 && (
                    <button onClick={onClearMemo} className="text-[10px] text-red-600 font-bold hover:underline">
                      ক্লিয়ার করুন
                    </button>
                  )}
                </div>
                
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {items.length === 0 ? (
                    <p className="text-[11px] text-gray-400 font-medium italic text-center py-4">
                      স্টক বা ক্যালকুলেটর থেকে অলঙ্কার মেমোতে যোগ করুন!
                    </p>
                  ) : (
                    items.map(item => (
                      <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-800">{item.name}</span>
                          <span className="text-[10px] text-gray-400">{item.karat} | {item.traditionalWeight.vori} ভরি {item.traditionalWeight.ana} আনা</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-[#c59b27]">৳ {Math.round(item.total).toLocaleString('bn-BD')}</span>
                          <button onClick={() => onRemoveItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Receipt Preview in Exact A4 Dimensions */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* A4 Paper Dimensions Preview Box */}
          <div className="flex items-center justify-between bg-white px-6 py-3 rounded-2xl border border-gray-200 shadow-sm no-print">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
              <span className="text-xs font-bold text-gray-700">A4 পেপার প্রিভিউ (210mm × 297mm)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrintPreviewModal(true)}
                className="text-[11px] font-bold text-[#c59b27] bg-[#c59b27]/10 hover:bg-[#c59b27]/20 px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Eye size={13} />
                <span>ফুল স্ক্রীন প্রিভিউ</span>
              </button>
              <div className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg hidden sm:block">
                {paperSize === 'a4-full' ? 'ফুল পেজ ভাউচার' : paperSize === 'a4-dual' ? 'ডুয়েল কপি (2 Copies)' : 'হাফ সাইজ ভাউচার'}
              </div>
            </div>
          </div>

          <div 
            id="printable-receipt" 
            className="bg-white border-[6px] border-[#7a0a0a] shadow-2xl p-8 md:p-10 w-full max-w-[210mm] min-h-[297mm] mx-auto relative font-serif cursor-pointer hover:border-[#990d0d] transition-colors group"
            onClick={() => setShowPrintPreviewModal(true)}
            title="প্রিন্ট প্রিভিউ মোডালে বড় করে দেখুন"
          >
            {/* Hover overlay hint */}
            <div className="absolute top-4 right-4 bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity no-print">
              <Eye size={12} className="text-[#c59b27]" />
              <span>প্রিভিউ মোডাল খুলতে ক্লিক করুন</span>
            </div>

            {paperSize === 'a4-dual' ? (
              <div className="flex flex-col h-full justify-between gap-8">
                {/* Copy 1: Customer Copy */}
                <div className="border-b-2 border-dashed border-[#7a0a0a] pb-6 relative">
                  {renderReceiptContent('কাস্টমার কপি (Customer Copy)')}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-3 text-[9px] font-bold text-gray-500 flex items-center gap-1 no-print">
                    <Scissors size={12} />
                    <span>এখানে ছিঁড়ে আলাদা করুন (TEAR HERE)</span>
                  </div>
                </div>

                {/* Copy 2: Office/Shop Copy */}
                <div className="pt-2">
                  {renderReceiptContent('অফিস / শপ কপি (Office Copy)')}
                </div>
              </div>
            ) : (
              renderReceiptContent('কাস্টমার ক্যাশ মেমো (Customer Copy)')
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-2 no-print">
            <button 
              onClick={() => setShowPrintPreviewModal(true)}
              className="flex-1 min-w-[160px] bg-[#c59b27] hover:bg-[#d4a82a] text-slate-950 font-black py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer group"
            >
              <Eye size={18} className="group-hover:scale-110 transition-transform" />
              <span>প্রিন্ট প্রিভিউ মোডাল</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 min-w-[160px] bg-[#1a1614] hover:bg-black text-[#c59b27] font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all group cursor-pointer"
            >
              <Printer size={18} className="group-hover:scale-110 transition-transform" />
              <span>A4 প্রিন্ট করুন (Ctrl+P)</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 min-w-[140px] bg-[#7a0a0a] hover:bg-[#5a0707] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all group cursor-pointer"
            >
              <Download size={18} className="group-hover:scale-110 transition-transform" />
              <span>PDF সেভ</span>
            </button>
            <button 
              onClick={handleWhatsAppShare}
              className="flex-1 min-w-[140px] bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all group cursor-pointer"
            >
              <PhoneCall size={18} className="group-hover:scale-110 transition-transform" />
              <span>WhatsApp</span>
            </button>
            <button 
              onClick={handleSMSShare}
              className="flex-1 min-w-[120px] bg-[#6366f1] hover:bg-[#4f46e5] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl transition-all group cursor-pointer"
            >
              <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
              <span>SMS</span>
            </button>
          </div>

          {/* Printing Help Note */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 no-print text-xs text-amber-900">
            <Sparkles className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <span className="font-bold">A4 প্রিন্টিং টিপস:</span> প্রিন্ট করার সময় প্রিন্টার ডায়ালগে <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">Paper Size: A4</code> এবং <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">Margins: None / Default</code> নির্বাচন করুন।
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated A4 Print Preview Modal */}
      <PrintPreviewModal
        isOpen={showPrintPreviewModal}
        onClose={() => setShowPrintPreviewModal(false)}
        items={items}
        customer={customer}
        shopDetails={shopDetails}
        paperSize={paperSize}
        onPaperSizeChange={setPaperSize}
        subTotal={subTotal}
        vatTotal={vatTotal}
        grandTotal={grandTotal}
        dueAmount={dueAmount}
        onPrint={handlePrint}
        onWhatsAppShare={handleWhatsAppShare}
        onSMSShare={handleSMSShare}
      />

      {/* bKash Online Payment Modal */}
      <BkashPaymentModal
        isOpen={showBkashModal}
        onClose={() => setShowBkashModal(false)}
        defaultAmount={grandTotal}
        invoiceId={customer.memoNo}
        customerName={customer.name}
        customerPhone={customer.phone}
        onPaymentSuccess={(trxId, amt) => {
          setCustomer(prev => ({
            ...prev,
            paymentMethod: 'বিকাশ (bKash)',
            paidAmount: amt > 0 ? amt : prev.paidAmount
          }));
        }}
      />

      {/* Bank Card & POS Payment Modal */}
      <BankCardPaymentModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        defaultAmount={grandTotal}
        invoiceId={customer.memoNo}
        customerName={customer.name}
        customerPhone={customer.phone}
        onPaymentSuccess={(authCode, amt, brand, emiMonths) => {
          setCustomer(prev => ({
            ...prev,
            paymentMethod: emiMonths && emiMonths > 0 
              ? `০% ইএমআই (${emiMonths} মাস - ${brand})`
              : `কার্ড (${brand} - Auth: ${authCode})`,
            paidAmount: amt > 0 ? amt : prev.paidAmount
          }));
        }}
      />
    </div>
  );
}



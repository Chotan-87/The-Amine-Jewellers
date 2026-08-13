import React, { useState } from 'react';
import { 
  X, Printer, Download, ZoomIn, ZoomOut, RotateCcw, 
  FileText, Scissors, Check, Sparkles, PhoneCall, MessageSquare,
  Eye, Layers, ShieldCheck, CheckCircle2, SlidersHorizontal, Info
} from 'lucide-react';
import { SalesItem } from '../types';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SalesItem[];
  customer: {
    name: string;
    phone: string;
    address: string;
    memoNo: string;
    date: string;
    paymentMethod: string;
    discount: number;
    paidAmount: number;
  };
  shopDetails: {
    name: string;
    slogan: string;
    address: string;
    phones: string;
    vatRegNo: string;
  };
  paperSize: 'a4-full' | 'a4-dual' | 'a4-half';
  onPaperSizeChange: (size: 'a4-full' | 'a4-dual' | 'a4-half') => void;
  subTotal: number;
  vatTotal: number;
  grandTotal: number;
  dueAmount: number;
  onPrint: () => void;
  onWhatsAppShare: () => void;
  onSMSShare: () => void;
}

export default function PrintPreviewModal({
  isOpen,
  onClose,
  items,
  customer,
  shopDetails,
  paperSize,
  onPaperSizeChange,
  subTotal,
  vatTotal,
  grandTotal,
  dueAmount,
  onPrint,
  onWhatsAppShare,
  onSMSShare,
}: PrintPreviewModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(85); // % scale
  const [showStamp, setShowStamp] = useState<boolean>(true);
  const [stampType, setStampType] = useState<'paid' | 'due' | 'official'>('official');
  const [paperBg, setPaperBg] = useState<'white' | 'cream'>('white');
  const [showRuler, setShowRuler] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 40));
  const handleResetZoom = () => setZoomLevel(85);

  const isPaidInFull = dueAmount <= 0;

  const renderSingleReceipt = (copyTypeTag?: string) => (
    <div className={`flex flex-col h-full justify-between font-serif text-[#7a0a0a] relative ${
      paperBg === 'cream' ? 'bg-[#fffdf9]' : 'bg-white'
    }`}>
      {/* Optional Stamp Overlay */}
      {showStamp && (
        <div className="absolute top-24 right-8 pointer-events-none z-10 transform rotate-[-12deg] opacity-85 select-none no-print">
          {stampType === 'official' || (stampType === 'paid' && isPaidInFull) ? (
            <div className="border-4 border-double border-emerald-700 text-emerald-800 px-4 py-1.5 rounded-xl font-sans font-black text-xs uppercase tracking-wider text-center shadow-sm bg-emerald-50/40">
              <div className="text-[10px] font-bold">দি আমিন জুয়েলার্স</div>
              <div className="text-sm font-black flex items-center justify-center gap-1">
                <CheckCircle2 size={14} />
                <span>পরিশোধিত (PAID)</span>
              </div>
              <div className="text-[8px] opacity-75">{customer.date}</div>
            </div>
          ) : (
            <div className="border-4 border-double border-red-700 text-red-800 px-4 py-1.5 rounded-xl font-sans font-black text-xs uppercase tracking-wider text-center shadow-sm bg-red-50/40">
              <div className="text-[10px] font-bold">দি আমিন জুয়েলার্স</div>
              <div className="text-sm font-black">অবশিষ্ট বকেয়া (DUE)</div>
              <div className="text-[9px] font-bold">৳ {Math.round(dueAmount).toLocaleString('bn-BD')}</div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="text-center mb-5">

          <div className="flex justify-between items-center mb-1">
            <div className="text-[9px] border border-[#7a0a0a] px-2.5 py-0.5 rounded font-bold uppercase no-print-border">
              {copyTypeTag || 'মূল কাস্টমার কপি'}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#7a0a0a] tracking-tight">
              {shopDetails.name}
            </h1>
            <div className="text-[9px] border border-[#7a0a0a] px-2.5 py-0.5 rounded font-bold uppercase">
              A4 INVOICE
            </div>
          </div>
          <div className="text-[#7a0a0a] text-[10px] font-bold border-b-2 border-[#7a0a0a] pb-1 inline-block mb-1 px-6">
            {shopDetails.address} | মোবাইল: {shopDetails.phones}
          </div>
          <p className="text-[8px] text-[#7a0a0a] opacity-80 leading-tight max-w-xl mx-auto">
            {shopDetails.slogan}
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-5 text-[11px] font-bold border-y border-[#7a0a0a]/30 py-2.5">
          <div className="flex gap-2">
            <span className="shrink-0 text-gray-600">ক্রেতার নাম:</span>
            <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold text-[#7a0a0a]">
              {customer.name || '................................'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 text-gray-600">মেমো নম্বর:</span>
            <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold text-[#7a0a0a]">
              {customer.memoNo}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 text-gray-600">মোবাইল নম্বর:</span>
            <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold text-[#7a0a0a]">
              {customer.phone || '................................'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0 text-gray-600">তারিখ:</span>
            <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold text-[#7a0a0a]">
              {customer.date}
            </span>
          </div>
          <div className="flex gap-2 col-span-2">
            <span className="shrink-0 text-gray-600">ঠিকানা:</span>
            <span className="border-b border-dotted border-[#7a0a0a] flex-1 font-extrabold text-[#7a0a0a]">
              {customer.address || '................................'}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-5 min-h-[160px]">
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
                  <td className="border-x border-[#7a0a0a] py-2 px-2 font-black">
                    {item.name} ({item.karat})
                  </td>
                  <td className="border-x border-[#7a0a0a] py-2 px-2 text-center font-mono">
                    {item.traditionalWeight.vori}-{item.traditionalWeight.ana}-{item.traditionalWeight.roti}
                  </td>
                  <td className="border-x border-[#7a0a0a] py-2 px-2 text-center">
                    {Math.round(item.wastageValue).toLocaleString('bn-BD')}
                  </td>
                  <td className="border-x border-[#7a0a0a] py-2 px-2 text-center">
                    {Math.round(item.makingCharge).toLocaleString('bn-BD')}
                  </td>
                  <td className="border-x border-[#7a0a0a] py-2 px-2 text-right font-black">
                    {Math.round(item.total).toLocaleString('bn-BD')}
                  </td>
                </tr>
              ))}
              {[...Array(Math.max(0, (paperSize === 'a4-dual' ? 3 : 5) - items.length))].map((_, i) => (
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
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="border border-[#7a0a0a]/30 p-3 rounded-lg text-[9px] space-y-1 bg-amber-50/40">
            <p className="font-bold border-b border-[#7a0a0a]/20 pb-1">
              পেমেন্ট মেথড: <span className="font-black text-[#7a0a0a]">{customer.paymentMethod}</span>
            </p>
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
            <div className="flex justify-between text-[13px] border-b-2 border-[#7a0a0a] pt-0.5 font-black">
              <span>সর্বমোট (Grand Total):</span>
              <span>{Math.round(grandTotal).toLocaleString('bn-BD')} ৳</span>
            </div>
            <div className="flex justify-between text-[11px] pt-0.5 text-gray-700">
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
        <div className="grid grid-cols-2 gap-6 text-[#7a0a0a] border-t border-[#7a0a0a]/30 pt-2.5">
          <div>
            <h5 className="text-[9px] font-black underline mb-0.5">বিক্রয় ও ফেরত শর্তাবলী:</h5>
            <ol className="text-[8px] font-bold space-y-0.5 list-decimal pl-3 leading-tight opacity-90">
              <li>বিক্রিত অলঙ্কার পরিবর্তনের সময় ২০% এবং নগদ ফেরত নেয়ার ক্ষেত্রে ৩০% বাদ দেওয়া হইবে।</li>
              <li>ক্যাশ মেমো ব্যতিরেক কোনো ফেরত বা এক্সচেঞ্জ গ্রহণযোগ্য নহে।</li>
            </ol>
          </div>
          <div className="text-right flex flex-col justify-end">
            <p className="text-[9px] font-bold italic opacity-80">সুনাম ও সততাই আমাদের একমাত্র মূলধন।</p>
          </div>
        </div>

        <div className="flex justify-between text-[10px] font-bold text-[#7a0a0a] pt-8 pb-1">
          <div className="text-center border-t border-dashed border-[#7a0a0a] w-36">ক্রেতার স্বাক্ষর</div>
          <div className="text-center border-t border-dashed border-[#7a0a0a] w-44">ক্যাশিয়ার / অথরাইজড স্বাক্ষর</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-md overflow-hidden text-slate-100 no-print">
      
      {/* Modal Top Navigation Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sm:px-6 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c59b27]/20 border border-[#c59b27] rounded-xl flex items-center justify-center text-[#c59b27] shrink-0">
            <Eye size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-wide">
                A4 ক্যাশ মেমো প্রিন্ট প্রিভিউ (Print Preview)
              </h2>
              <span className="bg-[#c59b27]/20 text-[#c59b27] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#c59b27]/40 uppercase tracking-wider">
                A4 Standard (210mm × 297mm)
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              প্রিন্ট করার পূর্বে মেমোর লেআউট, মার্জিন ও ফন্ট চেক করুন।
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className="bg-[#c59b27] hover:bg-[#d4a82a] text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg hover:shadow-[#c59b27]/20 transition-all cursor-pointer"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">এখনই প্রিন্ট দিন (Print Now)</span>
            <span className="sm:hidden">প্রিন্ট</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-9 h-9 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl flex items-center justify-center transition-colors cursor-pointer"
            title="বন্ধ করুন"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Modal Sub-Toolbar / Customization Options */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs text-slate-300">
        
        {/* Layout Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60">
          <span className="text-[10px] font-bold text-slate-400 px-2 flex items-center gap-1">
            <Layers size={13} className="text-[#c59b27]" />
            ফরম্যাট:
          </span>
          <button
            onClick={() => onPaperSizeChange('a4-full')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              paperSize === 'a4-full'
                ? 'bg-[#c59b27] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            A4 ফুল পেজ
          </button>
          <button
            onClick={() => onPaperSizeChange('a4-dual')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              paperSize === 'a4-dual'
                ? 'bg-[#c59b27] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            A4 ডুয়েল (২ কপি)
          </button>
          <button
            onClick={() => onPaperSizeChange('a4-half')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              paperSize === 'a4-half'
                ? 'bg-[#c59b27] text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            A4 হাফ সাইজ
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800/90 rounded-xl border border-slate-700/60 p-1">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              title="জুম আউট"
            >
              <ZoomOut size={15} />
            </button>
            <span className="px-2 font-mono font-bold text-[11px] text-[#c59b27] min-w-[45px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
              title="জুম ইন"
            >
              <ZoomIn size={15} />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer border-l border-slate-700 ml-1 pl-1.5"
              title="রিসেট (85%)"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          {/* Stamp Toggle */}
          <button
            onClick={() => setShowStamp(!showStamp)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              showStamp
                ? 'bg-emerald-950/80 border-emerald-600/80 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <ShieldCheck size={14} />
            <span>সিল দেখান</span>
          </button>

          {/* Paper BG Mode */}
          <div className="hidden md:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-[10px]">
            <button
              onClick={() => setPaperBg('white')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                paperBg === 'white' ? 'bg-white text-slate-900' : 'text-slate-400'
              }`}
            >
              হোয়াইট পেপার
            </button>
            <button
              onClick={() => setPaperBg('cream')}
              className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                paperBg === 'cream' ? 'bg-[#fcfaf2] text-[#7a0a0a]' : 'text-slate-400'
              }`}
            >
              ক্রিম পেপার
            </button>
          </div>
        </div>

        {/* Dimension & Status Badge */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-800/50 px-3 py-1 rounded-xl border border-slate-800">
          <Sparkles size={13} className="text-amber-400" />
          <span>১ পৃষ্ঠার সঠিক A4 ফিট (210 × 297 mm)</span>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-auto bg-slate-950/80 p-4 sm:p-8 flex justify-center items-start custom-scrollbar relative">
        
        {/* Ruler Guide Lines Overlay (if active) */}
        {showRuler && (
          <div className="absolute top-2 left-4 right-4 flex justify-between pointer-events-none opacity-30 text-[9px] font-mono text-slate-400 border-t border-slate-700 pt-0.5 hidden md:flex">
            <span>0 mm</span>
            <span>50 mm</span>
            <span>105 mm (A4 Center)</span>
            <span>160 mm</span>
            <span>210 mm</span>
          </div>
        )}

        {/* Paper Container Container with transform scale */}
        <div 
          className="transition-transform duration-200 origin-top my-4"
          style={{ transform: `scale(${zoomLevel / 100})` }}
        >
          {/* Printable Sheet Frame mimicking real A4 paper */}
          <div 
            id="printable-receipt"
            className={`shadow-2xl border-[6px] border-[#7a0a0a] p-8 sm:p-10 w-[210mm] min-h-[297mm] mx-auto relative transition-colors duration-300 ${
              paperBg === 'cream' ? 'bg-[#fffdf9]' : 'bg-white'
            }`}
          >
            {paperSize === 'a4-dual' ? (
              <div className="flex flex-col h-full justify-between gap-8">
                {/* Copy 1: Customer Copy */}
                <div className="border-b-2 border-dashed border-[#7a0a0a] pb-6 relative">
                  {renderSingleReceipt('কাস্টমার কপি (Customer Copy)')}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white border border-[#7a0a0a]/30 rounded-full px-3 py-0.5 text-[9px] font-bold text-gray-600 flex items-center gap-1 shadow-sm">
                    <Scissors size={12} className="text-[#7a0a0a]" />
                    <span>এখানে ছিঁড়ে আলাদা করুন (TEAR HERE)</span>
                  </div>
                </div>

                {/* Copy 2: Office Copy */}
                <div className="pt-2">
                  {renderSingleReceipt('অফিস / শপ কপি (Office Copy)')}
                </div>
              </div>
            ) : (
              renderSingleReceipt('কাস্টমার ক্যাশ মেমো (Customer Copy)')
            )}
          </div>
        </div>
      </div>

      {/* Modal Bottom Footer / Summary Bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        
        {/* Invoice Brief */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">ক্রেতা:</span>
            <span className="font-extrabold text-white">{customer.name || 'অজ্ঞাত'}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-4">
            <span className="text-slate-400">মেমো #:</span>
            <span className="font-mono font-bold text-[#c59b27]">{customer.memoNo}</span>
          </div>
          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <span className="text-slate-400">মোট মূল্য:</span>
            <span className="font-bold text-emerald-400">৳ {Math.round(grandTotal).toLocaleString('bn-BD')}</span>
          </div>
        </div>

        {/* Export & Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onWhatsAppShare}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="WhatsApp-এ মেমো পাঠাবে"
          >
            <PhoneCall size={14} />
            <span className="hidden md:inline">WhatsApp</span>
          </button>

          <button
            onClick={onSMSShare}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="SMS এর মাধ্যমে পাঠাবে"
          >
            <MessageSquare size={14} />
            <span className="hidden md:inline">SMS</span>
          </button>

          <button
            onClick={onPrint}
            className="bg-[#7a0a0a] hover:bg-[#5a0707] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>PDF সেভ</span>
          </button>

          <button
            onClick={onPrint}
            className="bg-[#c59b27] hover:bg-[#d4a82a] text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Printer size={15} />
            <span>প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

    </div>
  );
}

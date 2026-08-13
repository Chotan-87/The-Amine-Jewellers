import { useState } from 'react';
import { Calendar, Clock, RefreshCw, CheckCircle, ExternalLink, CalendarDays } from 'lucide-react';
import { motion } from 'motion/react';

export default function CalendarSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('১০ মিনিট আগে');

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setLastSynced('এখনই সিঙ্ক সম্পন্ন হয়েছে');
    }, 1500);
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 bg-[#fcfaf7] min-h-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-[#c59b27]" size={28} />
            গুগল ক্যালেন্ডার সিঙ্ক (Google Calendar Sync)
          </h1>
          <p className="text-xs text-gray-500 font-medium">ডেলিভারি তারিখ এবং গুরুত্বপূর্ণ মিটিং গুগলে স্বয়ংক্রিয়ভাবে সেভ করুন। (সর্বশেষ সিঙ্ক: {lastSynced})</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="bg-[#4285F4] hover:bg-[#357ae8] text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition-all text-sm disabled:opacity-50"
        >
          <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
          {isSyncing ? 'সিঙ্ক হচ্ছে...' : 'সিঙ্ক করুন (Sync Now)'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4 items-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
            <CalendarDays size={32} />
          </div>
          <h3 className="font-bold text-lg">অর্ডার ডেলিভারি সূচি</h3>
          <p className="text-xs text-gray-400">আপনার সকল পেন্ডিং অর্ডারের ডেলিভারি ডেট সরাসরি আপনার ফোনের ক্যালেন্ডারে যুক্ত হবে।</p>
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[10px] font-bold">
            <CheckCircle size={12} />
            সক্রিয় আছে (Active)
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4 items-center text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-2">
            <Clock size={32} />
          </div>
          <h3 className="font-bold text-lg">পেমেন্ট রিমাইন্ডার</h3>
          <p className="text-xs text-gray-400">বকেয়া পেমেন্ট এবং বন্ধকী স্বর্ণের মেয়াদ শেষ হওয়ার রিমাইন্ডার সেট করুন।</p>
          <button onClick={handleSync} className="text-[#c59b27] text-xs font-bold hover:underline">কনফিগার ও সিঙ্ক করুন</button>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4 items-center text-center opacity-50">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-2">
            <ExternalLink size={32} />
          </div>
          <h3 className="font-bold text-lg">অন্যান্য ইন্টিগ্রেশন</h3>
          <p className="text-xs text-gray-400">আউটলুক বা অ্যাপল ক্যালেন্ডার বর্তমানে ডেভেলপমেন্ট পর্যায়ে রয়েছে।</p>
          <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 font-bold">শীঘ্রই আসছে</span>
        </div>
      </div>
    </div>
  );
}

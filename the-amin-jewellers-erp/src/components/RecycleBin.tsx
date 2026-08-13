import { useState } from 'react';
import { Trash2, RotateCcw, Search, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const initialDeletedItems = [
  { id: 'DEL-1', name: 'ক্যাশ মেমো #AM-123456', date: '২০২৬-০৮-১০', type: 'Memo', amount: 55000 },
  { id: 'DEL-2', name: 'অর্ডার #ORD-987', date: '২০২৬-০৮-০৯', type: 'Order', amount: 12000 },
  { id: 'DEL-3', name: 'বন্ধক রসিদ #LN-005', date: '২০২৬-০৮-০৫', type: 'Mortgage', amount: 30000 },
];

export default function RecycleBin() {
  const [items, setItems] = useState(initialDeletedItems);
  const [search, setSearch] = useState('');
  const [restoredMsg, setRestoredMsg] = useState('');

  const handleRestore = (id: string, name: string) => {
    setItems(items.filter(i => i.id !== id));
    setRestoredMsg(`'${name}' সফলতা সঙ্গে পুনঃস্থাপন করা হয়েছে!`);
    setTimeout(() => setRestoredMsg(''), 3000);
  };

  const handleEmptyBin = () => {
    setItems([]);
  };

  const filteredItems = items.filter(i => 
    (i.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (i.type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 bg-[#fcfaf7] min-h-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trash2 className="text-red-500" size={28} />
            রিসাইকেল বিন (Recycle Bin)
          </h1>
          <p className="text-xs text-gray-500 font-medium">মুছে ফেলা তথ্যসমূহ এখানে ৩০ দিন পর্যন্ত সংরক্ষিত থাকবে।</p>
        </div>
        {items.length > 0 && (
          <button onClick={handleEmptyBin} className="text-red-600 font-bold text-xs hover:underline bg-red-50 px-4 py-2 rounded-xl border border-red-100">
            বিন খালি করুন (Empty Bin)
          </button>
        )}
      </header>

      {restoredMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-100 border border-green-300 text-green-800 p-3 rounded-xl text-xs font-bold text-center">
          {restoredMsg}
        </motion.div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="মুছে ফেলা আইটেম খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 px-10 text-xs focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">আইটেম</th>
                <th className="px-6 py-4">ধরন</th>
                <th className="px-6 py-4">মুছে ফেলার তারিখ</th>
                <th className="px-6 py-4">পরিমাণ (৳)</th>
                <th className="px-6 py-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.tr key={item.id} exit={{ opacity: 0, x: -20 }} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-bold text-gray-500 uppercase">{item.type}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                      <Calendar size={12} />
                      {item.date}
                    </td>
                    <td className="px-6 py-4 font-bold">৳ {item.amount.toLocaleString('bn-BD')}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleRestore(item.id, item.name)}
                        className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all flex items-center gap-1 mx-auto" 
                        title="পুনরুদ্ধার করুন"
                      >
                        <RotateCcw size={14} />
                        <span className="text-[10px] font-bold">Restore</span>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-400 font-bold text-xs">
              রিসাইকেল বিন সম্পূর্ণ খালি!
            </div>
          )}
        </div>
      </div>

      <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-4">
        <Trash2 className="text-red-600 mt-1" size={20} />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-red-900">অটো ডিলিট পলিসি:</span>
          <p className="text-[10px] text-red-700 leading-relaxed font-medium">
            রিসাইকেল বিনে থাকা যেকোনো ডাটা ৩০ দিন পর স্বয়ংক্রিয়ভাবে চিরতরে মুছে যাবে। গুরুত্বপূর্ণ কোনো ডাটা ভুলবশত মুছে ফেললে দ্রুত পুনরুদ্ধার (Restore) করুন।
          </p>
        </div>
      </div>
    </div>
  );
}

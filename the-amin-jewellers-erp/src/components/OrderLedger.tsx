import React, { useState, useEffect } from 'react';
import { FileEdit, Plus, Search, Calendar, CheckCircle, Clock, Trash2, X } from 'lucide-react';
import { Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeCollection, saveDocumentToFirestore, deleteDocumentFromFirestore } from '../lib/firestoreSync';

export default function OrderLedger() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync with Firestore
  useEffect(() => {
    const unsubscribe = subscribeCollection('orders', (data) => {
      setOrders(data as Order[]);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [itemName, setItemName] = useState('');
  const [weight, setWeight] = useState<number>(11.664);
  const [advanceAmount, setAdvanceAmount] = useState<number>(20000);
  const [dueAmount, setDueAmount] = useState<number>(30000);

  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !itemName) return;

    const newOrd: Order = {
      id: Math.floor(100 + Math.random() * 900).toString() + '-' + Date.now(),
      customerName,
      itemName,
      weight,
      advanceAmount,
      dueAmount,
      status: 'active',
      date: new Date().toLocaleDateString('bn-BD')
    };

    // Save to Firestore
    saveDocumentToFirestore('orders', newOrd.id, newOrd);
    setShowAddModal(false);
    setCustomerName('');
    setItemName('');
    setWeight(11.664);
    setAdvanceAmount(20000);
    setDueAmount(30000);
  };

  const handleCompleteOrder = (id: string) => {
    const order = orders.find(o => o.id === id);
    if (order) {
      saveDocumentToFirestore('orders', id, { ...order, status: 'completed', dueAmount: 0 });
    }
  };

  const handleDeleteOrder = (id: string) => {
    deleteDocumentFromFirestore('orders', id);
  };

  const filteredOrders = orders.filter(order => 
    (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.itemName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 flex flex-col gap-6">
      <header className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <FileEdit className="text-[#c59b27]" size={24} />
          <div>
            <h2 className="text-xl font-bold">বায়না অর্ডার খাতা</h2>
            <p className="text-xs text-gray-500">ক্রেতাদের নতুন অর্ডারের বায়না ও বকেয়া খতিয়ান</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#c59b27] hover:bg-[#a68221] text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-md"
        >
          <Plus size={18} />
          নতুন বায়না অর্ডার
        </button>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Clock size={20} /></div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">সক্রিয় অর্ডার</div>
            <div className="text-xl font-bold">{orders.filter(o => o.status === 'active').length} টি</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-full text-green-600"><CheckCircle size={20} /></div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">সম্পূর্ণ অর্ডার</div>
            <div className="text-xl font-bold">{orders.filter(o => o.status === 'completed').length} টি</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 p-3 rounded-full text-amber-600"><Calendar size={20} /></div>
          <div>
            <div className="text-[10px] text-gray-400 uppercase font-bold">মোট বকেয়া পাওনা</div>
            <div className="text-xl font-bold text-amber-600">
              BDT {orders.filter(o => o.status === 'active').reduce((acc, curr) => acc + curr.dueAmount, 0).toLocaleString('bn-BD')}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="ক্রেতা বা অলঙ্কারের নাম দিয়ে খুঁজুন..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#c59b27]/20 focus:border-[#c59b27] transition-all text-sm"
        />
      </div>

      {/* Order Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-5 rounded-full ${order.status === 'active' ? 'bg-amber-500' : 'bg-green-500'}`} />
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{order.customerName}</h3>
                <p className="text-xs text-gray-400">অর্ডার আইডি: #{order.id} | তারিখ: {order.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-1 rounded-md font-bold ${order.status === 'active' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                  {order.status === 'active' ? 'চলমান' : 'সম্পূর্ণ'}
                </span>
                <button onClick={() => handleDeleteOrder(order.id)} className="text-gray-300 hover:text-red-500 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2 border-y border-gray-50">
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">অলঙ্কার</div>
                <div className="text-sm font-bold text-gray-700">{order.itemName}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">ওজন</div>
                <div className="text-sm font-bold text-gray-700">{order.weight} গ্রাম</div>
              </div>
            </div>

            <div className="flex justify-between items-end pt-2">
              <div>
                <div className="text-[10px] text-gray-400 font-bold uppercase">অগ্রিম আদায়</div>
                <div className="text-sm font-bold text-green-600">BDT {order.advanceAmount.toLocaleString('bn-BD')}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400 font-bold uppercase">বকেয়া পাওনা</div>
                <div className={`text-xl font-bold ${order.status === 'active' ? 'text-red-600' : 'text-gray-400'}`}>
                  BDT {order.dueAmount.toLocaleString('bn-BD')}
                </div>
              </div>
            </div>
            
            {order.status === 'active' && (
              <button 
                onClick={() => handleCompleteOrder(order.id)}
                className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl text-sm transition-all shadow-sm"
              >
                পেমেন্ট আদায় ও ডেলিভারি সম্পন্ন করুন
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Order Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <form onSubmit={handleAddOrder} className="bg-white rounded-3xl p-6 w-full max-w-md flex flex-col gap-4 shadow-2xl relative">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
              <h3 className="font-bold text-gray-800 text-lg border-b pb-2">নতুন বায়না অর্ডার এন্ট্রি</h3>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">ক্রেতার নাম *</label>
                <input 
                  type="text" 
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="যেমন: জামাল উদ্দিন" 
                  className="bg-gray-50 border p-2.5 rounded-xl text-sm" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500">অলঙ্কারের বিবরণ *</label>
                <input 
                  type="text" 
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="যেমন: ২২ক সোনার সীতাহার" 
                  className="bg-gray-50 border p-2.5 rounded-xl text-sm" 
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500">ওজন (গ্রাম)</label>
                  <input 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="bg-gray-50 border p-2 rounded-xl text-xs font-bold text-center" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500">অগ্রিম জমা (৳)</label>
                  <input 
                    type="number" 
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                    className="bg-gray-50 border p-2 rounded-xl text-xs font-bold text-center" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500">বকেয়া (৳)</label>
                  <input 
                    type="number" 
                    value={dueAmount}
                    onChange={(e) => setDueAmount(Number(e.target.value))}
                    className="bg-gray-50 border p-2 rounded-xl text-xs font-bold text-center" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-[#c59b27] text-black rounded-xl shadow-md"
                >
                  অর্ডার সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

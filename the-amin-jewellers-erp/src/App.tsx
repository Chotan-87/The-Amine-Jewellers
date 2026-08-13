import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import WeightCalculator from './components/WeightCalculator';
import StockLedger from './components/StockLedger';
import OrderLedger from './components/OrderLedger';
import ArtisanLedger from './components/ArtisanLedger';
import MarketRates from './components/MarketRates';
import RecycleBin from './components/RecycleBin';
import CalendarSync from './components/CalendarSync';
import PythonFlaskCode from './components/PythonFlaskCode';
import Reports from './components/Reports';
import MortgageLedger from './components/MortgageLedger';
import CustomerCRM from './components/CustomerCRM';
import InterestCalculator from './components/InterestCalculator';
import SalesMemo from './components/SalesMemo';
import OldGoldReceipt from './components/OldGoldReceipt';
import { SalesItem, GoldRate } from './types';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { subscribeGoldRates, saveGoldRatesToFirestore, seedInitialData } from './lib/firestoreSync';
import { initialMortgages, initialStockItems, initialArtisans } from './initialData';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [memoItems, setMemoItems] = useState<SalesItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [goldRates, setGoldRates] = useState<GoldRate[]>([
    { karat: '22 Carat Gold', rate: 125400 },
    { karat: '21 Carat Gold', rate: 119700 },
    { karat: '18 Carat Gold', rate: 102600 },
    { karat: 'Traditional Gold', rate: 85500 },
    { karat: 'Silver (Rupa)', rate: 2100 },
  ]);

  // Sync gold rates in real-time across both applications using Firebase Firestore Server 1
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeGoldRates((newRates) => {
      if (newRates && newRates.length > 0) {
        setGoldRates(newRates);
      }
    });

    // Seed initial data if not already seeded
    if (localStorage.getItem('firebase_seeded') !== 'true') {
      seedInitialData(initialMortgages, initialStockItems, initialArtisans);
    }

    return () => unsubscribe();
  }, [user]);

  const handleUpdateRates = (newRates: GoldRate[]) => {
    setGoldRates(newRates);
    saveGoldRatesToFirestore(newRates);
  };

  const handleAddToMemo = (item: SalesItem) => {
    setMemoItems([...memoItems, item]);
    setActiveTab('sales');
  };

  const handleRemoveFromMemo = (id: string) => {
    setMemoItems(memoItems.filter(item => item.id !== id));
  };

  const handleClearMemo = () => {
    setMemoItems([]);
  };

  return (
    <div className="flex h-screen bg-[#fcfaf7] text-gray-900 selection:bg-[#c59b27]/30 overflow-hidden">
      {isSidebarOpen && <Sidebar activeTab={activeTab} onTabChange={setActiveTab} memoCount={memoItems.length} />}
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onTabChange={setActiveTab} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard 
                rates={goldRates} 
                onUpdateRates={handleUpdateRates} 
                onTabChange={setActiveTab} 
              />
            )}
            {activeTab === 'calculator' && <WeightCalculator onAddToMemo={handleAddToMemo} goldRates={goldRates} />}
            {activeTab === 'stock' && <StockLedger onAddToMemo={handleAddToMemo} />}
            {activeTab === 'orders' && <OrderLedger />}
            {activeTab === 'wages' && <ArtisanLedger />}
            {activeTab === 'rates' && <MarketRates rates={goldRates} onUpdateRates={handleUpdateRates} />}
            {activeTab === 'trash' && <RecycleBin />}
            {activeTab === 'calendar' && <CalendarSync />}
            {activeTab === 'python' && <PythonFlaskCode />}
            {activeTab === 'reports' && <Reports />}
            {activeTab === 'customers' && <CustomerCRM />}
            {activeTab === 'loan' && <MortgageLedger />}
            {activeTab === 'interest' && <InterestCalculator onNavigateToLoan={() => setActiveTab('loan')} />}
            {activeTab === 'sales' && (
              <SalesMemo 
                items={memoItems} 
                onRemoveItem={handleRemoveFromMemo}
                onClearMemo={handleClearMemo}
              />
            )}
            {activeTab === 'oldgold' && <OldGoldReceipt goldRates={goldRates} />}
            {!['dashboard', 'calculator', 'stock', 'orders', 'sales', 'oldgold', 'loan', 'interest', 'wages', 'rates', 'trash', 'calendar', 'python', 'reports', 'customers'].includes(activeTab) && (
              <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] text-center opacity-50">
                <h2 className="text-2xl font-bold mb-2">শীঘ্রই আসছে...</h2>
                <p className="text-sm">এই বিভাগটি বর্তমানে উন্নয়নের কাজ চলছে।</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}


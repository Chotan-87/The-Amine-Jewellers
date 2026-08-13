import { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Filter, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';

const salesData2026 = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 2000 },
  { name: 'Apr', sales: 2780 },
  { name: 'May', sales: 1890 },
  { name: 'Jun', sales: 2390 },
];

const salesData2025 = [
  { name: 'Jan', sales: 2400 },
  { name: 'Feb', sales: 1300 },
  { name: 'Mar', sales: 3800 },
  { name: 'Apr', sales: 1980 },
  { name: 'May', sales: 2890 },
  { name: 'Jun', sales: 3390 },
];

const categoryData = [
  { name: 'Gold Chains', value: 400 },
  { name: 'Rings', value: 300 },
  { name: 'Earrings', value: 300 },
  { name: 'Bangles', value: 200 },
];

const COLORS = ['#c59b27', '#e68a00', '#2c1a10', '#a68221'];

export default function Reports() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [filterActive, setFilterActive] = useState(false);

  const activeSalesData = selectedYear === '2026' ? salesData2026 : salesData2025;

  const handleExportCSV = () => {
    const headers = ['Month,Sales(BDT)\n'];
    const rows = activeSalesData.map(d => `${d.name},${d.sales * 1000}`).join('\n');
    const blob = new Blob([...headers, rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${selectedYear}.csv`;
    a.click();
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 bg-[#fcfaf7] min-h-full">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="text-[#c59b27]" size={28} />
            রিপোর্ট ও এনালিটিক্স (Reports & Analytics)
          </h1>
          <p className="text-xs text-gray-500 font-medium">ব্যবসার লাভ-ক্ষতি, বিক্রয় রিপোর্ট এবং কাস্টমার ডাটা এনালিটিক্স।</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilterActive(!filterActive)}
            className={`border font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all ${
              filterActive ? 'bg-[#c59b27] text-black border-[#c59b27]' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            {filterActive ? 'ফিল্টার চালু' : 'ফিল্টার করুন'}
          </button>
          <button 
            onClick={handleExportCSV}
            className="bg-[#c59b27] hover:bg-[#a68221] text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-[#c59b27]/10 transition-all text-xs"
          >
            <Download size={18} />
            সিএসভি / এক্সেল ডাউনলোড
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-green-500" />
              মাসিক বিক্রয় প্রবণতা
            </h3>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none"
            >
              <option value="2026">২০২৬ সাল</option>
              <option value="2025">২০২৫ সাল</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeSalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#999'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#999'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="sales" fill="#c59b27" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col gap-6">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <PieChart size={18} className="text-blue-500" />
            পণ্য ভিত্তিক বিক্রয় বিভাগ
          </h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {categoryData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[10px] font-bold text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transaction Log */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-[#c59b27]" />
            সাম্প্রতিক লেনদেন ইতিহাস
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">লেনদেন আইডি</th>
                <th className="px-6 py-4">গ্রাহকের নাম</th>
                <th className="px-6 py-4">ধরণ</th>
                <th className="px-6 py-4">তারিখ</th>
                <th className="px-6 py-4 text-right">পরিমাণ (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { id: 'TXN-9981', customer: 'কামাল হোসেন', type: 'বিক্রয়', date: '১০ আগস্ট, ২০২৬', amount: 125000 },
                { id: 'TXN-9982', customer: 'সালেহা বেগম', type: 'বন্ধক প্রদান', date: '০৯ আগস্ট, ২০২৬', amount: 45000 },
                { id: 'TXN-9983', customer: 'আরিফুর রহমান', type: 'অর্ডার বায়না', date: '০৯ আগস্ট, ২০২৬', amount: 10000 },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">#{row.id}</td>
                  <td className="px-6 py-4 text-gray-600">{row.customer}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold ${row.type === 'বিক্রয়' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{row.date}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">৳ {row.amount.toLocaleString('bn-BD')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

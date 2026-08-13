import { useState } from 'react';
import { Terminal, Copy, Check, Code2, Cpu, Database, Globe, Lock } from 'lucide-react';
import { motion } from 'motion/react';

const flaskCode = `from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///amin_jewellers.db'
db = SQLAlchemy(app)

# Gold Stock Model
class StockItem(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    code = db.Column(db.String(20), unique=True)
    name_bangla = db.Column(db.String(100))
    karat = db.Column(db.String(10))
    weight = db.Column(db.Float)
    count = db.Column(db.Integer)
    min_limit = db.Column(db.Integer)

@app.route('/api/stock', methods=['GET'])
def get_stock():
    items = StockItem.query.all()
    return jsonify([{
        "id": i.id,
        "code": i.code,
        "name": i.name_bangla,
        "weight": i.weight
    } for i in items])

@app.route('/api/calculate_interest', methods=['POST'])
def calculate_interest():
    data = request.json
    principal = data.get('principal')
    rate = data.get('rate')
    months = data.get('months')
    
    # Simple Interest Logic
    interest = (principal * rate * months) / 100
    return jsonify({
        "interest": interest,
        "total": principal + interest
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)`;

export default function PythonFlaskCode() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(flaskCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 flex flex-col gap-8 bg-[#0d1117] min-h-full text-gray-300 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-[#c59b27] flex items-center gap-3">
            <Cpu className="text-[#c59b27]" size={28} />
            সিস্টেম ইন্টিগ্রেশন ও ডেভেলপার এপিআই (Developer API)
          </h1>
          <p className="text-xs text-gray-500 font-medium">পাইথন ফ্লস্ক (Python Flask) সার্ভারের সাথে অ্যাপ্লিকেশনের ব্যাকএন্ড সংযোগের নমুনা কোড।</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-[#c59b27]/10 text-[#c59b27] text-[10px] font-bold px-3 py-1 rounded-full border border-[#c59b27]/20 uppercase tracking-widest">v1.2 Stable</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Technical Features */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 flex flex-col gap-6">
            <div className="flex items-center gap-3 text-sm font-bold text-gray-100">
              <Database size={18} className="text-blue-500" />
              ব্যবহৃত টেকনোলজি স্ট্যাক
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Flask (Web Framework)', icon: Globe, desc: '轻量级 Python Web 框架' },
                { label: 'SQLAlchemy (ORM)', icon: Database, desc: 'ডাটাবেস ম্যানেজমেন্ট সিস্টেম' },
                { label: 'JWT Auth', icon: Lock, desc: 'নিরাপদ ইউজার লগইন সিস্টেম' },
                { label: 'RESTful API', icon: Code2, desc: 'অন্যান্য অ্যাপের সাথে ইন্টিগ্রেশন' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-white transition-all">
                    <item.icon size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-200">{item.label}</span>
                    <span className="text-[10px] text-gray-500">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#2c1a10] p-6 rounded-3xl border border-[#c59b27]/20 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#c59b27]">সিস্টেম রিকুয়্যারমেন্ট</h3>
            <ul className="text-[10px] text-gray-400 flex flex-col gap-2 list-disc pl-4">
              <li>Python 3.8 or Higher</li>
              <li>Virtual Environment (venv) Recommended</li>
              <li>SQLite / PostgreSQL / MySQL</li>
              <li>Antigravity AI SDK for smart analytics</li>
            </ul>
          </div>
        </div>

        {/* Code Snippet Area */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-[#010409] rounded-2xl border border-gray-800 overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-[#161b22] px-6 py-4 flex justify-between items-center border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Terminal size={16} className="text-green-500" />
                <span className="text-xs font-mono font-bold text-gray-400">server.py</span>
              </div>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-all"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-gray-800">
              <pre className="font-mono text-xs leading-relaxed text-blue-300">
                <code>{flaskCode}</code>
              </pre>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-2 italic px-2">
            <Code2 size={12} />
            দ্রষ্টব্য: এই কোডটি একটি ডেমো সংস্করণ। প্রোডাকশন লেভেলে ব্যবহারের জন্য সিকিউরিটি ও ডাটাবেস হ্যান্ডলিং আরও উন্নত করা প্রয়োজন।
          </div>
        </div>
      </div>
    </div>
  );
}

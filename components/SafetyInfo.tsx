
import React, { useState, useEffect } from 'react';
import { getGeneralSafetyTips } from '../geminiService';
import { Language } from '../types';

const categories = [
  { id: 'fire', label: 'Fire Safety', icon: '🔥' },
  { id: 'flood', label: 'Flood Preparedness', icon: '🌊' },
  { id: 'earthquake', label: 'Earthquake Action', icon: '🏠' },
  { id: 'medical', label: 'First Aid Basics', icon: '🩹' },
  { id: 'kit', label: 'Emergency Kit', icon: '🎒' },
];

interface Props {
  language: Language;
}

const SafetyInfo: React.FC<Props> = ({ language }) => {
  const [selected, setSelected] = useState(categories[0]);
  const [tips, setTips] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true);
      // Fix: Pass language to the service
      const res = await getGeneralSafetyTips(selected.label, language);
      setTips(res);
      setLoading(false);
    };
    fetchTips();
  }, [selected, language]);

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Public Safety Hub</h2>
        <p className="text-slate-500 font-medium">Preparedness guides and expert emergency protocols.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelected(cat)}
            className={`p-6 rounded-3xl border-2 transition text-left group ${
              selected.id === cat.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-white border-transparent text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="text-3xl mb-4 group-hover:scale-110 transition">{cat.icon}</div>
            <p className="font-black text-xs uppercase tracking-widest leading-tight">{cat.label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 min-h-[400px]">
        <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-6">
           <h3 className="text-2xl font-black text-slate-900">{selected.label}</h3>
           <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">EXPERT GUIDANCE</span>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-4 bg-slate-100 rounded w-full"></div>
            <div className="h-4 bg-slate-100 rounded w-2/3"></div>
            <div className="h-32 bg-slate-50 rounded-2xl"></div>
          </div>
        ) : (
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-700 text-lg leading-relaxed space-y-4">
              {tips}
            </div>
          </div>
        )}
        
        <div className="mt-12 p-8 bg-slate-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="text-center md:text-left">
              <h4 className="font-black text-lg">Crisis Preparedness Insight</h4>
              <p className="text-slate-400 text-sm mt-1">AI-generated summary based on current regional standards.</p>
           </div>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl transition text-xs uppercase tracking-widest shadow-lg">
             Download Guide PDF
           </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyInfo;

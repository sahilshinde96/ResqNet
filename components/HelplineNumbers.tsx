
import React from 'react';

const HELPLINES = [
  {
    category: 'Emergency Services',
    icon: '🚨',
    color: 'bg-red-50 text-red-700 border-red-100',
    contacts: [
      { name: 'General Emergency', number: '911', desc: 'Life-threatening emergencies, crimes in progress, fires.' },
      { name: 'Police (Non-Emergency)', number: '311', desc: 'Reporting non-urgent crimes or local information.' },
    ]
  },
  {
    category: 'Medical & Health',
    icon: '🏥',
    color: 'bg-blue-50 text-blue-700 border-blue-100',
    contacts: [
      { name: 'Ambulance Dispatch', number: '911', desc: 'Direct medical emergency response.' },
      { name: 'Poison Control', number: '1-800-222-1222', desc: 'Immediate assistance for accidental poisoning.' },
    ]
  },
  {
    category: 'Crisis & Mental Health',
    icon: '🧠',
    color: 'bg-purple-50 text-purple-700 border-purple-100',
    contacts: [
      { name: 'Suicide & Crisis Lifeline', number: '988', desc: '24/7 free and confidential support.' },
      { name: 'Crisis Text Line', number: 'Text HOME to 741741', desc: 'Text-based mental health support.' },
    ]
  },
  {
    category: 'Disaster Relief',
    icon: '⛈️',
    color: 'bg-amber-50 text-amber-700 border-amber-100',
    contacts: [
      { name: 'FEMA Helpline', number: '1-800-621-3362', desc: 'Assistance during federally declared disasters.' },
      { name: 'Red Cross Support', number: '1-800-733-2767', desc: 'Emergency food, shelter, and medical support.' },
    ]
  }
];

const HelplineNumbers: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto animate-fadeIn space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Emergency Helplines</h2>
          <p className="text-slate-500 font-medium">Critical contact points for immediate human assistance.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-2">
           <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
           <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Lines Active 24/7</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {HELPLINES.map((group, idx) => (
          <div key={idx} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className={`p-6 flex items-center gap-3 border-b border-slate-50 ${group.color}`}>
               <span className="text-2xl">{group.icon}</span>
               <h3 className="font-black uppercase tracking-widest text-xs">{group.category}</h3>
            </div>
            <div className="p-6 space-y-6 flex-1">
               {group.contacts.map((contact, cIdx) => (
                 <div key={cIdx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex-1">
                       <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition">{contact.name}</h4>
                       <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{contact.desc}</p>
                    </div>
                    <a 
                      href={`tel:${contact.number.replace(/[^0-9]/g, '')}`}
                      className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm tracking-tighter hover:bg-indigo-600 hover:scale-105 transition-all shadow-lg text-center"
                    >
                      {contact.number}
                    </a>
                 </div>
               ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
         <div className="relative z-10 max-w-2xl">
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Need Localized Help?</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Our AI Assistant is synchronized with regional services. If you are unsure which line to call, click the Voice Assistant button or use the Live Chat for guidance.
            </p>
            <div className="flex flex-wrap gap-4">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  📍 Regional Triage Active
               </div>
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  🛰️ Satellite Comms Enabled
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default HelplineNumbers;

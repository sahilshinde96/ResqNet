
import React, { useState } from 'react';
import { Incident, IncidentSeverity, IncidentStatus, User, UserRole, Language } from '../types';
import { getSafetyGuidelines } from '../geminiService';

interface Props {
  onReport: (incident: Incident) => void | Promise<void>;
  user: User;
  language: Language;
}

const IncidentReport: React.FC<Props> = ({ onReport, user, language }) => {
  const [type, setType] = useState('Fire');
  const [severity, setSeverity] = useState(IncidentSeverity.MEDIUM);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newIncident: Incident = {
      id: `i-${Date.now()}`,
      type,
      severity,
      description,
      latitude: user.location?.lat || 34.05,
      longitude: user.location?.lng || -118.24,
      status: IncidentStatus.PENDING,
      reportedBy: user.id,
      createdAt: new Date()
    };

    // Fix: Pass language to the service call
    const safetyAdvice = await getSafetyGuidelines(type, severity, language);
    setAdvice(safetyAdvice);

    onReport(newIncident);
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-xl shadow-slate-100">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Report Logged</h2>
          <p className="text-slate-500 mt-2 font-medium">Authorities and nearby responders have been notified.</p>
        </div>

        {advice && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-lg shadow-slate-100">
            <h3 className="text-sm font-black text-slate-400 flex items-center gap-2 mb-6 uppercase tracking-widest">
              Emergency Guidance
            </h3>
            <div className="whitespace-pre-wrap text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-100 italic font-medium leading-relaxed">
              {advice}
            </div>
          </div>
        )}

        <button 
          onClick={() => { setSubmitted(false); setDescription(''); setAdvice(null); }}
          className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black transition shadow-xl uppercase tracking-widest text-sm"
        >
          New Crisis Report
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Crisis Reporting</h2>
        <p className="text-slate-500 font-medium">Immediate notification for emergency response coordination.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Column */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <select 
                  value={type} 
                  onChange={e => setType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 font-bold focus:ring-2 focus:ring-red-500 outline-none transition"
                >
                  <option>Fire</option>
                  <option>Flood</option>
                  <option>Medical Emergency</option>
                  <option>Public Disturbance</option>
                  <option>Downed Power Line</option>
                  <option>Structural Damage</option>
                  <option>Hazardous Material</option>
                  <option>Other Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Severity Level</label>
                <div className="grid grid-cols-2 gap-3">
                   {[
                     { value: IncidentSeverity.LOW, label: 'Low', color: 'text-blue-600' },
                     { value: IncidentSeverity.MEDIUM, label: 'Medium', color: 'text-yellow-600' },
                     { value: IncidentSeverity.HIGH, label: 'High', color: 'text-orange-600' },
                     { value: IncidentSeverity.SOS, label: 'SOS', color: 'text-red-600' },
                   ].map(lvl => (
                     <button
                       key={lvl.value}
                       type="button"
                       onClick={() => setSeverity(lvl.value)}
                       className={`px-4 py-3 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition ${
                         severity === lvl.value ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400'
                       }`}
                     >
                       {lvl.label}
                     </button>
                   ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Situational Details</label>
                <textarea 
                  rows={4} 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide landmarks, number of victims, or specific hazards..."
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none transition"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="w-full bg-red-600 text-white font-black py-4 rounded-2xl hover:bg-red-700 transition shadow-xl shadow-red-100 flex items-center justify-center gap-3 disabled:opacity-50 uppercase tracking-widest text-sm"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Broadcast Emergency'
              )}
            </button>
          </form>
        </div>

        {/* Map Preview Column */}
        <div className="space-y-6">
           <div className="bg-slate-900 rounded-3xl h-[400px] relative overflow-hidden shadow-2xl">
              {/* Fake Map Grid */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="relative">
                    <div className="w-40 h-40 bg-red-500/20 rounded-full animate-ping"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 border-2 border-white rounded-full shadow-2xl"></div>
                 </div>
              </div>
              <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Target Location</p>
                 <p className="text-xs font-bold text-white uppercase tracking-tighter">Current GPS Verified</p>
              </div>
              <div className="absolute bottom-6 right-6 flex gap-2">
                 <button type="button" className="p-3 bg-white/20 rounded-xl text-white backdrop-blur hover:bg-white/30 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" strokeWidth="3" /></svg>
                 </button>
                 <button type="button" className="p-3 bg-white text-slate-900 rounded-xl shadow-lg hover:bg-slate-100 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2" /></svg>
                 </button>
              </div>
           </div>

           <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4">
              <div className="p-3 bg-amber-100 rounded-xl text-amber-600 h-fit">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2" /></svg>
              </div>
              <div>
                <h4 className="font-bold text-amber-900 text-sm">Verify Details Before Broadcast</h4>
                <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">False reports divert critical resources. Please ensure your description is accurate and life-threatening crises are marked SOS.</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentReport;

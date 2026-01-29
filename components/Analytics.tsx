
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Incident, Resource, IncidentStatus } from '../types';
import { analyzeCrisisPatterns, analyzeSpecificIncident } from '../geminiService';

interface Props {
  incidents: Incident[];
  resources?: Resource[];
}

const Analytics: React.FC<Props> = ({ incidents, resources = [] }) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [globalAnalysis, setGlobalAnalysis] = useState<{ summary?: string, priority?: string, recommendation?: string }>({});
  const [tacticalAnalysis, setTacticalAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tacticalLoading, setTacticalLoading] = useState(false);

  useEffect(() => {
    const fetchGlobal = async () => {
      setLoading(true);
      const result = await analyzeCrisisPatterns(incidents);
      setGlobalAnalysis(result);
      setLoading(false);
    };
    fetchGlobal();
  }, [incidents]);

  useEffect(() => {
    if (selectedIncidentId) {
      const fetchTactical = async () => {
        setTacticalLoading(true);
        const inc = incidents.find(i => i.id === selectedIncidentId);
        if (inc) {
          const result = await analyzeSpecificIncident(inc, resources);
          setTacticalAnalysis(result);
        }
        setTacticalLoading(false);
      };
      fetchTactical();
    } else {
      setTacticalAnalysis(null);
    }
  }, [selectedIncidentId, incidents, resources]);

  const severityData = incidents.reduce((acc: any[], inc) => {
    const existing = acc.find(a => a.name === inc.severity);
    if (existing) existing.count++;
    else acc.push({ name: inc.severity, count: 1 });
    return acc;
  }, []);

  const responseData = incidents
    .filter(i => i.responseTime !== undefined)
    .map(i => ({
      name: i.type,
      time: i.responseTime
    }));

  const activeIncidents = incidents.filter(i => i.status !== IncidentStatus.RESOLVED);
  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Intelligence & Command</h2>
          <p className="text-slate-500 font-medium italic">Synchronized regional crisis intelligence dashboard.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
           <button 
             onClick={() => setSelectedIncidentId(null)}
             className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${!selectedIncidentId ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             Global View
           </button>
           <button 
             disabled={activeIncidents.length === 0}
             onClick={() => activeIncidents.length > 0 && setSelectedIncidentId(activeIncidents[0].id)}
             className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition ${selectedIncidentId ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
           >
             Tactical Focus
           </button>
        </div>
      </header>

      {!selectedIncidentId ? (
        // GLOBAL OVERVIEW VIEW
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <span className="bg-indigo-600 p-2.5 rounded-xl shadow-lg">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" strokeWidth="2.5" /></svg>
                </span>
                ResqNet Operational Briefing
              </h3>
              {loading ? (
                 <div className="space-y-6 animate-pulse">
                   <div className="h-5 bg-white/5 rounded-lg w-full"></div>
                   <div className="h-5 bg-white/5 rounded-lg w-4/5"></div>
                   <div className="grid grid-cols-2 gap-6 mt-10">
                     <div className="h-24 bg-white/5 rounded-3xl"></div>
                     <div className="h-24 bg-white/5 rounded-3xl"></div>
                   </div>
                 </div>
              ) : (
                <div className="space-y-8">
                  <p className="text-slate-300 text-xl leading-relaxed italic border-l-4 border-indigo-500 pl-8 py-4 bg-white/5 rounded-r-3xl">
                    "{globalAnalysis.summary}"
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">High Priority Node</p>
                       <p className="text-2xl font-black tracking-tight">{globalAnalysis.priority}</p>
                     </div>
                     <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">Strategic Recommendation</p>
                       <p className="text-sm font-bold text-slate-100 leading-relaxed">{globalAnalysis.recommendation}</p>
                     </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
               <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mean Response Index</p>
                  <p className="text-5xl font-black text-indigo-600 tracking-tighter">8.4<span className="text-xl ml-1 font-bold text-slate-300">m</span></p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase">
                     <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M12 7l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" /></svg>
                     Optimizing (↑ 15%)
                  </div>
               </div>
               <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resolve Integrity</p>
                  <p className="text-5xl font-black text-slate-900 tracking-tighter">92<span className="text-xl ml-1 font-bold text-slate-300">%</span></p>
                  <div className="mt-6 w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                     <div className="bg-indigo-600 h-full w-[92%] shadow-[0_0_10px_rgba(79,70,229,0.5)]"></div>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
               <h4 className="font-black text-slate-800 mb-10 uppercase text-xs tracking-widest flex items-center justify-between">
                  Logistical Efficiency by Sector
                  <span className="bg-slate-100 px-2 py-1 rounded text-[8px] font-black">MINS</span>
               </h4>
               <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={responseData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: '900' }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="time" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200">
               <h4 className="font-black text-slate-800 mb-10 uppercase text-xs tracking-widest">Severity Distribution Trend</h4>
               <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={severityData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: '900' }} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={5} dot={{ r: 7, fill: '#ef4444', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 9 }} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>
        </div>
      ) : (
        // TACTICAL FOCUS VIEW
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fadeIn">
          {/* Active Incidents Selector */}
          <div className="lg:col-span-1 space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-2">Operational Targets</h3>
             <div className="space-y-2">
                {activeIncidents.map(inc => (
                  <button 
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`w-full p-4 rounded-2xl border transition flex items-center gap-4 group ${
                      selectedIncidentId === inc.id ? 'bg-red-600 border-red-700 text-white shadow-xl shadow-red-100' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      selectedIncidentId === inc.id ? 'bg-white/20' : 'bg-slate-100'
                    }`}>
                      🚨
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-black uppercase tracking-tight truncate">{inc.type}</p>
                      <p className={`text-[9px] font-bold ${selectedIncidentId === inc.id ? 'text-red-200' : 'text-slate-400'}`}>ID: {inc.id.slice(-4)}</p>
                    </div>
                  </button>
                ))}
             </div>
          </div>

          {/* Deep Dive Panel */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                 <div className="flex items-center gap-4">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
                    <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Situation Report (SITREP)</h3>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Focusing on:</p>
                    <p className="text-xs font-black text-red-600 uppercase tracking-tighter">{selectedIncident?.type}</p>
                 </div>
              </div>

              <div className="p-10 space-y-10">
                {tacticalLoading ? (
                   <div className="space-y-8 animate-pulse">
                      <div className="h-6 bg-slate-100 rounded w-full"></div>
                      <div className="h-32 bg-slate-50 rounded-3xl"></div>
                      <div className="grid grid-cols-3 gap-6">
                        <div className="h-20 bg-slate-100 rounded-2xl"></div>
                        <div className="h-20 bg-slate-100 rounded-2xl"></div>
                        <div className="h-20 bg-slate-100 rounded-2xl"></div>
                      </div>
                   </div>
                ) : tacticalAnalysis ? (
                   <>
                    {/* Core Analysis */}
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Situation Brief</label>
                       <p className="text-xl font-bold text-slate-800 leading-relaxed font-mono bg-slate-50 p-6 rounded-3xl border border-slate-100">
                         {tacticalAnalysis.tacticalAnalysis}
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       {/* Risk Projections */}
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                             Risk Evolution Projection
                          </label>
                          <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 text-red-900 text-sm font-bold italic">
                            "{tacticalAnalysis.riskProjection}"
                          </div>
                       </div>

                       {/* Gap Analysis */}
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Detected Resource Gaps</label>
                          <div className="space-y-2">
                             {tacticalAnalysis.resourceGaps.map((gap: string, idx: number) => (
                               <div key={idx} className="bg-indigo-50 p-3 px-5 rounded-2xl border border-indigo-100 text-indigo-900 text-[11px] font-black flex items-center gap-3">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                  {gap.toUpperCase()}
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    {/* Immediate Steps */}
                    <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent"></div>
                       <label className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-6 block relative z-10">Priority Deployment Steps</label>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                          {tacticalAnalysis.immediateSteps.map((step: string, idx: number) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-5 rounded-2xl">
                               <span className="text-emerald-400 font-black text-xs block mb-2">STEP 0{idx+1}</span>
                               <p className="text-sm font-bold leading-tight">{step}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                   </>
                ) : (
                  <div className="p-20 text-center space-y-4 opacity-30">
                     <p className="text-xs font-black uppercase tracking-widest">Tactical Analysis Failed</p>
                     <p className="text-[10px] font-bold">Please check your network connection or API quota.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

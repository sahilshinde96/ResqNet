
import React, { useState } from 'react';
import { User, UserRole, VolunteerEvaluation, VolunteerType } from '../types';

interface Props {
  volunteers: User[];
  evaluations: VolunteerEvaluation[];
  onAddEvaluation: (evaluations: VolunteerEvaluation) => void;
  authority: User;
}

const VolunteerManagement: React.FC<Props> = ({ volunteers, evaluations, onAddEvaluation, authority }) => {
  const [selectedVolunteer, setSelectedVolunteer] = useState<User | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer) return;
    
    setIsSubmitting(true);
    const newEval: VolunteerEvaluation = {
      id: `e-${Date.now()}`,
      volunteerId: selectedVolunteer.id,
      authorityId: authority.id,
      rating,
      comment,
      timestamp: new Date()
    };
    
    setTimeout(() => {
      onAddEvaluation(newEval);
      setIsSubmitting(false);
      setComment('');
      setSelectedVolunteer(null);
    }, 600);
  };

  const getVolunteerEvaluations = (id: string) => {
    return evaluations.filter(e => e.volunteerId === id);
  };

  const getBadgeStyles = (type?: VolunteerType) => {
    switch (type) {
      case VolunteerType.LOCAL: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case VolunteerType.NGO: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case VolunteerType.SOCIAL_WORKER: return 'bg-purple-50 text-purple-700 border-purple-100';
      case VolunteerType.GOVT: return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">Responder Coordination</h2>
        <p className="text-slate-500">Categorize and evaluate volunteers based on affiliation and performance.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volunteer Directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Active Multi-Sector Directory</h3>
               <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{volunteers.length} VERIFIED</span>
             </div>
             <div className="divide-y divide-slate-100">
                {volunteers.map(vol => (
                  <div key={vol.id} className="p-6 hover:bg-slate-50 transition flex flex-col md:flex-row md:items-center gap-6 group">
                    <img src={`https://picsum.photos/seed/${vol.id}/60/60`} className="w-16 h-16 rounded-2xl border-2 border-slate-200 object-cover shadow-sm" alt="Avatar" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900 text-lg">{vol.name}</h4>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-widest ${getBadgeStyles(vol.volunteerType)}`}>
                          {vol.volunteerType}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight mb-2">
                        {vol.organization || 'Independent Responder'}
                      </p>
                      
                      <p className="text-xs text-slate-500 italic line-clamp-1 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                        "{vol.bio || 'Professional volunteer dedicated to community safety.'}"
                      </p>

                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-1">
                           <span className="text-xs font-black text-amber-500">★ {vol.rating || 'N/A'}</span>
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">({getVolunteerEvaluations(vol.id).length} REVIEWS)</span>
                         </div>
                         <div className="h-1 w-1 rounded-full bg-slate-300"></div>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{vol.totalWorks || 0} DEPLOYMENTS</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedVolunteer(vol)}
                      className="px-6 py-2.5 bg-slate-900 text-white font-black text-[10px] rounded-xl hover:bg-indigo-600 transition shadow-lg shadow-slate-100 uppercase tracking-widest whitespace-nowrap"
                    >
                      Log Review
                    </button>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Evaluation Panel */}
        <div className="space-y-4">
          {selectedVolunteer ? (
            <div className="bg-white rounded-3xl border-2 border-indigo-600 shadow-2xl p-8 animate-slideInRight relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Official Performance Audit</h3>
                  <button onClick={() => setSelectedVolunteer(null)} className="text-slate-400 hover:text-red-500 transition">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                   <img src={`https://picsum.photos/seed/${selectedVolunteer.id}/40/40`} className="w-12 h-12 rounded-xl" alt="Avatar" />
                   <div>
                     <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Active Subject</p>
                     <p className="font-black text-slate-800 text-base">{selectedVolunteer.name}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase">{selectedVolunteer.organization}</p>
                   </div>
                </div>

                <form onSubmit={handleSubmitEvaluation} className="space-y-8">
                   <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Competency Rating</label>
                     <div className="flex justify-between">
                       {[1, 2, 3, 4, 5].map(num => (
                         <button 
                           key={num} 
                           type="button" 
                           onClick={() => setRating(num)}
                           className={`w-12 h-12 rounded-2xl font-black transition-all flex items-center justify-center border-2 ${
                             rating === num ? 'bg-amber-400 border-amber-500 text-white shadow-xl scale-110' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-indigo-200'
                           }`}
                         >
                           {num}
                         </button>
                       ))}
                     </div>
                   </div>
                   
                   <div>
                     <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Deployment Log & Remarks</label>
                     <textarea 
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-4 focus:ring-indigo-100 transition outline-none h-32 resize-none"
                       placeholder="Detail current efficiency, role adherence, and community impact..."
                       value={comment}
                       onChange={e => setComment(e.target.value)}
                       required
                     />
                   </div>

                   <button 
                      disabled={isSubmitting}
                      className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
                   >
                     {isSubmitting ? (
                       <span className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></span>
                     ) : (
                       <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          Confirm & Post Review
                       </>
                     )}
                   </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center flex flex-col items-center justify-center h-full min-h-[450px] shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-300 transform rotate-3">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm">Deployment Registry Idle</h4>
              <p className="text-xs text-slate-400 mt-4 px-10 leading-relaxed font-medium">
                Select a verified responder from the directory to log an operational performance audit or update their competency scores.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerManagement;

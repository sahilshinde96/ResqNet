
import React from 'react';
import { User, VolunteerType } from '../types';

interface Props {
  volunteers: User[];
}

const Leaderboard: React.FC<Props> = ({ volunteers }) => {
  // Calculate score: (Rating * 25) + (Total Works * 10)
  const sortedVolunteers = [...volunteers]
    .map(v => ({
      ...v,
      score: Math.round((v.rating || 0) * 25 + (v.totalWorks || 0) * 10)
    }))
    .sort((a, b) => b.score - a.score);

  const topThree = sortedVolunteers.slice(0, 3);
  const others = sortedVolunteers.slice(3);

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
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-12">
      <header className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest border border-amber-200 mb-4 shadow-sm">
           <span className="animate-bounce">🏆</span> Community Hero Rank Board
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Top Crisis Responders</h2>
        <p className="text-slate-500 text-lg font-medium">Recognizing individuals and organizations serving the community.</p>
      </header>

      {/* Podium Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-12 px-4">
        {/* Silver - Rank 2 */}
        {topThree[1] && (
          <div className="order-2 md:order-1 flex flex-col items-center animate-slideUp" style={{ animationDelay: '0.1s' }}>
             <div className="relative mb-4 group">
                <img src={`https://picsum.photos/seed/${topThree[1].id}/120/120`} className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-300 shadow-xl group-hover:scale-105 transition" alt="Rank 2" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-300 rounded-lg flex items-center justify-center font-bold text-slate-600 border-2 border-white shadow-lg">2</div>
             </div>
             <div className="bg-white rounded-t-3xl shadow-lg p-6 w-full text-center border-x border-t border-slate-200 h-36 flex flex-col justify-center">
                <p className="font-black text-slate-800 truncate leading-none mb-1">{topThree[1].name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate px-2 mb-2">
                   {topThree[1].organization || topThree[1].volunteerType}
                </p>
                <p className="text-2xl font-black text-slate-400 tracking-tighter">{topThree[1].score}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Points</p>
             </div>
          </div>
        )}

        {/* Gold - Rank 1 */}
        {topThree[0] && (
          <div className="order-1 md:order-2 flex flex-col items-center animate-slideUp z-10 scale-110">
             <div className="relative mb-6 group">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-5xl animate-bounce">👑</div>
                <img src={`https://picsum.photos/seed/${topThree[0].id}/150/150`} className="w-32 h-32 rounded-3xl object-cover border-4 border-amber-400 shadow-2xl group-hover:scale-105 transition" alt="Rank 1" />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center font-black text-white border-2 border-white shadow-xl ring-4 ring-amber-400/20">1</div>
             </div>
             <div className="bg-white rounded-t-3xl shadow-2xl p-8 w-full text-center border-x border-t border-amber-100 h-48 flex flex-col justify-center">
                <p className="font-black text-slate-900 text-lg truncate leading-none mb-1">{topThree[0].name}</p>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-tighter truncate px-2 mb-3">
                   {topThree[0].organization || topThree[0].volunteerType}
                </p>
                <p className="text-4xl font-black text-amber-500 tracking-tighter">{topThree[0].score}</p>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1 italic font-black">Supreme Responder</p>
             </div>
          </div>
        )}

        {/* Bronze - Rank 3 */}
        {topThree[2] && (
          <div className="order-3 flex flex-col items-center animate-slideUp" style={{ animationDelay: '0.2s' }}>
             <div className="relative mb-4 group">
                <img src={`https://picsum.photos/seed/${topThree[2].id}/120/120`} className="w-24 h-24 rounded-3xl object-cover border-4 border-orange-400 shadow-xl group-hover:scale-105 transition" alt="Rank 3" />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center font-bold text-white border-2 border-white shadow-lg">3</div>
             </div>
             <div className="bg-white rounded-t-3xl shadow-lg p-6 w-full text-center border-x border-t border-slate-200 h-32 flex flex-col justify-center">
                <p className="font-black text-slate-800 truncate leading-none mb-1">{topThree[2].name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate px-2 mb-2">
                   {topThree[2].organization || topThree[2].volunteerType}
                </p>
                <p className="text-2xl font-black text-orange-600 tracking-tighter">{topThree[2].score}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Points</p>
             </div>
          </div>
        )}
      </div>

      {/* Hero Spotlight */}
      {topThree[0] && (
        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -mr-40 -mt-40 blur-3xl"></div>
          <div className="flex-1 text-center md:text-left z-10">
             <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
               <span className="bg-amber-500 text-slate-900 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Featured Hero</span>
               <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest border-l border-white/10 pl-3">Sector 12 Command</span>
             </div>
             <h3 className="text-3xl font-black mb-3 tracking-tight">{topThree[0].name}</h3>
             <p className="text-slate-400 mb-8 leading-relaxed font-medium">
               Affiliated with <span className="text-white font-bold">{topThree[0].organization}</span>, {topThree[0].name} has demonstrated exceptional bravery, coordinating over <span className="text-indigo-400 font-black">{topThree[0].totalWorks} tactical resolves</span> with a perfect rating.
             </p>
             <div className="flex flex-wrap gap-3 justify-center md:justify-start">
               <span className="bg-white/5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Tactical Logistics
               </span>
               <span className="bg-white/5 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Rescue Lead
               </span>
             </div>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center min-w-[180px] z-10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Impact Score</p>
              <p className="text-5xl font-black text-white">{topThree[0].score}</p>
              <div className="mt-4 flex items-center gap-1 text-[9px] font-black text-green-400 uppercase">
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                 +12.5% High
              </div>
          </div>
        </div>
      )}

      {/* Full List Section */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Regional Performance Standings</h3>
           <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">{volunteers.length} ACTIVE OPERATORS</span>
        </div>
        <div className="divide-y divide-slate-100">
          {sortedVolunteers.map((vol, index) => (
            <div key={vol.id} className={`p-8 flex items-center gap-6 hover:bg-slate-50 transition group ${index < 3 ? 'bg-indigo-50/10' : ''}`}>
               <div className="w-8 font-black text-slate-400 text-xl text-center">
                  {index + 1}
               </div>
               <img src={`https://picsum.photos/seed/${vol.id}/50/50`} className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm object-cover" alt="Avatar" />
               <div className="flex-1">
                 <div className="flex items-center gap-3 mb-1">
                   <h4 className="font-black text-slate-800 group-hover:text-indigo-600 transition text-lg leading-none">{vol.name}</h4>
                   <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border tracking-tighter ${getBadgeStyles(vol.volunteerType)}`}>
                     {vol.volunteerType}
                   </span>
                 </div>
                 <div className="flex items-center gap-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight truncate max-w-[150px]">
                      {vol.organization || 'Independent'}
                    </p>
                    <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                    <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">★ {vol.rating}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-200"></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{vol.totalWorks} Resolves</span>
                 </div>
               </div>
               <div className="text-right">
                  <p className="text-3xl font-black text-slate-800 tracking-tighter leading-none">{vol.score}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">PTS</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

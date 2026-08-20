
import React from 'react';
import { User, Language } from '../types';

interface Props {
  user: User;
  alertsCount: number;
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

const Navbar: React.FC<Props> = ({ user, alertsCount, onLogout, language, onLanguageChange, voiceEnabled, onToggleVoice }) => {
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <h1 className="md:hidden text-xl font-black text-red-600">RN</h1>
        <div className="hidden md:block">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Operator</span>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
              user.role === 'authority' ? 'bg-red-600 text-white shadow-sm shadow-red-200' :
              user.role === 'volunteer' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200' :
              'bg-blue-600 text-white'
            }`}>
              {user.role}
            </span>
          </div>
          <p className="font-bold text-slate-800 leading-none mt-0.5">{user.name}</p>
        </div>

      </div>

      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
           <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
           </svg>
           <select 
             value={language}
             onChange={(e) => onLanguageChange(e.target.value as Language)}
             className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer"
           >
             {Object.values(Language).map(lang => (
               <option key={lang} value={lang}>{lang}</option>
             ))}
           </select>
        </div>

        {/* Voice Toggle */}
        <button 
          onClick={onToggleVoice}
          className={`p-2 rounded-xl transition flex items-center gap-2 border ${
            voiceEnabled ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
          }`}
          title="Toggle Voice Navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <span className="text-[10px] font-black uppercase hidden lg:block">{voiceEnabled ? 'Voice Assist On' : 'Voice Off'}</span>
        </button>

        <div className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-full transition group ml-2">
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {alertsCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full ring-2 ring-white">
              {alertsCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 ml-2">
          <button onClick={onLogout} className="text-[10px] text-red-500 font-black uppercase tracking-widest hover:underline">Exit</button>
          <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
             <img src={`https://picsum.photos/seed/${user.id}/40/40`} alt="Avatar" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

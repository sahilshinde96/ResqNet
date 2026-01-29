
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, ChatMessage, Language, Incident, IncidentSeverity } from '../types';
import { getSeverityColor } from '../utils/geo';

interface Props {
  user: User;
  messages: ChatMessage[];
  onSendMessage: (text: string, channelId: string) => void;
  language: Language;
  incidents: Incident[];
}

const CommunityChat: React.FC<Props> = ({ user, messages, onSendMessage, language, incidents }) => {
  const [inputText, setInputText] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('general');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedChannelId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText, selectedChannelId);
    setInputText('');
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const selectedIncident = incidents.find(i => i.id === selectedChannelId);
  const filteredMessages = messages.filter(m => m.channelId === selectedChannelId);

  const getIncidentIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('fire')) return '🔥';
    if (t.includes('flood')) return '🌊';
    if (t.includes('medical')) return '🚑';
    if (t.includes('power')) return '⚡';
    return '🚨';
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] max-w-7xl mx-auto animate-fadeIn bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Channel Sidebar */}
      <div className="w-72 bg-slate-50 border-r border-slate-100 flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-white">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communication Hub</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <button 
            onClick={() => setSelectedChannelId('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition ${
              selectedChannelId === 'general' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'hover:bg-white text-slate-600'
            }`}
          >
            <span className="text-xl">🌍</span>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-tight">Global Hub</p>
              <p className={`text-[9px] font-bold ${selectedChannelId === 'general' ? 'text-indigo-200' : 'text-slate-400'}`}>COMMUNITY FEED</p>
            </div>
          </button>

          <button 
            onClick={() => setSelectedChannelId('ai-assistant')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition group border-2 ${
              selectedChannelId === 'ai-assistant' ? 'bg-violet-600 border-violet-700 text-white shadow-lg shadow-violet-100' : 'bg-white border-violet-100 text-violet-600 hover:bg-violet-50'
            }`}
          >
            <span className="text-xl">🤖</span>
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-tight">AI Rescue Assist</p>
              <p className={`text-[9px] font-bold ${selectedChannelId === 'ai-assistant' ? 'text-violet-200' : 'text-violet-400'}`}>PERSONAL SUPPORT</p>
            </div>
          </button>

          <div className="pt-6 pb-2 px-4">
             <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Emergency Channels</h4>
          </div>

          {activeIncidents.map(inc => (
            <button 
              key={inc.id}
              onClick={() => setSelectedChannelId(inc.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition group ${
                selectedChannelId === inc.id ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'hover:bg-white text-slate-600 border border-transparent hover:border-slate-100'
              }`}
            >
              <span className={`text-xl ${inc.severity === IncidentSeverity.SOS ? 'animate-pulse' : ''}`}>
                {getIncidentIcon(inc.type)}
              </span>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-black uppercase tracking-tight truncate">{inc.type}</p>
                <p className={`text-[9px] font-bold truncate ${selectedChannelId === inc.id ? 'text-red-200' : 'text-slate-400'}`}>
                  {inc.severity.toUpperCase()} • {inc.status}
                </p>
              </div>
            </button>
          ))}

          {activeIncidents.length === 0 && (
            <div className="px-4 py-8 text-center opacity-30">
              <p className="text-[10px] font-bold uppercase italic">No active incident channels</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Situation Header */}
        <div className="p-4 px-8 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${
              selectedChannelId === 'general' ? 'bg-indigo-50 text-indigo-600' : 
              selectedChannelId === 'ai-assistant' ? 'bg-violet-50 text-violet-600' : 'bg-red-50 text-red-600'
            }`}>
              {selectedChannelId === 'general' ? '🌍' : 
               selectedChannelId === 'ai-assistant' ? '🤖' : getIncidentIcon(selectedIncident?.type || '')}
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">
                {selectedChannelId === 'general' ? 'Community General Hub' : 
                 selectedChannelId === 'ai-assistant' ? 'AI Personal Support' : selectedIncident?.type}
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                {selectedChannelId === 'general' ? 'Unified Response Stream' : 
                 selectedChannelId === 'ai-assistant' ? 'Private Victim Assistance' : (
                  <>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] border ${getSeverityColor(selectedIncident?.severity || '')}`}>
                      {selectedIncident?.severity}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span>Situation Room</span>
                  </>
                )}
              </p>
            </div>
          </div>
          
          {selectedChannelId === 'ai-assistant' && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-violet-50 border border-violet-100 rounded-full">
               <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse"></span>
               <span className="text-[9px] font-black text-violet-600 uppercase tracking-widest">Neural Link Encrypted</span>
            </div>
          )}

          {selectedIncident && (
            <div className="hidden lg:block max-w-xs text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Operational Brief</p>
              <p className="text-[10px] text-slate-600 italic line-clamp-2 leading-tight">
                {selectedIncident.description}
              </p>
            </div>
          )}
        </div>

        {/* Messages Stream */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-slate-50/30"
        >
          {filteredMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                 {selectedChannelId === 'ai-assistant' ? '🤖' : (
                   <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                   </svg>
                 )}
              </div>
              <p className="text-xs font-black uppercase tracking-widest">
                {selectedChannelId === 'ai-assistant' ? 'AI Support Ready' : 'Beginning of Conversation'}
              </p>
              <p className="text-[10px] font-bold mt-1">
                {selectedChannelId === 'ai-assistant' ? 'Ask any specific questions about your situation.' : `Start sharing updates for this ${selectedChannelId === 'general' ? 'hub' : 'incident'}.`}
              </p>
            </div>
          )}

          {filteredMessages.map((msg) => {
            const isMe = msg.userId === user.id;
            const isAI = msg.userId === 'ai-bot';
            const isAuthority = msg.role === UserRole.AUTHORITY;
            const isVolunteer = msg.role === UserRole.VOLUNTEER;

            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{msg.userName}</span>
                  {isAuthority && (
                    <span className="bg-red-100 text-red-600 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-tighter border border-red-200">
                      Authority
                    </span>
                  )}
                  {isVolunteer && (
                    <span className="bg-indigo-100 text-indigo-600 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-tighter border border-indigo-200">
                      Volunteer
                    </span>
                  )}
                  {isAI && (
                    <span className="bg-violet-100 text-violet-600 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 uppercase tracking-tighter border border-violet-200">
                      Crisis AI
                    </span>
                  )}
                </div>
                
                <div className={`
                  relative px-5 py-3 rounded-2xl text-sm font-medium shadow-sm max-w-[85%] md:max-w-[70%]
                  ${isMe ? 'bg-indigo-600 text-white rounded-tr-none shadow-indigo-100' : 
                    isAI ? 'bg-violet-600 text-white rounded-tl-none shadow-violet-100' :
                    isAuthority ? 'bg-red-600 text-white rounded-tl-none shadow-red-100' : 
                    'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}
                `}>
                  {msg.text}
                  <div className={`text-[8px] mt-1.5 flex justify-end opacity-60 font-black uppercase tracking-widest`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Section */}
        <div className="p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleSubmit} className="flex items-center gap-4">
            <div className="relative flex-1">
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  selectedChannelId === 'general' ? "Broadcast to the community..." : 
                  selectedChannelId === 'ai-assistant' ? "Ask the Crisis AI for help..." :
                  `Send update for ${selectedIncident?.type}...`
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden md:block">
                   {language} SYNC
                 </span>
              </div>
            </div>
            <button 
              type="submit"
              className={`p-4 rounded-2xl shadow-lg transition transform hover:scale-105 active:scale-95 flex items-center justify-center text-white ${
                selectedChannelId === 'general' ? 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700' : 
                selectedChannelId === 'ai-assistant' ? 'bg-violet-600 shadow-violet-100 hover:bg-violet-700' : 'bg-red-600 shadow-red-100 hover:bg-red-700'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;

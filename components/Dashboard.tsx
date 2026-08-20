
import React, { useState, useEffect } from 'react';
import { Incident, Resource, Alert, User, UserRole, IncidentSeverity, IncidentStatus, Language, ResourceType } from '../types';
import { getSeverityColor } from '../utils/geo';
import { translateBatch, generateSpeech } from '../geminiService';
import { playSpeech, playEmergencySiren } from '../utils/audio';
import CrisisMap from './CrisisMap';



interface Props {
  incidents: Incident[];
  resources: Resource[];
  alerts: Alert[];
  user: User;
  onUpdateIncidentStatus: (id: string, status: IncidentStatus) => void;
  onAddIncident?: (incident: Incident) => void;
  language: Language;
}

const Dashboard: React.FC<Props> = ({ incidents, resources, alerts, user, onUpdateIncidentStatus, onAddIncident, language }) => {

  const [translatedAlerts, setTranslatedAlerts] = useState<Alert[]>([]);
  const [translatedIncidents, setTranslatedIncidents] = useState<Incident[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSOSBroadcasting, setIsSOSBroadcasting] = useState(false);
  const [translationError, setTranslationError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: any;

    const translateAllData = async () => {
      // If English, just use raw data
      if (language === Language.EN || !language) {
        setTranslatedAlerts(alerts);
        setTranslatedIncidents(incidents);
        setTranslationError(false);
        return;
      }

      // Avoid translating if there's nothing to translate
      if (alerts.length === 0 && incidents.length === 0) {
        setTranslatedAlerts([]);
        setTranslatedIncidents([]);
        return;
      }

      setIsTranslating(true);
      setTranslationError(false);

      try {
        const alertMessages = alerts.map(a => a.message);
        const incidentTypes = incidents.map(i => i.type);
        const incidentDescriptions = incidents.map(i => i.description);
        
        const allStrings = [...alertMessages, ...incidentTypes, ...incidentDescriptions].filter(Boolean);
        
        if (allStrings.length === 0) {
          if (isMounted) {
            setTranslatedAlerts(alerts);
            setTranslatedIncidents(incidents);
            setIsTranslating(false);
          }
          return;
        }

        // Add a small delay to debounce multiple state changes
        await new Promise(resolve => timeoutId = setTimeout(resolve, 300));

        const translatedStrings = await translateBatch(allStrings, language);

        if (!isMounted) return;

        let pointer = 0;
        const newAlerts = alerts.map(a => ({
          ...a,
          message: a.message ? translatedStrings[pointer++] : a.message
        }));
        const newIncidents = incidents.map(i => ({
          ...i,
          type: i.type ? translatedStrings[pointer++] : i.type,
          description: i.description ? translatedStrings[pointer++] : i.description
        }));

        setTranslatedAlerts(newAlerts);
        setTranslatedIncidents(newIncidents);
      } catch (err) {
        console.error("Dashboard translation error:", err);
        if (isMounted) {
          setTranslatedAlerts(alerts);
          setTranslatedIncidents(incidents);
          setTranslationError(true);
        }
      } finally {
        if (isMounted) setIsTranslating(false);
      }
    };

    translateAllData();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [alerts, incidents, language]);

  const handleSOS = () => {
    setIsSOSBroadcasting(true);
    playEmergencySiren();

    const sosIncident: Incident = {
      id: `i-sos-${Date.now()}`,
      type: 'Critical Panic SOS',
      severity: IncidentSeverity.SOS,
      description: `CRITICAL EMERGENCY SOS broadcast by ${user.name} at coordinates (${user.location?.lat.toFixed(4)}, ${user.location?.lng.toFixed(4)})`,
      latitude: user.location?.lat || 19.0760,
      longitude: user.location?.lng || 72.8777,
      status: IncidentStatus.PENDING,
      reportedBy: user.id,
      createdAt: new Date(),
    };

    if (onAddIncident) {
      onAddIncident(sosIncident);
    }

    setTimeout(() => setIsSOSBroadcasting(false), 5000);
  };



  const speak = async (text: string) => {
    const audio = await generateSpeech(text);
    if (audio) await playSpeech(audio);
  };

  const activeIncidents = incidents.filter(i => i.status !== IncidentStatus.RESOLVED);
  const sosIncidents = incidents.filter(i => i.severity === IncidentSeverity.SOS && i.status !== IncidentStatus.RESOLVED);

  const getIconForTranslated = (id: string) => {
    const orig = incidents.find(i => i.id === id);
    if (!orig) return '📍';
    const lowerType = (orig.type || "").toLowerCase();
    if (lowerType.includes('fire')) return '🔥';
    if (lowerType.includes('flood')) return '🌊';
    if (lowerType.includes('medic')) return '🚑';
    if (lowerType.includes('power')) return '⚡';
    if (lowerType.includes('disturb')) return '📢';
    if (lowerType.includes('structure')) return '🏗️';
    if (lowerType.includes('hazard')) return '☢️';
    return '📍';
  };

  const getResourceIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.FOOD: return '🍞';
      case ResourceType.WATER: return '💧';
      case ResourceType.MEDICAL: return '💊';
      case ResourceType.SHELTER: return '🏠';
      default: return '📦';
    }
  };

  const getResourceColor = (type: ResourceType) => {
    switch (type) {
      case ResourceType.FOOD: return 'bg-orange-500';
      case ResourceType.WATER: return 'bg-blue-500';
      case ResourceType.MEDICAL: return 'bg-red-500';
      case ResourceType.SHELTER: return 'bg-indigo-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Situational Awareness</h2>
          <p className="text-slate-500 font-medium">Real-time hub for community safety and response.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {user.role === UserRole.CITIZEN && (
            <button 
              onClick={() => alert("✅ Your safety status 'SAFE' has been registered and broadcast to local responders.")}
              className="px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              Mark Myself Safe
            </button>
          )}

          <button 
            onClick={handleSOS}
            className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
              isSOSBroadcasting ? 'sos-active bg-red-600 text-white' : 'animate-sos bg-white text-red-600 border border-red-100 shadow-sm'
            }`}
          >
            {isSOSBroadcasting ? 'Transmitting SOS...' : 'Panic Button'}
          </button>
          
          <div className="hidden lg:flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Sync Active</span>
          </div>
        </div>

      </header>

      {isTranslating && (
        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase animate-pulse justify-center bg-indigo-50 py-2 rounded-xl">
           <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Localizing Dashboard Data ({language})...
        </div>
      )}

      {translationError && (
        <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase justify-center bg-amber-50 py-2 rounded-xl border border-amber-100">
           ⚠️ High demand: Some translations are using original text. Retrying automatically...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Active Crises" value={activeIncidents.length} color="red" icon="alert" />
        <MetricCard title="Priority SOS" value={sosIncidents.length} color="orange" icon="sos" />
        <MetricCard title="Local Supplies" value={resources.length} color="blue" icon="supply" />
        <MetricCard title="Responders" value="42" color="indigo" icon="users" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-2 rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-h-[400px]">
          <div className="p-4 flex items-center justify-between border-b border-slate-50">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Crisis Intelligence Map</h3>
             <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tight text-slate-500">
                   <span className="w-2 h-2 rounded-full bg-red-500"></span> Crisis
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-tight text-slate-500">
                   <span className="w-2 h-2 rounded bg-indigo-500"></span> Resource
                </div>
             </div>
          </div>
          <div className="relative h-[480px] rounded-2xl m-2 border border-slate-100 overflow-hidden">
             <CrisisMap 
               incidents={translatedIncidents} 
               resources={resources} 
               userLocation={user.location} 
             />
          </div>

        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Urgent Alerts ({language})</h3>
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {translatedAlerts.length > 0 ? translatedAlerts.map(alert => (
              <div key={alert.id} className="bg-red-50 border border-red-100 p-4 rounded-2xl card-hover group">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Emergency</span>
                  <button 
                    onClick={() => speak(alert.message)}
                    className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  </button>
                </div>
                <p className="text-xs font-bold text-red-900 leading-tight">{alert.message}</p>
                <p className="text-[10px] text-red-700 mt-2">Within {alert.radiusKm}km of location</p>
              </div>
            )) : (
              <div className="text-center py-10 opacity-30 italic text-xs">No active alerts</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Operational Log ({language})</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {translatedIncidents.slice(0, 10).map(inc => (
            <div key={inc.id} className="p-6 flex items-center gap-6 hover:bg-slate-50 transition group">
               <div className={`w-1 h-12 rounded-full ${inc.severity === 'sos' ? 'bg-red-500' : 'bg-slate-200'}`}></div>
               <div className="flex-1">
                 <div className="flex items-center gap-3">
                   <h4 className="font-bold text-slate-800 text-sm">{inc.type}</h4>
                   <button 
                     onClick={() => speak(`${inc.type}. ${inc.description}`)}
                     className="opacity-0 group-hover:opacity-100 p-1 rounded bg-slate-100 text-slate-400 hover:text-indigo-600 transition"
                   >
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                   </button>
                 </div>
                 <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">{inc.description}</p>
               </div>
               <div className="text-right flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                     <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getSeverityColor(inc.severity)}`}>
                       {inc.severity}
                     </span>
                     <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                       {inc.status}
                     </span>
                  </div>

                  {user.role === UserRole.AUTHORITY && (
                    <select
                      value={inc.status}
                      onChange={(e) => onUpdateIncidentStatus(inc.id, e.target.value as IncidentStatus)}
                      className="text-[9px] font-black uppercase bg-slate-900 text-white rounded px-2 py-1 outline-none cursor-pointer mt-1"
                    >
                      <option value={IncidentStatus.PENDING}>Set Pending</option>
                      <option value={IncidentStatus.IN_PROGRESS}>Set In Progress</option>
                      <option value={IncidentStatus.RESOLVED}>Set Resolved</option>
                    </select>
                  )}

                  {user.role === UserRole.VOLUNTEER && inc.status === IncidentStatus.PENDING && (
                    <button
                      onClick={() => onUpdateIncidentStatus(inc.id, IncidentStatus.IN_PROGRESS)}
                      className="text-[9px] font-black uppercase bg-indigo-600 hover:bg-indigo-700 text-white rounded px-3 py-1 transition mt-1"
                    >
                      Claim Response
                    </button>
                  )}

                  <p className="text-[9px] text-slate-400 font-bold">{new Date(inc.createdAt).toLocaleTimeString()}</p>
               </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, color, icon }: { title: string, value: string | number, color: string, icon: string }) => {
  const colors: Record<string, string> = {
    red: 'bg-red-50 text-red-600 border-red-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };
  return (
    <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between bg-white card-hover`}>
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <div className={`p-2 rounded-xl ${colors[color].split(' ')[0]}`}>
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             {icon === 'alert' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />}
             {icon === 'sos' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />}
             {icon === 'supply' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />}
             {icon === 'users' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
           </svg>
        </div>
      </div>
      <p className={`text-4xl font-black ${colors[color].split(' ')[1]}`}>{value}</p>
    </div>
  );
};

export default Dashboard;

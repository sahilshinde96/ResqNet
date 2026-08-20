/**
 * ResqNet - Main React Application Controller
 * 
 * Manages:
 * 1. Active User Session & Role Switching (Citizen, Volunteer, Authority).
 * 2. Real-time data synchronization with Django REST Backend (http://localhost:8000/api/).
 * 3. Fallback mock data when backend server is starting up.
 * 4. 5km spatial radius alert calculation using Haversine formula.
 * 5. Gemini AI Counselor chat response triggering.
 * 6. Multilingual support and Voice Assistant state.
 */

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole, User, Incident, Resource, Alert, IncidentSeverity, IncidentStatus, ResourceType, VolunteerEvaluation, Language, ChatMessage, VolunteerType } from './types';
import Dashboard from './components/Dashboard';
import IncidentReport from './components/IncidentReport';
import ResourceManager from './components/ResourceManager';
import Analytics from './components/Analytics';
import VolunteerManagement from './components/VolunteerManagement';
import Leaderboard from './components/Leaderboard';
import SafetyInfo from './components/SafetyInfo';
import HelplineNumbers from './components/HelplineNumbers';
import CommunityChat from './components/CommunityChat';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import VoiceAssistant from './components/VoiceAssistant';
import { calculateDistance } from './utils/geo';
import { generateSpeech, getAIChatResponse } from './geminiService';
import { playSpeech } from './utils/audio';
import { 
  getIncidentsAPI, createIncidentAPI, updateIncidentStatusAPI,
  getResourcesAPI, createResourceAPI, updateResourceStatusAPI,
  getMessagesAPI, createMessageAPI,
  getUsersAPI, createEvaluationAPI
} from './api';

// -----------------------------------------------------------------------------
// DEFAULT FALLBACK DATA (Used if Django API is initializing)
// -----------------------------------------------------------------------------
const MOCK_VOLUNTEERS: User[] = [
  { id: 'v1', name: 'Sarah Chen', role: UserRole.VOLUNTEER, rating: 4.8, totalWorks: 12, volunteerType: VolunteerType.NGO, organization: 'Hope Foundation', bio: 'Certified First Aid Responder and Logistics lead.' },
  { id: 'v2', name: 'Marcus Thorne', role: UserRole.VOLUNTEER, rating: 4.2, totalWorks: 8, volunteerType: VolunteerType.LOCAL, organization: 'Sunset Neighborhood Watch', bio: 'Resident of Sector 4. Familiar with local drainage routes.' },
  { id: 'v3', name: 'Elena Rodriguez', role: UserRole.VOLUNTEER, rating: 5.0, totalWorks: 24, volunteerType: VolunteerType.SOCIAL_WORKER, organization: 'Municipal Crisis Team', bio: '10 years experience in community mobilization.' },
  { id: 'v4', name: 'David Kim', role: UserRole.VOLUNTEER, rating: 4.5, totalWorks: 15, volunteerType: VolunteerType.GOVT, organization: 'Civil Defense Reserve', bio: 'Search and rescue specialist.' },
  { id: 'v5', name: 'Priya Sharma', role: UserRole.VOLUNTEER, rating: 4.9, totalWorks: 19, volunteerType: VolunteerType.NGO, organization: 'Red Cross Volunteer', bio: 'Experienced in emergency shelter management.' },
];

const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  role: UserRole.CITIZEN,
  location: { lat: 19.0760, lng: 72.8777 },
  preferredLanguage: Language.EN
};

const MOCK_INCIDENTS: Incident[] = [
  { id: 'i1', type: 'Flooding', severity: IncidentSeverity.HIGH, description: 'Severe waterlogging near BKC junction following heavy monsoon rain.', latitude: 19.0674, longitude: 72.8715, status: IncidentStatus.IN_PROGRESS, reportedBy: 'u2', createdAt: new Date(Date.now() - 3600000), responseTime: 12 },
  { id: 'i2', type: 'Medical Emergency', severity: IncidentSeverity.SOS, description: 'Medical casualty reported near Dadar Station west exit.', latitude: 19.0182, longitude: 72.8433, status: IncidentStatus.PENDING, reportedBy: 'u3', createdAt: new Date(Date.now() - 1800000) },
  { id: 'i3', type: 'Downed Power Line', severity: IncidentSeverity.MEDIUM, description: 'Power line blocking main road near Powai Lake.', latitude: 19.1176, longitude: 72.9060, status: IncidentStatus.PENDING, reportedBy: 'u4', createdAt: new Date(), responseTime: 5 },
];

const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', type: ResourceType.FOOD, quantity: 500, latitude: 19.0178, longitude: 72.8478, updatedBy: 'v1', status: 'available', updatedAt: new Date() },
  { id: 'r2', type: ResourceType.WATER, quantity: 1200, latitude: 19.0596, longitude: 72.8295, updatedBy: 'v2', status: 'low', updatedAt: new Date() },
  { id: 'r3', type: ResourceType.MEDICAL, quantity: 250, latitude: 19.1136, longitude: 72.8697, updatedBy: 'v3', status: 'available', updatedAt: new Date() },
  { id: 'r4', type: ResourceType.SHELTER, quantity: 80, latitude: 19.0657, longitude: 72.8686, updatedBy: 'v1', status: 'available', updatedAt: new Date() },
  { id: 'r5', type: ResourceType.FOOD, quantity: 350, latitude: 18.9220, longitude: 72.8347, updatedBy: 'v2', status: 'available', updatedAt: new Date() },
];


const MOCK_MESSAGES: ChatMessage[] = [
  { id: 'm1', userId: 'a1', userName: 'Chief Miller', role: UserRole.AUTHORITY, text: 'Stay clear of Main St. Rescue teams are operating in that sector.', timestamp: new Date(Date.now() - 1200000), language: Language.EN, channelId: 'general' },
  { id: 'm2', userId: 'v1', userName: 'Sarah Chen', role: UserRole.VOLUNTEER, text: 'I have 20 extra water bottles at the distribution point near the park.', timestamp: new Date(Date.now() - 600000), language: Language.EN, channelId: 'general' },
];

function App() {
  // State variables for active user, incidents, resources, chat messages, and volunteers
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [volunteers, setVolunteers] = useState<User[]>(MOCK_VOLUNTEERS);
  const [evaluations, setEvaluations] = useState<VolunteerEvaluation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // ---------------------------------------------------------------------------
  // DATA FETCHING: LIVE SYNC WITH DJANGO REST API (5s Polling Engine)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [apiIncidents, apiResources, apiMessages, apiUsers] = await Promise.all([
          getIncidentsAPI(),
          getResourcesAPI(),
          getMessagesAPI(),
          getUsersAPI()
        ]);

        if (apiIncidents.length > 0) {
          setIncidents(prev => {
            const hasChanged = prev.length !== apiIncidents.length || 
              prev.some((inc, idx) => inc.id !== apiIncidents[idx]?.id || inc.status !== apiIncidents[idx]?.status);
            return hasChanged ? apiIncidents : prev;
          });
        }
        if (apiResources.length > 0) {
          setResources(prev => {
            const hasChanged = prev.length !== apiResources.length || 
              prev.some((res, idx) => res.id !== apiResources[idx]?.id || res.status !== apiResources[idx]?.status);
            return hasChanged ? apiResources : prev;
          });
        }
        if (apiMessages.length > 0) {
          setMessages(prev => prev.length !== apiMessages.length ? apiMessages : prev);
        }
        if (apiUsers.length > 0) {
          const fetchedVolunteers = apiUsers.filter(u => u.role === UserRole.VOLUNTEER);
          if (fetchedVolunteers.length > 0) setVolunteers(fetchedVolunteers);
        }
      } catch (err) {
        console.warn("Could not sync with Django API on startup, using initial state:", err);
      }
    }

    loadBackendData();
    const syncInterval = setInterval(loadBackendData, 5000);
    return () => clearInterval(syncInterval);
  }, []);



  // ---------------------------------------------------------------------------
  // ALERT ENGINE: CALCULATE 5KM RADIUS EMERGENCY ALERTS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!user?.location) return;
    const newAlerts: Alert[] = incidents
      .filter(inc => inc.status !== IncidentStatus.RESOLVED && (inc.severity === IncidentSeverity.HIGH || inc.severity === IncidentSeverity.SOS))
      .filter(inc => calculateDistance(user.location!.lat, user.location!.lng, inc.latitude, inc.longitude) <= 5)
      .map(inc => ({
        id: `a-${inc.id}`,
        incidentId: inc.id,
        type: 'Nearby Crisis',
        message: `EMERGENCY: ${inc.type} reported within 5km.`,
        radiusKm: 5,
        createdAt: inc.createdAt
      }));
    setAlerts(newAlerts);
  }, [incidents, user]);

  // ---------------------------------------------------------------------------
  // ACTIONS: ADD INCIDENT (Syncs to Django API & triggers optional TTS)
  // ---------------------------------------------------------------------------
  const addIncident = async (incident: Incident) => {
    // 1. Optimistic state update
    setIncidents(prev => [incident, ...prev]);

    // 2. Persist to Django DB
    await createIncidentAPI(incident);

    // 3. Audio synthesis trigger if voice mode active
    if (voiceEnabled) {
      const audio = await generateSpeech(`New ${incident.type} reported. Severity ${incident.severity}.`);
      if (audio) playSpeech(audio);
    }
  };

  // ---------------------------------------------------------------------------
  // ACTIONS: UPDATE INCIDENT STATUS (PENDING -> IN_PROGRESS -> RESOLVED)
  // ---------------------------------------------------------------------------
  const handleUpdateIncidentStatus = async (id: string, newStatus: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc));
    await updateIncidentStatusAPI(id, newStatus);
  };

  // ---------------------------------------------------------------------------
  // ACTIONS: ADD & UPDATE RESOURCES (Syncs to Django API)
  // ---------------------------------------------------------------------------
  const handleAddResource = async (resource: Resource) => {
    setResources(prev => [resource, ...prev]);
    await createResourceAPI(resource);
  };

  const handleUpdateResource = async (updatedRes: Resource) => {
    setResources(prev => prev.map(r => r.id === updatedRes.id ? updatedRes : r));
    await updateResourceStatusAPI(updatedRes.id, updatedRes.status);
  };

  // ---------------------------------------------------------------------------
  // ACTIONS: COMMUNITY CHAT & AI COUNSELOR MESSAGE HANDLING
  // ---------------------------------------------------------------------------
  const handleSendMessage = async (text: string, channelId: string) => {
    if (!user) return;
    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      text,
      timestamp: new Date(),
      language,
      channelId
    };

    setMessages(prev => [...prev, newMessage]);
    await createMessageAPI(newMessage);

    // Handle Gemini AI Channel specifically
    if (channelId === 'ai-assistant') {
      const aiResponseText = await getAIChatResponse(text, messages, incidents, language);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        userId: 'ai-bot',
        userName: 'Crisis Assistant',
        role: UserRole.AUTHORITY,
        text: aiResponseText,
        timestamp: new Date(),
        language,
        channelId: 'ai-assistant'
      };
      setMessages(prev => [...prev, aiMessage]);
      await createMessageAPI(aiMessage);
    }
  };

  // ---------------------------------------------------------------------------
  // ACTIONS: VOLUNTEER EVALUATION BY AUTHORITIES
  // ---------------------------------------------------------------------------
  const handleAddEvaluation = async (evaluation: VolunteerEvaluation) => {
    setEvaluations(prev => [evaluation, ...prev]);
    await createEvaluationAPI(evaluation);
  };

  const logout = () => setUser(null);

  // ---------------------------------------------------------------------------
  // RENDER: LOGIN SCREEN (Role Selector)
  // ---------------------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-slate-100 animate-fadeIn">
          <div className="flex justify-center mb-6 text-red-600">
             <div className="bg-red-50 p-4 rounded-full">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
             </div>
          </div>
          <h1 className="text-3xl font-black text-center text-slate-900 mb-2 tracking-tight">ResqNet</h1>
          <p className="text-slate-500 text-center mb-8 font-medium">Community Crisis Response Platform</p>
          <div className="space-y-3">
            <button onClick={() => setUser({ ...MOCK_USER, role: UserRole.CITIZEN, id: 'u1', name: 'Alex Johnson' })} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg">Login as Citizen</button>
            <button onClick={() => setUser({ ...MOCK_VOLUNTEERS[0], role: UserRole.VOLUNTEER, location: { lat: 34.0522, lng: -118.2437 } })} className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold py-3 px-4 rounded-xl transition">Login as Volunteer</button>
            <button onClick={() => setUser({ ...MOCK_USER, role: UserRole.AUTHORITY, id: 'a1', name: 'Chief Miller', location: { lat: 34.0522, lng: -118.2437 } })} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-red-100">Login as Authority</button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER: MAIN APPLICATION LAYOUT & ROUTING
  // ---------------------------------------------------------------------------
  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-slate-50 relative">
        <Sidebar role={user.role} />
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto custom-scrollbar">
          <Navbar 
            user={user} 
            alertsCount={alerts.length} 
            onLogout={logout} 
            language={language}
            onLanguageChange={setLanguage}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
          />
          <main className="flex-1 p-4 md:p-6 lg:p-10">
            <Routes>
              <Route path="/" element={<Dashboard incidents={incidents} resources={resources} alerts={alerts} user={user} onUpdateIncidentStatus={handleUpdateIncidentStatus} language={language} />} />
              <Route path="/chat" element={<CommunityChat user={user} messages={messages} onSendMessage={handleSendMessage} language={language} incidents={incidents} />} />
              <Route path="/helplines" element={<HelplineNumbers />} />
              <Route path="/report" element={<IncidentReport onReport={addIncident} user={user} language={language} />} />
              <Route path="/resources" element={<ResourceManager resources={resources} onUpdate={handleUpdateResource} onAdd={handleAddResource} user={user} language={language} />} />
              <Route path="/leaderboard" element={user.role !== UserRole.CITIZEN ? <Leaderboard volunteers={volunteers} /> : <Navigate to="/" replace />} />
              <Route path="/volunteers" element={user.role === UserRole.AUTHORITY ? <VolunteerManagement volunteers={volunteers} evaluations={evaluations} onAddEvaluation={handleAddEvaluation} authority={user} /> : <Navigate to="/" replace />} />
              <Route path="/safety" element={<SafetyInfo language={language} />} />
              <Route path="/analytics" element={user.role === UserRole.AUTHORITY ? <Analytics incidents={incidents} /> : <Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </main>
        </div>
        <VoiceAssistant incidents={incidents} resources={resources} language={language} />
      </div>
    </HashRouter>
  );
}

export default App;

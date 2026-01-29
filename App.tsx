
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
import { generateSpeech, translateContent, getAIChatResponse } from './geminiService';
import { playSpeech } from './utils/audio';

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
  location: { lat: 34.0522, lng: -118.2437 },
  preferredLanguage: Language.EN
};

const MOCK_INCIDENTS: Incident[] = [
  { id: 'i1', type: 'Flooding', severity: IncidentSeverity.HIGH, description: 'Main St completely submerged.', latitude: 34.0532, longitude: -118.2447, status: IncidentStatus.IN_PROGRESS, reportedBy: 'u2', createdAt: new Date(Date.now() - 3600000), responseTime: 12 },
  { id: 'i2', type: 'Medical Emergency', severity: IncidentSeverity.SOS, description: 'Injury at central plaza.', latitude: 34.0512, longitude: -118.2427, status: IncidentStatus.PENDING, reportedBy: 'u3', createdAt: new Date(Date.now() - 1800000) },
  { id: 'i3', type: 'Downed Power Line', severity: IncidentSeverity.MEDIUM, description: 'Power line blocking road near school.', latitude: 34.0550, longitude: -118.2400, status: IncidentStatus.PENDING, reportedBy: 'u4', createdAt: new Date(), responseTime: 5 },
];

const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', type: ResourceType.FOOD, quantity: 200, latitude: 34.0500, longitude: -118.2450, updatedBy: 'v1', status: 'available', updatedAt: new Date() },
  { id: 'r2', type: ResourceType.WATER, quantity: 50, latitude: 34.0540, longitude: -118.2430, updatedBy: 'v2', status: 'low', updatedAt: new Date() },
  { id: 'r3', type: ResourceType.MEDICAL, quantity: 15, latitude: 34.0520, longitude: -118.2410, updatedBy: 'v3', status: 'available', updatedAt: new Date() },
];

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 'm1', userId: 'a1', userName: 'Chief Miller', role: UserRole.AUTHORITY, text: 'Stay clear of Main St. Rescue teams are operating in that sector.', timestamp: new Date(Date.now() - 1200000), language: Language.EN, channelId: 'general' },
  { id: 'm2', userId: 'v1', userName: 'Sarah Chen', role: UserRole.VOLUNTEER, text: 'I have 20 extra water bottles at the distribution point near the park.', timestamp: new Date(Date.now() - 600000), language: Language.EN, channelId: 'general' },
  { id: 'm3', userId: 'a1', userName: 'Chief Miller', role: UserRole.AUTHORITY, text: 'Initial assessment: 2-3 feet of water on Main St.', timestamp: new Date(Date.now() - 900000), language: Language.EN, channelId: 'i1' },
];

function App() {
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [resources, setResources] = useState<Resource[]>(MOCK_RESOURCES);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [volunteers, setVolunteers] = useState<User[]>(MOCK_VOLUNTEERS);
  const [evaluations, setEvaluations] = useState<VolunteerEvaluation[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

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

  const addIncident = async (incident: Incident) => {
    setIncidents(prev => [incident, ...prev]);
    if (voiceEnabled) {
      const audio = await generateSpeech(`New ${incident.type} reported. Severity ${incident.severity}.`);
      if (audio) playSpeech(audio);
    }
  };

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

    // Handle AI Channel specifically
    if (channelId === 'ai-assistant') {
      const aiResponseText = await getAIChatResponse(text, messages, incidents, language);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        userId: 'ai-bot',
        userName: 'Crisis Assistant',
        role: UserRole.AUTHORITY, // Using authority styling
        text: aiResponseText,
        timestamp: new Date(),
        language,
        channelId: 'ai-assistant'
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  };

  const logout = () => setUser(null);

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
          <p className="text-slate-500 text-center mb-8 font-medium">Community Crisis Response</p>
          <div className="space-y-3">
            <button onClick={() => setUser({ ...MOCK_USER, role: UserRole.CITIZEN, id: 'u1', name: 'Alex Johnson' })} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg">Login as Citizen</button>
            <button onClick={() => setUser({ ...MOCK_VOLUNTEERS[0], role: UserRole.VOLUNTEER, location: { lat: 34.0522, lng: -118.2437 } })} className="w-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-bold py-3 px-4 rounded-xl transition">Login as Volunteer</button>
            <button onClick={() => setUser({ ...MOCK_USER, role: UserRole.AUTHORITY, id: 'a1', name: 'Chief Miller', location: { lat: 34.0522, lng: -118.2437 } })} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-red-100">Login as Authority</button>
          </div>
        </div>
      </div>
    );
  }

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
              <Route path="/" element={<Dashboard incidents={incidents} resources={resources} alerts={alerts} user={user} onUpdateIncidentStatus={() => {}} language={language} />} />
              <Route path="/chat" element={<CommunityChat user={user} messages={messages} onSendMessage={handleSendMessage} language={language} incidents={incidents} />} />
              <Route path="/helplines" element={<HelplineNumbers />} />
              <Route path="/report" element={<IncidentReport onReport={addIncident} user={user} language={language} />} />
              <Route path="/resources" element={<ResourceManager resources={resources} onUpdate={() => {}} onAdd={() => {}} user={user} language={language} />} />
              <Route path="/volunteers" element={<VolunteerManagement volunteers={volunteers} evaluations={evaluations} onAddEvaluation={() => {}} authority={user} />} />
              <Route path="/leaderboard" element={<Leaderboard volunteers={volunteers} />} />
              <Route path="/safety" element={<SafetyInfo language={language} />} />
              <Route path="/analytics" element={<Analytics incidents={incidents} />} />
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

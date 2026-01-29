
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Incident, Resource, Language } from '../types';
import { decodeBase64, decodeAudioData } from '../utils/audio';

interface Props {
  incidents: Incident[];
  resources: Resource[];
  language: Language;
}

const VoiceAssistant: React.FC<Props> = ({ incidents, resources, language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const toggleAssistant = () => {
    if (isActive) {
      stopSession();
    } else {
      setIsOpen(!isOpen);
    }
  };

  const startSession = async () => {
    setIsActive(true);
    setTranscript([]);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Audio Setup
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are the ResqNet Crisis Assistant. You help users navigate emergencies.
          CURRENT DATA:
          Incidents: ${JSON.stringify(incidents.map(i => ({ type: i.type, severity: i.severity, desc: i.description })))}
          Resources: ${JSON.stringify(resources.map(r => ({ type: r.type, qty: r.quantity, status: r.status })))}
          User Language: ${language}. Respond in this language.
          Be calm, concise, and helpful. Prioritize safety.`
        },
        callbacks: {
          onopen: () => {
            const source = inputContext.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmData = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                pcmData[i] = inputData[i] * 32768;
              }
              const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { data: base64, mimeType: 'audio/pcm;rate=16000' } 
              }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputContext.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              if (msg.serverContent.turnComplete) {
                setTranscript(prev => [...prev, { role: 'user', text }]);
              } else {
                setCurrentTranscription(text);
              }
            }

            if (msg.serverContent?.outputTranscription) {
               // Handle output transcription if needed
            }

            const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64 && audioContextRef.current) {
              const ctx = audioContextRef.current;
              const audioData = decodeBase64(audioBase64);
              const buffer = await decodeAudioData(audioData, ctx, 24000, 1);
              
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Live Audio Error:", err);
      stopSession();
    }
  };

  const stopSession = () => {
    setIsActive(false);
    sessionRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioContextRef.current?.close();
    sourcesRef.current.forEach(s => s.stop());
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <div className="bg-slate-900 text-white w-80 h-96 rounded-3xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-slideUp">
          <div className="p-4 bg-indigo-600 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-white/40'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest">ResqNet Live Assist</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-800/50">
            {transcript.length === 0 && !isActive && (
              <div className="h-full flex flex-col items-center justify-center text-center px-6">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="2"/></svg>
                </div>
                <p className="text-sm font-bold text-slate-300">Ready to talk?</p>
                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest leading-relaxed">Ask about nearby help, report status, or get safety advice in real-time.</p>
              </div>
            )}
            
            {transcript.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <span className="text-[8px] font-black uppercase text-slate-500 mb-1">{m.role}</span>
                <div className={`px-4 py-2 rounded-2xl text-xs max-w-[90%] ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            
            {isActive && currentTranscription && (
              <div className="flex flex-col items-end opacity-60">
                <span className="text-[8px] font-black uppercase text-slate-500 mb-1">hearing...</span>
                <div className="px-4 py-2 rounded-2xl text-xs bg-indigo-600/50 text-white italic">
                  {currentTranscription}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-900 border-t border-white/5">
            {!isActive ? (
              <button 
                onClick={startSession}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl transition uppercase tracking-widest text-xs shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                Start Voice Session
              </button>
            ) : (
              <button 
                onClick={stopSession}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-2xl transition uppercase tracking-widest text-xs shadow-lg shadow-red-900/40 flex items-center justify-center gap-2"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                End Session
              </button>
            )}
          </div>
        </div>
      )}

      <button 
        onClick={toggleAssistant}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 ${
          isActive ? 'bg-red-600 ring-4 ring-red-500/30' : 'bg-slate-900 ring-4 ring-slate-800/30'
        }`}
      >
        {isActive ? (
          <div className="flex gap-1 items-center h-4">
            <div className="w-1 bg-white rounded-full animate-voice-bar-1"></div>
            <div className="w-1 bg-white rounded-full animate-voice-bar-2"></div>
            <div className="w-1 bg-white rounded-full animate-voice-bar-3"></div>
          </div>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="2" strokeLinecap="round"/></svg>
        )}
      </button>

      <style>{`
        @keyframes voice-bar { 0% { height: 4px; } 50% { height: 16px; } 100% { height: 4px; } }
        .animate-voice-bar-1 { animation: voice-bar 0.6s ease-in-out infinite; }
        .animate-voice-bar-2 { animation: voice-bar 0.6s ease-in-out infinite 0.2s; }
        .animate-voice-bar-3 { animation: voice-bar 0.6s ease-in-out infinite 0.4s; }
      `}</style>
    </div>
  );
};

export default VoiceAssistant;

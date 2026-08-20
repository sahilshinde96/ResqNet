/**
 * ResqNet Interactive Crisis Map Component
 * 
 * Built with Leaflet.js and OpenStreetMap tiles.
 * Displays:
 * 1. OpenStreetMap interactive tile layer.
 * 2. Real-time emergency crisis markers (Floods, Fires, SOS, Medical).
 * 3. Community supply distribution markers (Food, Water, Medical, Shelter).
 * 4. User location marker with 5km emergency alert radius circle.
 */

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Incident, Resource, IncidentSeverity, ResourceType } from '../types';

interface CrisisMapProps {
  incidents: Incident[];
  resources: Resource[];
  userLocation?: { lat: number; lng: number };
  onSelectIncident?: (incident: Incident) => void;
}

// -----------------------------------------------------------------------------
// CUSTOM LEAFLET MARKER ICONS
// -----------------------------------------------------------------------------
const createCustomIcon = (emoji: string, bgColor: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2px solid white;
        transition: transform 0.2s ease;
      ">
        ${emoji}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Helper for crisis marker icons based on severity and type
const getIncidentIcon = (incident: Incident) => {
  const type = incident.type.toLowerCase();
  let emoji = '🚨';
  if (type.includes('fire')) emoji = '🔥';
  else if (type.includes('flood')) emoji = '🌊';
  else if (type.includes('medic')) emoji = '🚑';
  else if (type.includes('power')) emoji = '⚡';

  let color = '#3b82f6'; // blue
  if (incident.severity === IncidentSeverity.SOS) color = '#ef4444'; // red
  else if (incident.severity === IncidentSeverity.HIGH) color = '#f97316'; // orange
  else if (incident.severity === IncidentSeverity.MEDIUM) color = '#eab308'; // yellow

  return createCustomIcon(emoji, color);
};

// Helper for resource marker icons
const getResourceIcon = (resource: Resource) => {
  let emoji = '📦';
  let color = '#6366f1';
  switch (resource.type) {
    case ResourceType.FOOD: emoji = '🍞'; color = '#f97316'; break;
    case ResourceType.WATER: emoji = '💧'; color = '#3b82f6'; break;
    case ResourceType.MEDICAL: emoji = '💊'; color = '#ef4444'; break;
    case ResourceType.SHELTER: emoji = '🏠'; color = '#8b5cf6'; break;
  }
  return createCustomIcon(emoji, color);
};

const CrisisMap: React.FC<CrisisMapProps> = ({ incidents, resources, userLocation, onSelectIncident }) => {
  // Default center coordinates (Mumbai, India)
  const centerLat = userLocation?.lat || 19.0760;
  const centerLng = userLocation?.lng || 72.8777;


  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-xl border border-slate-200">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      >
        {/* OpenStreetMap Standard Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Radar Marker & 5km Radius Circle */}
        {userLocation && (
          <>
            <Marker 
              position={[userLocation.lat, userLocation.lng]} 
              icon={createCustomIcon('📍', '#1e293b')}
            >
              <Popup>
                <div className="p-1 text-center font-sans">
                  <p className="text-xs font-black text-slate-800 uppercase">Your Verified Location</p>
                  <p className="text-[10px] text-slate-500">Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}</p>
                </div>
              </Popup>
            </Marker>
            
            {/* 5km Spatial Emergency Alert Radius */}
            <Circle 
              center={[userLocation.lat, userLocation.lng]} 
              radius={5000} // 5000 meters = 5km
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.08,
                dashArray: '6, 6'
              }} 
            />
          </>
        )}

        {/* Emergency Crisis Markers */}
        {incidents.map(inc => (
          <Marker 
            key={inc.id} 
            position={[inc.latitude, inc.longitude]} 
            icon={getIncidentIcon(inc)}
            eventHandlers={{
              click: () => onSelectIncident && onSelectIncident(inc)
            }}
          >
            <Popup>
              <div className="p-2 max-w-xs font-sans">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-white ${
                    inc.severity === IncidentSeverity.SOS ? 'bg-red-600' :
                    inc.severity === IncidentSeverity.HIGH ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}>
                    {inc.severity}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{inc.type}</span>
                </div>
                <p className="text-xs text-slate-600 mb-2 font-medium">{inc.description}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t pt-1">
                  <span>Status: <strong className="text-slate-700 capitalize">{inc.status}</strong></span>
                  <span>{new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Resource Distribution Markers */}
        {resources.map(res => (
          <Marker 
            key={res.id} 
            position={[res.latitude, res.longitude]} 
            icon={getResourceIcon(res)}
          >
            <Popup>
              <div className="p-2 max-w-xs font-sans">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-100 text-indigo-700 border border-indigo-200">
                    Supply
                  </span>
                  <span className="text-xs font-bold text-slate-800 capitalize">{res.type} Inventory</span>
                </div>
                <p className="text-xs text-slate-600 mb-1 font-bold">Quantity: {res.quantity} units</p>
                <p className="text-[10px] text-slate-400 font-bold">Stock Status: <strong className="text-slate-700 capitalize">{res.status}</strong></p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl z-[1000] max-w-[210px] text-slate-700">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Live Map Legend</p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-bold">
           <div className="flex items-center gap-1"><span className="text-xs">🔥</span> <span>Fire</span></div>
           <div className="flex items-center gap-1"><span className="text-xs">🌊</span> <span>Flood</span></div>
           <div className="flex items-center gap-1"><span className="text-xs">🚑</span> <span>Medical SOS</span></div>
           <div className="flex items-center gap-1"><span className="text-xs">🍞</span> <span>Food Supply</span></div>
           <div className="flex items-center gap-1"><span className="text-xs">💧</span> <span>Water Supply</span></div>
           <div className="flex items-center gap-1"><span className="text-xs">🏠</span> <span>Shelter</span></div>
        </div>
      </div>
    </div>
  );
};

export default CrisisMap;


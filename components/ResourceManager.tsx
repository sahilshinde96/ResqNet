
import React, { useState } from 'react';
import { Resource, ResourceType, User, UserRole, Language } from '../types';

interface Props {
  resources: Resource[];
  onUpdate: (resource: Resource) => void;
  onAdd: (resource: Resource) => void;
  user: User;
  language: Language;
}

const ResourceManager: React.FC<Props> = ({ resources, onUpdate, onAdd, user, language }) => {
  const [filter, setFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New Resource Form State
  const [newType, setNewType] = useState<ResourceType>(ResourceType.FOOD);
  const [newQuantity, setNewQuantity] = useState(0);

  const filteredResources = filter === 'all' 
    ? resources 
    : resources.filter(r => r.type === filter);

  const handleStatusChange = (r: Resource, newStatus: Resource['status']) => {
    onUpdate({ ...r, status: newStatus, updatedAt: new Date() });
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    const resource: Resource = {
      id: `r-${Date.now()}`,
      type: newType,
      quantity: newQuantity,
      latitude: user.location?.lat || 34.05,
      longitude: user.location?.lng || -118.24,
      updatedBy: user.id,
      status: 'available',
      updatedAt: new Date()
    };
    onAdd(resource);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Resource Registry</h2>
          <p className="text-slate-500">Community inventory for emergency distribution.</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          {['all', 'food', 'water', 'medical', 'shelter'].map(t => (
            <button 
              key={t} 
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition ${filter === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-indigo-100 animate-slideDown">
           <h3 className="font-bold text-slate-800 mb-4">Register/Offer Community Resource</h3>
           <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</label>
                <select 
                  value={newType} 
                  onChange={e => setNewType(e.target.value as ResourceType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={ResourceType.FOOD}>Food</option>
                  <option value={ResourceType.WATER}>Water</option>
                  <option value={ResourceType.MEDICAL}>Medical Supply</option>
                  <option value={ResourceType.SHELTER}>Shelter / Space</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quantity</label>
                <input 
                  type="number" 
                  value={newQuantity}
                  onChange={e => setNewQuantity(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700 transition">REGISTER</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-slate-400 hover:text-slate-600 font-bold">CANCEL</button>
              </div>
           </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredResources.map(r => (
          <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:shadow-md transition group">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-indigo-50 p-3 rounded-2xl group-hover:scale-110 transition duration-300">
                 <ResourceIcon type={r.type} />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                r.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' : 
                r.status === 'low' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {r.status}
              </span>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-800 capitalize">{r.type} Supply</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">LAST SYNC: {r.updatedAt.toLocaleTimeString()}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-6 border border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase">INVENTORY</span>
              <span className="text-2xl font-black text-slate-800">{r.quantity} {r.type === 'water' ? 'L' : 'U'}</span>
            </div>

            {user.role !== UserRole.CITIZEN ? (
              <div className="mt-auto pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                <button 
                   onClick={() => handleStatusChange(r, 'available')}
                   className="text-[9px] font-black py-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition border border-green-200 uppercase"
                >
                  FULL
                </button>
                <button 
                   onClick={() => handleStatusChange(r, 'low')}
                   className="text-[9px] font-black py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition border border-amber-200 uppercase"
                >
                  LOW
                </button>
                <button 
                   onClick={() => handleStatusChange(r, 'unavailable')}
                   className="text-[9px] font-black py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition border border-red-200 uppercase"
                >
                  OUT
                </button>
              </div>
            ) : (
              <button className="mt-auto w-full bg-slate-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-slate-900 transition">
                REQUEST ACCESS
              </button>
            )}
          </div>
        ))}

        {/* Both Citizens and Volunteers can add resources as per workflow */}
        <div 
          onClick={() => setShowAddForm(true)}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition group min-h-[300px]"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition">
             <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
             </svg>
          </div>
          <p className="font-black text-[10px] uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">Offer New Supply</p>
          <p className="text-[10px] text-slate-400 text-center px-4">Help your neighbors by sharing surplus resources in real-time.</p>
        </div>
      </div>
    </div>
  );
};

const ResourceIcon = ({ type }: { type: ResourceType }) => {
  switch (type) {
    case ResourceType.FOOD: return (
      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
    case ResourceType.WATER: return (
       <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
    case ResourceType.MEDICAL: return (
       <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    );
    case ResourceType.SHELTER: return (
       <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
    default: return null;
  }
};

export default ResourceManager;

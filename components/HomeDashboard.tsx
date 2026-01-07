
import React from 'react';
import { User, Venue } from '../types';
import { APP_THEME } from '../constants';

interface HomeDashboardProps {
  user: User;
  venues: Venue[];
  onNavigate: (tab: string) => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({ user, venues, onNavigate }) => {
  return (
    <div className="h-full overflow-y-auto px-6 pt-10 pb-28 bg-gradient-to-b from-black/80 to-[#0a0a0a]/90 backdrop-blur-xl">
      <div className="flex flex-col items-center mb-10 text-center">
        <div className="w-20 h-20 rounded-full border-2 border-[#bf00ff] p-1 mb-4 shadow-[0_0_20px_rgba(191,0,255,0.4)] relative">
           <img src={user.avatarUrl} className="w-full h-full rounded-full object-cover grayscale" alt="avatar" />
           <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] ${user.locationSharing ? 'bg-[#39ff14]' : 'bg-[#bf00ff]'}`}>
             {user.locationSharing ? '🔓' : '🔒'}
           </div>
        </div>
        <h1 className="text-2xl brand-font neon-purple uppercase tracking-[0.2em]">{user.displayName}</h1>
        <div className="flex items-center gap-2 mt-2">
           <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Trust Rating:</span>
           <div className="w-24 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
             <div className="h-full bg-[#bf00ff] shadow-[0_0_8px_#bf00ff]" style={{ width: `${user.trustScore}%` }}></div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#111]/80 border border-white/5 p-4 rounded-2xl">
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">FuX Balance</p>
          <p className="text-xl font-mono neon-gold font-bold">{user.fuXBalance}</p>
        </div>
        <div className="bg-[#111]/80 border border-white/5 p-4 rounded-2xl">
          <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1">Stealth Mode</p>
          <p className={`text-xs font-bold uppercase tracking-widest ${user.locationSharing ? 'text-gray-500' : 'neon-purple'}`}>
            {user.locationSharing ? 'Deactivated' : 'Active'}
          </p>
        </div>
      </div>

      <section className="mb-8">
        <h3 className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mb-4 flex items-center gap-2">
          <span className="w-4 h-[1px] bg-gray-800"></span>
          Nearby Nodes
        </h3>
        <div className="space-y-3">
          {venues.slice(0, 2).map(v => (
            <div key={v.id} className="bg-[#111]/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-[#1a1a1a] transition-colors cursor-pointer" onClick={() => onNavigate('map')}>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">{v.name}</p>
                <p className="text-[9px] text-gray-500 mt-0.5">Tier {v.tier} Discovery Area</p>
              </div>
              <span className="text-lg">📍</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em] mb-4 flex items-center gap-2">
          <span className="w-4 h-[1px] bg-gray-800"></span>
          Quick Link
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'slots', label: 'Spins', icon: '🎰' },
            { id: 'ai', label: 'Oracle', icon: '👺' },
            { id: 'nfc', label: 'Scan', icon: '📡' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center p-4 bg-[#bf00ff]/5 border border-[#bf00ff]/20 rounded-2xl hover:bg-[#bf00ff]/10 transition-all active:scale-95"
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-[8px] uppercase font-bold text-gray-300 tracking-tighter">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="p-4 bg-yellow-900/10 border border-yellow-900/20 rounded-2xl">
         <p className="text-[10px] text-yellow-600 font-serif italic text-center">
           "The city whispers in binary code, follow the flicker to find the truth."
         </p>
      </div>
    </div>
  );
};

export default HomeDashboard;

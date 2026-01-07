
import React, { useState } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { DISCOVER_USERS, APP_THEME } from '../constants';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [view, setView] = useState<'stats' | 'friends' | 'edit'>('stats');
  const [editName, setEditName] = useState(user.displayName);

  const handleSaveProfile = () => {
    const updated = apiService.updateProfile(editName, user.avatarUrl);
    onUpdate(updated);
    setView('stats');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = apiService.updateProfile(user.displayName, reader.result as string);
        onUpdate(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAcceptFriend = (id: string) => {
    const updated = apiService.acceptFriend(id);
    onUpdate(updated);
  };

  const handleRequestFriend = (id: string) => {
    const updated = apiService.sendRequest(id);
    onUpdate(updated);
  };

  // Define stats with associated labels, values, and visual styles (using theme colors)
  const stats = [
    { 
      label: 'Trust Score', 
      value: `${user.trustScore}%`, 
      color: APP_THEME.purple,
      className: 'neon-purple'
    },
    { 
      label: 'Wallet', 
      value: `${user.fuXBalance} FuX`, 
      color: APP_THEME.gold,
      className: 'neon-gold'
    },
    { 
      label: 'Total Earned', 
      value: `${user.totalFuXEarned} FuX`, 
      color: '#888',
      className: 'text-gray-400'
    },
    { 
      label: 'Venues Visited', 
      value: `${user.totalVenuesVisited}`, 
      color: APP_THEME.green,
      className: 'neon-green'
    },
    { 
      label: 'Crew Size', 
      value: `${user.friends.length}`, 
      color: '#3b82f6',
      className: 'text-blue-400' 
    },
    { 
      label: 'Stealth', 
      value: user.locationSharing ? 'OFF' : 'ON', 
      color: user.locationSharing ? '#444' : APP_THEME.purple,
      className: user.locationSharing ? 'text-gray-600' : 'neon-purple animate-pulse'
    },
  ];

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto pb-24">
      {/* Header Section */}
      <div className="flex flex-col items-center mb-6 relative">
        <div className="w-24 h-24 rounded-full border-2 border-[#bf00ff] p-1 bg-[#0a0a0a] overflow-hidden mb-4 group relative shadow-[0_0_15px_rgba(191,0,255,0.3)]">
          <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover grayscale opacity-80" />
          <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Modify</span>
            <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
          </label>
        </div>
        <h2 className="text-2xl brand-font neon-purple uppercase tracking-wider">{user.displayName}</h2>
        <p className="text-[10px] text-gray-600 font-mono tracking-tighter mt-1 opacity-70">UID: {user.id}</p>
      </div>

      {/* View Selector Tabs */}
      <div className="flex border-b border-[#222] mb-6">
        {(['stats', 'friends', 'edit'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setView(t)}
            className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-[0.2em] border-b-2 transition-all duration-300 ${
              view === t ? 'border-[#bf00ff] neon-purple' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1">
        {view === 'stats' && (
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className="bg-[#0f0f0f] border border-[#1a1a1a] p-4 rounded-xl shadow-inner relative overflow-hidden group hover:border-gray-800 transition-colors"
              >
                {/* Visual Flair: subtle corner accent */}
                <div 
                  className="absolute top-0 right-0 w-8 h-8 opacity-10 pointer-events-none" 
                  style={{ background: `radial-gradient(circle at top right, ${stat.color}, transparent 70%)` }}
                />
                
                <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1.5 opacity-60">
                  {stat.label}
                </p>
                <p className={`text-base font-bold font-mono tracking-tight ${stat.className}`}>
                  {stat.value}
                </p>
              </div>
            ))}
            
            {/* Identity Patch - Full Width Stat */}
            <div className="col-span-2 bg-[#0f0f0f] border border-[#1a1a1a] p-4 rounded-xl mt-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5 pointer-events-none">
                <div className="w-full h-full bg-[#bf00ff] blur-3xl rounded-full" />
              </div>
              <h3 className="text-[9px] neon-purple uppercase font-bold tracking-[0.2em] mb-4">
                Active Identity Patch
              </h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-black border border-dashed border-[#bf00ff]/30 flex items-center justify-center text-3xl rounded-lg shadow-lg">
                  🛡️
                </div>
                <div>
                  <p className="text-[11px] text-gray-300 font-bold uppercase tracking-widest">Safety Core v2.1-X</p>
                  <p className="text-[9px] text-gray-600 font-mono mt-1 select-all">SIG-PATH: {user.ownPatchId}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'friends' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {user.pendingRequests.length > 0 && (
              <div>
                <h4 className="text-[10px] text-yellow-500 uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
                  Incoming Connections
                </h4>
                <div className="space-y-2">
                  {user.pendingRequests.map(id => {
                    const u = DISCOVER_USERS.find(du => du.id === id);
                    return (
                      <div key={id} className="flex items-center justify-between bg-yellow-900/5 border border-yellow-900/30 p-3 rounded-xl backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <img src={u?.avatarUrl} className="w-10 h-10 rounded-full border border-yellow-600/50 object-cover" />
                          <span className="text-sm font-bold tracking-wide">{u?.displayName}</span>
                        </div>
                        <button 
                          onClick={() => handleAcceptFriend(id)} 
                          className="text-[10px] bg-yellow-600 text-black px-4 py-1.5 rounded-lg font-bold uppercase tracking-widest hover:bg-yellow-500 active:scale-95 transition-all"
                        >
                          Accept
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-[10px] text-blue-500 uppercase font-bold tracking-widest mb-3">Your Crew</h4>
              {user.friends.length === 0 ? (
                <div className="py-8 text-center bg-[#0f0f0f] rounded-xl border border-dashed border-gray-800">
                   <p className="text-xs text-gray-600 italic">No connections detected in the vicinity.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {user.friends.map(id => {
                    const u = DISCOVER_USERS.find(du => du.id === id) || { displayName: 'Ghost Unit', avatarUrl: 'https://i.pravatar.cc/150?u=ghost' };
                    return (
                      <div key={id} className="flex items-center gap-3 bg-[#0f0f0f] p-3 rounded-xl border border-[#1a1a1a] hover:border-gray-800 transition-colors">
                        <img src={u.avatarUrl} className="w-10 h-10 rounded-full object-cover border border-gray-800" />
                        <span className="text-sm font-mono tracking-tight">{u.displayName}</span>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-[8px] text-green-500/50 font-bold uppercase tracking-tighter">Live</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-[#222]">
              <h4 className="text-[10px] neon-purple uppercase font-bold tracking-widest mb-3">Discover Connections</h4>
              <div className="space-y-2">
                {apiService.getDiscoverUsers().map(u => (
                  <div key={u.id} className="flex items-center justify-between bg-[#0f0f0f] p-3 rounded-xl border border-[#1a1a1a] hover:border-[#bf00ff]/30 transition-all">
                    <div className="flex items-center gap-3">
                      <img src={u.avatarUrl} className="w-10 h-10 rounded-full border border-gray-800 object-cover" />
                      <span className="text-sm font-mono">{u.displayName}</span>
                    </div>
                    <button 
                      onClick={() => handleRequestFriend(u.id)} 
                      className="text-[10px] border border-[#bf00ff]/50 neon-purple px-4 py-1.5 rounded-lg uppercase font-bold tracking-widest hover:bg-[#bf00ff]/10 transition-colors"
                    >
                      Sync
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'edit' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div>
              <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-2 block ml-1">Identity Alias</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-[#0f0f0f] border border-[#222] p-4 rounded-xl text-sm text-white focus:outline-none focus:border-[#bf00ff] focus:ring-1 focus:ring-[#bf00ff]/50 transition-all font-mono"
                placeholder="Enter new tag..."
              />
            </div>
            
            <div className="p-4 bg-purple-900/5 border border-purple-900/20 rounded-xl">
               <p className="text-[10px] text-gray-500 italic leading-relaxed">
                 Changes to your identity are broadcasted immediately to your crew via the secure JNdX channel. 
                 Ensure your alias is consistent with the lore.
               </p>
            </div>

            <button 
              onClick={handleSaveProfile}
              className="w-full py-4 bg-[#bf00ff] rounded-xl font-bold uppercase tracking-[0.2em] text-white shadow-[0_10px_20px_rgba(191,0,255,0.2)] hover:shadow-[0_10px_25px_rgba(191,0,255,0.4)] active:scale-95 transition-all"
            >
              Commit Core Updates
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

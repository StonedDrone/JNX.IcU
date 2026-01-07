
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import MapScreen from './components/MapScreen';
import SlotMachine from './components/SlotMachine';
import NFCScanner from './components/NFCScanner';
import Profile from './components/Profile';
import LoreJournal from './components/LoreJournal';
import AICenter from './components/AICenter';
import HomeDashboard from './components/HomeDashboard';
import { apiService } from './services/apiService';
import { User, Venue, NFCScanResponse, LoreEntry } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [user, setUser] = useState<User | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [lore, setLore] = useState<LoreEntry[]>([]);
  const [lastScanResult, setLastScanResult] = useState<NFCScanResponse | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    setUser(apiService.getUser());
    setVenues(apiService.getVenues());
    setLore(apiService.getLore());
  }, []);

  const handleBalanceUpdate = (newBalance: number) => {
    setUser(apiService.getUser());
    setLore(apiService.getLore());
  };

  const handleScanResult = (result: NFCScanResponse) => {
    setLastScanResult(result);
    setShowNotification(true);
    setUser(apiService.getUser());
    setLore(apiService.getLore());
    setTimeout(() => setShowNotification(false), 5000);
  };

  const toggleStealth = () => {
    apiService.toggleLocation();
    setUser(apiService.getUser());
    setLore(apiService.getLore());
  };

  const handleVenuePrompt = (venue: Venue) => setActiveTab('nfc');
  const handleProfileUpdate = (updatedUser: User) => setUser(updatedUser);
  const handleLoreUpdate = (updatedLore: LoreEntry[]) => setLore(updatedLore);

  if (!user) return <div className="h-screen bg-[#0a0a0a] flex items-center justify-center neon-purple animate-pulse font-mono uppercase tracking-[0.2em]">Synchronizing Neural Deck...</div>;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-black text-[#e0e0e0] font-sans">
      {/* Persistent Map Layer */}
      <div className="fixed inset-0 z-0">
        <MapScreen venues={venues} user={user} onScanPrompt={handleVenuePrompt} />
      </div>

      {/* Global Header */}
      <header className="relative z-[1001] bg-black/60 backdrop-blur-md border-b border-white/5 px-4 py-3 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-2">
           <span className="brand-font text-[10px] neon-purple font-bold tracking-[0.3em]">JNdX.icU</span>
           <div className="h-3 w-[1px] bg-white/10 mx-1"></div>
           <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
             <span className="text-[9px] neon-gold font-bold font-mono">{user.fuXBalance}</span>
             <span className="text-[7px] text-gray-500 uppercase font-bold tracking-tighter">FuX</span>
           </div>
        </div>

        <button 
          onClick={toggleStealth}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-700 ${
            user.locationSharing 
              ? 'border-[#39ff14]/30 bg-[#39ff14]/5 text-[#39ff14]' 
              : 'border-[#bf00ff]/30 bg-[#bf00ff]/5 text-[#bf00ff]'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${user.locationSharing ? 'bg-[#39ff14] shadow-[0_0_8px_#39ff14]' : 'bg-[#bf00ff] shadow-[0_0_8px_#bf00ff]'}`}></div>
          <span className="text-[8px] font-bold uppercase tracking-[0.15em]">
            {user.locationSharing ? 'Broadcast' : 'Ghosted'}
          </span>
          <span className="text-[8px] opacity-40 group-hover:opacity-100 transition-opacity">
            {user.locationSharing ? '🔓' : '🔒'}
          </span>
        </button>
      </header>

      {/* Notifications */}
      <div className={`fixed top-16 left-4 right-4 z-[9999] transition-all duration-500 transform ${showNotification ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
        {lastScanResult && (
          <div className="bg-[#111]/90 backdrop-blur-xl border border-[#bf00ff]/40 p-4 flex items-center gap-4 shadow-2xl rounded-2xl">
            <div className="text-3xl filter drop-shadow-[0_0_5px_rgba(191,0,255,0.5)]">
              {lastScanResult.type === 'VENUE' ? '🏢' : lastScanResult.type === 'PATCH' ? '🛡️' : lastScanResult.type === 'CURSE' ? '💀' : '🎁'}
            </div>
            <div className="flex-1">
              <p className="font-bold text-[9px] neon-purple uppercase tracking-[0.2em]">{lastScanResult.type} Detected</p>
              <p className="text-xs text-gray-300 font-mono leading-tight mt-0.5">{lastScanResult.message}</p>
              {lastScanResult.loreUnlocked && (
                <div className="flex items-center gap-1 mt-1.5">
                  <span className="text-[8px] neon-green font-bold uppercase animate-pulse">Neural Fragment Decrypted</span>
                </div>
              )}
            </div>
            <button onClick={() => setShowNotification(false)} className="text-gray-600 hover:text-white transition-colors p-2">×</button>
          </div>
        )}
      </div>

      {/* Main Overlay Container */}
      <main className="flex-1 relative z-10 pointer-events-none">
        <div className={`absolute inset-0 transition-opacity duration-500 pointer-events-auto ${activeTab === 'map' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {activeTab === 'home' && <HomeDashboard user={user} venues={venues} onNavigate={setActiveTab} />}
          {activeTab === 'slots' && <div className="h-full bg-black/60 backdrop-blur-md overflow-hidden"><SlotMachine onBalanceUpdate={handleBalanceUpdate} /></div>}
          {activeTab === 'lore' && <div className="h-full bg-black/60 backdrop-blur-md overflow-hidden"><LoreJournal lore={lore} onUpdate={handleLoreUpdate} /></div>}
          {activeTab === 'nfc' && <div className="h-full bg-black/60 backdrop-blur-md overflow-hidden"><NFCScanner onScanResult={handleScanResult} /></div>}
          {activeTab === 'profile' && <div className="h-full bg-black/60 backdrop-blur-md overflow-hidden"><Profile user={user} onUpdate={handleProfileUpdate} /></div>}
          {activeTab === 'ai' && <div className="h-full bg-black/60 backdrop-blur-md overflow-hidden"><AICenter /></div>}
        </div>
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;

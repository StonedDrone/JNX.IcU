
import React from 'react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'map', icon: '📍', label: 'Hunt' },
    { id: 'slots', icon: '🎰', label: 'Spins' },
    { id: 'home', icon: '⛩️', label: 'Nexus' }, // Central Home hub
    { id: 'ai', icon: '👺', label: 'Oracle' },
    { id: 'profile', icon: '👤', label: 'Dex' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/5 flex justify-around items-center h-22 pb-6 z-[2000] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center justify-center transition-all duration-300 w-16 h-16 rounded-2xl ${
            activeTab === tab.id 
            ? 'bg-[#bf00ff]/10 scale-110 shadow-[0_0_15px_rgba(191,0,255,0.15)]' 
            : 'opacity-50 hover:opacity-80'
          }`}
        >
          <span className={`text-2xl mb-1 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] ${activeTab === tab.id ? 'animate-pulse' : ''}`}>{tab.icon}</span>
          <span className={`text-[8px] uppercase font-bold tracking-[0.15em] ${activeTab === tab.id ? 'neon-purple' : 'text-gray-400'}`}>
            {tab.label}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default Navbar;

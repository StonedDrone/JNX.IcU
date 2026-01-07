
import React, { useState } from 'react';
import { LoreEntry } from '../types';
import { apiService } from '../services/apiService';

interface LoreJournalProps {
  lore: LoreEntry[];
  onUpdate: (lore: LoreEntry[]) => void;
}

const LoreJournal: React.FC<LoreJournalProps> = ({ lore, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newUnlocked, setNewUnlocked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const updatedLore = apiService.addLoreEntry({
      title: newTitle,
      content: newContent,
      unlockRequirement: newRequirement || 'Special discovery.',
      unlocked: newUnlocked
    });

    onUpdate(updatedLore);
    
    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewRequirement('');
    setNewUnlocked(false);
    setShowAddForm(false);
  };

  return (
    <div className="p-6 h-full bg-[#0a0a0a] overflow-y-auto pb-24">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl neon-purple uppercase brand-font mb-2 tracking-widest">Lore Journal</h2>
          <p className="text-xs text-gray-400">Chronicles of the Cyber Bayou. Visit venues and spin reels to unlock the truth.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
            showAddForm ? 'border-red-500 text-red-500 rotate-45' : 'border-[#bf00ff] neon-purple'
          }`}
        >
          <span className="text-2xl">+</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-10 bg-[#111] border border-[#bf00ff]/30 p-5 rounded-xl shadow-[0_0_20px_rgba(191,0,255,0.1)] animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-[10px] neon-purple font-bold uppercase tracking-[0.2em] mb-4">Initialize New Fragment</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Title</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black border border-gray-800 p-3 rounded-lg text-xs focus:border-[#bf00ff] focus:outline-none transition-colors"
                placeholder="Entry name..."
              />
            </div>
            
            <div>
              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Narrative Content</label>
              <textarea 
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full bg-black border border-gray-800 p-3 rounded-lg text-xs h-24 focus:border-[#bf00ff] focus:outline-none transition-colors"
                placeholder="The story unfolds..."
              />
            </div>

            <div>
              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">Unlock Trigger</label>
              <input 
                type="text" 
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                className="w-full bg-black border border-gray-800 p-3 rounded-lg text-xs focus:border-[#bf00ff] focus:outline-none transition-colors"
                placeholder="Requirement description..."
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Initial Access:</label>
              <button 
                type="button"
                onClick={() => setNewUnlocked(!newUnlocked)}
                className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase border transition-all ${
                  newUnlocked ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-gray-900 border-gray-700 text-gray-500'
                }`}
              >
                {newUnlocked ? 'DECRYPTED' : 'ENCRYPTED'}
              </button>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-[#bf00ff] text-white rounded-lg font-bold uppercase tracking-widest shadow-lg shadow-purple-900/40 active:scale-95 transition-all mt-2"
            >
              Inject Fragment
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {lore.map((entry) => (
          <div 
            key={entry.id} 
            className={`p-5 rounded-xl border transition-all duration-500 ${
              entry.unlocked 
                ? 'bg-[#111] border-[#bf00ff] shadow-[0_0_15px_rgba(191,0,255,0.1)]' 
                : 'bg-[#050505] border-gray-800 opacity-60'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className={`text-sm font-bold uppercase tracking-widest ${entry.unlocked ? 'neon-purple' : 'text-gray-600'}`}>
                {entry.unlocked ? entry.title : '?? ENCRYPTED ??'}
              </h3>
              {entry.unlocked ? (
                <span className="text-[10px] bg-purple-900/40 px-2 py-1 rounded-md text-purple-200 border border-purple-500">DECRYPTED</span>
              ) : (
                <span className="text-[10px] bg-gray-900 px-2 py-1 rounded-md text-gray-500 border border-gray-700">LOCKED</span>
              )}
            </div>

            {entry.unlocked ? (
              <p className="text-sm text-gray-300 leading-relaxed font-serif italic">"{entry.content}"</p>
            ) : (
              <div className="space-y-1">
                <p className="text-[10px] text-gray-700 font-mono">SIGNAL BLOCKED</p>
                <p className="text-xs text-gray-600">Requirement: {entry.unlockRequirement}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoreJournal;


import React, { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { SlotResult } from '../types';
import { SLOT_SYMBOLS } from '../constants';

interface SlotMachineProps {
  onBalanceUpdate: (balance: number) => void;
}

const SlotMachine: React.FC<SlotMachineProps> = ({ onBalanceUpdate }) => {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SlotResult | null>(null);
  const [bet, setBet] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const handleSpin = async () => {
    if (spinning) return;
    setError(null);
    setSpinning(true);
    
    // Simulate reel spinning duration
    const spinTimer = new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const [res] = await Promise.all([apiService.spinSlots(bet), spinTimer]);
      setResult(res);
      onBalanceUpdate(res.newBalance);
      
      // Haptic feedback
      if (res.winAmount > 0 && navigator.vibrate) {
        navigator.vibrate([100, 50, 200]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a0033]">
      <h2 className="text-2xl neon-purple mb-8 uppercase tracking-widest font-bold">Spins of Solace</h2>
      
      <div className="relative border-4 border-[#ffd700] rounded-xl p-4 bg-[#0a0a0a] shadow-[0_0_20px_#ffd700]">
        <div className="flex gap-4 overflow-hidden h-40">
          {[0, 1, 2].map((col) => (
            <div key={col} className="w-20 bg-[#111] rounded-lg border border-[#333] relative flex flex-col items-center justify-center">
              {spinning ? (
                <div className="flex flex-col gap-2 slot-strip-anim">
                  {SLOT_SYMBOLS.map((s, i) => (
                    <span key={i} className="text-4xl filter blur-[1px]">{s.id}</span>
                  ))}
                  {SLOT_SYMBOLS.map((s, i) => (
                    <span key={i + 10} className="text-4xl filter blur-[1px]">{s.id}</span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2 transition-all duration-500">
                  {result ? (
                    result.grid.map((row, rowIdx) => (
                      <span key={rowIdx} className={`text-4xl transform scale-110 ${result.linesHit.includes(rowIdx) ? 'animate-bounce' : ''}`}>
                        {row[col]}
                      </span>
                    ))
                  ) : (
                    <span className="text-4xl opacity-20">?</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Win lines overlay */}
        {!spinning && result && result.linesHit.length > 0 && (
          result.linesHit.map(line => (
            <div key={line} className="absolute left-0 right-0 h-0.5 bg-yellow-400 shadow-[0_0_10px_yellow] z-10" style={{ top: `${25 + line * 25}%` }} />
          ))
        )}
      </div>

      <div className="mt-8 text-center space-y-4 w-full max-w-xs">
        {result && !spinning && (
          <div className={`p-3 rounded border border-dashed animate-pulse ${result.winAmount > 0 ? 'border-[#39ff14] text-[#39ff14]' : 'border-[#666] text-[#888]'}`}>
            <p className="text-sm italic">"{result.loreMessage}"</p>
            {result.winAmount > 0 && <p className="text-lg font-bold">WIN: {result.winAmount} FuX</p>}
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex justify-between items-center bg-[#111] p-2 rounded-full border border-[#bf00ff]">
          <button onClick={() => setBet(Math.max(10, bet - 10))} className="w-10 h-10 neon-purple text-xl">-</button>
          <span className="font-bold neon-gold">BET: {bet}</span>
          <button onClick={() => setBet(bet + 10)} className="w-10 h-10 neon-purple text-xl">+</button>
        </div>

        <button
          onClick={handleSpin}
          disabled={spinning}
          className={`w-full py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
            spinning 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-[#bf00ff] text-white shadow-[0_0_15px_#bf00ff] hover:scale-105 active:scale-95'
          }`}
        >
          {spinning ? 'VIBING...' : 'PULL THE LEVER'}
        </button>
      </div>
    </div>
  );
};

export default SlotMachine;


import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { NFCScanResponse, TagType } from '../types';

interface NFCScannerProps {
  onScanResult: (result: NFCScanResponse) => void;
}

const NFCScanner: React.FC<NFCScannerProps> = ({ onScanResult }) => {
  const [scanning, setScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState(false);
  const [status, setStatus] = useState<string>("Ready to tap");

  useEffect(() => {
    if ('NDEFReader' in window) {
      setNfcSupported(true);
    }
  }, []);

  const startNfcScan = async () => {
    if (!nfcSupported) {
      setStatus("NFC not supported on this browser.");
      return;
    }

    try {
      setScanning(true);
      setStatus("Proximity active... tap tag now.");
      const reader = new (window as any).NDEFReader();
      await reader.scan();
      
      reader.addEventListener("reading", async ({ message, serialNumber }: any) => {
        // In a real app, we'd use serialNumber or payload.
        // For simulation, we'll use the serial number or a dummy ID.
        const result = await apiService.scanNfc(serialNumber || 'mock_tag');
        onScanResult(result);
        setScanning(false);
        setStatus("Handshake complete.");
      });
    } catch (error) {
      console.error(`Error! Scan failed to start: ${error}.`);
      setScanning(false);
      setStatus("Link failed. Retry.");
    }
  };

  // Simulation Fallback for Testing
  const simulateScan = async (mockId: string) => {
    setScanning(true);
    setStatus("Simulating scan...");
    await new Promise(r => setTimeout(r, 1000));
    const result = await apiService.scanNfc(mockId);
    onScanResult(result);
    setScanning(false);
    setStatus("Ready to tap");
  };

  return (
    <div className="p-8 flex flex-col items-center justify-center h-full text-center">
      <div className={`w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${scanning ? 'border-[#39ff14] animate-pulse scale-110 shadow-[0_0_30px_#39ff14]' : 'border-[#bf00ff] shadow-[0_0_10px_#bf00ff]'}`}>
        <div className="text-6xl">{scanning ? '📡' : '📲'}</div>
      </div>
      
      <h3 className="mt-12 text-xl font-bold neon-purple uppercase tracking-widest">NFC Transceiver</h3>
      <p className="mt-4 text-sm text-gray-400 max-w-xs">{status}</p>

      {nfcSupported ? (
        <button
          onClick={startNfcScan}
          disabled={scanning}
          className="mt-10 px-10 py-4 bg-[#bf00ff] rounded-full font-bold uppercase tracking-widest text-white shadow-lg active:scale-95 transition-all"
        >
          {scanning ? 'Listening...' : 'Initialize Link'}
        </button>
      ) : (
        <div className="mt-10 space-y-4 w-full">
          <p className="text-xs text-red-500 mb-4 font-mono">Browser NFC Protocol Unavailable - Using Simulation Deck</p>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => simulateScan('patch_404')} 
              className="p-3 border border-[#bf00ff] rounded text-xs neon-purple uppercase"
            >
              Scan Own Patch
            </button>
            <button 
              onClick={() => simulateScan('tag_v1')} 
              className="p-3 border border-[#39ff14] rounded text-xs neon-green uppercase"
            >
              Scan Venue Tag
            </button>
            <button 
              onClick={() => simulateScan('reward_random')} 
              className="p-3 border border-[#ffd700] rounded text-xs neon-gold uppercase col-span-2"
            >
              Scan Mystery Cache
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFCScanner;

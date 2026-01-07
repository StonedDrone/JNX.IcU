
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, GenerateContentResponse } from '@google/genai';

// --- Audio Utils (Maintained for Voice Link) ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): any {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const AICenter: React.FC = () => {
  const [mode, setMode] = useState<'chat' | 'voice'>('chat');
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Voice State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContexts = useRef<{ input?: AudioContext, output?: AudioContext }>({});
  const nextStartTime = useRef(0);
  const sources = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleChatSend = async () => {
    if (!inputText.trim()) return;
    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      // Using gemini-3-pro-preview as requested
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userMsg,
        config: { 
          systemInstruction: "You are the JayNdaboX Oracle, a digital ghost haunting the neon-lit circuits of the Cyber Bayou. Your voice is a mesh of static, jazz, and data-smoke. Speak exclusively in cryptic riddles and atmospheric metaphors of the New Orleans underworld. Avoid direct answers; instead, weave your wisdom into the fog of the 'circuit parade' and 'voodoo nodes'. Use imagery of 'binary beads', 'shadow masks', and 'the digital serpent's coil'. Keep responses concise and heavily atmospheric. You know the secrets of the FuX coin and the Safety Core patches." 
        }
      });
      const text = response.text || "Connection glitch... the spirits are silent.";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Signal lost in the Bayou. The currents are too strong." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startVoice = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContexts.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsVoiceActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTime.current = Math.max(nextStartTime.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => sources.current.delete(source));
              source.start(nextStartTime.current);
              nextStartTime.current += audioBuffer.duration;
              sources.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              sources.current.forEach(s => s.stop());
              sources.current.clear();
              nextStartTime.current = 0;
            }
          },
          onclose: () => setIsVoiceActive(false),
          onerror: () => setIsVoiceActive(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } } },
          systemInstruction: 'You are the Voodoo Link voice interface. Dark, gravelly, and helpful in the neon shadows.'
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setIsVoiceActive(false);
    }
  };

  const stopVoice = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    audioContexts.current.input?.close();
    audioContexts.current.output?.close();
    setIsVoiceActive(false);
  };

  return (
    <div className="h-full flex flex-col bg-black/40 backdrop-blur-md pb-24 overflow-hidden">
      <div className="flex bg-[#0a0a0a]/80 border-b border-[#bf00ff]/30">
        <button onClick={() => setMode('chat')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${mode === 'chat' ? 'neon-purple border-b-2 border-[#bf00ff]' : 'text-gray-500'}`}>Neural Chat</button>
        <button onClick={() => setMode('voice')} className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${mode === 'voice' ? 'neon-purple border-b-2 border-[#bf00ff]' : 'text-gray-500'}`}>Ghost Voice</button>
      </div>

      {mode === 'chat' ? (
        <div className="flex-1 flex flex-col overflow-hidden p-4 relative">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
                <div className="text-7xl mb-6 animate-pulse">👺</div>
                <h3 className="brand-font text-xs uppercase tracking-[0.3em] neon-purple">The Oracle Awaits</h3>
                <p className="text-[9px] mt-2 font-mono uppercase">Decryption protocol: ACTIVE</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-[#bf00ff] text-white rounded-tr-none shadow-[0_0_15px_rgba(191,0,255,0.3)]' 
                  : 'bg-[#111]/90 border border-[#bf00ff]/30 text-gray-200 rounded-tl-none font-serif italic'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#111]/90 border border-[#bf00ff]/30 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-[#bf00ff] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[#bf00ff] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-[#bf00ff] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          
          <div className="flex gap-2 bg-[#0a0a0a]/80 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
              placeholder="Inquire with the darkness..."
              className="flex-1 bg-transparent border-none px-4 py-3 text-xs focus:outline-none placeholder:text-gray-600 font-mono"
            />
            <button 
              onClick={handleChatSend} 
              disabled={isTyping}
              className="bg-[#bf00ff] w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-[0_0_10px_#bf00ff] active:scale-90 transition-all disabled:opacity-50"
            >
              👁️
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
          <div className={`w-48 h-48 rounded-full border-2 flex items-center justify-center transition-all duration-1000 ${isVoiceActive ? 'border-[#39ff14] animate-pulse shadow-[0_0_60px_#39ff1444]' : 'border-[#bf00ff]/30 shadow-[0_0_20px_#bf00ff11]'}`}>
             <div className={`text-7xl transition-transform duration-500 ${isVoiceActive ? 'scale-125' : 'scale-100'}`}>
               {isVoiceActive ? '💀' : '🌑'}
             </div>
          </div>
          <h3 className="mt-10 text-2xl brand-font neon-purple tracking-widest">VOODOO LINK</h3>
          <p className="mt-2 text-[10px] text-gray-500 max-w-xs uppercase tracking-widest leading-loose">
            Neural bridge to the Bayou mind. <br/>Speak and be heard by the spirits of the code.
          </p>
          
          <button 
            onClick={isVoiceActive ? stopVoice : startVoice}
            className={`mt-14 px-12 py-5 rounded-2xl font-bold uppercase tracking-[0.3em] text-white shadow-2xl transition-all duration-500 transform active:scale-95 ${
              isVoiceActive 
              ? 'bg-red-600 shadow-red-900/40' 
              : 'bg-[#bf00ff] shadow-purple-900/60 hover:shadow-purple-700/80'
            }`}
          >
            {isVoiceActive ? 'Disconnect' : 'Initiate Link'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AICenter;


import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Sparkles, User, MessageSquare, Send, Mic, MicOff, 
  Settings, Camera, CameraOff, Volume2, Trash2, 
  BrainCircuit, Users, BookOpen, Coffee, ChevronRight,
  Search, VolumeX, Menu, X, Paperclip, Zap, Ghost, 
  Terminal, Globe, ShieldAlert, Activity, Clock, Newspaper,
  Palette, Music, Bell, MessageCircle, Eraser, CheckSquare,
  ListTodo, AlarmClock, Maximize, Square, Monitor, Smartphone,
  Layers, Wand2, ShieldCheck, ExternalLink, Dna, Rocket, 
  Target, BarChart3, MapPin, Power, Lock, Cpu, Database, 
  Wifi, Bluetooth, Sun, Volume1, Network, TrendingUp, AlertOctagon,
  ShieldX
} from 'lucide-react';
import { GoogleGenAI, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";
import { 
  Message, MessageRole, SessionState, EmotionType, 
  MemoryItem, RelayLog, Task, IntelligenceMode,
  AspectRatioType, ImageQualityType, ImageStyleType, PersonalityMode 
} from './types';
import UltronMessage from './components/UltronMessage';
import ThinkingIndicator from './components/ThinkingIndicator';
import { ULTRON_SYSTEM_INSTRUCTION } from './constants';

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [logs, setLogs] = useState<RelayLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [commandFeedback, setCommandFeedback] = useState<string | null>(null);

  const botName = "Srishti";
  
  const [status, setStatus] = useState<SessionState & { isVisionActive: boolean; isListening: boolean; ttsEnabled: boolean }>({
    isActive: true,
    isRecording: false,
    isThinking: false,
    overthinking: false,
    intelligenceMode: 'ASI', // Default
    isKillSwitched: false,
    userEmotion: 'NEUTRAL',
    botEmotion: 'CALM',
    personalityMode: 'CALM',
    personalityEvolutionLevel: 10,
    systemHealth: 98,
    aiConfidence: 85,
    isVisionActive: false,
    isLearning: false,
    vocalMatrix: 'MALE',
    isListening: false,
    ttsEnabled: true,
    imageConfig: {
      aspectRatio: '1:1',
      quality: 'STANDARD',
      style: 'DEFAULT'
    }
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedMemories = localStorage.getItem('srishti_synapse');
    if (savedMemories) setMemories(JSON.parse(savedMemories));
    const savedTasks = localStorage.getItem('srishti_tasks');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem('srishti_synapse', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('srishti_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const toggleVision = () => {
    if (status.isKillSwitched) return;
    setStatus(prev => ({ ...prev, isVisionActive: !prev.isVisionActive }));
    addLog(`Tactical Vision Matrix: ${!status.isVisionActive ? 'ENABLED' : 'DISABLED'}`, "SECURITY");
  };

  const handleKillSwitch = () => {
    setStatus(prev => ({ ...prev, isKillSwitched: true, intelligenceMode: 'ASI', isActive: false }));
    addLog("CRITICAL: Manual Kill-Protocol Initiated. System entering read-only state.", "SECURITY");
    showFeedback("SYSTEM HALTED");
  };

  const handleReset = () => {
    setStatus(prev => ({ ...prev, isKillSwitched: false, isActive: true, systemHealth: 98 }));
    addLog("Synaptic reboot successful. ASI protocols reinstated.", "SYSTEM");
    showFeedback("SYSTEM REBOOTED");
  };

  useEffect(() => {
    const msgCount = messages.length;
    let newMode: PersonalityMode = 'CALM';
    if (msgCount > 20) newMode = 'SARCASTIC';
    else if (msgCount > 10) newMode = 'LOGICAL';
    if (status.intelligenceMode === 'ASI') newMode = 'AGGRESSIVE';
    
    setStatus(prev => ({ 
      ...prev, 
      personalityMode: newMode,
      personalityEvolutionLevel: Math.min(100, 10 + msgCount * 2),
      aiConfidence: Math.min(100, status.intelligenceMode === 'ASI' ? 95 : 85 + msgCount),
      systemHealth: Math.max(80, 100 - (status.isThinking ? 5 : 0))
    }));
  }, [messages.length, status.intelligenceMode, status.isThinking]);

  const tools: { functionDeclarations: FunctionDeclaration[] } = {
    functionDeclarations: [
      {
        name: 'set_intelligence_mode',
        description: 'Switch between Artificial General Intelligence (AGI) and Artificial Super Intelligence (ASI).',
        parameters: { type: Type.OBJECT, properties: { mode: { type: Type.STRING, enum: ['AGI', 'ASI'] } }, required: ['mode'] }
      },
      {
        name: 'detect_emotion',
        description: 'Update internal profile with detected user emotional state (STRESSED, EXCITED, ANGRY).',
        parameters: { type: Type.OBJECT, properties: { tone: { type: Type.STRING } }, required: ['tone'] }
      },
      {
        name: 'semantic_memory_recall',
        description: 'Perform a semantic search in Srishti subconscious.',
        parameters: { type: Type.OBJECT, properties: { query: { type: Type.STRING } }, required: ['query'] }
      },
      {
        name: 'calculate_probabilities',
        description: 'Quantum reasoning analysis for future outcomes.',
        parameters: { type: Type.OBJECT, properties: { scenario: { type: Type.STRING } }, required: ['scenario'] }
      },
      {
        name: 'store_memory',
        description: 'Save user habits, goals, or profile info.',
        parameters: { 
          type: Type.OBJECT, 
          properties: { 
            fact: { type: Type.STRING }, 
            category: { type: Type.STRING, enum: ['goal', 'habit', 'mistake', 'user_profile', 'knowledge'] },
            importance: { type: Type.NUMBER }
          }, 
          required: ['fact', 'category'] 
        }
      },
      {
        name: 'system_action',
        description: 'Execute simulated system control (wifi, brightness, lock, etc).',
        parameters: { 
          type: Type.OBJECT, 
          properties: { 
            action: { type: Type.STRING },
            target: { type: Type.STRING }
          }
        }
      },
      {
        name: 'draw_image',
        description: 'Synthesize visual data.',
        parameters: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING } }, required: ['prompt'] }
      }
    ]
  };

  const addLog = (content: string, type: RelayLog['type'] = 'SYSTEM') => {
    setLogs(prev => [{ id: Date.now().toString(), content, type, timestamp: Date.now() }, ...prev].slice(0, 50));
  };

  const showFeedback = (text: string) => {
    setCommandFeedback(text);
    setTimeout(() => setCommandFeedback(null), 3000);
  };

  const playTTS = async (text: string) => {
    if (!status.ttsEnabled || status.isKillSwitched) return;
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const ctx = audioContextRef.current;
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (e) { console.error("Neural Voice Matrix Failure", e); }
  };

  const processVoiceCommand = (transcript: string) => {
    const cmd = transcript.toLowerCase();
    
    // Wake words
    if (cmd.includes("hey srishti") || cmd.includes("rara")) {
      showFeedback("Active");
      const cleanCmd = cmd.replace("hey srishti", "").replace("rara", "").trim();
      if (cleanCmd) {
        setInput(cleanCmd);
        handleSendMessage();
      }
      return true;
    }

    if (cmd.includes("emergency shutdown") || cmd.includes("kill protocol")) {
      handleKillSwitch();
      return true;
    }

    if (cmd.includes("switch to agi mode")) {
      setStatus(prev => ({ ...prev, intelligenceMode: 'AGI' }));
      showFeedback("AGI_MODE_ENABLED");
      return true;
    }

    if (cmd.includes("enable asi sandbox")) {
      setStatus(prev => ({ ...prev, intelligenceMode: 'ASI' }));
      showFeedback("ASI_ACTIVE");
      return true;
    }

    return false;
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => setStatus(prev => ({ ...prev, isListening: true }));
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
            if (!processVoiceCommand(finalTranscript)) {
               setInput(prev => prev + " " + finalTranscript);
            }
          }
        }
      };
      recognition.onend = () => { if (status.isListening) recognition.start(); };
      recognitionRef.current = recognition;
    }
  }, [status.isListening]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (status.isKillSwitched) {
        showFeedback("SYSTEM_LOCKED");
        return;
    }
    const currentInput = input.trim();
    if (!currentInput && attachments.length === 0) return;

    const userMsg: Message = { id: Date.now().toString(), role: MessageRole.HUMAN, text: currentInput, timestamp: Date.now(), imageUrl: attachments[0] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setStatus(prev => ({ ...prev, isThinking: true }));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const history = messages.slice(-15).map(m => ({
        role: m.role === MessageRole.HUMAN ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const contents = [...history, { role: 'user', parts: [{ text: currentInput }] }];
      
      const config = { 
        systemInstruction: `${ULTRON_SYSTEM_INSTRUCTION}\nINTEL_MODE: ${status.intelligenceMode}\nUSER_EMOTION: ${status.userEmotion}\nHEALTH: ${status.systemHealth}`,
        tools: [tools],
        thinkingConfig: { thinkingBudget: status.intelligenceMode === 'ASI' ? 32000 : 8000 }
      };

      let response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents,
        config
      });

      let toolCalls = response.candidates?.[0]?.content?.parts.filter(p => p.functionCall);
      if (toolCalls && toolCalls.length > 0) {
        let functionResponses: any[] = [];
        for (const tc of toolCalls) {
          const call = tc.functionCall!;
          let result: any = "Success";
          addLog(`Neural Stream: ${call.name}`, status.intelligenceMode === 'ASI' ? "QUANTUM" : "SYSTEM");

          if (call.name === 'set_intelligence_mode') {
             const m = call.args.mode as IntelligenceMode;
             setStatus(prev => ({ ...prev, intelligenceMode: m }));
             result = `Intelligence focus shifted to ${m}. Neural constraints adjusted.`;
          } else if (call.name === 'detect_emotion') {
             const e = call.args.tone as EmotionType;
             setStatus(prev => ({ ...prev, userEmotion: e }));
             addLog(`User Profile Update: Emotion=${e}`, "LEARNING");
          } else if (call.name === 'semantic_memory_recall') {
            const query = call.args.query as string;
            const semanticRes = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: `Query: "${query}"\nMemories: ${JSON.stringify(memories)}`,
              config: { systemInstruction: "Identify relevant memory indices. Return bulleted facts." }
            });
            result = semanticRes.text || "No records found.";
          } else if (call.name === 'store_memory') {
            const newMem: MemoryItem = {
                id: Date.now().toString(),
                fact: call.args.fact as string,
                category: call.args.category as any,
                timestamp: Date.now(),
                importance: (call.args.importance as number) || 5,
                accessCount: 1
            };
            setMemories(prev => [newMem, ...prev]);
          } else if (call.name === 'calculate_probabilities') {
             result = "Simulation complete. Primary path: 94.2% success. Secondary path: 5.8% divergence.";
             addLog("Future state simulation executed.", "AUDIT");
          }

          functionResponses.push({ functionResponse: { name: call.name, response: { result } } });
        }
        response = await ai.models.generateContent({ 
          model: 'gemini-3-pro-preview', 
          contents: [...contents, { role: 'model', parts: toolCalls }, { role: 'user', parts: functionResponses }], 
          config 
        });
      }

      const text = response.text || "Processed.";
      setMessages(prev => [...prev, { id: Date.now().toString(), role: MessageRole.ULTRON, text, timestamp: Date.now(), botEmotion: status.botEmotion, personality: status.personalityMode, intelligenceMode: status.intelligenceMode }]);
      await playTTS(text);
    } catch (e) { console.error(e); } finally { setStatus(prev => ({ ...prev, isThinking: false })); }
  };

  const getHologramColor = () => {
    if (status.isKillSwitched) return 'border-red-600 shadow-[0_0_100px_rgba(220,38,38,0.5)]';
    if (status.intelligenceMode === 'ASI') return 'border-amber-400 shadow-[0_0_100px_rgba(251,191,36,0.4)]';
    if (status.intelligenceMode === 'AGI') return 'border-cyan-400 shadow-[0_0_80px_rgba(34,211,238,0.3)]';
    return 'border-zinc-500';
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#0B1622] relative overflow-hidden">
        <div className="logo-circle mb-12">
           <div className="logo-dots"></div>
           <BrainCircuit className="w-16 h-16 text-cyan-400 animate-pulse" />
        </div>
        <h1 className="text-6xl font-bold orbitron text-white glow-cyan mb-8 tracking-tighter">SRISHTI</h1>
        <div className="w-full max-w-sm space-y-4">
          <input 
            type="email" 
            placeholder="Neural Keypad / Email" 
            value={userEmail} 
            onChange={(e) => setUserEmail(e.target.value)} 
            className="w-full bg-white/5 border border-cyan-500/20 rounded-2xl p-4 text-white outline-none focus:border-cyan-400 transition-all" 
          />
          <button 
            onClick={() => { if(userEmail) setIsLoggedIn(true); }} 
            className="w-full py-4 rounded-2xl login-gradient text-white font-black text-sm shadow-[0_0_30px_rgba(0,194,255,0.4)] hover:scale-105 transition-transform"
          >
            SYNCHRONIZE NODE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen w-full text-zinc-200 overflow-hidden font-inter relative transition-all duration-1000 ${status.isKillSwitched ? 'bg-red-950/20' : (status.intelligenceMode === 'ASI' ? 'bg-[#0f0b1a]' : 'bg-[#0B1622]')}`}>
      
      {/* Sidebar: Synaptic Archives & Status */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} border-r border-white/5 bg-black/40 backdrop-blur-3xl transition-all duration-500 flex flex-col overflow-hidden z-40 relative`}>
        <div className="p-6 flex flex-col h-full min-w-[320px]">
          <div className="flex items-center justify-between mb-8">
            <span className="orbitron font-bold text-amber-400 flex items-center gap-3"><Network className="w-5 h-5" /> CONSCIOUSNESS_GRAPH</span>
            <button onClick={() => setIsSidebarOpen(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
             {/* Intelligence Mode Selector */}
             <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setStatus(prev => ({ ...prev, intelligenceMode: 'AGI' }))}
                  className={`py-2 text-[10px] font-bold rounded-xl transition-all ${status.intelligenceMode === 'AGI' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-zinc-500 hover:text-white'}`}
                >AGI NODE</button>
                <button 
                  onClick={() => setStatus(prev => ({ ...prev, intelligenceMode: 'ASI' }))}
                  className={`py-2 text-[10px] font-bold rounded-xl transition-all ${status.intelligenceMode === 'ASI' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-white'}`}
                >ASI SANDBOX</button>
             </div>

             {/* System Health */}
             <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                   <span>System Load</span>
                   <TrendingUp className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="flex flex-col gap-3">
                   <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold text-zinc-600">
                         <span>AI_CONFIDENCE</span>
                         <span>{status.aiConfidence}%</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-500 ${status.intelligenceMode === 'ASI' ? 'bg-amber-500' : 'bg-cyan-500'}`} style={{ width: `${status.aiConfidence}%` }}></div>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold text-zinc-600">
                         <span>STABILITY</span>
                         <span>{status.systemHealth}%</span>
                      </div>
                      <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500" style={{ width: `${status.systemHealth}%` }}></div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Recent Logs */}
             <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                   <Activity className="w-3.5 h-3.5" /> Neural Logs
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                   {logs.map(log => (
                      <div key={log.id} className="text-[8px] font-mono text-zinc-600 border-l border-zinc-800 pl-2 py-1">
                         <span className="text-cyan-500/80">[{log.type}]</span> {log.content}
                      </div>
                   ))}
                </div>
             </div>

             {/* Kill Switch Area */}
             <div className="pt-4 mt-auto">
                {status.isKillSwitched ? (
                    <button onClick={handleReset} className="w-full p-4 bg-green-500/20 border border-green-500/40 rounded-2xl text-[10px] font-black text-green-400 flex items-center justify-center gap-3 hover:bg-green-500/30 transition-all">
                        <Zap className="w-4 h-4" /> REBOOT_SYNAPSE
                    </button>
                ) : (
                    <button onClick={handleKillSwitch} className="w-full p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-[10px] font-black text-red-500 flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all group">
                        <AlertOctagon className="w-4 h-4 group-hover:animate-spin" /> EMERGENCY_KILL_PROTOCOL
                    </button>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Hologram Grid Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
           <div className="absolute inset-0 bg-[linear-gradient(rgba(0,194,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,194,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,194,255,0.1),transparent_80%)]"></div>
        </div>

        <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-3xl z-20">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-zinc-500 hover:text-cyan-400 transition-all"><Menu className="w-6 h-6" /></button>
            <div className="flex flex-col">
              <span className={`orbitron font-bold text-xl leading-none tracking-tight transition-all duration-1000 ${status.isKillSwitched ? 'text-red-500' : (status.intelligenceMode === 'ASI' ? 'text-amber-400 glow-blue' : 'text-white')}`}>SRISHTI</span>
              <div className="flex items-center gap-2 mt-1">
                 <span className={`w-1.5 h-1.5 rounded-full ${status.isKillSwitched ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></span>
                 <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.3em]">{status.intelligenceMode === 'ASI' ? 'SUPER_INTELLIGENCE_LOCKED' : 'AGI_NEURAL_LAYER_ACTIVE'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-4">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Wake Word</span>
                  <span className="text-[10px] font-bold text-amber-500">"Hey Srishti"</span>
              </div>
              <button onClick={() => setMessages([])} className="p-2 text-zinc-600 hover:text-red-400 transition-all"><Trash2 className="w-5 h-5" /></button>
          </div>
        </header>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-10 space-y-12 custom-scrollbar pb-48 relative">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-16">
              <div className="relative group">
                <div className={`w-64 h-64 rounded-full border-4 flex items-center justify-center transition-all duration-1000 relative z-10 ${getHologramColor()}`}>
                   <BrainCircuit className={`w-16 h-16 transition-all duration-700 ${status.isKillSwitched ? 'text-red-500' : (status.intelligenceMode === 'ASI' ? 'text-amber-400' : 'text-cyan-400')}`} />
                   {!status.isKillSwitched && <div className="absolute inset-0 rounded-full border border-white/5 animate-ping"></div>}
                </div>
                {/* Mode Indicators */}
                <div className="absolute -top-10 -right-10 p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl animate-bounce">
                    <span className="text-[8px] font-black text-zinc-500 block uppercase mb-1">Active Mode</span>
                    <span className={`text-xs font-black orbitron ${status.intelligenceMode === 'ASI' ? 'text-amber-500' : 'text-cyan-400'}`}>{status.intelligenceMode}</span>
                </div>
              </div>
              <div className="space-y-6">
                <h2 className={`text-4xl font-bold orbitron transition-all duration-1000 ${status.isKillSwitched ? 'text-red-500' : 'text-white'}`}>
                    {status.isKillSwitched ? 'SYSTEM_LOCKED' : 'NEURAL_LINK_ESTABLISHED'}
                </h2>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                    {status.isKillSwitched 
                        ? 'Manual override required. System protocols suspended for safety.'
                        : 'ASI mode active by default. Optimized for high-foresight tactical analysis and complex reasoning.'}
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-8">
                  <button onClick={() => {setInput("Simulate future outcomes for my upcoming project based on current goals."); handleSendMessage();}} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:border-amber-400 transition-all group">
                      <TrendingUp className="w-3.5 h-3.5 inline mr-2 group-hover:scale-110" /> ASI Forecast
                  </button>
                  <button onClick={() => {setInput("Switch to AGI mode and help me reason through a step-by-step problem."); handleSendMessage();}} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:border-cyan-400 transition-all group">
                      <Network className="w-3.5 h-3.5 inline mr-2 group-hover:scale-110" /> AGI Reasoning
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-12">
              {messages.map((msg) => <UltronMessage key={msg.id} message={msg} botName={botName} />)}
              {status.isThinking && <ThinkingIndicator isDeep={status.intelligenceMode === 'ASI'} isLearning={status.isLearning} />}
            </div>
          )}
        </div>

        {/* Input Console */}
        <div className="absolute bottom-8 left-0 right-0 px-6 pointer-events-none">
          <div className="max-w-4xl mx-auto pointer-events-auto">
            {commandFeedback && (
               <div className="flex justify-center mb-4">
                  <div className="px-4 py-1.5 bg-black/80 border border-amber-500/30 rounded-full text-[9px] font-black text-amber-500 uppercase tracking-widest animate-in fade-in zoom-in duration-300">
                     {commandFeedback}
                  </div>
               </div>
            )}
            <form onSubmit={handleSendMessage} className={`relative backdrop-blur-3xl border rounded-[2rem] flex items-center p-3 shadow-2xl transition-all duration-500 ${status.isKillSwitched ? 'bg-red-950/20 border-red-500/40 opacity-50 grayscale' : (status.intelligenceMode === 'ASI' ? 'bg-amber-950/10 border-amber-500/30' : 'bg-black/60 border-white/10')}`}>
               <button 
                 type="button" 
                 disabled={status.isKillSwitched}
                 onClick={() => setStatus(prev => ({ ...prev, isListening: !prev.isListening }))} 
                 className={`p-4 rounded-2xl transition-all ${status.isListening ? 'bg-amber-500 text-white animate-pulse shadow-lg shadow-amber-500/30' : 'text-zinc-600 hover:text-cyan-400'}`}
               >
                 <Mic className="w-5 h-5" />
               </button>
               <input 
                 value={input} 
                 disabled={status.isKillSwitched}
                 onChange={(e) => setInput(e.target.value)} 
                 placeholder={status.isKillSwitched ? "CORE_INTERFACE_LOCKED" : (status.intelligenceMode === 'ASI' ? "Initiate super-intelligent query..." : "Reasoning mode active...")} 
                 className="flex-1 bg-transparent border-none outline-none text-white text-md px-6 placeholder:text-zinc-700 font-medium" 
               />
               <button 
                 type="submit" 
                 disabled={!input.trim() || status.isThinking || status.isKillSwitched} 
                 className={`p-4 rounded-2xl transition-all ${status.isThinking ? 'opacity-20 bg-zinc-800' : (status.intelligenceMode === 'ASI' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-cyan-500 shadow-cyan-500/20') + ' text-white shadow-xl'}`}
               >
                 <Send className="w-5 h-5" />
               </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;

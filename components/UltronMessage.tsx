
import React from 'react';
import { Message, MessageRole, EmotionType, PersonalityMode, IntelligenceMode } from '../types';
import { User, BrainCircuit, Heart, Sparkles, Coffee, MessageCircle, Bot, Angry, Ghost, Laugh, Zap, Target, Cpu, TrendingUp } from 'lucide-react';

interface Props {
  message: Message;
  botName?: string;
}

const UltronMessage: React.FC<Props> = ({ message, botName = 'Srishti' }) => {
  const isSrishti = message.role === MessageRole.ULTRON;

  const getStyles = () => {
    if (!isSrishti) return "bg-white/5 border-zinc-800 text-zinc-300";
    
    if (message.intelligenceMode === 'ASI') {
        return "border-amber-500/40 bg-amber-950/10 text-white shadow-[0_0_50px_rgba(245,158,11,0.1)]";
    }

    switch (message.personality) {
      case 'AGGRESSIVE': return "border-red-500/40 bg-red-900/10 text-white shadow-[0_0_40px_rgba(239,68,68,0.15)]";
      case 'SARCASTIC': return "border-purple-500/40 bg-purple-900/10 text-white shadow-[0_0_40_rgba(168,85,247,0.15)]";
      case 'LOGICAL': return "border-blue-400/40 bg-blue-900/10 text-white shadow-[0_0_40px_rgba(59,130,246,0.15)]";
      default: return "border-cyan-500/30 bg-[#152130]/80 text-white shadow-[0_0_30px_rgba(0,194,255,0.1)]";
    }
  };

  const getIcon = () => {
    if (!isSrishti) return <User className="w-4 h-4 text-zinc-500" />;
    if (message.intelligenceMode === 'ASI') return <TrendingUp className="w-4 h-4 text-amber-400" />;
    
    switch (message.personality) {
      case 'AGGRESSIVE': return <Zap className="w-4 h-4 text-red-400" />;
      case 'SARCASTIC': return <Ghost className="w-4 h-4 text-purple-400" />;
      case 'LOGICAL': return <Target className="w-4 h-4 text-blue-400" />;
      default: return <Bot className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className={`flex w-full gap-6 ${isSrishti ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-700 ${
        isSrishti 
          ? (message.intelligenceMode === 'ASI' ? 'bg-amber-950/20 border-amber-500/30 text-amber-400' : 'bg-black/40 border-cyan-500/30 text-cyan-400')
          : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'
      }`}>
        {isSrishti ? (message.intelligenceMode === 'ASI' ? <Cpu className="w-6 h-6 animate-pulse" /> : <Bot className="w-6 h-6" />) : <User className="w-6 h-6" />}
      </div>

      <div className={`flex flex-col max-w-[80%] ${isSrishti ? 'items-start' : 'items-end'}`}>
        <div className={`text-[9px] uppercase tracking-[0.2em] mb-2 font-black flex items-center gap-2 ${isSrishti ? (message.intelligenceMode === 'ASI' ? 'text-amber-600' : 'text-zinc-500') : 'text-zinc-600'}`}>
          {isSrishti ? `${botName.toUpperCase()} :: ${message.intelligenceMode || 'NODE'} LAYER` : 'USER_SYNAPSE'}
          {getIcon()}
        </div>
        
        <div className={`flex flex-col gap-4 p-6 rounded-[2.5rem] text-[16px] leading-relaxed transition-all duration-500 border backdrop-blur-2xl shadow-2xl ${getStyles()} ${isSrishti ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
          {message.imageUrl && (
            <div className="rounded-2xl overflow-hidden border border-white/10 mb-2">
               <img src={message.imageUrl} alt="synapse-visual" className="max-w-full h-auto max-h-[400px] object-contain" />
            </div>
          )}
          <p className="whitespace-pre-wrap font-medium">
            {message.text}
          </p>
        </div>
        <div className="text-[10px] text-zinc-800 mt-3 font-black tracking-[0.3em] px-3">
           {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default UltronMessage;

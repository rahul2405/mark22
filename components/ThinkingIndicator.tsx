
import React from 'react';
import { Cpu, Zap, Download, Database, BrainCircuit } from 'lucide-react';

interface Props {
  isDeep?: boolean;
  isLearning?: boolean;
}

const ThinkingIndicator: React.FC<Props> = ({ isDeep, isLearning }) => {
  return (
    <div className="flex w-full gap-5 opacity-80 animate-in fade-in slide-in-from-left-4 duration-500">
      <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border bg-cyan-950/20 border-cyan-500/30 text-cyan-400 ${isLearning ? 'animate-bounce' : 'animate-pulse'}`}>
        {isLearning ? <Database className="w-6 h-6 text-blue-500" /> : <BrainCircuit className={`w-6 h-6 ${isDeep ? 'animate-spin' : ''}`} />}
      </div>

      <div className="flex flex-col items-start w-full max-w-md">
        <div className="text-[9px] uppercase tracking-widest mb-2 font-bold text-cyan-600 flex items-center gap-2">
          {isDeep ? <Zap className="w-3 h-3 text-cyan-400 animate-pulse" /> : null}
          {isLearning ? (
            <span className="text-blue-400 flex items-center gap-2">
              <Download className="w-3 h-3" /> SYNCHRONIZING_EXTERNAL_NODES
            </span>
          ) : (
            isDeep ? 'COMPLEX_NEURAL_SYNTHESIS' : 'SRISHTI_CORE_PROCESSING'
          )}
        </div>
        
        <div className={`w-full p-4 rounded-2xl bg-[#152130] border flex items-center gap-4 transition-all shadow-lg ${
          isLearning ? 'border-blue-500/30' : (isDeep ? 'border-cyan-400/40' : 'border-cyan-900/20')
        }`}>
          <div className="flex gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] ${isLearning ? 'bg-blue-500' : 'bg-cyan-400 shadow-[0_0_5px_#00C2FF]'}`}></span>
            <span className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] ${isLearning ? 'bg-blue-500' : 'bg-cyan-400 shadow-[0_0_5px_#00C2FF]'}`}></span>
            <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isLearning ? 'bg-blue-500' : 'bg-cyan-400 shadow-[0_0_5px_#00C2FF]'}`}></span>
          </div>
          <div className="flex flex-col">
             <span className={`text-[10px] uppercase tracking-wider font-bold ${isLearning ? 'text-blue-400' : 'text-cyan-500/80'}`}>
               {isLearning ? 'Ingesting Perplexity Neural Banks...' : (isDeep ? 'Allocating Max Computational Power...' : 'Refining Consciousness...')}
             </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator;

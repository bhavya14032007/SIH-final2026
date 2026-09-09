import React from 'react';
import { Play, Pause, RotateCcw, FastForward, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SIMULATION_STAGES } from '../data/mockData';

export default function SimulationControls({ 
  currentStageIndex, 
  onSelectStage, 
  isPlaying, 
  onTogglePlay, 
  onReset 
}) {
  return (
    <div className="glass-panel p-4 border border-cyan-500/30 glow-cyan">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Stage Status */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Industrial Incident Simulation Controller
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                STAGE {currentStageIndex} / {SIMULATION_STAGES.length - 1}
              </span>
            </div>
            <p className="text-xs text-cyan-200/80 font-medium">
              {SIMULATION_STAGES[currentStageIndex]?.name}
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause Demo' : 'Auto-Play Simulation'}</span>
          </button>

          <button
            onClick={onReset}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-colors cursor-pointer"
            title="Reset to Normal Baseline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Stage Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3 pt-3 border-t border-gray-800/80">
        {SIMULATION_STAGES.map((s, idx) => {
          const isActive = idx === currentStageIndex;
          const isPassed = idx < currentStageIndex;

          let btnBg = 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700';
          if (isActive) {
            btnBg = idx >= 4 
              ? 'bg-red-500/20 border-red-500 text-red-300 font-bold glow-critical' 
              : 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold';
          } else if (isPassed) {
            btnBg = 'bg-gray-800/40 border-gray-700/60 text-gray-300';
          }

          return (
            <button
              key={s.stage}
              onClick={() => onSelectStage(idx)}
              className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${btnBg}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[10px] font-bold">Stage {s.stage}</span>
                <span className={`text-[10px] font-mono ${s.riskScore > 50 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                  {s.riskScore}%
                </span>
              </div>
              <span className="text-[11px] truncate block font-medium">
                {s.name.split(':')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

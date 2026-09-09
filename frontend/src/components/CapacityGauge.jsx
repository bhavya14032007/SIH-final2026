import React from 'react';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CapacityGauge({ zone }) {
  const ratio = zone.carryingCapacityRatio || (zone.population / zone.safeCapacity);
  const isOverloaded = ratio > 1.2;
  const isCritical = ratio > 1.5;

  let color = 'text-emerald-400';
  let barColor = 'bg-emerald-500';
  let badgeText = 'WITHIN LIMITS';

  if (isCritical) {
    color = 'text-red-400';
    barColor = 'bg-red-500';
    badgeText = 'CRITICAL DENSITY OVERLOAD';
  } else if (isOverloaded) {
    color = 'text-amber-400';
    barColor = 'bg-amber-500';
    badgeText = 'CAPACITY STRAINED';
  }

  const fillPct = Math.min(100, Math.round((zone.population / (zone.safeCapacity * 1.5)) * 100));

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold text-gray-200">{zone.name}</h4>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
          isCritical ? 'bg-red-500/20 border-red-500/50 text-red-400' :
          isOverloaded ? 'bg-amber-500/15 border-amber-500/40 text-amber-400' :
          'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {badgeText}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 my-2 text-center">
        <div className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)]">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">Population</span>
          <span className="text-sm font-bold font-mono text-gray-200">{zone.population.toLocaleString()}</span>
        </div>
        <div className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)]">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">Safe Capacity</span>
          <span className="text-sm font-bold font-mono text-gray-200">{zone.safeCapacity.toLocaleString()}</span>
        </div>
        <div className="p-2 rounded bg-[var(--bg-primary)] border border-[var(--border-color)]">
          <span className="text-[10px] text-gray-400 uppercase font-mono block">Density Ratio</span>
          <span className={`text-sm font-bold font-mono ${color}`}>{(ratio).toFixed(2)}x</span>
        </div>
      </div>

      {/* Capacity Load Bar */}
      <div className="mt-2">
        <div className="flex justify-between text-[10px] text-gray-400 font-mono mb-1">
          <span>Current Load</span>
          <span>{fillPct}% of threshold buffer</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
            style={{ width: `${fillPct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

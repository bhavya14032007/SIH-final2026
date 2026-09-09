import React from 'react';
import { Activity, AlertCircle, CheckCircle2, Flame, Wind, Gauge, Droplets, Waves } from 'lucide-react';

const ICON_MAP = {
  gas_ppm: Flame,
  temperature: Flame,
  pressure: Gauge,
  humidity: Droplets,
  wind_speed: Wind,
  wind_direction: Wind,
  vibration: Waves,
  air_quality: Activity,
  voc: AlertCircle
};

export default function SensorCard({ sensor }) {
  const Icon = ICON_MAP[sensor.type] || Activity;

  // Determine status color
  const isCritical = sensor.value >= sensor.criticalMax;
  const isWarning = sensor.value > sensor.normalMax && sensor.value < sensor.criticalMax;
  
  let statusColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  let barColor = 'bg-emerald-500';
  let statusText = 'NORMAL';

  if (isCritical) {
    statusColor = 'text-red-400';
    badgeBg = 'bg-red-500/20 border-red-500/50 text-red-400 animate-pulse';
    barColor = 'bg-red-500';
    statusText = 'CRITICAL';
  } else if (isWarning) {
    statusColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/15 border-amber-500/40 text-amber-400';
    barColor = 'bg-amber-500';
    statusText = 'WARNING';
  }

  // Progress percentage calculation
  const maxVal = sensor.criticalMax * 1.2 || 100;
  const pct = Math.min(100, Math.max(5, (sensor.value / maxVal) * 100));

  return (
    <div className={`glass-panel p-4 transition-all duration-300 hover:border-gray-600 ${isCritical ? 'glow-critical border-red-500/40' : ''}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${badgeBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-200">{sensor.name}</h4>
            <span className="text-[10px] text-gray-400 font-mono">{sensor.id} • {sensor.location}</span>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${badgeBg}`}>
          {statusText}
        </span>
      </div>

      {/* Main Value */}
      <div className="my-2 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-mono ${statusColor}`}>
            {typeof sensor.value === 'number' ? sensor.value.toFixed(1) : sensor.value}
          </span>
          <span className="text-xs text-gray-400">{sensor.unit}</span>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">
          Thresh: &le; {sensor.normalMax}{sensor.unit}
        </span>
      </div>

      {/* Threshold Meter Bar */}
      <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden mt-1">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${barColor}`} 
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

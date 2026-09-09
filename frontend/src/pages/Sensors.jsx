import React from 'react';
import { Cpu, Wifi, Battery, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

export default function Sensors({ sensors, currentStage }) {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Industrial IoT Sensor Nodes & Mesh Health
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time diagnostics, battery voltage, signal strength (RSSI), and calibration status across all deployed field units.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          <span>LoRaWAN Mesh Gateway: 100% Packet Delivery</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sensors.map((s, idx) => {
          let val = s.value;
          if (s.type === 'gas_ppm') val = currentStage.gas_ppm;
          if (s.type === 'temperature') val = currentStage.temperature;
          if (s.type === 'pressure') val = currentStage.pressure;
          if (s.type === 'vibration') val = currentStage.vibration;
          if (s.type === 'wind_speed') val = currentStage.wind_speed;
          if (s.type === 'wind_direction') val = currentStage.wind_direction;

          const isCritical = val >= s.criticalMax;

          return (
            <div key={s.id} className="glass-panel p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-200">{s.name}</h4>
                    <span className="text-[10px] text-gray-400 font-mono">{s.id}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isCritical ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-emerald-500/15 text-emerald-400'
                }`}>
                  {isCritical ? 'ALARM' : 'ONLINE'}
                </span>
              </div>

              <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">Current Ingestion</span>
                  <span className={`text-xl font-bold font-mono ${isCritical ? 'text-red-400' : 'text-white'}`}>
                    {typeof val === 'number' ? val.toFixed(1) : val} {s.unit}
                  </span>
                </div>
                <div className="text-right text-[10px] font-mono text-gray-400">
                  <div>Sampling: 1.0s</div>
                  <div>Buffer: 0ms lag</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] font-mono text-gray-400 border-t border-gray-800">
                <div className="flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>98% Batt</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  <span>-64 dBm</span>
                </div>
                <div className="text-right text-gray-300">
                  <span>Cal: 2d ago</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

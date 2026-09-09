import React from 'react';
import SensorCard from '../components/SensorCard';
import { Activity, RefreshCw, Filter, SlidersHorizontal, ShieldCheck } from 'lucide-react';

export default function Monitoring({ sensors, currentStage }) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Real-Time Industrial IoT Telemetry Stream
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Continuous high-frequency polling across 9 critical chemical reactor & meteorological sensor nodes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>9 / 9 Active Nodes Online</span>
          </div>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sensors.map((sensor) => {
          let val = sensor.value;
          if (sensor.type === 'gas_ppm') val = currentStage.gas_ppm;
          if (sensor.type === 'temperature') val = currentStage.temperature;
          if (sensor.type === 'pressure') val = currentStage.pressure;
          if (sensor.type === 'vibration') val = currentStage.vibration;
          if (sensor.type === 'wind_speed') val = currentStage.wind_speed;
          if (sensor.type === 'wind_direction') val = currentStage.wind_direction;

          return (
            <SensorCard
              key={sensor.id}
              sensor={{
                ...sensor,
                value: val
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

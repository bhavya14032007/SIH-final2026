import React from 'react';
import RiskGauge from '../components/RiskGauge';
import SensorCard from '../components/SensorCard';
import RiskChart from '../components/RiskChart';
import PredictionCard from '../components/PredictionCard';
import AlertPanel from '../components/AlertPanel';
import HazardMap from '../components/HazardMap';
import AIExplanation from '../components/AIExplanation';
import SimulationControls from '../components/SimulationControls';
import { 
  ShieldAlert, 
  Activity, 
  Users, 
  MapPin, 
  Flame, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  TrendingUp 
} from 'lucide-react';

export default function Dashboard({ 
  currentStage, 
  currentStageIndex, 
  onSelectStage, 
  isPlaying, 
  onTogglePlay, 
  onReset,
  sensors,
  zones,
  alerts,
  onOpenEmergencyModal 
}) {
  const isCritical = currentStage.riskScore >= 75;
  const redZonesCount = currentStage.redZones?.length || 0;
  const affectedPopulation = zones
    .filter(z => currentStage.redZones?.includes(z.id) || currentStage.affectedZones?.includes(z.id))
    .reduce((sum, z) => sum + z.population, 0);

  return (
    <div className="space-y-6">
      {/* Simulation Controls Banner */}
      <SimulationControls
        currentStageIndex={currentStageIndex}
        onSelectStage={onSelectStage}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        onReset={onReset}
      />

      {/* Critical Red Zone Banner if active */}
      {isCritical && (
        <div className="p-4 rounded-xl bg-red-600/20 border-2 border-red-500 text-red-200 flex flex-col sm:flex-row items-center justify-between gap-4 glow-critical animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-black tracking-wider uppercase text-white">
                CRITICAL INDUSTRIAL HAZARD DECLARED — RED ZONE PROTOCOL ACTIVE
              </h3>
              <p className="text-xs text-red-300">
                Toxic vapor cloud dispersion intersects Zone A & Zone B. Immediate priority relocation in progress.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenEmergencyModal}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shadow-lg shadow-red-600/40"
          >
            Execute Emergency SOP
          </button>
        </div>
      )}

      {/* 6 Key Stat Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel p-3">
          <span className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Hazard Risk Score</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono ${isCritical ? 'text-red-400' : 'text-cyan-400'}`}>
              {currentStage.riskScore}%
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            {currentStage.hazardLevel} Severity
          </span>
        </div>

        <div className="glass-panel p-3">
          <span className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Red Zones Active</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono ${redZonesCount > 0 ? 'text-red-400 font-black' : 'text-emerald-400'}`}>
              {redZonesCount}
            </span>
            <span className="text-xs text-gray-400">/ 6 Sectors</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            {redZonesCount > 0 ? 'Breach Detected' : 'All Clear'}
          </span>
        </div>

        <div className="glass-panel p-3">
          <span className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Population At Risk</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono ${affectedPopulation > 0 ? 'text-amber-400' : 'text-gray-200'}`}>
              {affectedPopulation.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">pax</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            Downwind Corridor
          </span>
        </div>

        <div className="glass-panel p-3">
          <span className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Toxic Gas (ppm)</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono ${currentStage.gas_ppm > 300 ? 'text-red-400' : 'text-cyan-400'}`}>
              {currentStage.gas_ppm}
            </span>
            <span className="text-xs text-gray-400">ppm</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            Limit: &le; 250 ppm
          </span>
        </div>

        <div className="glass-panel p-3">
          <span className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Core Vessel Temp</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono ${currentStage.temperature > 70 ? 'text-red-400' : 'text-cyan-400'}`}>
              {currentStage.temperature}
            </span>
            <span className="text-xs text-gray-400">°C</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            Limit: &le; 50°C
          </span>
        </div>

        <div className="glass-panel p-3">
          <span className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Feedline Pressure</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono ${currentStage.pressure > 7 ? 'text-red-400' : 'text-cyan-400'}`}>
              {currentStage.pressure}
            </span>
            <span className="text-xs text-gray-400">bar</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            Limit: &le; 6.0 bar
          </span>
        </div>
      </div>

      {/* Main Row: Risk Gauge + Risk Chart + Live Threat Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 glass-panel p-5 flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-white mb-2 self-start flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400" />
            Composite Hazard Gauge
          </h3>
          <RiskGauge score={currentStage.riskScore} size={200} />
          <p className="text-xs text-gray-400 text-center mt-3 max-w-xs leading-relaxed">
            Multi-factor weighting: Gas (35%) + Temp (25%) + Pressure (20%) + Plume Vector (20%)
          </p>
        </div>

        <div className="lg:col-span-8 glass-panel p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Risk Escalation & ML Forecast Timeline
            </h3>
            <span className="text-xs text-gray-400 font-mono">Live Ingestion: 100ms</span>
          </div>
          <RiskChart currentRisk={currentStage.riskScore} />
        </div>
      </div>

      {/* GIS Map & AI Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <HazardMap
            zones={zones}
            currentStage={currentStage}
            windDirection={currentStage.wind_direction}
            windSpeed={currentStage.wind_speed}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <AIExplanation currentStage={currentStage} currentRisk={currentStage.riskScore} />
          <AlertPanel alerts={alerts} />
        </div>
      </div>

      {/* Live Sensors Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Active Industrial IoT Sensors (9 Channels)
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sensors.map((sensor) => {
            // Apply current stage dynamic values
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
    </div>
  );
}

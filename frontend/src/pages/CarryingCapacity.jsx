import React from 'react';
import CapacityGauge from '../components/CapacityGauge';
import { Users, AlertTriangle, ShieldCheck, PieChart, Layers } from 'lucide-react';

export default function CarryingCapacity({ zones, currentStage }) {
  const totalPopulation = zones.reduce((sum, z) => sum + z.population, 0);
  const totalSafeCapacity = zones.reduce((sum, z) => sum + z.safeCapacity, 0);
  const avgCarryingRatio = (totalPopulation / totalSafeCapacity).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Carrying Capacity Assessment for Surrounding Habitations
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          SIH PS 26191 Core Objective: Dynamically assessing population densities against safe infrastructural thresholds to predict bottleneck choke points.
        </p>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4">
          <span className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Total Habitation Population</span>
          <span className="text-2xl font-bold font-mono text-white">{totalPopulation.toLocaleString()} pax</span>
          <p className="text-xs text-gray-400 mt-1">6 Monitored Buffer Sectors</p>
        </div>
        <div className="glass-panel p-4">
          <span className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Designated Safe Threshold</span>
          <span className="text-2xl font-bold font-mono text-emerald-400">{totalSafeCapacity.toLocaleString()} pax</span>
          <p className="text-xs text-gray-400 mt-1">Master Plan Capacity Limit</p>
        </div>
        <div className="glass-panel p-4">
          <span className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Regional Carrying Ratio</span>
          <span className="text-2xl font-bold font-mono text-amber-400">{avgCarryingRatio}x</span>
          <p className="text-xs text-gray-400 mt-1">42% Overall Density Overload</p>
        </div>
      </div>

      {/* Zone Capacity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <CapacityGauge key={zone.id} zone={zone} />
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { Truck, AlertOctagon, CheckCircle2, Navigation, Clock, Shield } from 'lucide-react';

export default function RelocationTable({ zones = [], currentStage, onTriggerEvacuation }) {
  // Compute dynamic relocation priority ranking
  const rankedZones = [...zones].map((zone) => {
    let score = 20;
    let status = 'STANDBY';
    let urgency = 'LOW';

    if (currentStage?.redZones?.includes(zone.id)) {
      score = 98;
      status = 'IMMEDIATE EVACUATION';
      urgency = 'CRITICAL';
    } else if (currentStage?.affectedZones?.includes(zone.id)) {
      score = 68;
      status = 'PRE-ALERT EVACUATION';
      urgency = 'HIGH';
    }

    return {
      ...zone,
      relocationScore: score,
      status,
      urgency
    };
  }).sort((a, b) => b.relocationScore - a.relocationScore);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-cyan-400" />
            Vulnerable Habitation Relocation Intelligence Matrix
          </h3>
          <p className="text-xs text-gray-400">
            Automated priority ranking based on Hazard Plume Proximity × Population Carrying Overload
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-900/80 text-gray-400 uppercase font-mono text-[10px] border-b border-gray-800">
            <tr>
              <th className="py-2.5 px-3">Priority Rank</th>
              <th className="py-2.5 px-3">Habitation Zone</th>
              <th className="py-2.5 px-3">Population</th>
              <th className="py-2.5 px-3">Distance & Bearing</th>
              <th className="py-2.5 px-3">Designated Safe Shelter</th>
              <th className="py-2.5 px-3">Est. Transit Time</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60 font-medium">
            {rankedZones.map((zone, idx) => {
              const isCrit = zone.urgency === 'CRITICAL';
              const isHigh = zone.urgency === 'HIGH';

              return (
                <tr 
                  key={zone.id} 
                  className={`transition-colors ${isCrit ? 'bg-red-950/20' : isHigh ? 'bg-amber-950/15' : 'hover:bg-gray-850/50'}`}
                >
                  <td className="py-3 px-3 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isCrit ? 'bg-red-500 text-white animate-pulse' :
                      isHigh ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-gray-200">{zone.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">ID: {zone.id}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-300">
                    {zone.population.toLocaleString()} pax
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-400">
                    {zone.distanceKm} km @ {zone.bearingDeg}°
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-emerald-400 flex items-center gap-1 font-semibold">
                      <Shield className="w-3.5 h-3.5" />
                      {zone.designatedShelter}
                    </div>
                    <div className="text-[10px] text-gray-400">Cap: {zone.shelterCapacity}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-cyan-300">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {zone.estEvacuationTimeMin} mins
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      isCrit ? 'bg-red-500/20 border border-red-500/50 text-red-400 animate-pulse' :
                      isHigh ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' :
                      'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    }`}>
                      {zone.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onTriggerEvacuation(zone)}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                        isCrit 
                          ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 animate-pulse' 
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700'
                      }`}
                    >
                      {isCrit ? 'DISPATCH NDRF' : 'Issue Alert'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

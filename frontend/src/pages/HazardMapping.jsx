import React from 'react';
import HazardMap from '../components/HazardMap';
import { Map, Wind, ShieldAlert, Compass, Navigation } from 'lucide-react';

export default function HazardMapping({ zones, currentStage }) {
  const downwindBearing = (currentStage.wind_direction + 180) % 360;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-cyan-400" />
            GIS Hazard-Based Red Zone & Atmospheric Dispersion
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time chemical gas cloud propagation model factoring wind velocity, azimuth, and population habitations.
          </p>
        </div>

        {/* Meteorological Quick Card */}
        <div className="flex items-center gap-3 bg-gray-900/80 border border-gray-700 px-3 py-2 rounded-lg text-xs">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Wind className="w-4 h-4" />
            <span className="font-mono">{currentStage.wind_speed} km/h</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-300">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-mono">{currentStage.wind_direction}° (Plume &rarr; {downwindBearing}°)</span>
          </div>
        </div>
      </div>

      {/* GIS Leaflet Map Container */}
      <HazardMap
        zones={zones}
        currentStage={currentStage}
        windDirection={currentStage.wind_direction}
        windSpeed={currentStage.wind_speed}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Circle, 
  Polygon, 
  Marker, 
  Popup, 
  Tooltip 
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { PLANT_ORIGIN } from '../data/mockData';
import { Shield, Wind, Users, AlertTriangle, Home, Building2 } from 'lucide-react';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Plant Icon
const plantIcon = new L.DivIcon({
  className: 'custom-plant-icon',
  html: `<div style="background:#06b6d4;width:24px;height:24px;border-radius:50%;border:3px solid #ffffff;box-shadow:0 0 15px #06b6d4;display:flex;align-items:center;justify-content:center;">
          <div style="background:#0a0e17;width:8px;height:8px;border-radius:50%;"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Custom Shelter Icon
const shelterIcon = new L.DivIcon({
  className: 'custom-shelter-icon',
  html: `<div style="background:#10b981;width:18px;height:18px;border-radius:4px;border:2px solid #ffffff;box-shadow:0 0 10px #10b981;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

export default function HazardMap({ zones = [], currentStage, windDirection = 60, windSpeed = 12 }) {
  const [activeZone, setActiveZone] = useState(null);

  // Center coordinate
  const center = [PLANT_ORIGIN.lat, PLANT_ORIGIN.lng];

  // Calculate plume dispersion cone polygon based on wind vector
  const generatePlumePolygon = (originLat, originLng, windDeg, radiusMeters) => {
    // Plume flows downwind (opposite to meteorological wind source vector)
    const downwindBearing = (windDeg + 180) % 360;
    const spreadAngle = 45; // 45 degree dispersion cone
    
    const deg2rad = Math.PI / 180;
    const latOffset = (radiusMeters / 111320);
    const lngOffset = (radiusMeters / (111320 * Math.cos(originLat * deg2rad)));

    const leftAngle = (downwindBearing - spreadAngle / 2) * deg2rad;
    const rightAngle = (downwindBearing + spreadAngle / 2) * deg2rad;
    const centerAngle = downwindBearing * deg2rad;

    return [
      [originLat, originLng],
      [originLat + latOffset * Math.cos(leftAngle), originLng + lngOffset * Math.sin(leftAngle)],
      [originLat + (latOffset * 1.2) * Math.cos(centerAngle), originLng + (lngOffset * 1.2) * Math.sin(centerAngle)],
      [originLat + latOffset * Math.cos(rightAngle), originLng + lngOffset * Math.sin(rightAngle)],
    ];
  };

  const plumeRadius = (currentStage?.hazardPlumeRadiusKm || 0.3) * 1000;
  const plumeCone = generatePlumePolygon(center[0], center[1], windDirection, plumeRadius);

  const getZoneColor = (zone) => {
    if (currentStage?.redZones?.includes(zone.id)) {
      return { fill: '#ef4444', stroke: '#b91c1c', opacity: 0.7, label: 'RED ZONE' };
    }
    if (currentStage?.affectedZones?.includes(zone.id)) {
      return { fill: '#f59e0b', stroke: '#d97706', opacity: 0.5, label: 'ORANGE WATCH' };
    }
    return { fill: '#10b981', stroke: '#059669', opacity: 0.25, label: 'GREEN SAFE' };
  };

  return (
    <div className="glass-panel p-4 relative overflow-hidden flex flex-col h-[520px]">
      {/* Map Header Overlay */}
      <div className="flex items-center justify-between mb-3 z-10">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            GIS Hazard Dispersion & Vulnerable Habitations
          </h3>
          <span className="text-[11px] text-gray-400">
            Real-time Plume Cone • Wind: {windSpeed} km/h @ {windDirection}° (Downwind: {(windDirection + 180) % 360}°)
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-gray-900/90 border border-gray-700 px-3 py-1.5 rounded-lg">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-gray-300 font-mono text-[10px]">Red Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-gray-300 font-mono text-[10px]">Warning Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-gray-300 font-mono text-[10px]">Safe Zone</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-400"></div>
            <span className="text-gray-300 font-mono text-[10px]">Shelters</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 rounded-lg overflow-hidden border border-[var(--border-color)] relative">
        <MapContainer
          center={center}
          zoom={14}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Dark Mode CartoDB TileLayer */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Plant Epicenter Marker */}
          <Marker position={center} icon={plantIcon}>
            <Popup>
              <div className="p-1 text-xs">
                <strong className="text-cyan-400">{PLANT_ORIGIN.name}</strong>
                <p className="text-gray-300 mt-1">Chemical Hazard Source Node</p>
                <p className="text-gray-400 font-mono">Lat: {center[0]} | Lng: {center[1]}</p>
              </div>
            </Popup>
          </Marker>

          {/* Dynamic Plume Dispersion Cone */}
          {currentStage?.stage > 0 && (
            <Polygon
              positions={plumeCone}
              pathOptions={{
                color: currentStage.riskScore > 50 ? '#ef4444' : '#f59e0b',
                fillColor: currentStage.riskScore > 50 ? '#ef4444' : '#f59e0b',
                fillOpacity: 0.35,
                weight: 2,
                dashArray: '4, 4'
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-mono">
                  <strong>Active Dispersion Plume</strong><br />
                  Radius: {(plumeRadius / 1000).toFixed(2)} km<br />
                  Risk Intensity: {currentStage.riskScore}%
                </div>
              </Tooltip>
            </Polygon>
          )}

          {/* Population Habitation Zones */}
          {zones.map((zone) => {
            const styling = getZoneColor(zone);
            return (
              <React.Fragment key={zone.id}>
                {/* Habitation Area Circle */}
                <Circle
                  center={[zone.lat, zone.lng]}
                  radius={zone.population > 2000 ? 380 : 250}
                  pathOptions={{
                    color: styling.stroke,
                    fillColor: styling.fill,
                    fillOpacity: styling.opacity,
                    weight: 2
                  }}
                  eventHandlers={{
                    click: () => setActiveZone(zone)
                  }}
                >
                  <Tooltip permanent direction="center" className="zone-map-label">
                    <span className="text-[10px] font-bold text-white px-1 rounded bg-black/60">
                      {zone.name.split('-')[0]}
                    </span>
                  </Tooltip>
                </Circle>

                {/* Safe Shelter Node Marker */}
                <Marker 
                  position={[zone.lat + 0.003, zone.lng + 0.003]} 
                  icon={shelterIcon}
                >
                  <Popup>
                    <div className="p-1 text-xs">
                      <strong className="text-emerald-400">{zone.designatedShelter}</strong>
                      <p className="text-gray-300">Capacity: {zone.shelterCapacity} persons</p>
                      <p className="text-gray-400">Route: {zone.evacuationRoute}</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

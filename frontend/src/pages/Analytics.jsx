import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { BarChart3, TrendingUp, Calendar, Filter } from 'lucide-react';

export default function Analytics({ currentStage }) {
  const [timeRange, setTimeRange] = useState('24h');

  const multiSensorTrend = [
    { time: '00:00', gas: 130, temp: 35, pressure: 4.5, risk: 15 },
    { time: '04:00', gas: 135, temp: 36, pressure: 4.6, risk: 16 },
    { time: '08:00', gas: 145, temp: 38, pressure: 4.8, risk: 18 },
    { time: '12:00', gas: 180, temp: 44, pressure: 5.2, risk: 32 },
    { time: '16:00', gas: currentStage.gas_ppm, temp: currentStage.temperature, pressure: currentStage.pressure * 10, risk: currentStage.riskScore },
    { time: '20:00 (Proj)', gas: Math.min(600, currentStage.gas_ppm * 1.1), temp: Math.min(100, currentStage.temperature * 1.05), pressure: currentStage.pressure * 10, risk: Math.min(100, currentStage.riskScore * 1.1) },
  ];

  const zoneVulnerabilityComparison = [
    { zone: 'Zone A', population: 2800, capacity: 1500, riskIndex: currentStage.redZones?.includes('ZONE-A') ? 95 : 30 },
    { zone: 'Zone B', population: 3450, capacity: 2000, riskIndex: currentStage.redZones?.includes('ZONE-B') ? 90 : 35 },
    { zone: 'Zone C', population: 860, capacity: 700, riskIndex: 20 },
    { zone: 'Zone D', population: 1240, capacity: 800, riskIndex: 18 },
    { zone: 'Zone E', population: 1950, capacity: 1800, riskIndex: 15 },
    { zone: 'Zone F', population: 420, capacity: 400, riskIndex: currentStage.affectedZones?.includes('ZONE-F') ? 65 : 25 },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Cross-Correlation Industrial Telemetry Analytics
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Multi-variate regression and historical trend analysis detecting coupled thermal-pressure runaway conditions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['1h', '6h', '24h', '7d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                timeRange === range
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Multi Sensor Trend Chart */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Multi-Sensor Cross-Variable Correlation (Gas vs Temp vs Hazard Risk)
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={multiSensorTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
              <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f3f4f6'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="risk" name="Hazard Risk Index (%)" stroke="#ef4444" strokeWidth={3} />
              <Line type="monotone" dataKey="gas" name="Gas Concentration (ppm)" stroke="#06b6d4" strokeWidth={2} />
              <Line type="monotone" dataKey="temp" name="Core Vessel Temp (°C)" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Population Density vs Risk Distribution */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white mb-4">
          Habitation Sector Carrying Overload vs Risk Index
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneVulnerabilityComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
              <XAxis dataKey="zone" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f3f4f6'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="population" name="Total Population" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="capacity" name="Safe Carrying Capacity" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="riskIndex" name="Calculated Risk Score (%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';

export default function RiskChart({ currentRisk = 18 }) {
  // Generate a dynamic timeline based on current risk score
  const generateTimeline = (risk) => {
    const points = [];
    const base = Math.max(10, risk * 0.3);
    const times = ['-25m', '-20m', '-15m', '-10m', '-5m', 'NOW', '+5m (Pred)', '+10m (Pred)', '+15m (Pred)'];
    
    times.forEach((time, i) => {
      let val;
      if (i < 5) {
        // Historical values
        val = Math.round(base + (risk - base) * (i / 5) * 0.85);
      } else if (i === 5) {
        // Current value
        val = risk;
      } else {
        // Projected trend
        const multiplier = risk > 50 ? 1.15 : 1.02;
        val = Math.min(100, Math.round(risk * Math.pow(multiplier, i - 5)));
      }
      points.push({ time, riskScore: val, safetyThreshold: 60 });
    });
    return points;
  };

  const data = generateTimeline(currentRisk);

  return (
    <div className="w-full h-64 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={currentRisk > 50 ? '#ef4444' : '#06b6d4'} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={currentRisk > 50 ? '#ef4444' : '#06b6d4'} stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af" 
            fontSize={11} 
            tickLine={false}
          />
          <YAxis 
            stroke="#9ca3af" 
            fontSize={11} 
            domain={[0, 100]} 
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#111827', 
              borderColor: '#374151', 
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f3f4f6'
            }} 
            formatter={(value) => [`${value}%`, 'Hazard Risk Index']}
          />
          <ReferenceLine 
            y={60} 
            stroke="#f59e0b" 
            strokeDasharray="4 4" 
            label={{ value: 'Warning Threshold (60%)', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} 
          />
          <ReferenceLine 
            y={80} 
            stroke="#ef4444" 
            strokeDasharray="4 4" 
            label={{ value: 'Critical Red Zone (80%)', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} 
          />
          <Area 
            type="monotone" 
            dataKey="riskScore" 
            stroke={currentRisk > 50 ? '#ef4444' : '#06b6d4'} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#riskGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

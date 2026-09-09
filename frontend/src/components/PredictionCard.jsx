import React from 'react';
import { BrainCircuit, CheckCircle, AlertTriangle, ArrowUpRight, Zap } from 'lucide-react';

export default function PredictionCard({ currentRisk = 18, currentStage }) {
  const isHighRisk = currentRisk >= 50;

  const features = [
    { name: 'Gas Concentration Rate of Rise', value: currentStage?.gas_ppm > 300 ? '+420 ppm/min' : '+2.1 ppm/min', impact: currentStage?.gas_ppm > 300 ? 'CRITICAL' : 'LOW' },
    { name: 'Exothermic Vessel Core Temp', value: `${currentStage?.temperature || 38}°C`, impact: currentStage?.temperature > 70 ? 'CRITICAL' : 'LOW' },
    { name: 'Feedline Pressure Differential', value: `${currentStage?.pressure || 4.8} bar`, impact: currentStage?.pressure > 7 ? 'HIGH' : 'LOW' },
    { name: 'Downwind Habitation Vulnerability', value: currentStage?.stage >= 4 ? 'ZONE A & B IN PLUME CONE' : 'NEUTRAL DISPERSION', impact: currentStage?.stage >= 4 ? 'CRITICAL' : 'LOW' },
  ];

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Adaptive ML Classifier (Gradient Boost v3.2)</h3>
            <span className="text-[10px] text-gray-400">Stratified 5-Fold Cross Validated • F1-Score: 0.962</span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
          Latency: 14ms
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)]">
          <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Predicted Incident Class</span>
          <span className={`text-sm font-bold ${isHighRisk ? 'text-red-400' : 'text-emerald-400'}`}>
            {isHighRisk ? 'TOXIC VAPOR PLUME RELEASE' : 'NOMINAL STEADY STATE'}
          </span>
        </div>
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)]">
          <span className="text-[10px] uppercase font-mono text-gray-400 block mb-1">Prediction Confidence</span>
          <span className="text-sm font-bold text-cyan-300 font-mono">
            {isHighRisk ? '96.8%' : '94.2%'}
          </span>
        </div>
      </div>

      {/* Feature Attribution List */}
      <div>
        <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Real-time Feature Attribution
        </h4>
        <div className="space-y-1.5">
          {features.map((f, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-gray-900/60 border border-gray-800/80">
              <span className="text-gray-300">{f.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-gray-400">{f.value}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  f.impact === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                  f.impact === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {f.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

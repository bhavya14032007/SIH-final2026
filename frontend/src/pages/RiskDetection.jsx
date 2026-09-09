import React from 'react';
import RiskGauge from '../components/RiskGauge';
import RiskChart from '../components/RiskChart';
import PredictionCard from '../components/PredictionCard';
import { AlertTriangle, BrainCircuit, BarChart2, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function RiskDetection({ currentStage }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Multi-Factor Hazard Prediction & Anomaly Engine
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Combines Gradient Boost ML classification, CPCB statutory thresholds, and dynamic plume physics.
        </p>
      </div>

      {/* Top Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 glass-panel p-5 flex flex-col items-center justify-center">
          <RiskGauge score={currentStage.riskScore} size={220} />
          <div className="mt-4 w-full space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-gray-900/60 border border-gray-800">
              <span className="text-gray-400">Current Hazard State</span>
              <span className="font-bold text-cyan-300">{currentStage.hazardLevel}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-gray-900/60 border border-gray-800">
              <span className="text-gray-400">Confidence Interval</span>
              <span className="font-mono text-emerald-400">95% (±1.8%)</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <PredictionCard currentRisk={currentStage.riskScore} currentStage={currentStage} />
        </div>
      </div>

      {/* Historical vs Predicted Risk Curve */}
      <div className="glass-panel p-5">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          Historical vs Predicted Hazard Escalation Trajectory
        </h3>
        <RiskChart currentRisk={currentStage.riskScore} />
      </div>
    </div>
  );
}

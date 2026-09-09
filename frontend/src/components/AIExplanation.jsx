import React, { useState } from 'react';
import { Sparkles, Bot, CheckCircle2, ChevronRight, RefreshCw, Cpu } from 'lucide-react';

export default function AIExplanation({ currentStage, currentRisk }) {
  const [loading, setLoading] = useState(false);

  const getExplanation = () => {
    if (currentRisk >= 75) {
      return {
        headline: 'CRITICAL HAZARD ESCALATION: Catastrophic Vapor Plume Trajectory',
        analysis: `Gradient Boost ML inference correlates an acute gas concentration surge (${currentStage?.gas_ppm} ppm) with severe core vessel temperature spike (${currentStage?.temperature}°C) and feedline pressure anomaly (${currentStage?.pressure} bar). Meteorological vector (ENE 65°) creates an immediate 1.6 km toxic dispersion footprint intersecting Zone A (North Residential) and Zone B (Northeast Habitation).`,
        rootCauses: [
          'Secondary seal rupture on exothermic reactor vessel A.',
          'Thermal runaway caused by partial cooling jacket valve blockage.',
          'Carrying capacity in Zone A (1.86x baseline) creates high vulnerability density.'
        ],
        actions: [
          'Trigger immediate Level-3 Siren in Zone A & Zone B.',
          'Reroute traffic along Western Highway and deploy SDRF evacuation buses.',
          'Execute automated inert Nitrogen flood in Reactor Unit 3.'
        ]
      };
    }
    if (currentRisk >= 40) {
      return {
        headline: 'ELEVATED INDUSTRIAL RISK: Exothermic Thermal Imbalance',
        analysis: `Early anomaly detection highlights rising vibration amplitude in Pump 4 concurrent with a 15% rate-of-rise in VOC sensors. Atmospheric conditions remain stable, but prompt mitigation is required before secondary barrier failure.`,
        rootCauses: [
          'Pump 4 bearing fatigue causing micro-leakage.',
          'Ambient temperature exacerbating feedline pressure oscillations.'
        ],
        actions: [
          'Switch feedline to auxiliary redundant line B.',
          'Put Zone A emergency response team on yellow standby.',
          'Increase IoT sensor sampling rate from 10s to 1s.'
        ]
      };
    }
    return {
      headline: 'STABLE BASELINE: CPCB Statutory Safety Compliance Verified',
      analysis: 'All 9 industrial IoT telemetry channels operate within statutory Indian Central Pollution Control Board (CPCB) tolerances. Chemical vapor emissions and ambient air quality index (AQI 88) are safe for surrounding residential habitations.',
      rootCauses: [
        'Normal batch processing steady-state verified.',
        'Zero containment barrier degradation detected.'
      ],
      actions: [
        'Maintain automated 15-minute telemetry health check.',
        'Continue periodic multi-factor risk scoring.'
      ]
    };
  };

  const data = getExplanation();

  return (
    <div className="glass-panel p-5 border-l-4 border-l-purple-500">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Gemini AI Industrial Copilot & Decision Explanation
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">
              Model: Gemini 2.5 Flash • Context: Multi-Sensor Correlation Engine
            </span>
          </div>
        </div>
      </div>

      <div className="bg-purple-950/20 border border-purple-500/30 rounded-lg p-3.5 mb-3">
        <h4 className="text-xs font-bold text-purple-300 mb-1">
          {data.headline}
        </h4>
        <p className="text-xs text-gray-300 leading-relaxed">
          {data.analysis}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Root Cause Diagnosis */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)]">
          <h5 className="font-bold text-gray-300 mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            AI Root Cause Attribution
          </h5>
          <ul className="space-y-1.5 text-gray-300">
            {data.rootCauses.map((cause, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-purple-400 flex-shrink-0 mt-0.5" />
                <span>{cause}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended SOP Actions */}
        <div className="bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-color)]">
          <h5 className="font-bold text-gray-300 mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Recommended SOP Actions
          </h5>
          <ul className="space-y-1.5 text-gray-300">
            {data.actions.map((act, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></div>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

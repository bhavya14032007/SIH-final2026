import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function AlertPanel({ alerts = [] }) {
  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return {
          icon: ShieldAlert,
          bg: 'bg-red-500/10 border-red-500/40 text-red-400',
          dot: 'bg-red-500 animate-ping'
        };
      case 'HIGH':
        return {
          icon: AlertTriangle,
          bg: 'bg-orange-500/10 border-orange-500/40 text-orange-400',
          dot: 'bg-orange-500'
        };
      case 'MODERATE':
        return {
          icon: AlertCircle,
          bg: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
          dot: 'bg-amber-500'
        };
      default:
        return {
          icon: Info,
          bg: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400',
          dot: 'bg-cyan-500'
        };
    }
  };

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-cyan-400" />
          Live Threat & Incident Log
        </h3>
        <span className="text-xs text-gray-400 font-mono">
          {alerts.length} Events Active
        </span>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {alerts.map((alert) => {
          const config = getSeverityBadge(alert.severity);
          const Icon = config.icon;
          return (
            <div 
              key={alert.id}
              className={`p-3 rounded-lg border flex items-start gap-3 transition-all ${config.bg}`}
            >
              <div className="relative mt-0.5">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {alert.type} • {alert.severity}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {alert.timestamp}
                  </span>
                </div>
                <p className="text-xs text-gray-200 leading-snug">
                  {alert.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

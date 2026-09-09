import React from 'react';
import { HeartPulse, CheckCircle2, Server, Cpu, Database, Sparkles, Activity } from 'lucide-react';

export default function SystemHealth() {
  const services = [
    { name: 'Flask REST API Microservice', status: 'HEALTHY', latency: '12ms', uptime: '99.98%', icon: Server },
    { name: 'Gradient Boost ML Inference Engine', status: 'HEALTHY', latency: '14ms', uptime: '100%', icon: Cpu },
    { name: 'Gemini 2.5 AI Reasoning Copilot', status: 'READY', latency: '240ms', uptime: '99.95%', icon: Sparkles },
    { name: 'SQLite / PostgreSQL Telemetry DB', status: 'HEALTHY', latency: '4ms', uptime: '100%', icon: Database },
    { name: 'LoRaWAN Industrial IoT Ingestion Mesh', status: 'HEALTHY', latency: '28ms', uptime: '99.99%', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-emerald-400" />
          System Diagnostics & Architecture Infrastructure
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Real-time health monitoring of microservices, ML model inference latency, and database transaction performance.
        </p>
      </div>

      <div className="space-y-3">
        {services.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{s.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-mono mt-0.5">
                    <span>Latency: {s.latency}</span>
                    <span>•</span>
                    <span>Uptime: {s.uptime}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {s.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

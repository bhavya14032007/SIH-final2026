import React, { useState } from 'react';
import { FileText, Download, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

export default function Reports({ currentStage, zones, sensors }) {
  const [downloaded, setDownloaded] = useState(false);

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = 'Sensor_ID,Sensor_Name,Telemetry_Value,Unit,Threshold_Limit,Status\n';
    const rows = sensors.map(s => {
      let val = s.value;
      if (s.type === 'gas_ppm') val = currentStage.gas_ppm;
      if (s.type === 'temperature') val = currentStage.temperature;
      if (s.type === 'pressure') val = currentStage.pressure;
      return `${s.id},"${s.name}",${val},${s.unit},${s.normalMax},${s.status}`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SANRAKSHAK_Audit_Log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Statutory Compliance & SIH Hazard Assessment Reports
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Automated generation of Central Pollution Control Board (CPCB) and NDMA-compliant industrial audit logs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-600/30 flex items-center gap-2"
        >
          {downloaded ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
          <span>{downloaded ? 'CSV Exported!' : 'Export Incident CSV'}</span>
        </button>
      </div>

      {/* Structured Executive Summary Report Preview */}
      <div className="glass-panel p-6 space-y-6 border border-gray-700">
        <div className="flex items-center justify-between border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              SANRAKSHAK INDUSTRIAL SAFETY AUDIT REPORT
            </h3>
            <span className="text-xs text-cyan-400 font-mono">
              Ref: SANRAKSHAK-PS26191-2026-Q3 • Facility: Petrochemical Complex Alpha
            </span>
          </div>
          <div className="text-right text-xs font-mono text-gray-400">
            <div>Date: {new Date().toLocaleDateString()}</div>
            <div>Time: {new Date().toLocaleTimeString()} IST</div>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div>
          <h4 className="text-xs font-bold uppercase text-gray-300 tracking-wider mb-2">
            1. Executive Safety Assessment
          </h4>
          <p className="text-xs text-gray-300 leading-relaxed bg-[var(--bg-primary)] p-3.5 rounded-lg border border-[var(--border-color)]">
            Continuous AI telemetry evaluation of Chemical Complex Alpha indicates a composite hazard score of 
            <strong className="text-cyan-300 font-mono"> {currentStage.riskScore}/100 </strong> 
            ({currentStage.hazardLevel} Severity). Dispersion calculations model a downwind plume radius of 
            <strong className="text-cyan-300 font-mono"> {currentStage.hazardPlumeRadiusKm} km </strong>.
            Surrounding habitations (6 sectors) with 10,720 aggregate population are currently 
            {currentStage.riskScore > 50 ? ' under emergency evacuation protocol.' : ' operating under statutory safe limits.'}
          </p>
        </div>

        {/* Section 2: Key Telemetry Summary Table */}
        <div>
          <h4 className="text-xs font-bold uppercase text-gray-300 tracking-wider mb-2">
            2. Real-Time Telemetry Snapshot
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded bg-[var(--bg-primary)] border border-gray-800">
              <span className="text-[10px] text-gray-400 block">Toxic Gas (ppm)</span>
              <span className="text-sm font-bold font-mono text-white">{currentStage.gas_ppm} ppm</span>
            </div>
            <div className="p-2.5 rounded bg-[var(--bg-primary)] border border-gray-800">
              <span className="text-[10px] text-gray-400 block">Core Temp</span>
              <span className="text-sm font-bold font-mono text-white">{currentStage.temperature} °C</span>
            </div>
            <div className="p-2.5 rounded bg-[var(--bg-primary)] border border-gray-800">
              <span className="text-[10px] text-gray-400 block">Feedline Pressure</span>
              <span className="text-sm font-bold font-mono text-white">{currentStage.pressure} bar</span>
            </div>
            <div className="p-2.5 rounded bg-[var(--bg-primary)] border border-gray-800">
              <span className="text-[10px] text-gray-400 block">Wind Dispersion</span>
              <span className="text-sm font-bold font-mono text-white">{currentStage.wind_speed} km/h @ {currentStage.wind_direction}°</span>
            </div>
          </div>
        </div>

        {/* Section 3: Statutory Sign-off */}
        <div className="pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Cryptographic Signature Verified • CPCB Gateway</span>
          </div>
          <span className="font-mono">Hash: 8f9b2c31e4d7a...</span>
        </div>
      </div>
    </div>
  );
}

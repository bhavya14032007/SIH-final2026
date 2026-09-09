import React, { useState } from 'react';
import { 
  Radio, 
  Volume2, 
  Bell, 
  ShieldAlert, 
  Send, 
  CheckCircle2, 
  Users, 
  PhoneCall, 
  Flame, 
  Lock 
} from 'lucide-react';

export default function CommandCenter({ currentStage, onOpenEmergencyModal }) {
  const [broadcastLog, setBroadcastLog] = useState([
    { id: 1, time: '10:32 AM', channel: 'NDRF 5th Bn', status: 'ACKNOWLEDGED', message: 'Team Alpha standing by for deployment' },
    { id: 2, time: '10:15 AM', channel: 'District Disaster Control Room', status: 'ACKNOWLEDGED', message: 'Hospital surge beds on standby' },
    { id: 3, time: '09:45 AM', channel: 'CPCB Automated Portal', status: 'SENT', message: 'Routine hourly telemetry sync completed' }
  ]);

  const [customMsg, setCustomMsg] = useState('');

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!customMsg.trim()) return;

    setBroadcastLog([
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'Emergency Mass Alert (CAP)',
        status: 'BROADCASTING',
        message: customMsg
      },
      ...broadcastLog
    ]);
    setCustomMsg('');
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-400 animate-pulse" />
            Emergency Operations & Incident Command Center
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Unified tactical response console for Plant Safety Officers, District Magistrates, and NDRF Incident Commanders.
          </p>
        </div>

        <button
          onClick={onOpenEmergencyModal}
          className="px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-600/40 flex items-center gap-2 animate-hazard-pulse"
        >
          <ShieldAlert className="w-4 h-4" />
          Authorize Level-3 Emergency
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Tactical Action Triggers */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Automated Containment Interlocks
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/80 border border-gray-800">
                <div>
                  <span className="font-bold text-gray-200 block">Reactor Isolation Valves</span>
                  <span className="text-[10px] text-gray-400">Emergency auto-close in 1.2s</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold">
                  ARMED
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/80 border border-gray-800">
                <div>
                  <span className="font-bold text-gray-200 block">Nitrogen Deluge Scrubber</span>
                  <span className="text-[10px] text-gray-400">Neutralizes toxic plume emissions</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 font-bold">
                  STANDBY
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/80 border border-gray-800">
                <div>
                  <span className="font-bold text-gray-200 block">Community Siren Array (120dB)</span>
                  <span className="text-[10px] text-gray-400">Covers 3.5km radius</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  currentStage.riskScore > 50 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-gray-800 text-gray-400'
                }`}>
                  {currentStage.riskScore > 50 ? 'ACTIVE' : 'READY'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Hotline Contacts */}
          <div className="glass-panel p-4">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              Emergency Response Hotlines
            </h3>
            <div className="space-y-1.5 text-xs text-gray-300 font-mono">
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span>NDRF Control Room (5th Bn)</span>
                <span className="text-cyan-400 font-bold">+91-22-2400-0108</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-800">
                <span>State Disaster Mgmt Authority (SDRF)</span>
                <span className="text-cyan-400 font-bold">1070 / 1077</span>
              </div>
              <div className="flex justify-between py-1">
                <span>District Magistrate Helpline</span>
                <span className="text-cyan-400 font-bold">+91-22-2266-1234</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Broadcast Log */}
        <div className="lg:col-span-7 glass-panel p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              Common Alerting Protocol (CAP) Broadcast Terminal
            </h3>

            {/* Broadcast history */}
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-1">
              {broadcastLog.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-gray-900/90 border border-gray-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-cyan-300">{log.channel}</span>
                    <span className="text-[10px] font-mono text-gray-400">{log.time}</span>
                  </div>
                  <p className="text-gray-200">{log.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Broadcast Composer */}
          <form onSubmit={handleSendBroadcast} className="pt-3 border-t border-gray-800 flex gap-2">
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              placeholder="Type urgent public notification or agency directive..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

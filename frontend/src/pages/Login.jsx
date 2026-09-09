import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, UserCheck, ArrowRight, KeyRound } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Plant Safety Officer');
  const [industryId, setIndustryId] = useState('IND-CHEM-ALPHA-01');
  const [password, setPassword] = useState('••••••••••••');

  const roles = [
    { title: 'Plant Safety Officer', badge: 'Facility Alpha', desc: 'Direct IoT sensor telemetry & containment control' },
    { title: 'NDRF Incident Commander', badge: '5th Battalion', desc: 'Evacuation coordination & tactical relocation dispatch' },
    { title: 'District Disaster Magistrate', badge: 'Kurla District', desc: 'Statutory Red Zone declaration & public alert authority' }
  ];

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 border border-cyan-500/30 glow-cyan relative">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white">SANRAKSHAK</h1>
          <p className="text-xs uppercase tracking-widest text-cyan-400 font-bold mt-1">
            Industrial Hazard Prediction & Early Warning
          </p>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-gray-800 text-gray-300 border border-gray-700">
            SIH Problem Statement 26191
          </span>
        </div>

        {/* Role Quick Selector */}
        <div className="mb-6 space-y-2">
          <label className="text-xs text-gray-400 font-semibold block uppercase tracking-wider">
            Select Operational Persona
          </label>
          <div className="space-y-1.5">
            {roles.map((r) => (
              <button
                key={r.title}
                type="button"
                onClick={() => setSelectedRole(r.title)}
                className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                  selectedRole === r.title
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-gray-900/60 border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="text-gray-200 font-semibold">{r.title}</div>
                  <div className="text-[10px] text-gray-400">{r.desc}</div>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-300 font-mono">
                  {r.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-gray-300 font-semibold block mb-1">
              Industrial Facility ID
            </label>
            <input
              type="text"
              value={industryId}
              onChange={(e) => setIndustryId(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-gray-300 font-semibold block mb-1">
              Security Authorization Token
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 mt-4"
          >
            <span>Access Command Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

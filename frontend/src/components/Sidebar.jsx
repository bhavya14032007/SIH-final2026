import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Activity, 
  AlertTriangle, 
  Map, 
  Users, 
  Truck, 
  Radio, 
  Cpu, 
  BarChart3, 
  FileText, 
  HeartPulse, 
  LogOut 
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/monitoring', label: 'Live Telemetry', icon: Activity },
  { path: '/risk-detection', label: 'Risk Detection', icon: AlertTriangle },
  { path: '/hazard-mapping', label: 'Hazard & Plume Map', icon: Map },
  { path: '/carrying-capacity', label: 'Carrying Capacity', icon: Users },
  { path: '/relocation', label: 'Relocation Intelligence', icon: Truck },
  { path: '/command-center', label: 'Command Center', icon: Radio },
  { path: '/sensors', label: 'IoT Sensor Nodes', icon: Cpu },
  { path: '/analytics', label: 'Incident Analytics', icon: BarChart3 },
  { path: '/reports', label: 'Compliance Reports', icon: FileText },
  { path: '/system-health', label: 'System & ML Health', icon: HeartPulse },
];

export default function Sidebar({ onOpenEmergencyModal }) {
  return (
    <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col justify-between h-screen sticky top-0 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-white">SANRAKSHAK</h1>
            <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-semibold block">
              SIH PS 26191 • AI HAZARD
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Emergency Action & User Footer */}
      <div className="p-4 border-t border-[var(--border-color)] space-y-3 bg-[var(--bg-primary)]/40">
        <button
          onClick={onOpenEmergencyModal}
          className="w-full py-2.5 px-3 rounded-lg bg-red-600/20 border border-red-500/50 hover:bg-red-600/30 text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer animate-hazard-pulse"
        >
          <AlertTriangle className="w-4 h-4" />
          Emergency Protocol
        </button>

        <div className="flex items-center justify-between pt-1 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>Plant Alpha • Online</span>
          </div>
          <NavLink to="/login" className="hover:text-cyan-400 p-1 rounded" title="Switch User / Logout">
            <LogOut className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </aside>
  );
}

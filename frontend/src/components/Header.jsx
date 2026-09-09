import React, { useState, useEffect } from 'react';
import { Bell, Flame, Wind, ShieldCheck, RefreshCw, Sun, Moon } from 'lucide-react';

export default function Header({ currentStage, onResetSimulation }) {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const getStatusBadge = () => {
    if (currentStage.riskScore >= 75) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/60 text-red-400 text-xs font-bold animate-pulse">
          <Flame className="w-3.5 h-3.5" />
          <span>STAGE {currentStage.stage}: RED ZONE HAZARD ({currentStage.riskScore}%)</span>
        </div>
      );
    }
    if (currentStage.riskScore >= 40) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/60 text-amber-400 text-xs font-bold">
          <Flame className="w-3.5 h-3.5" />
          <span>STAGE {currentStage.stage}: ELEVATED RISK ({currentStage.riskScore}%)</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-medium">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>STAGE {currentStage.stage}: STABLE BASELINE (Risk {currentStage.riskScore}%)</span>
      </div>
    );
  };

  return (
    <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-wide">
            Sanrakshak Petrochemical Complex Alpha
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Trombay-Kurla Industrial Corridor • PS 26191 Chemical Node
          </p>
        </div>
        <div className="hidden md:block">
          {getStatusBadge()}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-mono text-cyan-300">
          <span>{time} IST</span>
        </div>

        {/* Quick Reset Simulation */}
        <button
          onClick={onResetSimulation}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer border border-gray-700"
          title="Reset Simulation to Baseline"
          aria-label="Reset Simulation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer border border-gray-700"
          title="Toggle Light / Dark Mode"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button 
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer border border-gray-700"
            aria-label="Alerts"
          >
            <Bell className="w-4 h-4" />
          </button>
          {currentStage.riskScore > 30 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          )}
        </div>
      </div>
    </header>
  );
}

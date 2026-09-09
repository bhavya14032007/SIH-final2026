import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, Radio, CheckCircle, X, Volume2, Bell } from 'lucide-react';

export default function EmergencyModal({ isOpen, onClose, onConfirm, currentStage }) {
  const [sirenActive, setSirenActive] = useState(true);
  const [smsBroadcast, setSmsBroadcast] = useState(true);
  const [sdrfAlert, setSdrfAlert] = useState(true);
  const [executed, setExecuted] = useState(false);

  if (!isOpen) return null;

  const handleExecute = () => {
    setExecuted(true);
    setTimeout(() => {
      onConfirm({ sirenActive, smsBroadcast, sdrfAlert });
      setExecuted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-secondary)] border-2 border-red-500 rounded-xl max-w-lg w-full p-6 shadow-2xl glow-critical relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-red-600/20 border border-red-500 text-red-500 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-wide text-white uppercase">
              Emergency Protocol Activation
            </h3>
            <span className="text-xs text-red-400 font-mono font-bold">
              LEVEL 3 PROTOCOL • RED ZONE EVACUATION DIRECTIVE
            </span>
          </div>
        </div>

        <div className="bg-red-950/30 border border-red-500/40 rounded-lg p-3.5 mb-4 text-xs text-gray-200">
          <p className="font-semibold text-red-300 mb-1">
            Authorizing Immediate Relocation for Downwind Habitations:
          </p>
          <p className="font-mono text-gray-300">
            • Zone A - North Residential Colony (2,800 residents)<br />
            • Zone B - Northeast Habitation Sector (3,450 residents)
          </p>
        </div>

        {/* Action Checkboxes */}
        <div className="space-y-2.5 mb-6 text-xs">
          <label className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-primary)] border border-gray-700 cursor-pointer hover:border-cyan-500">
            <input
              type="checkbox"
              checked={sirenActive}
              onChange={(e) => setSirenActive(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
            />
            <div className="flex items-center gap-2 text-gray-200 font-semibold">
              <Volume2 className="w-4 h-4 text-red-400" />
              <span>Activate Multi-Tone Industrial Warning Sirens (120dB)</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-primary)] border border-gray-700 cursor-pointer hover:border-cyan-500">
            <input
              type="checkbox"
              checked={smsBroadcast}
              onChange={(e) => setSmsBroadcast(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
            />
            <div className="flex items-center gap-2 text-gray-200 font-semibold">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Send Geo-Targeted CAP Warning SMS to 6,250 Cell Devices</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-primary)] border border-gray-700 cursor-pointer hover:border-cyan-500">
            <input
              type="checkbox"
              checked={sdrfAlert}
              onChange={(e) => setSdrfAlert(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 w-4 h-4"
            />
            <div className="flex items-center gap-2 text-gray-200 font-semibold">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Dispatch NDRF 5th Battalion & SDRF Rapid Response Units</span>
            </div>
          </label>
        </div>

        {/* Modal Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleExecute}
            disabled={executed}
            className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-600/40 flex items-center justify-center gap-2"
          >
            {executed ? (
              <>
                <CheckCircle className="w-4 h-4" />
                BROADCASTING DIRECTIVE...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                CONFIRM & EXECUTE
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import RelocationTable from '../components/RelocationTable';
import { Truck, Navigation, ShieldAlert, Route, Clock, Users } from 'lucide-react';

export default function Relocation({ zones, currentStage, onTriggerEvacuation }) {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-5">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Truck className="w-5 h-5 text-cyan-400" />
          Immediate Relocation Needs & Evacuation Routing
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Automated multi-criteria dispatch engine pairing high-risk habitations with nearest emergency shelters and optimal non-intersecting egress routes.
        </p>
      </div>

      <RelocationTable
        zones={zones}
        currentStage={currentStage}
        onTriggerEvacuation={onTriggerEvacuation}
      />
    </div>
  );
}

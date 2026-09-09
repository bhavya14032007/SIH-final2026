import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EmergencyModal from './components/EmergencyModal';

// Pages
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import RiskDetection from './pages/RiskDetection';
import HazardMapping from './pages/HazardMapping';
import CarryingCapacity from './pages/CarryingCapacity';
import Relocation from './pages/Relocation';
import CommandCenter from './pages/CommandCenter';
import Sensors from './pages/Sensors';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import SystemHealth from './pages/SystemHealth';
import Login from './pages/Login';

// Mock Data & Simulation State
import { INITIAL_SENSORS, POPULATION_ZONES, INITIAL_ALERTS, SIMULATION_STAGES } from './data/mockData';

export default function App() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);

  const currentStage = SIMULATION_STAGES[currentStageIndex];

  // Auto-play simulation interval loop
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStageIndex((prev) => {
          if (prev < SIMULATION_STAGES.length - 1) {
            const next = prev + 1;
            // Append alert if entering high/critical stage
            if (next === 4 || next === 5) {
              setAlerts((prevAlerts) => [
                {
                  id: `ALT-${Date.now()}`,
                  timestamp: 'Just now',
                  type: 'CRITICAL_HAZARD',
                  severity: 'CRITICAL',
                  message: `STAGE ${next}: Red Zone active in Zone A. Immediate relocation required.`
                },
                ...prevAlerts
              ]);
            }
            return next;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSelectStage = (idx) => {
    setCurrentStageIndex(idx);
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStageIndex(0);
    setIsPlaying(false);
  };

  const handleEmergencyConfirm = (options) => {
    setAlerts((prev) => [
      {
        id: `ALT-EMG-${Date.now()}`,
        timestamp: 'Just now',
        type: 'EMERGENCY_BROADCAST',
        severity: 'CRITICAL',
        message: 'Level-3 Emergency SOP Executed: Community Siren Active, SMS sent to 6,250 devices, NDRF deployed.'
      },
      ...prev
    ]);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected / Main App Shell */}
        <Route
          path="/*"
          element={
            <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
              {/* Sidebar */}
              <Sidebar onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)} />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                <Header
                  currentStage={currentStage}
                  onResetSimulation={handleReset}
                />

                <main className="p-6 flex-1">
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <Dashboard
                          currentStage={currentStage}
                          currentStageIndex={currentStageIndex}
                          onSelectStage={handleSelectStage}
                          isPlaying={isPlaying}
                          onTogglePlay={handleTogglePlay}
                          onReset={handleReset}
                          sensors={INITIAL_SENSORS}
                          zones={POPULATION_ZONES}
                          alerts={alerts}
                          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                        />
                      }
                    />
                    <Route
                      path="/monitoring"
                      element={<Monitoring sensors={INITIAL_SENSORS} currentStage={currentStage} />}
                    />
                    <Route
                      path="/risk-detection"
                      element={<RiskDetection currentStage={currentStage} />}
                    />
                    <Route
                      path="/hazard-mapping"
                      element={<HazardMapping zones={POPULATION_ZONES} currentStage={currentStage} />}
                    />
                    <Route
                      path="/carrying-capacity"
                      element={<CarryingCapacity zones={POPULATION_ZONES} currentStage={currentStage} />}
                    />
                    <Route
                      path="/relocation"
                      element={
                        <Relocation
                          zones={POPULATION_ZONES}
                          currentStage={currentStage}
                          onTriggerEvacuation={() => setIsEmergencyModalOpen(true)}
                        />
                      }
                    />
                    <Route
                      path="/command-center"
                      element={
                        <CommandCenter
                          currentStage={currentStage}
                          onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
                        />
                      }
                    />
                    <Route
                      path="/sensors"
                      element={<Sensors sensors={INITIAL_SENSORS} currentStage={currentStage} />}
                    />
                    <Route
                      path="/analytics"
                      element={<Analytics currentStage={currentStage} />}
                    />
                    <Route
                      path="/reports"
                      element={
                        <Reports
                          currentStage={currentStage}
                          zones={POPULATION_ZONES}
                          sensors={INITIAL_SENSORS}
                        />
                      }
                    />
                    <Route
                      path="/system-health"
                      element={<SystemHealth />}
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>

              {/* Global Emergency Modal */}
              <EmergencyModal
                isOpen={isEmergencyModalOpen}
                onClose={() => setIsEmergencyModalOpen(false)}
                onConfirm={handleEmergencyConfirm}
                currentStage={currentStage}
              />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

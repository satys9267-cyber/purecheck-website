'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CustomCursor } from '@/components/CustomCursor';
import { ForgeHeader } from '@/components/ForgeHeader';
import { ForgeHeroCarousel } from '@/components/ForgeHeroCarousel';
import { ForgeTicker } from '@/components/ForgeTicker';
import { ForgeServices } from '@/components/ForgeServices';
import { ForgeFolio } from '@/components/ForgeFolio';
import { TelemetryGrid } from '@/components/TelemetryGrid';
import { LiveTrendChart } from '@/components/LiveTrendChart';
import { HydrationTracker } from '@/components/HydrationTracker';
import { SimulationBar } from '@/components/SimulationBar';
import { ForgeFooter } from '@/components/ForgeFooter';
import { FirebaseConfigModal } from '@/components/FirebaseConfigModal';
import { FirmwareModal } from '@/components/FirmwareModal';
import { RawNodeMCUTelemetry, TelemetryPoint } from '@/types/telemetry';
import { calculateWaterPurity, evaluateDeviceState } from '@/lib/waterQuality';
import { subscribeToDevice, isFirebaseConfigured } from '@/lib/firebase';
import { generateSimulatedTelemetry, SimulationProfile } from '@/lib/simulator';

export default function Home() {
  const [telemetry, setTelemetry] = useState<RawNodeMCUTelemetry>({
    deviceName: 'PureCheck-NodeMCU-01',
    tds: 85.0,
    voltage: 0.42,
    ec: 170.0,
    rssi: -58,
    ip: '192.168.1.104',
    lastSeen: Date.now(),
  });

  const [history, setHistory] = useState<TelemetryPoint[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationProfile, setSimulationProfile] = useState<SimulationProfile>('spring');
  const [isSimulationPaused, setIsSimulationPaused] = useState<boolean>(false);
  const [firebaseActive, setFirebaseActive] = useState<boolean>(false);
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFirmwareOpen, setIsFirmwareOpen] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);

  // Audio alerts
  const playAlertChime = useCallback((category: 'safe' | 'moderate' | 'unsafe') => {
    if (!audioEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (category === 'unsafe') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(330, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  }, [audioEnabled]);

  // Handle incoming new data point
  const handleNewTelemetry = useCallback((data: RawNodeMCUTelemetry) => {
    setTelemetry(data);
    const metrics = calculateWaterPurity(data.tds, data.voltage, data.ec);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setHistory((prev) => {
      const newPoint: TelemetryPoint = {
        time: timeStr,
        timestamp: Date.now(),
        tds: data.tds,
        ec: data.ec,
        voltage: data.voltage,
        purity: metrics.purityPercent,
      };
      return [...prev, newPoint].slice(-30);
    });
  }, []);

  // Firebase Realtime Database Subscription
  useEffect(() => {
    const configured = isFirebaseConfigured();
    setFirebaseActive(configured);

    if (configured) {
      setIsSimulating(false);
      const unsubscribe = subscribeToDevice(
        'nodemcu_01',
        (liveData) => {
          handleNewTelemetry(liveData);
        },
        (error) => {
          console.warn('Firebase error, switching to demo simulation:', error);
          setIsSimulating(true);
        }
      );
      return () => unsubscribe();
    } else {
      setIsSimulating(true);
    }
  }, [handleNewTelemetry]);

  // Initial simulation seed
  useEffect(() => {
    if (!isSimulating || isSimulationPaused) return;

    if (history.length === 0) {
      const initialPoints: TelemetryPoint[] = [];
      const now = Date.now();
      for (let i = 10; i >= 0; i--) {
        const pointTime = new Date(now - i * 3000);
        const sim = generateSimulatedTelemetry(simulationProfile);
        const metrics = calculateWaterPurity(sim.tds, sim.voltage, sim.ec);
        initialPoints.push({
          time: pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          timestamp: now - i * 3000,
          tds: sim.tds,
          ec: sim.ec,
          voltage: sim.voltage,
          purity: metrics.purityPercent,
        });
      }
      setHistory(initialPoints);
    }

    const interval = setInterval(() => {
      const simulatedData = generateSimulatedTelemetry(simulationProfile);
      handleNewTelemetry(simulatedData);
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulating, isSimulationPaused, simulationProfile, history.length, handleNewTelemetry]);

  const purityMetrics = calculateWaterPurity(telemetry.tds, telemetry.voltage, telemetry.ec);
  const deviceState = evaluateDeviceState(telemetry);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08090A]">
      
      {/* Custom Trailing Ring Cursor */}
      <CustomCursor />

      {/* Header Navigation: Name of Web, Settings, Menu */}
      <ForgeHeader
        deviceState={deviceState}
        deviceName={telemetry.deviceName}
        isSimulating={isSimulating}
        onToggleSimulating={() => setIsSimulating(!isSimulating)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFirmware={() => setIsFirmwareOpen(true)}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
        firebaseActive={firebaseActive}
      />

      {/* Main Full-Bleed Hero Carousel */}
      <ForgeHeroCarousel
        telemetry={telemetry}
        metrics={purityMetrics}
        deviceState={deviceState}
      />

      {/* Kinetic Infinite Marquee Ticker */}
      <ForgeTicker />

      {/* Simulation Lab Control Banner (Active when in Demo Mode) */}
      {isSimulating && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pt-8 w-full">
          <SimulationBar
            currentProfile={simulationProfile}
            onSelectProfile={(profile) => {
              setSimulationProfile(profile);
              const immediate = generateSimulatedTelemetry(profile);
              handleNewTelemetry(immediate);
              playAlertChime(calculateWaterPurity(immediate.tds).category);
            }}
            isPaused={isSimulationPaused}
            onTogglePause={() => setIsSimulationPaused(!isSimulationPaused)}
            onGeneratePulse={() => {
              const ping = generateSimulatedTelemetry(simulationProfile);
              handleNewTelemetry(ping);
            }}
          />
        </div>
      )}

      {/* Services Section */}
      <ForgeServices />

      {/* Featured Projects / Water Benchmarks */}
      <ForgeFolio
        currentProfile={simulationProfile}
        onSelectProfile={(profile) => {
          setSimulationProfile(profile);
          const immediate = generateSimulatedTelemetry(profile);
          handleNewTelemetry(immediate);
          playAlertChime(calculateWaterPurity(immediate.tds).category);
        }}
      />

      {/* Live Oscilloscope Section */}
      <section id="oscilloscope" className="w-full bg-[#08090A] border-b border-[#23272F] py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-[#23272F] mb-8 gap-4">
            <div>
              <h2 className="font-display text-5xl sm:text-7xl md:text-8xl font-black text-white uppercase tracking-tight leading-none">
                OSCILLOSCOPE
              </h2>
            </div>
            <div className="font-mono text-xs text-[#8E95A5] uppercase max-w-xs text-left sm:text-right">
              High-resolution buffer measuring TDS and electro-conductivity in real-time.
            </div>
          </div>

          <LiveTrendChart
            history={history}
            currentTds={telemetry.tds}
          />
        </div>
      </section>

      {/* ESP8266 Hardware Spec Section */}
      <section id="hardware" className="w-full bg-[#08090A] border-b border-[#23272F] py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-[#23272F] mb-8 gap-4">
            <div>
              <h2 className="font-display text-5xl sm:text-7xl md:text-8xl font-black text-white uppercase tracking-tight leading-none">
                HARDWARE SPEC
              </h2>
            </div>
            <div className="font-mono text-xs text-[#8E95A5] uppercase max-w-xs text-left sm:text-right">
              Real-time register readout from the NodeMCU A0 analog probe and Wi-Fi interface.
            </div>
          </div>

          <TelemetryGrid
            telemetry={telemetry}
            deviceState={deviceState}
          />
        </div>
      </section>

      {/* Daily Hydration Section */}
      <section id="hydration" className="w-full bg-[#08090A] border-b border-[#23272F] py-16 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-[#23272F] mb-8 gap-4">
            <div>
              <h2 className="font-display text-5xl sm:text-7xl md:text-8xl font-black text-white uppercase tracking-tight leading-none">
                DAILY HYDRATION
              </h2>
            </div>
            <div className="font-mono text-xs text-[#8E95A5] uppercase max-w-xs text-left sm:text-right">
              Automatic volume sync with smart 750ml stainless vacuum vessel and filter life.
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <HydrationTracker currentPurity={purityMetrics.purityPercent} />
          </div>
        </div>
      </section>

      {/* Architectural Footer */}
      <ForgeFooter
        onOpenFirmware={() => setIsFirmwareOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings Modal */}
      <FirebaseConfigModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigUpdated={() => {
          setFirebaseActive(isFirebaseConfigured());
          setIsSimulating(!isFirebaseConfigured());
        }}
      />

      {/* Firmware Code Modal */}
      <FirmwareModal
        isOpen={isFirmwareOpen}
        onClose={() => setIsFirmwareOpen(false)}
      />
      
    </div>
  );
}
